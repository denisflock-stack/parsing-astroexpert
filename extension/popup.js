const state = {
  language: 'en',
  mode: 'charts',
  charts: [],
  parsed: null,
  selected: new Set(),
  vimshottari: null,
  helpOpen: false,
  promptOpen: false,
  promptEditing: false,
  promptText: '',
  promptPath: '',
  vimAutoRefreshTimer: null,
  vimAutoRefreshPending: false
};

const LANGUAGE_STORAGE_KEY = 'uiLanguage';
const PROMPT_STORAGE_PREFIX = 'userPrompt';

// Keep this file in UTF-8 so Russian UI labels do not turn into mojibake.
const t = {
  en: {
    parse: 'Update',
    copy: 'Copy selected',
    selectAll: 'Select all',
    noData: 'No cards found on this page.',
    copied: 'Copied.',
    noSelection: 'Select at least one item.',
    parseError: 'Parsing error:',
    parseDone: 'Ready.',
    open: 'Open',
    close: 'Close',
    chartTitle: 'Chart',
    vimTitle: 'Vimshottari Dasha',
    refreshTree: 'Refresh',
    copyTree: 'Copy text',
    treeEmpty: 'No visible periods found.',
    treeError: 'Vimshottari error:',
    noActiveTab: 'No active tab',
    subtitleVim: 'Work with the Vimshottari tree directly in this popup.',
    subtitleChart: '-',
    working: 'Working...',
    help: 'Help',
    helpTitle: 'How to use',
    helpClose: 'Close',
    promptToggle: 'Example prompt',
    promptHide: 'Hide prompt',
    promptCopy: 'Copy prompt',
    promptEdit: 'Edit',
    promptSave: 'Save',
    promptReset: 'Reset',
    promptResetConfirm: 'Reset this prompt to the default version? Your saved edits will be deleted.',
    promptSaved: 'Prompt saved.',
    promptResetDone: 'Default prompt restored.',
    promptCopied: 'Prompt copied.',
    promptError: 'Prompt loading error:',
    promptNote: 'EN and RU prompts are saved separately. Your edits are stored locally in this browser and will be deleted if browser or extension data is cleared.',
    helpStepsCharts: [
      'Works on Pod rukoi, Divisional charts, Ashtakavarga, Vimshottari Dasha, and Ashtottari Dasha pages.',
      'Select the chart sections you need.',
      'Click "Copy selected" to copy the data.',
      'Paste the data into the AI chat.'
    ],
    helpStepsVim: [
      'Works on Pod rukoi, Divisional charts, Ashtakavarga, Vimshottari Dasha, and Ashtottari Dasha pages.',
      'Click a period name or date to open a subperiod.',
      'Mark the periods you need with checkboxes.',
      'Click "Copy" to copy the selected data.',
      'The "Open" button automatically opens and selects dashas for the selected period.\n⚠ (Please review the result — it may miss something.)',
      'Paste the data into the AI chat.'
    ]
  },
  ru: {
    parse: 'Обновить',
    copy: 'Copy selected',
    selectAll: 'Select all',
    noData: 'No cards found on this page.',
    copied: 'Copied.',
    noSelection: 'Select at least one item.',
    parseError: 'Parsing error:',
    parseDone: 'Ready.',
    open: 'Open',
    close: 'Close',
    chartTitle: 'Карта',
    vimTitle: 'Вимшоттари Даша',
    refreshTree: 'Refresh',
    copyTree: 'Copy text',
    treeEmpty: 'No visible periods found.',
    treeError: 'Vimshottari error:',
    noActiveTab: 'No active tab',
    working: 'Working...',
    help: 'Помощь',
    helpTitle: 'Как пользоваться',
    helpClose: 'Закрыть',
    promptToggle: 'Пример промта',
    promptHide: 'Скрыть промт',
    promptCopy: 'Копировать промт',
    promptEdit: 'Редактировать',
    promptSave: 'Сохранить',
    promptReset: 'Сбросить',
    promptResetConfirm: 'Сбросить промт к стандартной версии? Сохранённые правки будут удалены.',
    promptSaved: 'Промт сохранён.',
    promptResetDone: 'Промт сброшен к стандартному.',
    promptCopied: 'Промт скопирован.',
    promptError: 'Ошибка загрузки промта:',
    promptNote: 'Промты RU и EN сохраняются отдельно. Правки хранятся локально в этом браузере и удалятся при очистке данных браузера или расширения.',
    helpStepsCharts: [
      'Работает на страницах Под рукой, Дробные карты, Аштакаварга, Вимшоттари Даша, Ашоттари Даша.',
      'Выберите нужные разделы карты.',
      'Нажмите "Копировать выбранное", чтобы скопировать данные.',
      'Вставьте данные в чат нейросети.'
    ],
    helpStepsVim: [
      'Работает на страницах Под рукой, Дробные карты, Аштакаварга, Вимшоттари Даша, Ашоттари Даша.',
      'Нажимайте на название периода или дату, чтобы открыть подпериод.',
      'Отметьте галочками нужные периоды.',
      'Нажмите "Копировать", чтобы скопировать выбранные данные.',
      'Кнопка «Открыть» автоматически раскрывает и выбирает даши за указанный период.\n⚠ (Проверьте результат — может что-то пропустить)',
      'Вставьте данные в чат нейросети.'
    ]
  }
};

t.en.pinPanel = 'Pin';
t.en.pinnedToPage = 'Panel opened on the page.';
t.ru.pinPanel = 'Закрепить';
t.ru.pinnedToPage = 'Панель открыта на странице.';
t.ru.copy = 'Копировать выбранное';
t.ru.selectAll = 'Выбрать все';
t.ru.noData = 'На странице не найдены карты.';
t.ru.copied = 'Скопировано.';
t.ru.noSelection = 'Выберите хотя бы один элемент.';
t.ru.parseError = 'Ошибка парсинга:';
t.ru.parseDone = 'Готово.';
t.ru.open = 'Открыть';
t.ru.close = 'Закрыть';
t.ru.refreshTree = 'Обновить';
t.ru.copyTree = 'Копировать';
t.ru.treeEmpty = 'Видимые периоды не найдены.';
t.ru.treeError = 'Ошибка Вимшоттари:';
t.ru.noActiveTab = 'Нет активной вкладки';
t.ru.working = 'Обработка...';
t.en.manualDate = 'data';
t.ru.manualDate = 'дата';

const elements = {
  d1Title: document.getElementById('d1Title'),
  userData: document.getElementById('userData'),
  helpToggle: document.getElementById('helpToggle'),
  helpPanel: document.getElementById('helpPanel'),
  helpTitle: document.getElementById('helpTitle'),
  helpSteps: document.getElementById('helpSteps'),
  helpClose: document.getElementById('helpClose'),
  promptToggle: document.getElementById('promptToggle'),
  promptEdit: document.getElementById('promptEdit'),
  promptCopy: document.getElementById('promptCopy'),
  promptReset: document.getElementById('promptReset'),
  promptNote: document.getElementById('promptNote'),
  promptPreview: document.getElementById('promptPreview'),
  promptEditor: document.getElementById('promptEditor'),
  langToggle: document.getElementById('langToggle'),
  chartMode: document.getElementById('chartMode'),
  refreshBtn: document.getElementById('refreshBtn'),
  copySelectedBtn: document.getElementById('copySelectedBtn'),
  chartControls: document.getElementById('chartControls'),
  selectAll: document.getElementById('selectAll'),
  selectAllLabel: document.getElementById('selectAllLabel'),
  chartList: document.getElementById('chartList'),
  vimMode: document.getElementById('vimMode'),
  vimSelectAll: document.getElementById('vimSelectAll'),
  vimSelectAllLabel: document.getElementById('vimSelectAllLabel'),
  pinPanelBtn: document.getElementById('pinPanelBtn'),
  refreshTreeBtn: document.getElementById('refreshTreeBtn'),
  copyTreeBtn: document.getElementById('copyTreeBtn'),
  levelSelect: document.getElementById('levelSelect'),
  fromPresetSelect: document.getElementById('fromPresetSelect'),
  fromDateInput: document.getElementById('fromDateInput'),
  toDateInput: document.getElementById('toDateInput'),
  toPresetSelect: document.getElementById('toPresetSelect'),
  applyHorizonBtn: document.getElementById('applyHorizonBtn'),
  vimshottariTree: document.getElementById('vimshottariTree'),
  status: document.getElementById('status')
};

function tr(key) {
  return t[state.language][key] || key;
}

function getActiveDashaTitle() {
  return state.vimshottari?.dashaTitles?.[state.language]
    || state.vimshottari?.dashaTitles?.en
    || tr('vimTitle');
}

function getTreeErrorPrefix() {
  return `${getActiveDashaTitle()} error:`;
}

function loadSavedLanguage() {
  return new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      resolve('en');
      return;
    }

    chrome.storage.local.get({ [LANGUAGE_STORAGE_KEY]: 'en' }, (result) => {
      resolve(result?.[LANGUAGE_STORAGE_KEY] === 'ru' ? 'ru' : 'en');
    });
  });
}

function getCurrentHorizonSettings() {
  return {
    level: elements.levelSelect.value || '2',
    fromPreset: elements.fromPresetSelect.value || 'today',
    fromDate: elements.fromDateInput.value || formatIsoDate(new Date()),
    toDate: elements.toDateInput.value || formatIsoDate(new Date()),
    toPreset: elements.toPresetSelect.value || 'today'
  };
}

function applyHorizonSettings(settings) {
  if (!settings) return;

  if (settings.level) {
    elements.levelSelect.value = settings.level;
  }

  if (settings.fromDate) {
    elements.fromDateInput.value = settings.fromDate;
  }

  if (settings.toDate) {
    elements.toDateInput.value = settings.toDate;
  }

  syncPresetFromDate(elements.fromPresetSelect, elements.fromDateInput, [-1, -2, -3, -4, -5]);
  syncPresetFromDate(elements.toPresetSelect, elements.toDateInput, [1, 2, 3, 4, 5]);

  if (settings.fromPreset === 'data') {
    ensureTemporaryManualOption(elements.fromPresetSelect);
    elements.fromPresetSelect.value = 'data';
  } else if (settings.fromPreset) {
    removeTemporaryManualOption(elements.fromPresetSelect);
    elements.fromPresetSelect.value = settings.fromPreset;
  }

  if (settings.toPreset === 'data') {
    ensureTemporaryManualOption(elements.toPresetSelect);
    elements.toPresetSelect.value = 'data';
  } else if (settings.toPreset) {
    removeTemporaryManualOption(elements.toPresetSelect);
    elements.toPresetSelect.value = settings.toPreset;
  }
}

function persistCurrentHorizonSettings() {
  if (state.mode !== 'vimshottari') return;
  sendToActiveTab({
    type: 'SET_VIMSHOTTARI_HORIZON_SETTINGS',
    settings: getCurrentHorizonSettings()
  }).catch(() => {});
}

function saveLanguage(language) {
  if (!chrome?.storage?.local) return;
  chrome.storage.local.set({ [LANGUAGE_STORAGE_KEY]: language });
}

function setStatus(message) {
  elements.status.textContent = message;
}

function getHelpSteps() {
  return state.mode === 'vimshottari' ? tr('helpStepsVim') : tr('helpStepsCharts');
}

function getPromptPath() {
  return `prompts/prompt.${state.language}.md`;
}

function getPromptStorageKey() {
  return `${PROMPT_STORAGE_PREFIX}:${state.language}`;
}

function getStoredPrompt() {
  return new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      resolve(null);
      return;
    }

    chrome.storage.local.get({ [getPromptStorageKey()]: null }, (result) => {
      const value = result?.[getPromptStorageKey()];
      resolve(typeof value === 'string' && value.trim() ? value : null);
    });
  });
}

function saveStoredPrompt(text) {
  return new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      resolve();
      return;
    }

    chrome.storage.local.set({ [getPromptStorageKey()]: text }, resolve);
  });
}

function removeStoredPrompt() {
  return new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      resolve();
      return;
    }

    chrome.storage.local.remove(getPromptStorageKey(), resolve);
  });
}

async function loadPromptExample() {
  const promptPath = getPromptPath();
  if (state.promptText && state.promptPath === promptPath) {
    return state.promptText;
  }

  const response = await fetch(chrome.runtime.getURL(promptPath));
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`.trim());
  }

  state.promptPath = promptPath;
  state.promptText = await getStoredPrompt() || await response.text();
  return state.promptText;
}

function renderHelpPanel() {
  elements.helpPanel.classList.toggle('hidden', !state.helpOpen);
  elements.helpToggle.textContent = tr('help');
  elements.helpTitle.textContent = tr('helpTitle');
  elements.helpClose.textContent = tr('helpClose');
  elements.promptToggle.textContent = state.promptOpen ? tr('promptHide') : tr('promptToggle');
  elements.promptCopy.textContent = tr('promptCopy');
  elements.promptEdit.textContent = state.promptEditing ? tr('promptSave') : tr('promptEdit');
  elements.promptReset.textContent = tr('promptReset');
  elements.promptNote.textContent = tr('promptNote');
  elements.promptEdit.classList.toggle('hidden', !state.promptOpen || !state.promptText);
  elements.promptCopy.classList.toggle('hidden', !state.promptOpen || !state.promptText);
  elements.promptReset.classList.toggle('hidden', !state.promptOpen || !state.promptText);
  elements.promptNote.classList.toggle('hidden', !state.promptOpen);
  elements.promptPreview.classList.toggle('hidden', !state.promptOpen || state.promptEditing);
  elements.promptEditor.classList.toggle('hidden', !state.promptOpen || !state.promptEditing);
  elements.promptPreview.textContent = state.promptOpen
    ? (state.promptText || tr('working'))
    : '';
  if (
    state.promptOpen
    && state.promptEditing
    && document.activeElement !== elements.promptEditor
    && elements.promptEditor.value !== state.promptText
  ) {
    elements.promptEditor.value = state.promptText;
  }
  elements.helpSteps.innerHTML = '';

  getHelpSteps().forEach((step) => {
    const item = document.createElement('li');
    item.textContent = step;
    elements.helpSteps.appendChild(item);
  });
}

function syncStatusFromVimState(fallbackMessage) {
  const message = state.vimshottari?.statusMessage || fallbackMessage || '';
  setStatus(message);
}

function setMode(mode) {
  const modeChanged = state.mode !== mode;
  state.mode = mode;
  if (modeChanged) {
    state.promptOpen = false;
    state.promptEditing = false;
    state.promptText = '';
    state.promptPath = '';
  }
  elements.chartMode.classList.toggle('hidden', mode !== 'charts');
  elements.vimMode.classList.toggle('hidden', mode !== 'vimshottari');
  renderHelpPanel();

  if (mode === 'vimshottari') {
    startVimAutoRefresh();
    return;
  }

  stopVimAutoRefresh();
}

function updateLabels() {
  renderHelpPanel();
  elements.langToggle.textContent = state.language.toUpperCase();
  elements.refreshBtn.textContent = tr('parse');
  elements.copySelectedBtn.textContent = tr('copy');
  elements.selectAllLabel.textContent = tr('selectAll');
  elements.vimSelectAllLabel.textContent = tr('selectAll');
  elements.pinPanelBtn.textContent = tr('pinPanel');
  elements.refreshTreeBtn.textContent = tr('refreshTree');
  elements.copyTreeBtn.textContent = tr('copyTree');
  elements.applyHorizonBtn.textContent = tr('open');
  updateHorizonOptionLabels();
}

function relabelSelectOptions(select, labelsByValue) {
  Array.from(select.options).forEach((option) => {
    if (labelsByValue[option.value]) {
      option.textContent = labelsByValue[option.value];
    }
  });
}

function updateHorizonOptionLabels() {
  relabelSelectOptions(elements.levelSelect, {
    '2': state.language === 'ru' ? 'Антардаша' : 'Antardasha',
    '3': state.language === 'ru' ? 'Пратьянтардаша' : 'Pratyantardasha'
  });

  const fromLabels = {
    today: state.language === 'ru' ? 'сегодня' : 'today',
    '-1': '-1',
    '-2': '-2',
    '-3': '-3',
    '-4': '-4',
    '-5': '-5',
    data: tr('manualDate')
  };

  const toLabels = {
    today: state.language === 'ru' ? 'сегодня' : 'today',
    '1': '+1',
    '2': '+2',
    '3': '+3',
    '4': '+4',
    '5': '+5',
    data: tr('manualDate')
  };

  relabelSelectOptions(elements.fromPresetSelect, fromLabels);
  relabelSelectOptions(elements.toPresetSelect, toLabels);
}

function createIcon(type) {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '1.9');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  icon.setAttribute('aria-hidden', 'true');

  if (type === 'date') {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '3');
    rect.setAttribute('y', '4');
    rect.setAttribute('width', '18');
    rect.setAttribute('height', '17');
    rect.setAttribute('rx', '2');

    const topLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    topLine.setAttribute('x1', '3');
    topLine.setAttribute('y1', '9');
    topLine.setAttribute('x2', '21');
    topLine.setAttribute('y2', '9');

    const leftPin = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftPin.setAttribute('x1', '8');
    leftPin.setAttribute('y1', '2');
    leftPin.setAttribute('x2', '8');
    leftPin.setAttribute('y2', '6');

    const rightPin = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightPin.setAttribute('x1', '16');
    rightPin.setAttribute('y1', '2');
    rightPin.setAttribute('x2', '16');
    rightPin.setAttribute('y2', '6');

    icon.append(rect, topLine, leftPin, rightPin);
    return icon;
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 21s-7-4.35-7-11a7 7 0 1 1 14 0c0 6.65-7 11-7 11Z');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '10');
  circle.setAttribute('r', '2.5');

  icon.append(path, circle);
  return icon;
}

function createMetaItem(type, text) {
  const item = document.createElement('span');
  item.className = 'meta-item';

  const label = document.createElement('span');
  label.className = 'meta-text';
  label.textContent = text;

  item.append(createIcon(type), label);
  return item;
}

function updateHeader() {
  if (state.mode === 'vimshottari') {
    const owner = state.vimshottari?.owner || {};
    const chartName = (owner.name || 'D1').trim() || 'D1';
    elements.d1Title.textContent = `${tr('chartTitle')}: ${chartName}`;
    elements.userData.replaceChildren();

    if (owner.birthDateTime) {
      elements.userData.appendChild(createMetaItem('date', owner.birthDateTime));
    }

    if (owner.birthPlace) {
      elements.userData.appendChild(createMetaItem('place', owner.birthPlace));
    }

    if (!elements.userData.childNodes.length) {
      elements.userData.textContent = state.vimshottari?.statusMessage || '-';
    }
    return;
  }

  if (!state.parsed) {
    elements.d1Title.textContent = tr('chartTitle');
    elements.userData.textContent = '-';
    return;
  }

  const data = state.parsed.finalResult?.dataWithHouses || {};
  const chartName = (data.chartName || 'D1').replace(/\s*\(D1\)\s*$/i, '').trim() || 'D1';
  elements.d1Title.textContent = `${tr('chartTitle')}: ${chartName}`;

  const owner = data.owner || {};
  elements.userData.replaceChildren();

  if (owner.birthDateTime) {
    elements.userData.appendChild(createMetaItem('date', owner.birthDateTime));
  }

  if (owner.birthPlace) {
    elements.userData.appendChild(createMetaItem('place', owner.birthPlace));
  }

  if (!elements.userData.childNodes.length) {
    elements.userData.textContent = '-';
  }
}

function formatChartContent(chart) {
  return chart.planets || [];
}

function getBirthDateOnly() {
  const birthDateTime = state.parsed?.finalResult?.dataWithHouses?.owner?.birthDateTime || '';
  const match = birthDateTime.match(/\d{2}\.\d{2}\.\d{4}/);
  return match ? match[0] : '';
}

function getCopyTitle(chart, index) {
  const baseTitle = chart.chartName || `#${index + 1}`;
  const isD1 = index === 0 && chart?.chartName;
  if (!isD1) return baseTitle;

  const birthDate = getBirthDateOnly();
  return birthDate ? `${baseTitle} - ${birthDate}` : baseTitle;
}

function buildChartsForPopup(localizedResult) {
  if (!localizedResult) return [];

  const d1Chart = localizedResult.dataWithHouses
    ? [{
        chartName: localizedResult.dataWithHouses.chartName || 'D1',
        planets: localizedResult.dataWithHouses.planets || []
      }]
    : [];

  return [...d1Chart, ...(localizedResult.parsedCharts || [])];
}

function syncSelectAll() {
  const total = state.charts.length;
  elements.selectAll.checked = total > 0 && state.selected.size === total;
}

function renderList() {
  elements.chartList.innerHTML = '';
  const charts = state.charts;

  if (!charts.length) {
    setStatus(tr('noData'));
    return;
  }

  charts.forEach((chart, index) => {
    const row = document.createElement('li');
    row.className = 'chart-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.selected.has(index);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.selected.add(index);
      } else {
        state.selected.delete(index);
      }
      syncSelectAll();
    });

    const name = document.createElement('div');
    name.className = 'chart-name';
    name.textContent = chart.chartName || `#${index + 1}`;

    const expand = document.createElement('button');
    expand.className = 'expand-btn';
    expand.textContent = tr('open');

    const content = document.createElement('pre');
    content.className = 'chart-content';
    content.textContent = formatChartContent(chart).join('\n');

    expand.addEventListener('click', () => {
      const isOpen = content.classList.toggle('open');
      expand.textContent = isOpen ? tr('close') : tr('open');
    });

    row.append(checkbox, name, expand);
    elements.chartList.append(row, content);
  });

  syncSelectAll();
  setStatus(tr('parseDone'));
}

function getActiveTab() {
  return chrome.tabs.query({ active: true, currentWindow: true }).then(([activeTab]) => {
    const activeUrl = activeTab?.url || '';
    if (activeTab?.id && !/^chrome-extension:|^chrome:|^about:/i.test(activeUrl)) {
      return activeTab;
    }

    return chrome.tabs.query({ currentWindow: true }).then((tabs) => {
      const fallback = tabs.find((tab) => /astro\.expert/i.test(tab.url || ''));
      return fallback || activeTab || null;
    });
  });
}

async function sendToActiveTab(message) {
  const tab = await getActiveTab();
  if (!tab?.id) {
    return { ok: false, error: tr('noActiveTab') };
  }

  const response = await chrome.tabs.sendMessage(tab.id, message).catch((error) => ({
    ok: false,
    error: error.message
  }));

  return response?.ok ? response : { ok: false, error: response?.error || 'unknown error' };
}

async function requestParse() {
  setStatus(tr('working'));
  const response = await sendToActiveTab({ type: 'PARSE_ASTRO_PAGE' });

  if (!response.ok) {
    setStatus(`${tr('parseError')} ${response.error}`);
    return;
  }

  state.parsed = response.data;
  const localized = state.language === 'ru' ? response.data.finalResultTextRu : response.data.finalResultTextEn;
  state.charts = buildChartsForPopup(localized).slice(0, 100);
  state.selected.clear();

  setMode('charts');
  updateHeader();
  renderList();
}

function applyVimState(nextState) {
  state.vimshottari = nextState;
  applyHorizonSettings(nextState?.horizonSettings || null);
  setMode('vimshottari');
  updateHeader();
  renderVimshottariTree();
  syncStatusFromVimState(tr('parseDone'));
}

async function requestVimshottariState() {
  setStatus(tr('working'));
  const response = await sendToActiveTab({ type: 'GET_VIMSHOTTARI_STATE' });

  if (!response.ok) {
    setStatus(`${getTreeErrorPrefix()} ${response.error}`);
    return;
  }

  applyVimState(response.data);
}

async function syncVimshottariStateSilently() {
  if (state.vimAutoRefreshPending) return;
  state.vimAutoRefreshPending = true;

  try {
    const response = await sendToActiveTab({ type: 'GET_VIMSHOTTARI_STATE' });
    if (response.ok) {
      applyVimState(response.data);
    }
  } finally {
    state.vimAutoRefreshPending = false;
  }
}

function startVimAutoRefresh() {
  if (state.vimAutoRefreshTimer) return;
  state.vimAutoRefreshTimer = window.setInterval(() => {
    if (state.mode !== 'vimshottari') return;
    syncVimshottariStateSilently();
  }, 700);
}

function stopVimAutoRefresh() {
  if (!state.vimAutoRefreshTimer) return;
  window.clearInterval(state.vimAutoRefreshTimer);
  state.vimAutoRefreshTimer = null;
  state.vimAutoRefreshPending = false;
}

function renderVimshottariNodes(nodes, depth = 0) {
  nodes.forEach((node) => {
    const row = document.createElement('div');
    row.className = 'vim-node';
    row.style.marginLeft = `${depth * 14}px`;

    const line = document.createElement('div');
    line.className = 'vim-line';

    const marker = document.createElement('input');
    marker.type = 'checkbox';
    marker.className = 'vim-marker';
    marker.checked = !!node.checked;
    marker.addEventListener('change', async () => {
      const response = await sendToActiveTab({
        type: 'SET_VIMSHOTTARI_MARKER',
        path: node.path,
        checked: marker.checked
      });

      if (!response.ok) {
        setStatus(`${getTreeErrorPrefix()} ${response.error}`);
        return;
      }

      applyVimState(response.data);
    });

    const title = document.createElement('span');
    title.className = `vim-title${depth === 0 ? ' root' : ''}`;
    title.textContent = node.title;

    const dates = document.createElement('span');
    dates.className = 'vim-dates';
    if (node.begin && node.end) {
      dates.textContent = `${node.begin} -> ${node.end}`;
    } else if (node.begin) {
      dates.textContent = node.begin;
    } else if (node.end) {
      dates.textContent = node.end;
    } else {
      dates.textContent = '';
    }

    const navigate = async () => {
      setStatus(tr('working'));
      const response = await sendToActiveTab({
        type: 'NAVIGATE_VIMSHOTTARI_NODE',
        path: node.path
      });

      if (!response.ok) {
        setStatus(`${getTreeErrorPrefix()} ${response.error}`);
        return;
      }

      applyVimState(response.data.state);
      syncStatusFromVimState(response.data.ok ? tr('parseDone') : getTreeErrorPrefix());
    };

    title.addEventListener('click', navigate);
    dates.addEventListener('click', navigate);

    line.append(marker, title, dates);
    row.appendChild(line);
    elements.vimshottariTree.appendChild(row);

    if (node.children?.length) {
      renderVimshottariNodes(node.children, depth + 1);
    }
  });
}

function renderVimshottariTree() {
  elements.vimshottariTree.innerHTML = '';
  const tree = state.vimshottari?.tree || [];

  elements.vimSelectAll.checked = !!state.vimshottari?.allChecked;
  elements.vimSelectAll.indeterminate = !!state.vimshottari?.partiallyChecked;

  if (!tree.length) {
    const empty = document.createElement('div');
    empty.className = 'vim-empty';
    empty.textContent = tr('treeEmpty');
    elements.vimshottariTree.appendChild(empty);
    return;
  }

  renderVimshottariNodes(tree, 0);
}

function copySelected() {
  if (!state.selected.size) {
    setStatus(tr('noSelection'));
    return;
  }

  const grouped = Array.from(state.selected)
    .sort((a, b) => a - b)
    .map((index) => {
      const chart = state.charts[index];
      const body = formatChartContent(chart).join('\n');
      return `${getCopyTitle(chart, index)}\n${body}`;
    })
    .join('\n\n');

  navigator.clipboard.writeText(grouped)
    .then(() => setStatus(tr('copied')))
    .catch((error) => setStatus(String(error)));
}

async function refreshVimshottari() {
  setStatus(tr('working'));
  const response = await sendToActiveTab({ type: 'REFRESH_VIMSHOTTARI' });

  if (!response.ok) {
    setStatus(`${getTreeErrorPrefix()} ${response.error}`);
    return;
  }

  applyVimState(response.data);
}

async function pinVimshottariPanel() {
  setStatus(tr('working'));
  persistCurrentHorizonSettings();
  const response = await sendToActiveTab({
    type: 'OPEN_VIMSHOTTARI_PANEL',
    settings: getCurrentHorizonSettings()
  });

  if (!response.ok) {
    setStatus(`${getTreeErrorPrefix()} ${response.error}`);
    return;
  }

  applyVimState(response.data);
  setStatus(tr('pinnedToPage'));
  window.close();
}

async function copyVimshottariText() {
  setStatus(tr('working'));
  const response = await sendToActiveTab({ type: 'EXPORT_VIMSHOTTARI_TEXT' });

  if (!response.ok) {
    setStatus(`${getTreeErrorPrefix()} ${response.error}`);
    return;
  }

  await navigator.clipboard.writeText(response.data?.text || '');
  setStatus(tr('copied'));
}

async function pollVimshottariStateWhile(promiseFactory) {
  let stopped = false;
  const poll = async () => {
    while (!stopped) {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      if (stopped) break;
      const stateResponse = await sendToActiveTab({ type: 'GET_VIMSHOTTARI_STATE' });
      if (stateResponse.ok) {
        applyVimState(stateResponse.data);
      }
    }
  };

  const pollingTask = poll();
  try {
    return await promiseFactory();
  } finally {
    stopped = true;
    await pollingTask;
  }
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

function fillPresetSelect(select, items) {
  select.innerHTML = '';
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.value;
    option.textContent = item.label;
    select.appendChild(option);
  });
}

function removeTemporaryManualOption(select) {
  const manualOption = select.querySelector('option[data-role="manual-temp"]');
  if (manualOption) {
    manualOption.remove();
  }
}

function ensureTemporaryManualOption(select) {
  let manualOption = select.querySelector('option[data-role="manual-temp"]');
  if (!manualOption) {
    manualOption = document.createElement('option');
    manualOption.value = 'data';
    manualOption.textContent = tr('manualDate');
    manualOption.dataset.role = 'manual-temp';
    select.appendChild(manualOption);
  } else {
    manualOption.textContent = tr('manualDate');
  }
}

function syncPresetFromDate(select, input, offsets) {
  const value = input.value;
  const todayIso = formatIsoDate(new Date());

  if (!value) {
    ensureTemporaryManualOption(select);
    select.value = 'data';
    return;
  }

  if (value === todayIso) {
    removeTemporaryManualOption(select);
    select.value = 'today';
    return;
  }

  const matched = offsets.find((offset) => value === formatIsoDate(shiftYears(new Date(), offset)));
  if (matched == null) {
    ensureTemporaryManualOption(select);
    select.value = 'data';
    return;
  }

  removeTemporaryManualOption(select);
  select.value = String(matched);
}

function initHorizonControls() {
  fillPresetSelect(elements.fromPresetSelect, [
    { value: 'today', label: state.language === 'ru' ? 'сегодня' : 'today' },
    { value: '-1', label: '-1' },
    { value: '-2', label: '-2' },
    { value: '-3', label: '-3' },
    { value: '-4', label: '-4' },
    { value: '-5', label: '-5' }
  ]);

  fillPresetSelect(elements.toPresetSelect, [
    { value: 'today', label: state.language === 'ru' ? 'сегодня' : 'today' },
    { value: '1', label: '+1' },
    { value: '2', label: '+2' },
    { value: '3', label: '+3' },
    { value: '4', label: '+4' },
    { value: '5', label: '+5' }
  ]);

  elements.fromDateInput.value = formatIsoDate(new Date());
  elements.toDateInput.value = formatIsoDate(new Date());
  elements.fromPresetSelect.value = 'today';
  elements.toPresetSelect.value = 'today';

  elements.fromPresetSelect.addEventListener('change', () => {
    const value = elements.fromPresetSelect.value;
    if (value === 'data') return;
    removeTemporaryManualOption(elements.fromPresetSelect);
    elements.fromDateInput.value = value === 'today'
      ? formatIsoDate(new Date())
      : formatIsoDate(shiftYears(new Date(), Number(value)));
    elements.fromPresetSelect.value = value;
    persistCurrentHorizonSettings();
  });

  elements.toPresetSelect.addEventListener('change', () => {
    const value = elements.toPresetSelect.value;
    if (value === 'data') return;
    removeTemporaryManualOption(elements.toPresetSelect);
    elements.toDateInput.value = value === 'today'
      ? formatIsoDate(new Date())
      : formatIsoDate(shiftYears(new Date(), Number(value)));
    elements.toPresetSelect.value = value;
    persistCurrentHorizonSettings();
  });

  elements.fromDateInput.addEventListener('change', () => {
    syncPresetFromDate(elements.fromPresetSelect, elements.fromDateInput, [-1, -2, -3, -4, -5]);
    persistCurrentHorizonSettings();
  });

  elements.toDateInput.addEventListener('change', () => {
    syncPresetFromDate(elements.toPresetSelect, elements.toDateInput, [1, 2, 3, 4, 5]);
    persistCurrentHorizonSettings();
  });

  elements.levelSelect.addEventListener('change', persistCurrentHorizonSettings);

  updateHorizonOptionLabels();
}

async function applyHorizon() {
  setStatus(tr('working'));
  elements.applyHorizonBtn.disabled = true;
  const response = await pollVimshottariStateWhile(() => sendToActiveTab({
    type: 'APPLY_VIMSHOTTARI_HORIZON',
    level: elements.levelSelect.value,
    targetDateText: elements.toDateInput.value,
    fromDateText: elements.fromDateInput.value
  }));
  elements.applyHorizonBtn.disabled = false;

  if (!response.ok) {
    setStatus(`${getTreeErrorPrefix()} ${response.error}`);
    return;
  }

  applyVimState(response.data.state);
}

async function detectModeAndLoad() {
  const tab = await getActiveTab();
  const url = tab?.url || '';

  if (/(vimshottari|ashtottari)/i.test(url)) {
    await requestVimshottariState();
    return;
  }

  await requestParse();
}

async function init() {
  state.language = await loadSavedLanguage();
  initHorizonControls();
  updateLabels();
  setMode('charts');
  updateHeader();

  elements.langToggle.addEventListener('click', () => {
    state.language = state.language === 'en' ? 'ru' : 'en';
    saveLanguage(state.language);
    const shouldReloadPrompt = state.promptOpen;
    state.promptEditing = false;
    state.promptText = '';
    state.promptPath = '';
    updateLabels();
    updateHeader();

    if (shouldReloadPrompt) {
      loadPromptExample()
        .then(() => renderHelpPanel())
        .catch((error) => {
          state.promptOpen = false;
          setStatus(`${tr('promptError')} ${error?.message || String(error)}`);
          renderHelpPanel();
        });
    }

    if (state.mode === 'vimshottari') {
      renderVimshottariTree();
      return;
    }

    if (state.parsed) {
      const localized = state.language === 'ru' ? state.parsed.finalResultTextRu : state.parsed.finalResultTextEn;
      state.charts = buildChartsForPopup(localized).slice(0, 100);
    }

    renderList();
  });

  elements.helpToggle.addEventListener('click', () => {
    state.helpOpen = !state.helpOpen;
    renderHelpPanel();
  });

  elements.promptToggle.addEventListener('click', async () => {
    state.promptOpen = !state.promptOpen;
    if (!state.promptOpen) {
      state.promptEditing = false;
      renderHelpPanel();
      return;
    }

    renderHelpPanel();
    try {
      state.promptText = await loadPromptExample();
      state.promptEditing = false;
      renderHelpPanel();
    } catch (error) {
      state.promptOpen = false;
      setStatus(`${tr('promptError')} ${error?.message || String(error)}`);
      renderHelpPanel();
    }
  });

  elements.promptEdit.addEventListener('click', async () => {
    if (!state.promptEditing) {
      state.promptEditing = true;
      renderHelpPanel();
      elements.promptEditor.focus();
      return;
    }

    state.promptText = elements.promptEditor.value;
    await saveStoredPrompt(state.promptText);
    state.promptEditing = false;
    setStatus(tr('promptSaved'));
    renderHelpPanel();
  });

  elements.promptReset.addEventListener('click', async () => {
    if (!window.confirm(tr('promptResetConfirm'))) {
      return;
    }

    await removeStoredPrompt();
    state.promptText = '';
    state.promptPath = '';
    state.promptEditing = false;

    try {
      state.promptText = await loadPromptExample();
      setStatus(tr('promptResetDone'));
    } catch (error) {
      state.promptOpen = false;
      setStatus(`${tr('promptError')} ${error?.message || String(error)}`);
    }

    renderHelpPanel();
  });

  elements.promptCopy.addEventListener('click', async () => {
    if (!state.promptText) {
      try {
        state.promptText = await loadPromptExample();
      } catch (error) {
        setStatus(`${tr('promptError')} ${error?.message || String(error)}`);
        renderHelpPanel();
        return;
      }
    }

    navigator.clipboard.writeText(state.promptText)
      .then(() => setStatus(tr('promptCopied')))
      .catch((error) => setStatus(String(error)));
  });

  elements.helpClose.addEventListener('click', () => {
    state.helpOpen = false;
    state.promptOpen = false;
    state.promptEditing = false;
    renderHelpPanel();
  });

  elements.refreshBtn.addEventListener('click', requestParse);
  elements.copySelectedBtn.addEventListener('click', copySelected);
  elements.pinPanelBtn.addEventListener('click', pinVimshottariPanel);
  elements.refreshTreeBtn.addEventListener('click', refreshVimshottari);
  elements.copyTreeBtn.addEventListener('click', copyVimshottariText);
  elements.applyHorizonBtn.addEventListener('click', applyHorizon);

  elements.selectAll.addEventListener('change', () => {
    state.selected.clear();
    if (elements.selectAll.checked) {
      state.charts.forEach((_, index) => state.selected.add(index));
    }
    renderList();
  });

  elements.vimSelectAll.addEventListener('change', async () => {
    const response = await sendToActiveTab({
      type: 'SET_ALL_VIMSHOTTARI_MARKERS',
      checked: elements.vimSelectAll.checked
    });

    if (!response.ok) {
      setStatus(`${getTreeErrorPrefix()} ${response.error}`);
      return;
    }

    applyVimState(response.data);
  });

  detectModeAndLoad();
}

window.addEventListener('beforeunload', stopVimAutoRefresh);

init();
