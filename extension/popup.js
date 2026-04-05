const state = {
  language: 'en',
  mode: 'charts',
  charts: [],
  parsed: null,
  selected: new Set(),
  vimshottariTree: []
};

const t = {
  en: {
    parse: 'Parse',
    copy: 'Copy selected',
    selectAll: 'Select all',
    noData: 'No cards found on this page.',
    copied: 'Selected cards copied.',
    noSelection: 'Select at least one card.',
    parseError: 'Parsing error:',
    parseDone: 'Ready.',
    open: 'Open',
    close: 'Close',
    chartTitle: 'Chart',
    vimTitle: 'Vimshottari Dasha',
    refreshTree: 'Refresh tree',
    copyTree: 'Copy tree',
    treeCopied: 'Tree copied.',
    treeEmpty: 'No visible periods found.',
    treeError: 'Vimshottari error:',
    noActiveTab: 'No active tab'
  },
  ru: {
    parse: 'Парсить',
    copy: 'Копировать выбранные',
    selectAll: 'Выбрать все',
    noData: 'На странице не найдено карт.',
    copied: 'Выбранные карты скопированы.',
    noSelection: 'Выберите минимум одну карту.',
    parseError: 'Ошибка парсинга:',
    parseDone: 'Готово.',
    open: 'Открыть',
    close: 'Скрыть',
    chartTitle: 'Карта',
    vimTitle: 'Вимшоттари Даша',
    refreshTree: 'Обновить дерево',
    copyTree: 'Копировать дерево',
    treeCopied: 'Дерево скопировано.',
    treeEmpty: 'Видимые периоды не найдены.',
    treeError: 'Ошибка Вимшоттари:',
    noActiveTab: 'Нет активной вкладки'
  }
};

const elements = {
  d1Title: document.getElementById('d1Title'),
  userData: document.getElementById('userData'),
  langToggle: document.getElementById('langToggle'),
  refreshBtn: document.getElementById('refreshBtn'),
  copySelectedBtn: document.getElementById('copySelectedBtn'),
  chartControls: document.getElementById('chartControls'),
  selectAll: document.getElementById('selectAll'),
  selectAllLabel: document.getElementById('selectAllLabel'),
  chartList: document.getElementById('chartList'),
  vimshottariControls: document.getElementById('vimshottariControls'),
  refreshTreeBtn: document.getElementById('refreshTreeBtn'),
  copyTreeBtn: document.getElementById('copyTreeBtn'),
  vimshottariTree: document.getElementById('vimshottariTree'),
  status: document.getElementById('status')
};

function tr(key) {
  return t[state.language][key] || key;
}

function setStatus(message) {
  elements.status.textContent = message;
}

function setMode(mode) {
  state.mode = mode;
  const isCharts = mode === 'charts';
  const isVim = mode === 'vimshottari';

  elements.chartControls.classList.toggle('hidden', !isCharts);
  elements.chartList.classList.toggle('hidden', !isCharts);
  elements.copySelectedBtn.classList.toggle('hidden', !isCharts);

  elements.vimshottariControls.classList.toggle('hidden', !isVim);
  elements.vimshottariTree.classList.toggle('hidden', !isVim);
  elements.refreshBtn.classList.toggle('hidden', !isCharts);
}

function updateLabels() {
  elements.langToggle.textContent = state.language.toUpperCase();
  elements.refreshBtn.textContent = tr('parse');
  elements.copySelectedBtn.textContent = tr('copy');
  elements.selectAllLabel.textContent = tr('selectAll');
  elements.refreshTreeBtn.textContent = tr('refreshTree');
  elements.copyTreeBtn.textContent = tr('copyTree');
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
    elements.d1Title.textContent = tr('vimTitle');
    elements.userData.textContent = '-';
    return;
  }

  if (!state.parsed) {
    elements.d1Title.textContent = tr('chartTitle');
    elements.userData.textContent = '-';
    return;
  }

  const data = state.parsed.finalResult?.dataWithHouses || {};
  const chartLabel = tr('chartTitle');
  const chartName = (data.chartName || 'D1').replace(/\s*\(D1\)\s*$/i, '').trim() || 'D1';
  elements.d1Title.textContent = `${chartLabel}: ${chartName}`;

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

function localizeChartName(name) {
  return name;
}

function getBirthDateOnly() {
  const birthDateTime = state.parsed?.finalResult?.dataWithHouses?.owner?.birthDateTime || '';
  const match = birthDateTime.match(/\d{2}\.\d{2}\.\d{4}/);
  return match ? match[0] : '';
}

function getCopyTitle(chart, index) {
  const baseTitle = localizeChartName(chart.chartName || `#${index + 1}`);
  const isD1 = index === 0 && chart?.chartName;
  if (!isD1) return baseTitle;

  const birthDate = getBirthDateOnly();
  return birthDate ? `${baseTitle} - ${birthDate}` : baseTitle;
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
    name.textContent = localizeChartName(chart.chartName || `#${index + 1}`);

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

    row.appendChild(checkbox);
    row.appendChild(name);
    row.appendChild(expand);

    elements.chartList.appendChild(row);
    elements.chartList.appendChild(content);
  });

  syncSelectAll();
  setStatus(tr('parseDone'));
}

function renderVimshottariNodes(nodes, depth = 0) {
  nodes.forEach((node) => {
    const row = document.createElement('div');
    row.className = 'vim-node';
    row.style.marginLeft = `${depth * 14}px`;

    const line = document.createElement('div');
    line.className = 'vim-line';

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

    line.append(title, dates);
    row.appendChild(line);
    elements.vimshottariTree.appendChild(row);

    if (node.children?.length) {
      renderVimshottariNodes(node.children, depth + 1);
    }
  });
}

function renderVimshottariTree() {
  elements.vimshottariTree.innerHTML = '';

  if (!state.vimshottariTree.length) {
    setStatus(tr('treeEmpty'));
    return;
  }

  renderVimshottariNodes(state.vimshottariTree, 0);
  setStatus(tr('parseDone'));
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

async function getActiveTab() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeUrl = activeTab?.url || '';

  if (activeTab?.id && !/^chrome-extension:|^chrome:|^about:/i.test(activeUrl)) {
    return activeTab;
  }

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const fallback = tabs.find((tab) => /astro\.expert/i.test(tab.url || ''));
  return fallback || activeTab || null;
}

async function requestParse() {
  setStatus('...');
  const tab = await getActiveTab();
  if (!tab?.id) {
    setStatus(tr('noActiveTab'));
    return;
  }

  const response = await chrome.tabs
    .sendMessage(tab.id, { type: 'PARSE_ASTRO_PAGE' })
    .catch((error) => ({ ok: false, error: error.message }));

  if (!response?.ok) {
    setStatus(`${tr('parseError')} ${response?.error || 'unknown error'}`);
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

async function requestVimshottariTree() {
  setStatus('...');
  const tab = await getActiveTab();
  if (!tab?.id) {
    setStatus(tr('noActiveTab'));
    return;
  }

  const response = await chrome.tabs
    .sendMessage(tab.id, { type: 'PARSE_VIMSHOTTARI_TREE' })
    .catch((error) => ({ ok: false, error: error.message }));

  if (!response?.ok) {
    setStatus(`${tr('treeError')} ${response?.error || 'unknown error'}`);
    return;
  }

  state.vimshottariTree = response.data || [];
  setMode('vimshottari');
  updateHeader();
  renderVimshottariTree();
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
      const title = getCopyTitle(chart, index);
      const body = formatChartContent(chart).join('\n');
      return `${title}\n${body}`;
    })
    .join('\n\n');

  navigator.clipboard
    .writeText(grouped)
    .then(() => setStatus(tr('copied')))
    .catch((err) => setStatus(String(err)));
}

function copyVimshottariTree() {
  navigator.clipboard
    .writeText(JSON.stringify(state.vimshottariTree, null, 2))
    .then(() => setStatus(tr('treeCopied')))
    .catch((err) => setStatus(String(err)));
}

async function detectModeAndLoad() {
  const tab = await getActiveTab();
  const url = tab?.url || '';

  if (/vimshottari/i.test(url)) {
    await requestVimshottariTree();
    return;
  }

  await requestParse();
}

function init() {
  updateLabels();
  setMode('charts');
  updateHeader();

  elements.langToggle.addEventListener('click', async () => {
    state.language = state.language === 'en' ? 'ru' : 'en';
    updateLabels();

    if (state.mode === 'vimshottari') {
      updateHeader();
      renderVimshottariTree();
      return;
    }

    if (state.parsed) {
      const localized = state.language === 'ru' ? state.parsed.finalResultTextRu : state.parsed.finalResultTextEn;
      state.charts = buildChartsForPopup(localized);
    }

    updateHeader();
    renderList();
  });

  elements.refreshBtn.addEventListener('click', requestParse);
  elements.copySelectedBtn.addEventListener('click', copySelected);
  elements.refreshTreeBtn.addEventListener('click', requestVimshottariTree);
  elements.copyTreeBtn.addEventListener('click', copyVimshottariTree);

  elements.selectAll.addEventListener('change', () => {
    state.selected.clear();
    if (elements.selectAll.checked) {
      state.charts.forEach((_, index) => state.selected.add(index));
    }
    renderList();
  });

  detectModeAndLoad();
}

init();
