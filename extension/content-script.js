chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  try {
    if (message?.type === 'PARSE_VIMSHOTTARI_TREE') {
      if (!window.AstroVimshottari) {
        sendResponse({ ok: false, error: 'Vimshottari module is not initialized on this page.' });
        return;
      }

      const tree = window.AstroVimshottari.parseVisibleTree();
      sendResponse({ ok: true, data: tree });
      return;
    }

    if (message?.type !== 'PARSE_ASTRO_PAGE') {
      return;
    }

    if (!window.AstroParser) {
      sendResponse({ ok: false, error: 'Parser is not initialized on this page.' });
      return;
    }

    if (typeof window.AstroParser.isSupportedAstroPage === 'function' && !window.AstroParser.isSupportedAstroPage()) {
      sendResponse({ ok: false, error: 'This page is not a supported Astro.Expert chart page.' });
      return;
    }

    const parsed = window.AstroParser.parseAstroPage();
    sendResponse({ ok: true, data: parsed });
  } catch (error) {
    sendResponse({ ok: false, error: error?.message || String(error) });
  }

  return true;
});
