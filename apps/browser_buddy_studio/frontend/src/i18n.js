import { createContext, useContext } from 'react'

export const DEFAULT_LANGUAGE =
  typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'

export const LANGUAGES = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
]

const EN = {
  // Sidebar / shell
  '下载文件夹': 'Downloads',
  '应用内': 'In app',
  '登录平台': 'Sign in',
  '登录中：': 'Signing in: ',
  '已登录': 'signed in',
  '对话': 'Chats',
  '还没有对话': 'No chats yet',
  '今天': 'Today',
  '昨天': 'Yesterday',
  '更早': 'Earlier',
  '删除这条对话': 'Delete this chat',
  '删除这条对话？': 'Delete this chat?',
  '取消': 'Cancel',
  '删除': 'Delete',
  '设置': 'Settings',
  '切换主题': 'Toggle theme',
  'API 已连接': 'API connected',
  '需要 API Key': 'API key required',
  '新任务': 'New task',
  '新对话': 'New chat',
  '历史任务': 'History',
  '任务': 'Task',
  '刚刚': 'Just now',
  '执行中': 'Running',
  '任务完成': 'Completed',
  '任务部分完成': 'Partially completed',
  '已完成': 'Done',
  '失败': 'Failed',

  // Welcome / composer
  '今天想让浏览器做什么？': 'What should the browser do today?',
  '描述一个目标，BrowserBuddy 会规划步骤、操作浏览器，并把结果和来源整理给你。':
    'Describe a goal. BrowserBuddy plans the steps, operates the browser, and organizes the results and sources for you.',
  '试试这些': 'Try these',
  '点击示例快速填入任务': 'Click an example to fill the task',
  'API Key 保存在本机私有配置（仅当前用户可读），不会写进代码或日志。':
    'Your API key is stored locally and is only readable by your macOS user. It is never written into the app bundle or logs.',
  '例如：搜索 browser automation，总结前 3 个结果并附上链接':
    'Example: search browser automation, summarize the top 3 results, and include links',
  '继续提问，或输入新的任务…': 'Ask a follow-up or start a new task…',
  '开始执行': 'Start',
  '发送': 'Send',
  '文件': 'Files',
  '上传中…': 'Uploading…',
  '停止任务': 'Stop task',
  '停止': 'Stop',
  '视觉模式': 'Vision',
  'DOM 模式': 'DOM mode',
  '后台运行': 'Headless',
  '显示浏览器': 'Show browser',
  '正在执行': 'Running',
  '正在分析任务...': 'Analyzing task…',
  '正在处理任务...': 'Processing…',
  '正在启动浏览器...': 'Starting browser…',
  '正在执行任务': 'Running task',
  '正在执行的任务': 'Running task',
  '任务已被手动停止。': 'Task stopped manually.',
  '运行失败：{message}': 'Run failed: {message}',
  '已复制': 'Copied',
  '复制失败': 'Copy failed',
  '复制结果': 'Copy result',
  '导出 Markdown': 'Export Markdown',
  '复制这条输入': 'Copy this message',
  '重试': 'Retry',

  // Status / result
  '任务没有完成': 'Task not completed',
  '任务完成，但模型没有返回文本结果。': 'Task finished, but the model returned no text.',
  '从左侧新建一个任务，或者使用示例开始。': 'Start a new task from the sidebar or use an example.',
  '左侧会实时显示浏览器执行步骤，完成后结果显示在这里。':
    'Browser steps appear on the left in real time; the result appears here when finished.',
  '执行结果': 'Result',
  '继续这个任务': 'Continue this task',
  '新建任务': 'New task',
  '来源': 'Sources',
  '附件与图片': 'Attachments & images',
  '执行轨迹': 'Execution trace',
  '部分完成': 'Partial',
  '已保存，留空即可': 'Saved — leave blank to keep it',
  '还没有保存这个提供商的 Key': 'No key saved for this provider',
  'Key 已保存在本机': 'Key saved on this Mac',
  '最多 {count} 个文件': 'Up to {count} files',
  '最多添加 {count} 个文件': 'You can add up to {count} files',
  '最多 {count} 个文件，已忽略多余文件': 'Up to {count} files; extra files were ignored',
  '没有可上传的文件': 'No uploadable files',
  '单次上传总大小不能超过 {limit}MB': 'Total upload size cannot exceed {limit}MB',
  '{name} 超过 {limit}MB': '{name} exceeds {limit}MB',
  '图片/视频需要开启「视觉模式」才能被模型理解':
    'Images and videos require Vision mode so the model can understand them',
  '（附件：{names}）': '(Attachments: {names})',
  '已删除对话': 'Chat deleted',
  '已删除对话，并清理 {items}': 'Chat deleted; cleaned up {items}',
  '{count} 个附件': '{count} attachments',
  '{count} 个上传文件': '{count} uploaded files',

  // Attachments
  '移除文件': 'Remove file',
  '打开失败': 'Open failed',
  '正在打开…': 'Opening…',
  '用已登录浏览器打开': 'Open in signed-in browser',
  '用 BrowserBuddy 已登录的浏览器打开': 'Open in BrowserBuddy’s signed-in browser',
  '该链接缺少 xsec_token，桌面端会显示 404。请重新运行任务，让来源返回完整链接。':
    'This link is missing xsec_token, so it will show 404 on desktop. Re-run the task and ask the source to return the full link.',
  '该小红书链接缺少访问令牌 xsec_token，桌面端会显示 404。请重新运行任务，让来源返回带 xsec_token 的完整链接。':
    'This Xiaohongshu link is missing xsec_token and will show 404 on desktop. Re-run the task and ask the source to return a full link with xsec_token.',
  '图片 20MB，视频 200MB，PDF/Word/PPT 100MB，Excel/CSV 50MB，文本 20MB':
    'Images 20MB · Video 200MB · PDF/Word/PPT 100MB · Excel/CSV 50MB · Text 20MB',
  '图片 · 视觉模式 · {size}': 'Image · Vision · {size}',
  '图片 · 需开启视觉 · {size}': 'Image · Vision off · {size}',
  '视频 · 自适应关键帧 · {size}': 'Video · Adaptive keyframes · {size}',
  '视频 · 需开启视觉 · {size}': 'Video · Vision off · {size}',
  '{chars} 字{truncated}': '{chars} chars{truncated}',
  '（已截断）': ' (truncated)',
  '（默认）': ' (default)',

  // Context warning
  '这段对话已经比较长': 'This conversation is getting long',
  '上下文已使用较多': 'Context usage is high',
  '上下文接近模型窗口上限': 'Close to the model context limit',
  '继续可能触发模型窗口限制，请新建对话后继续。':
    'Continuing may hit the model context limit. Start a new chat to continue.',
  '执行时会自动压缩较早内容；如果发现模型开始忘记早期约束，建议新建对话。':
    'Older turns are compacted automatically. If the model starts forgetting earlier constraints, start a new chat.',
  '新建对话': 'New chat',
  '按完整历史估算约 {tokens} / {window} tokens（{percent}%）。':
    'Estimated from full history: {tokens} / {window} tokens ({percent}%).',

  // Settings
  '模型、浏览器和输出': 'Model, browser and output',
  '模型': 'Model',
  '模型提供商': 'Provider',
  '模型名称': 'Model name',
  '上下文窗口（tokens，留空使用默认）': 'Context window (tokens; blank = default)',
  '搜索引擎': 'Search engine',
  '浏览器': 'Browser',
  '后台运行浏览器': 'Run browser headless',
  '不显示 Chrome 窗口': 'Do not show the Chrome window',
  '网页截图 + 上传图片，需要模型支持视觉':
    'Webpage screenshots + uploaded images. The model must support vision.',
  '视频音频转录': 'Video audio transcription',
  '使用已保存的 OpenAI 或 Google Gemini Key；未配置时只分析画面':
    'Uses a saved OpenAI or Google Gemini key. Without one, only visuals are analyzed.',
  '最大步数：{count}': 'Max steps: {count}',
  '平台登录': 'Platform sign-in',
  '已登录：': 'Signed in: ',
  '切换账号': 'Switch account',
  '确认切换': 'Confirm switch',
  '登录': 'Sign in',
  '外观': 'Appearance',
  '浅色': 'Light',
  '深色': 'Dark',
  '语言': 'Language',
  '界面语言': 'Interface language',
  '跟随系统': 'System',
  '中文': '中文',
  '数据与卸载': 'Data & uninstall',
  '浏览器、任务记录、登录状态和下载文件都保存在一个文件夹内。把 BrowserBuddy 拖到废纸篓即可删除应用本身；下面的按钮会清除全部本地数据。':
    'The browser, task history, login state, and downloads live in one folder. Drag BrowserBuddy to the Trash to remove the app; the button below clears all local data.',
  '打开数据文件夹': 'Open data folder',
  '将删除任务记录、登录状态、下载文件、浏览器配置和设置，且无法恢复。':
    'Task history, login state, downloads, browser profile, and settings will be deleted permanently.',
  '确认彻底删除': 'Delete permanently',
  '正在删除…': 'Deleting…',
  '彻底删除本地数据': 'Delete all local data',
  '打开日志目录': 'Open logs',
  '打开下载文件夹': 'Open downloads',
  '登录一次后，cookies 会保存在 BrowserBuddy 的独立浏览器 profile 中':
    'After signing in once, cookies are stored in BrowserBuddy’s dedicated browser profile.',
  '选择一个平台。BrowserBuddy 会打开一个可见浏览器，用户自己完成登录，App 不保存账号密码。':
    'Choose a platform. BrowserBuddy opens a visible browser; you sign in yourself. The app never stores your password.',
  '登录一次后，App 会保存登录状态，重启后不需要重复扫码。':
    'After signing in once, the app keeps you signed in across restarts.',
  '登录状态保存在本机，重启 App 后不需要重复扫码。':
    'Sign-in state is stored locally; no need to scan the QR code again after restarting.',
  '登录页已打开': 'Sign-in page opened',
  '请在弹出的浏览器窗口中完成扫码或账号密码登录。检测到登录成功后会自动关闭登录窗口；扫码失败时直接关闭浏览器窗口即可。':
    'Complete the QR-code or password sign-in in the browser window. The window closes automatically when sign-in is detected. If it fails, just close the browser window.',
  '不要在这里输入密码。只在你自己的浏览器窗口中登录。登录状态会保存在本机，下次不需要重复扫码。':
    'Do not enter your password here. Sign in only in your own browser window. Sign-in state is stored locally, so you will not need to scan again.',
  '已完成登录': 'I have signed in',
  '取消登录': 'Cancel sign-in',
  '扫码登录': 'QR code',
  '已登录，无需重复登录': 'Signed in — no need to sign in again',
  '自动（优先 Bing）': 'Auto (Bing first)',
  'Bing 中国': 'Bing China',
  'Bing 国际': 'Bing',
  '360 搜索': '360 Search',
  '自动': 'Auto',
  '百度': 'Baidu',
  '搜狗': 'Sogou',
  '淘宝': 'Taobao',
  '京东': 'JD',
  '小红书': 'Xiaohongshu',
  '抖音': 'Douyin',

  // Login / human dialogs
  '需要你操作一下': 'Action needed',
  '任务已暂停，等你完成浏览器里的操作': 'Task paused until you finish in the browser',
  '任务已暂停，登录成功后会自动继续': 'Task paused; it resumes after you sign in',
  '网站要求登录或人工验证': 'The website requires sign-in or human verification',
  '网站要求人工操作': 'The website needs a human action',
  '请在弹出的浏览器窗口中完成扫码、登录或验证码。完成后点击“继续任务”。如果看不到浏览器窗口，请取消任务，并在设置中关闭“后台运行浏览器”后重试。':
    'Complete the QR code, sign-in, or CAPTCHA in the browser window, then click “Continue”. If you cannot see the browser window, cancel the task, turn off headless mode in Settings, and retry.',
  '请在弹出的浏览器窗口中完成扫码/登录。检测到登录成功后会自动继续，不需要手动点击；扫码失败可以直接取消任务。如果看不到浏览器窗口，请取消任务，并在设置中关闭“后台运行浏览器”后重试。':
    'Complete the QR code or sign-in in the browser window. The task resumes automatically after sign-in is detected. If you cannot see the browser, cancel the task, turn off headless mode in Settings, and retry.',
  '继续任务': 'Continue task',
  '取消任务': 'Cancel task',
  '我已登录': 'I have signed in',
  '还没有检测到{label}登录成功，请先在浏览器里完成扫码。':
    'No {label} sign-in detected yet. Please complete the QR sign-in in the browser.',
  '{label}登录成功': '{label} signed in',
  '{label}登录成功，任务继续': '{label} signed in; task resumed',
  '已关闭登录窗口': 'Sign-in window closed',
  '已取消任务': 'Task cancelled',
  '请先完成购物网站登录，或取消登录后再发送。':
    'Finish the website sign-in or cancel it before sending.',
  '登录中：{label}': 'Signing in: {label}',
  '已登录：{account}': 'Signed in: {account}',
  '扫码或账号密码登录': 'QR code or password sign-in',

  // Errors / toasts
  '打开链接失败': 'Failed to open link',
  '上下文超过模型窗口，请新建对话': 'Context exceeded the model window. Start a new chat.',
  '请先完成人工验证': 'Finish the human verification first',
  '请先完成当前的人工验证': 'Finish the current human verification first',
  '任务运行中，请等任务结束后再删除对话': 'A task is running. Wait for it to finish before deleting this chat.',
  '任务运行中，请等任务结束后再打开来源链接':
    'A task is running. Wait for it to finish before opening source links.',
  '仅支持 http 或 https 链接': 'Only http or https links are supported',
  '无效的文件 ID': 'Invalid file ID',
  '当前请求超过了模型的上下文窗口限制。请新建对话后重试；如果必须保留细节，请把关键约束复制到新对话中。':
    'The request exceeded the model context window. Start a new chat and retry; copy any important constraints into the new chat.',
  '当前是后台运行模式，无法进行人工登录。请先取消任务，在设置中关闭后台运行后重试。':
    'Human sign-in is unavailable in headless mode. Cancel the task, turn off headless mode in Settings, and retry.',

  // Dead/legacy components kept for compatibility
  '来试试这些示例': 'Try these examples',
  '等待任务': 'Waiting for a task',
  复制: 'Copy',
  该平台: 'this platform',
  打开日志: 'Open logs',
  清除上下文: 'Clear context',
  '正在打开浏览器…': 'Opening browser…',
  '登录{label}': 'Sign in to {label}',
  '{count} 已登录': '{count} signed in',
  '{label} 登录页已打开': '{label} sign-in page opened',
  '此链接缺少访问令牌，可能无法直接播放': 'This link is missing an access token and may not play directly.',
  '执行轨迹 · {count} steps': 'Execution trace · {count} steps',
  '最多 {count} 个文件；{limits}': 'Up to {count} files; {limits}',
  '请先完成购物网站登录，或取消登录后再开始任务。':
    'Finish the website sign-in or cancel it before starting a task.',
}

export function interpolate(template, params) {
  if (!params) return template
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key]
    return value === undefined || value === null ? `{${key}}` : String(value)
  })
}

export function translate(text, language, params) {
  const source = String(text ?? '')
  const template = language === 'en' ? EN[source] || source : source
  return interpolate(template, params)
}

const BACKEND_PATTERNS = [
  [/缺少 (.+) API Key/g, 'Missing $1 API key'],
  [/未找到可用的浏览器。请先安装 Google Chrome（https:\/\/www\.google\.com\/chrome\/），然后重新打开 BrowserBuddy。/g,
    'No usable browser found. Install Google Chrome (https://www.google.com/chrome/), then reopen BrowserBuddy.'],
  [/当前请求超过了模型的上下文窗口限制。请新建对话后重试；如果必须保留细节，请把关键约束复制到新对话中。/g,
    'The request exceeded the model context window. Start a new chat and retry; copy any important constraints into the new chat.'],
  [/已有任务正在执行/g, 'A task is already running'],
  [/任务运行中，请等任务结束后再删除对话/g, 'A task is running. Wait for it to finish before deleting this chat.'],
  [/任务运行中，请等任务结束后再打开来源链接/g, 'A task is running. Wait for it to finish before opening source links.'],
  [/请先完成或关闭登录窗口/g, 'Finish or close the sign-in window first'],
  [/请先等待当前任务结束/g, 'Wait for the current task to finish first'],
  [/请先完成人工验证/g, 'Finish the human verification first'],
  [/不支持的模型提供商: (.+)/g, 'Unsupported model provider: $1'],
  [/一次最多上传 (\d+) 个文件/g, 'Up to $1 files per upload'],
  [/单次上传总大小不能超过 (\d+)MB/g, 'Total upload size cannot exceed $1MB'],
  [/(.+) 超过 (\d+)MB 限制/g, '$1 exceeds $2MB'],
  [/还没有检测到(.+)登录成功，请先完成扫码登录。/g, 'No $1 sign-in detected yet. Please complete the QR sign-in.'],
  [/用户取消了人工协助/g, 'The user cancelled human assistance'],
  [/后台运行模式/g, 'headless mode'],
]

export function localizeBackendError(message, language) {
  if (language !== 'en' || !message) return message
  let result = String(message)
  for (const [pattern, replacement] of BACKEND_PATTERNS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

export const I18nContext = createContext({
  lang: 'zh',
  t: (text, params) => interpolate(text, params),
})

export function useI18n() {
  return useContext(I18nContext)
}
