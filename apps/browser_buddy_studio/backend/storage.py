from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

from .config import APP_SUPPORT_DIR, ARTIFACT_DIR, HISTORY_DIR
from .uploads import collect_upload_ids, delete_upload_dirs

HISTORY_FILE = HISTORY_DIR / 'history.json'
CHATS_FILE = APP_SUPPORT_DIR / 'chats.json'
PREFERENCES_FILE = APP_SUPPORT_DIR / 'preferences.json'
_LOCK = threading.Lock()


def _read_json(path: Path, default: Any) -> Any:
	try:
		return json.loads(path.read_text(encoding='utf-8'))
	except Exception:
		return default


def _write_json(path: Path, data: Any) -> None:
	path.parent.mkdir(parents=True, exist_ok=True)
	temp = path.with_suffix(path.suffix + '.tmp')
	temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
	temp.replace(path)


def load_history() -> list[dict]:
	with _LOCK:
		value = _read_json(HISTORY_FILE, [])
	return value if isinstance(value, list) else []


def add_history(entry: dict) -> list[dict]:
	with _LOCK:
		items = _read_json(HISTORY_FILE, [])
		if not isinstance(items, list):
			items = []
		entry_id = entry.get('id')
		items = [item for item in items if item.get('id') != entry_id]
		items.insert(0, entry)
		items = items[:20]
		_write_json(HISTORY_FILE, items)
	return items


def clear_history() -> None:
	with _LOCK:
		_write_json(HISTORY_FILE, [])


def delete_history_entry(entry_id: str) -> None:
	"""Remove one legacy history row so deleted chats are not re-migrated."""
	with _LOCK:
		items = _read_json(HISTORY_FILE, [])
		if isinstance(items, list):
			items = [item for item in items if item.get('id') != entry_id]
			_write_json(HISTORY_FILE, items)


def load_chats() -> list[dict]:
	with _LOCK:
		value = _read_json(CHATS_FILE, [])
	return value if isinstance(value, list) else []


def save_chat(thread: dict) -> list[dict]:
	with _LOCK:
		items = _read_json(CHATS_FILE, [])
		if not isinstance(items, list):
			items = []
		thread_id = thread.get('id')
		items = [item for item in items if item.get('id') != thread_id]
		items.insert(0, thread)
		items.sort(key=lambda item: item.get('updatedAt') or 0, reverse=True)
		items = items[:50]
		_write_json(CHATS_FILE, items)
	return items


def delete_chat(thread_id: str) -> None:
	"""Compatibility helper: remove only the chat record, not its artifacts."""
	with _LOCK:
		items = _read_json(CHATS_FILE, [])
		if isinstance(items, list):
			items = [item for item in items if item.get('id') != thread_id]
			_write_json(CHATS_FILE, items)


def _collect_artifact_urls(entries: list[dict]) -> set[str]:
	"""Collect local ``/artifacts/...`` URLs from chats and legacy history rows."""
	urls: set[str] = set()
	for entry in entries:
		if not isinstance(entry, dict):
			continue
		results: list[dict] = []
		result = entry.get('result')
		if isinstance(result, dict):
			results.append(result)
		for message in entry.get('messages') or []:
			if isinstance(message, dict) and isinstance(message.get('result'), dict):
				results.append(message['result'])
		for result in results:
			for key in ('files', 'images'):
				for item in result.get(key) or []:
					if isinstance(item, dict):
						url = item.get('url')
						if isinstance(url, str) and url:
							urls.add(url)
	return urls


def _artifact_path(url: str) -> Path | None:
	"""Map an artifact URL back to a file inside ARTIFACT_DIR."""
	try:
		parsed = urlparse(url)
	except Exception:
		return None
	if not parsed.path.startswith('/artifacts/'):
		return None
	name = Path(unquote(parsed.path)).name
	if not name or name in ('.', '..'):
		return None
	try:
		artifact_root = ARTIFACT_DIR.resolve()
		path = (artifact_root / name).resolve()
		path.relative_to(artifact_root)
	except Exception:
		return None
	return path


def delete_chat_and_artifacts(thread_id: str) -> dict[str, list[str]]:
	"""Delete one chat, its legacy row, and files no other chat references.

	Artifacts are copied into a shared folder with deterministic names, so the
	same file can be referenced by more than one chat. Uploads are also
	reference-counted through user-message attachment ids.
	"""
	with _LOCK:
		chats = _read_json(CHATS_FILE, [])
		history = _read_json(HISTORY_FILE, [])
		if not isinstance(chats, list):
			chats = []
		if not isinstance(history, list):
			history = []

		targets = [item for item in chats if item.get('id') == thread_id]
		targets += [item for item in history if item.get('id') == thread_id]
		candidates = _collect_artifact_urls(targets)
		candidate_uploads = collect_upload_ids(targets)

		chats = [item for item in chats if item.get('id') != thread_id]
		history = [item for item in history if item.get('id') != thread_id]
		remaining = chats + history
		still_used = _collect_artifact_urls(remaining)
		still_used_uploads = collect_upload_ids(remaining)
		_write_json(CHATS_FILE, chats)
		_write_json(HISTORY_FILE, history)

		deleted: list[str] = []
		for url in candidates - still_used:
			path = _artifact_path(url)
			if path is None:
				continue
			try:
				path.unlink(missing_ok=True)
				deleted.append(path.name)
			except OSError:
				continue
		deleted_uploads = delete_upload_dirs(candidate_uploads - still_used_uploads)
		return {'deleted_artifacts': deleted, 'deleted_uploads': deleted_uploads}


def load_preferences() -> dict:
	with _LOCK:
		value = _read_json(PREFERENCES_FILE, {})
	return value if isinstance(value, dict) else {}


def save_preferences(preferences: dict) -> dict:
	with _LOCK:
		_write_json(PREFERENCES_FILE, preferences)
	return preferences
