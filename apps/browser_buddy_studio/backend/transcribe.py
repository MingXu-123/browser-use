"""Video audio extraction and transcription for BrowserBuddy.

The video's visual content is handled by keyframes in ``uploads.py``. This
module adds the audio track: ffmpeg extracts a mono 16 kHz MP3, then OpenAI
Whisper or Google Gemini turns it into text. Results are cached next to the
uploaded video so a follow-up task does not pay for transcription again.
"""

from __future__ import annotations

import asyncio
import logging
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import httpx

from browser_use.llm.messages import ContentPartImageParam, ContentPartTextParam, ImageURL, SystemMessage, UserMessage

try:
	import imageio_ffmpeg  # pyright: ignore[reportMissingImports]
except ImportError:  # pragma: no cover - the packaged app always ships it
	imageio_ffmpeg = None

logger = logging.getLogger('browser_buddy.transcribe')

AUDIO_MAX_SECONDS = 30 * 60
AUDIO_MAX_TRANSCRIPT_CHARS = 20_000


def _extract_audio(video_path: Path, output_path: Path) -> bool:
	if imageio_ffmpeg is None:
		return False
	try:
		ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
		subprocess.run(
			[
				ffmpeg,
				'-y',
				'-loglevel',
				'error',
				'-i',
				str(video_path),
				'-vn',
				'-ac',
				'1',
				'-ar',
				'16000',
				'-b:a',
				'32k',
				'-t',
				str(AUDIO_MAX_SECONDS),
				str(output_path),
			],
			capture_output=True,
			timeout=180,
		)
		return output_path.exists() and output_path.stat().st_size > 0
	except Exception as e:
		logger.warning(f'Could not extract audio from {video_path}: {type(e).__name__}: {e}')
		return False


async def _openai_transcribe(path: Path, api_key: str) -> str:
	with path.open('rb') as audio:
		async with httpx.AsyncClient(timeout=180.0) as client:
			response = await client.post(
				'https://api.openai.com/v1/audio/transcriptions',
				headers={'Authorization': f'Bearer {api_key}'},
				files={'file': (path.name, audio, 'audio/mpeg')},
				data={'model': 'whisper-1'},
			)
			response.raise_for_status()
			payload = response.json()
	return str(payload.get('text') or '')


def _google_transcribe(path: Path, api_key: str, model: str | None) -> str:
	from google import genai
	from google.genai import types

	client = genai.Client(api_key=api_key)
	response = client.models.generate_content(
		model=model or 'gemini-3-flash-preview',
		contents=[
			types.Part.from_bytes(data=path.read_bytes(), mime_type='audio/mpeg'),
			'请把这段音频逐字转录为文字。如果说话人切换或时间点很明显，可以保留；只输出转录内容。',
		],
	)
	return str(getattr(response, 'text', '') or '')


async def _transcribe_audio(path: Path, config: dict[str, Any]) -> str:
	provider = config.get('provider')
	if provider == 'OpenAI':
		return await _openai_transcribe(path, str(config.get('key') or ''))
	if provider == 'Google Gemini':
		return await asyncio.to_thread(
			_google_transcribe,
			path,
			str(config.get('key') or ''),
			config.get('model'),
		)
	raise ValueError(f'不支持的音频转录提供商: {provider}')


async def transcribe_video(record: dict[str, Any], config: dict[str, Any] | None) -> tuple[str, str | None]:
	"""Return ``(transcript, error)`` for one uploaded video.

	The transcript is cached in ``transcript.txt`` beside the video. A cache hit
	works even when the user later removes the transcription API key.
	"""
	path = Path(str(record.get('path') or ''))
	if not path.exists():
		return '', '视频文件不存在'

	cache_path = path.parent / 'transcript.txt'
	if cache_path.exists():
		try:
			return cache_path.read_text(encoding='utf-8'), None
		except Exception:
			pass

	if config is None:
		return '', '未配置音频转录 Key（OpenAI 或 Google Gemini）'
	if imageio_ffmpeg is None:
		return '', '当前 App 未包含 ffmpeg，无法提取音频'

	with tempfile.TemporaryDirectory(prefix='browserbuddy-audio-') as temp_dir:
		audio_path = Path(temp_dir) / 'audio.mp3'
		if not await asyncio.to_thread(_extract_audio, path, audio_path):
			return '', '视频没有可转录的音频轨道'
		try:
			text = (await _transcribe_audio(audio_path, config)).strip()
		except Exception as e:
			logger.warning(f'Audio transcription failed for {path}: {type(e).__name__}: {e}')
			return '', f'音频转录失败：{type(e).__name__}: {e}'

	if not text:
		return '', '音频转录结果为空'
	text = text[:AUDIO_MAX_TRANSCRIPT_CHARS]
	try:
		cache_path.write_text(text, encoding='utf-8')
	except Exception as e:
		logger.warning(f'Could not cache transcript for {path}: {type(e).__name__}: {e}')
	return text, None


async def summarize_video(
	llm,
	record: dict[str, Any],
	frames: list[dict[str, Any]],
	transcript: str,
) -> str:
	"""Create a reusable summary of a video, cached next to it.

	The current turn already sends keyframes and the full transcript. Later
	turns only carry this summary, which keeps the conversation context small.
	"""
	path = Path(str(record.get('path') or ''))
	if not path.exists():
		return ''
	cache_path = path.parent / 'summary.txt'
	if cache_path.exists():
		try:
			cached = cache_path.read_text(encoding='utf-8').strip()
			if cached:
				return cached
		except Exception:
			pass

	transcript = (transcript or '').strip()
	if not frames and not transcript:
		return ''

	instructions = (
		f'请为视频 {record.get("name", "video")} 生成一份供后续对话复用的内容摘要。\n'
		'保留主题、人物或主体、关键事件与时间线、重要数字和结论；不要编造。\n'
		'控制在 300-500 字，只输出摘要正文。\n\n'
		f'音频转录（可能为空）：\n{transcript[:12000] or "（无可用语音转录）"}'
	)
	content: list[ContentPartTextParam | ContentPartImageParam] = [ContentPartTextParam(text=instructions)]
	for frame in frames[:8]:
		content.append(
			ContentPartImageParam(
				image_url=ImageURL(
					url=f'data:{frame["media_type"]};base64,{frame["data"]}',
					media_type=frame['media_type'],
					detail='auto',
				)
			)
		)

	summary = ''
	try:
		response = await llm.ainvoke(
			[
				SystemMessage(content='你负责把视频压缩成简洁、事实性的摘要，供后续多轮对话作为上下文。'),
				UserMessage(content=content),
			]
		)
		summary = str(getattr(response, 'completion', '') or '').strip()
	except Exception as e:
		logger.warning(f'Video summary failed for {path}: {type(e).__name__}: {e}')

	if not summary:
		summary = transcript[:1200]
	if not summary:
		return ''
	summary = summary[:1600]
	try:
		cache_path.write_text(summary, encoding='utf-8')
	except Exception as e:
		logger.warning(f'Could not cache video summary for {path}: {type(e).__name__}: {e}')
	return summary
