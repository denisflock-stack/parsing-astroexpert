function getVimshottariBridge() {
  if (!window.AstroVimshottari) {
    return null;
  }

  return window.AstroVimshottari;
}

function handleVimshottariMessage(message) {
  const bridge = getVimshottariBridge();
  if (!bridge) {
    return { ok: false, error: 'Vimshottari module is not initialized on this page.' };
  }

  switch (message.type) {
    case 'PARSE_VIMSHOTTARI_TREE':
      return { ok: true, data: bridge.parseVisibleTree() };
    case 'GET_VIMSHOTTARI_STATE':
      return { ok: true, data: bridge.getPanelState() };
    case 'OPEN_VIMSHOTTARI_PANEL':
      return { ok: true, data: bridge.openPanel() };
    case 'REFRESH_VIMSHOTTARI':
      bridge.refresh();
      return { ok: true, data: bridge.getPanelState() };
    case 'EXPORT_VIMSHOTTARI_TEXT':
      return { ok: true, data: { text: bridge.exportText() } };
    case 'SET_ALL_VIMSHOTTARI_MARKERS':
      return { ok: true, data: bridge.setAllMarkers(!!message.checked) };
    case 'SET_VIMSHOTTARI_MARKER':
      return { ok: true, data: bridge.setNodeMarker(message.path || [], !!message.checked) };
    case 'NAVIGATE_VIMSHOTTARI_NODE':
      return bridge.navigateToPath(message.path || []).then((data) => ({ ok: true, data: data }));
    case 'APPLY_VIMSHOTTARI_HORIZON':
      return bridge.applyPopupHorizonSelection(
        message.level,
        message.targetDateText,
        message.fromDateText
      ).then((data) => ({ ok: true, data: data }));
    default:
      return null;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  try {
    const vimshottariResponse = handleVimshottariMessage(message || {});
    if (vimshottariResponse) {
      if (typeof vimshottariResponse.then === 'function') {
        vimshottariResponse.then(sendResponse).catch((error) => {
          sendResponse({ ok: false, error: error?.message || String(error) });
        });
        return true;
      }

      sendResponse(vimshottariResponse);
      return true;
    }

    if (message?.type !== 'PARSE_ASTRO_PAGE') {
      return false;
    }

    if (!window.AstroParser) {
      sendResponse({ ok: false, error: 'Parser is not initialized on this page.' });
      return true;
    }

    if (typeof window.AstroParser.isSupportedAstroPage === 'function' && !window.AstroParser.isSupportedAstroPage()) {
      sendResponse({ ok: false, error: 'This page is not a supported Astro.Expert chart page.' });
      return true;
    }

    const parsed = window.AstroParser.parseAstroPage();
    sendResponse({ ok: true, data: parsed });
  } catch (error) {
    sendResponse({ ok: false, error: error?.message || String(error) });
  }

  return true;
});
