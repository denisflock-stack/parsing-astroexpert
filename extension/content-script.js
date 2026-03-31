chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'PARSE_ASTRO_PAGE') {
    return;
  }

  try {
    if (!window.AstroParser) {
      sendResponse({ ok: false, error: 'Parser is not initialized on this page.' });
      return;
    }

    const parsed = window.AstroParser.parseAstroPage();
    sendResponse({ ok: true, data: parsed });
  } catch (error) {
    sendResponse({ ok: false, error: error?.message || String(error) });
  }

  return true;
});
