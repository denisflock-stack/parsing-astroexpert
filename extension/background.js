const COLLECT_STATE_KEY = 'collectAllState';
const COLLECT_RESULT_KEY = 'collectAllResult';
const LANGUAGE_STORAGE_KEY = 'uiLanguage';
const PROMPT_STORAGE_PREFIX = 'userPrompt';

const SECTION_LABELS = {
  en: {
    base: 'Pod rukoi',
    divisional: 'Divisional charts',
    ashtakavarga: 'Ashtakavarga',
    vimshottari: 'Vimshottari Dasha: Pratyantardasha, today +5 years',
    notes: 'Notes',
    title: 'Astro.Expert data'
  },
  ru: {
    base: 'Под рукой',
    divisional: 'Дробные карты',
    ashtakavarga: 'Аштакаварга',
    vimshottari: 'Вимшоттари Даша: Pratyantardasha, today +5 years',
    notes: 'Примечания',
    title: 'Данные Astro.Expert'
  }
};

let activeRun = null;

function storageGet(defaults) {
  return chrome.storage.local.get(defaults);
}

function storageSet(values) {
  return chrome.storage.local.set(values);
}

async function updateCollectState(patch) {
  const current = await storageGet({ [COLLECT_STATE_KEY]: {} });
  await storageSet({
    [COLLECT_STATE_KEY]: {
      ...(current[COLLECT_STATE_KEY] || {}),
      ...patch
    }
  });
}

async function getCollectState() {
  const result = await storageGet({ [COLLECT_STATE_KEY]: {} });
  return result[COLLECT_STATE_KEY] || {};
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftYears(date, years) {
  const next = new Date(date.getTime());
  next.setFullYear(next.getFullYear() + years);
  return next;
}

async function sendToTab(tabId, message) {
  return chrome.tabs.sendMessage(tabId, message);
}

async function injectContentScripts(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['vimshottari.js', 'parser-core.js', 'content-script.js']
  });
}

async function waitForTabComplete(tabId, timeoutMs = 30000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab) {
      throw new Error('Active tab was closed.');
    }
    if (tab.status === 'complete') {
      return tab;
    }
    await sleep(250);
  }
  throw new Error('Timed out while waiting for page load.');
}

async function waitForContentReady(tabId, timeoutMs = 30000) {
  const startedAt = Date.now();
  let lastError = null;
  let injectedScripts = false;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await sendToTab(tabId, { type: 'COLLECT_PING' });
      if (response?.ok) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (!injectedScripts && /Receiving end does not exist|Could not establish connection/i.test(error?.message || '')) {
        injectedScripts = true;
        try {
          await injectContentScripts(tabId);
        } catch (injectError) {
          lastError = injectError;
        }
      }
    }
    await sleep(300);
  }
  throw new Error(lastError?.message || 'Content script is not ready.');
}

async function ensureTabReady(tabId) {
  await waitForTabComplete(tabId);
  await waitForContentReady(tabId);
}

async function showOverlay(tabId, message) {
  await sendToTab(tabId, { type: 'SHOW_COLLECT_OVERLAY', message }).catch(() => {});
}

async function hideOverlay(tabId) {
  await sendToTab(tabId, { type: 'HIDE_COLLECT_OVERLAY' }).catch(() => {});
}

async function checkCancelled() {
  const state = await getCollectState();
  if (state.cancelRequested) {
    throw new Error('COLLECT_CANCELLED');
  }
}

async function parseCurrentPage(tabId, language, options = {}) {
  const response = await sendToTab(tabId, { type: 'PARSE_ASTRO_PAGE' });
  if (!response?.ok) {
    throw new Error(response?.error || 'Parse failed.');
  }

  const localized = language === 'ru' ? response.data?.finalResultTextRu : response.data?.finalResultTextEn;
  const charts = [];
  if (localized?.dataWithHouses && !options.omitBaseChart) {
    charts.push({
      chartName: localized.dataWithHouses.chartName || 'D1',
      planets: localized.dataWithHouses.planets || []
    });
  }
  charts.push(...(localized?.parsedCharts || []));

  if (!charts.length) {
    throw new Error('No parsed chart data found.');
  }

  return charts
    .map((chart) => `${chart.chartName || 'Chart'}\n${(chart.planets || []).join('\n')}`.trim())
    .join('\n\n');
}

async function findSectionHref(tabId, candidates) {
  const response = await sendToTab(tabId, {
    type: 'FIND_ASTRO_SECTION_LINK',
    candidates
  });
  return response?.href || null;
}

async function clickSection(tabId, candidates, message) {
  const response = await sendToTab(tabId, {
    type: 'CLICK_ASTRO_SECTION',
    candidates
  });

  if (!response?.ok) {
    return false;
  }

  await sleep(900);
  await ensureTabReady(tabId);
  await showOverlay(tabId, message);
  await sleep(500);
  return true;
}

async function navigateToHref(tabId, href, message) {
  await chrome.tabs.update(tabId, { url: href });
  await ensureTabReady(tabId);
  await showOverlay(tabId, message);
  await sleep(700);
}

async function reloadWorkflowTab(tabId, message) {
  await chrome.tabs.reload(tabId);
  await ensureTabReady(tabId);
  await showOverlay(tabId, message);
  await sleep(500);
}

async function collectChartSection(context, section) {
  const { tabId, language, labels, collectedSections, errors } = context;
  await checkCancelled();
  await updateCollectState({ currentStep: section.progress });
  await showOverlay(tabId, section.progress);

  if (section.candidates?.length) {
    const clicked = await clickSection(tabId, section.candidates, section.progress);
    if (!clicked) {
      const href = await findSectionHref(tabId, section.candidates);
      if (href) {
        await navigateToHref(tabId, href, section.progress);
      } else {
        errors.push(`${section.label}: not found`);
        return;
      }
    }
  }

  await checkCancelled();
  try {
    const text = await parseCurrentPage(tabId, language, section.parseOptions || {});
    collectedSections.push({ title: section.label, text });
  } catch (error) {
    errors.push(`${section.label}: ${error?.message || String(error)}`);
  }
}

async function collectVimshottari(context) {
  const { tabId, labels, collectedSections, errors } = context;
  await checkCancelled();
  await updateCollectState({ currentStep: labels.vimshottari });
  await showOverlay(tabId, labels.vimshottari);

  const candidates = ['vimshottari', 'вимшоттари'];
  const clicked = await clickSection(tabId, candidates, labels.vimshottari);
  if (!clicked) {
    const href = await findSectionHref(tabId, candidates);
    if (href) {
      await navigateToHref(tabId, href, labels.vimshottari);
    } else {
      errors.push(`${labels.vimshottari}: not found`);
      return;
    }
  }

  await reloadWorkflowTab(tabId, labels.vimshottari);
  await checkCancelled();

  const today = new Date();
  const fromDateText = formatIsoDate(today);
  const targetDateText = formatIsoDate(shiftYears(today, 5));

  const response = await sendToTab(tabId, {
    type: 'APPLY_VIMSHOTTARI_HORIZON',
    level: '3',
    fromDateText,
    targetDateText
  });

  if (!response?.ok) {
    errors.push(`${labels.vimshottari}: ${response?.error || 'Failed to open period'}`);
    return;
  }

  await sleep(500);
  await checkCancelled();

  const exportResponse = await sendToTab(tabId, { type: 'EXPORT_VIMSHOTTARI_TEXT' });
  const text = exportResponse?.data?.text || '';
  if (!exportResponse?.ok || !text.trim()) {
    errors.push(`${labels.vimshottari}: ${exportResponse?.error || 'No dasha text exported'}`);
    return;
  }

  collectedSections.push({ title: labels.vimshottari, text });
}

async function loadPrompt(language) {
  const stored = await storageGet({ [`${PROMPT_STORAGE_PREFIX}:${language}`]: null });
  const savedPrompt = stored[`${PROMPT_STORAGE_PREFIX}:${language}`];
  if (typeof savedPrompt === 'string' && savedPrompt.trim()) {
    return savedPrompt;
  }

  const response = await fetch(chrome.runtime.getURL(`prompts/prompt.${language}.md`));
  return response.text();
}

function buildResultText({ prompt, labels, collectedSections, errors }) {
  const sectionBlocks = collectedSections
    .map((section) => `## ${section.title}\n\n${section.text}`.trim())
    .join('\n\n');

  const notes = errors.length
    ? `\n\n## ${labels.notes}\n\n${errors.map((error) => `- ${error}`).join('\n')}`
    : '';

  return `${prompt.trim()}\n\n---\n\n# ${labels.title}\n\n${sectionBlocks || '_No data collected._'}${notes}\n`;
}

async function openResultPage(text, language, status) {
  await storageSet({
    [COLLECT_RESULT_KEY]: {
      text,
      language,
      status,
      finishedAt: Date.now()
    }
  });
  await chrome.tabs.create({ url: chrome.runtime.getURL('collect-result.html') });
}

async function runCollectAll(tabId, language) {
  const labels = SECTION_LABELS[language] || SECTION_LABELS.en;
  const collectedSections = [];
  const errors = [];

  try {
    await updateCollectState({
      running: true,
      cancelRequested: false,
      activeTabId: tabId,
      currentStep: labels.divisional,
      collectedSections: [],
      errors: [],
      startedAt: Date.now()
    });

    await ensureTabReady(tabId);
    await reloadWorkflowTab(tabId, labels.divisional);

    await collectChartSection({
      tabId,
      language,
      labels,
      collectedSections,
      errors
    }, {
      label: labels.divisional,
      progress: labels.divisional,
      candidates: ['divisional', 'division', 'varga', 'дроб', 'дробные']
    });

    await collectChartSection({
      tabId,
      language,
      labels,
      collectedSections,
      errors
    }, {
      label: labels.ashtakavarga,
      progress: labels.ashtakavarga,
      candidates: ['ashtakavarga', 'аштакаварга'],
      parseOptions: { omitBaseChart: true }
    });

    await collectVimshottari({
      tabId,
      language,
      labels,
      collectedSections,
      errors
    });

    await checkCancelled();
    const prompt = await loadPrompt(language);
    const text = buildResultText({ prompt, labels, collectedSections, errors });
    await openResultPage(text, language, 'completed');
    await updateCollectState({ running: false, currentStep: 'Completed', collectedSections, errors });
  } catch (error) {
    const cancelled = error?.message === 'COLLECT_CANCELLED';
    const prompt = await loadPrompt(language).catch(() => '');
    const text = buildResultText({
      prompt,
      labels,
      collectedSections,
      errors: cancelled ? [...errors, 'Stopped by user'] : [...errors, error?.message || String(error)]
    });
    await openResultPage(text, language, cancelled ? 'cancelled' : 'error');
    await updateCollectState({
      running: false,
      currentStep: cancelled ? 'Stopped' : 'Error',
      collectedSections,
      errors
    });
  } finally {
    await hideOverlay(tabId);
    activeRun = null;
  }
}

async function startCollectAll(options = {}) {
  if (activeRun) {
    return { ok: false, error: 'Collect all is already running.' };
  }

  const tab = options.tabId
    ? await chrome.tabs.get(options.tabId)
    : (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  if (!tab?.id || !/^https:\/\/.*astro\.expert\//i.test(tab.url || '')) {
    return { ok: false, error: 'Open an Astro.Expert page first.' };
  }

  const settings = await storageGet({ [LANGUAGE_STORAGE_KEY]: 'en' });
  const languageSetting = options.language || settings[LANGUAGE_STORAGE_KEY];
  const language = languageSetting === 'ru' ? 'ru' : 'en';
  activeRun = runCollectAll(tab.id, language);
  activeRun.catch(() => {});
  return { ok: true };
}

async function cancelCollectAll() {
  await updateCollectState({ cancelRequested: true, currentStep: 'Stopping...' });
  const state = await getCollectState();
  if (state.activeTabId) {
    await hideOverlay(state.activeTabId);
  }
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'START_COLLECT_ALL') {
    startCollectAll(message).then(sendResponse).catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }

  if (message?.type === 'CANCEL_COLLECT_ALL') {
    cancelCollectAll().then(sendResponse).catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }

  if (message?.type === 'GET_COLLECT_ALL_STATE') {
    getCollectState().then((state) => sendResponse({ ok: true, data: state })).catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }

  return false;
});
