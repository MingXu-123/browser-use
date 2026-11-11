"""Language detection for prompt scaffolding.

The app supports Chinese and English conversations. Prompt wrappers such as
"User's current message:" used to be hard-coded in Chinese, which biased models
to answer English messages in Chinese. Detecting the message language lets each
prompt use matching scaffolding and an explicit reply-language instruction.
"""

from __future__ import annotations

import re

CJK_RE = re.compile(r'[\u4e00-\u9fff]')
LATIN_RE = re.compile(r'[A-Za-z]')

# Chinese text still dominates short mixed messages such as "打开 taobao" or
# "iPhone 怎么连接", while English sentences that merely mention a Chinese site
# name stay below this ratio.
CHINESE_RATIO_THRESHOLD = 0.3


def message_language(text: str) -> str:
	"""Return ``'zh'`` for predominantly Chinese text, otherwise ``'en'``."""
	stripped = (text or '').strip()
	cjk = len(CJK_RE.findall(stripped))
	if cjk == 0:
		return 'en'
	# A message that starts with Chinese is Chinese even when it names an
	# English site or product, e.g. "打开 taobao".
	if CJK_RE.match(stripped[:1]):
		return 'zh'
	latin = len(LATIN_RE.findall(stripped))
	total = cjk + latin
	return 'zh' if cjk / total >= CHINESE_RATIO_THRESHOLD else 'en'
