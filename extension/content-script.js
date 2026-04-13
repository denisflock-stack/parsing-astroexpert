function getVimshottariBridge() {
  if (!window.AstroVimshottari) {
    return null;
  }

  return window.AstroVimshottari;
}

const COLLECT_OVERLAY_ID = 'astroexpert-collect-overlay';

function normalizeCollectText(text = '') {
  return String(text).replace(/\s+/g, ' ').trim().toLowerCase();
}

function findAstroSectionLink(candidates = []) {
  const normalizedCandidates = (candidates || [])
    .map((candidate) => normalizeCollectText(candidate))
    .filter(Boolean);

  if (!normalizedCandidates.length) {
    return null;
  }

  const links = Array.from(document.querySelectorAll('a[href]'));
  const matched = links.find((link) => {
    const href = normalizeCollectText(link.href || link.getAttribute('href') || '');
    const text = normalizeCollectText(link.textContent || '');
    return normalizedCandidates.some((candidate) => href.includes(candidate) || text.includes(candidate));
  });

  return matched?.href || null;
}

function findAstroSectionControl(candidates = []) {
  const normalizedCandidates = (candidates || [])
    .map((candidate) => normalizeCollectText(candidate))
    .filter(Boolean);

  if (!normalizedCandidates.length) {
    return null;
  }

  const controls = Array.from(document.querySelectorAll('button, [role="button"], a[href], [wire\\:click]'));
  return controls.find((control) => {
    const text = normalizeCollectText(control.textContent || '');
    const href = normalizeCollectText(control.href || control.getAttribute?.('href') || '');
    return normalizedCandidates.some((candidate) => text.includes(candidate) || href.includes(candidate));
  }) || null;
}

function clickAstroSection(candidates = []) {
  const control = findAstroSectionControl(candidates);
  if (!control) {
    return { ok: false, error: 'Section control not found.' };
  }

  if (typeof control.click === 'function') {
    control.click();
  } else {
    control.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }

  return {
    ok: true,
    text: (control.textContent || '').replace(/\s+/g, ' ').trim(),
    href: control.href || control.getAttribute?.('href') || null
  };
}

function showCollectOverlay(message = 'Working...') {
  let overlay = document.getElementById(COLLECT_OVERLAY_ID);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = COLLECT_OVERLAY_ID;
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '2147483647';
    overlay.style.background = 'rgba(15, 23, 42, 0.38)';
    overlay.style.backdropFilter = 'blur(1px)';
    overlay.style.display = 'grid';
    overlay.style.placeItems = 'center';
    overlay.style.pointerEvents = 'auto';

    const card = document.createElement('div');
    card.style.maxWidth = '360px';
    card.style.margin = '16px';
    card.style.padding = '16px';
    card.style.borderRadius = '14px';
    card.style.background = '#ffffff';
    card.style.boxShadow = '0 18px 60px rgba(15, 23, 42, 0.28)';
    card.style.color = '#172033';
    card.style.font = '13px Arial, sans-serif';

    const title = document.createElement('div');
    title.dataset.role = 'title';
    title.textContent = 'Astro.Expert';
    title.style.fontWeight = '700';
    title.style.marginBottom = '8px';

    const text = document.createElement('div');
    text.dataset.role = 'message';
    text.style.lineHeight = '1.45';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Stop';
    button.style.marginTop = '12px';
    button.style.border = '1px solid #c7cfdd';
    button.style.borderRadius = '8px';
    button.style.background = '#ffffff';
    button.style.padding = '7px 12px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'CANCEL_COLLECT_ALL' }).catch(() => {});
    });

    card.append(title, text, button);
    overlay.appendChild(card);
    document.documentElement.appendChild(overlay);
  }

  const messageNode = overlay.querySelector('[data-role="message"]');
  if (messageNode) {
    messageNode.textContent = message;
  }

  return { ok: true };
}

function hideCollectOverlay() {
  document.getElementById(COLLECT_OVERLAY_ID)?.remove();
  return { ok: true };
}

function handleVimshottariMessage(message) {
  const bridge = getVimshottariBridge();
  if (!bridge) {
    return { ok: false, error: 'Dasha module is not initialized on this page.' };
  }

  switch (message.type) {
    case 'PARSE_VIMSHOTTARI_TREE':
      return { ok: true, data: bridge.parseVisibleTree() };
    case 'GET_VIMSHOTTARI_STATE':
      return { ok: true, data: bridge.getPanelState() };
    case 'OPEN_VIMSHOTTARI_PANEL':
      return { ok: true, data: bridge.openPanel(message.settings || null) };
    case 'SET_VIMSHOTTARI_HORIZON_SETTINGS':
      return { ok: true, data: bridge.setHorizonSettings(message.settings || null) };
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
    if (message?.type === 'COLLECT_PING') {
      sendResponse({ ok: true, url: window.location.href });
      return true;
    }

    if (message?.type === 'SHOW_COLLECT_OVERLAY') {
      sendResponse(showCollectOverlay(message.message));
      return true;
    }

    if (message?.type === 'HIDE_COLLECT_OVERLAY') {
      sendResponse(hideCollectOverlay());
      return true;
    }

    if (message?.type === 'FIND_ASTRO_SECTION_LINK') {
      sendResponse({ ok: true, href: findAstroSectionLink(message.candidates || []) });
      return true;
    }

    if (message?.type === 'CLICK_ASTRO_SECTION') {
      sendResponse(clickAstroSection(message.candidates || []));
      return true;
    }

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
