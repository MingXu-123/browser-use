# BrowserBuddy 用户手册

- `BrowserBuddy-2.0-安装使用说明.pdf` — 面向普通用户的安装与使用说明
- `guide.html` + `final/` — 手册源文件和截图

重新生成 PDF：

```bash
CHROME="apps/browser_buddy_studio/dist/BrowserBuddy.app/Contents/Frameworks/ms-playwright/chromium-*/chrome-mac*/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=BrowserBuddy-2.0-安装使用说明.pdf \
  file:///absolute/path/to/apps/browser_buddy_studio/docs/user-guide/guide.html
```
