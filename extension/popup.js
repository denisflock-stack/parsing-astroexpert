const state = {
  language: 'en',
  charts: [],
  parsed: null,
  selected: new Set()
};

const t = {
  en: {
    parse: 'Parse',
    copy: 'Copy selected',
    selectAll: 'Select all',
    clear: 'Clear',
    noData: 'No Navamsha (D9) cards found on this page.',
    copied: 'Selected cards copied.',
    noSelection: 'Select at least one card.',
    parseError: 'Parsing error:',
    parseDone: 'Ready.',
    open: 'Open',
    close: 'Close'
  },
  ru: {
    parse: 'Парсить',
    copy: 'Копировать выбранные',
    selectAll: 'Выбрать все',
    clear: 'Снять все',
    noData: 'На странице не найдено карт Навамша (D9).',
    copied: 'Выбранные карты скопированы.',
    noSelection: 'Выберите минимум одну карту.',
    parseError: 'Ошибка парсинга:',
    parseDone: 'Готово.',
    open: 'Открыть',
    close: 'Скрыть'
  }
};

const elements = {
  d1Title: document.getElementById('d1Title'),
  userData: document.getElementById('userData'),
  langToggle: document.getElementById('langToggle'),
  refreshBtn: document.getElementById('refreshBtn'),
  copySelectedBtn: document.getElementById('copySelectedBtn'),
  selectAll: document.getElementById('selectAll'),
  selectAllLabel: document.getElementById('selectAllLabel'),
  clearSelection: document.getElementById('clearSelection'),
  chartList: document.getElementById('chartList'),
  status: document.getElementById('status')
};

function tr(key) {
  return t[state.language][key] || key;
}

function updateLabels() {
  elements.langToggle.textContent = state.language.toUpperCase();
  elements.refreshBtn.textContent = tr('parse');
  elements.copySelectedBtn.textContent = tr('copy');
  elements.selectAllLabel.textContent = tr('selectAll');
  elements.clearSelection.textContent = tr('clear');
}

function setStatus(message) {
  elements.status.textContent = message;
}

function updateHeader() {
  if (!state.parsed) {
    elements.d1Title.textContent = 'D1';
    elements.userData.textContent = '-';
    return;
  }

  const data = state.parsed.dataWithHouses;
  const d1Label = state.language === 'ru' ? 'Карта D1' : 'D1';
  elements.d1Title.textContent = `${d1Label}: ${data.chartName || 'D1'}`;

  const owner = data.owner || {};
  elements.userData.textContent = [owner.name, owner.birthDateTime, owner.birthPlace].filter(Boolean).join(' • ') || '-';
}

function formatChartContent(chart) {
  const houseLabel = state.language === 'ru' ? 'дом' : 'house';
  const planetMap = {
    en: { Asc: 'Asc', Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury', Jp: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu' },
    ru: { Asc: 'Asc', Su: 'Солнце', Mo: 'Луна', Ma: 'Марс', Me: 'Меркурий', Jp: 'Юпитер', Ve: 'Венера', Sa: 'Сатурн', Ra: 'Раху', Ke: 'Кету' }
  };

  return (chart.planets || []).map((p) => {
    const base = `${planetMap[state.language][p.planet] || p.planet}: ${p.sign || '-'}, ${houseLabel} ${p.house ?? '-'}`;
    return p.retrograde ? `${base} (R)` : base;
  });
}

function localizeChartName(name) {
  if (state.language === 'en') {
    return name.replace('Навамша', 'Navamsha');
  }
  return name.replace('Navamsha', 'Навамша');
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
      if (checkbox.checked) state.selected.add(index);
      else state.selected.delete(index);
      syncSelectAll();
    });

    const name = document.createElement('div');
    name.className = 'chart-name';
    name.textContent = localizeChartName(chart.chartName || `D9 #${index + 1}`);

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

  setStatus(tr('parseDone'));
  syncSelectAll();
}

function syncSelectAll() {
  const total = state.charts.length;
  elements.selectAll.checked = total > 0 && state.selected.size === total;
}

async function requestParse() {
  setStatus('...');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setStatus('No active tab');
    return;
  }

  const response = await chrome.tabs.sendMessage(tab.id, { type: 'PARSE_ASTRO_PAGE' }).catch((error) => ({ ok: false, error: error.message }));

  if (!response?.ok) {
    setStatus(`${tr('parseError')} ${response?.error || 'unknown error'}`);
    return;
  }

  state.parsed = response.data;
  state.charts = (response.data.navamshaCharts || []).slice(0, 100);
  state.selected.clear();

  updateHeader();
  renderList();
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
      const title = localizeChartName(chart.chartName || `D9 #${index + 1}`);
      const body = formatChartContent(chart).join('\n');
      return `${title}\n${body}`;
    })
    .join('\n\n');

  navigator.clipboard.writeText(grouped)
    .then(() => setStatus(tr('copied')))
    .catch((err) => setStatus(String(err)));
}

function init() {
  updateLabels();
  updateHeader();

  elements.langToggle.addEventListener('click', () => {
    state.language = state.language === 'en' ? 'ru' : 'en';
    updateLabels();
    updateHeader();
    renderList();
  });

  elements.refreshBtn.addEventListener('click', requestParse);
  elements.copySelectedBtn.addEventListener('click', copySelected);

  elements.selectAll.addEventListener('change', () => {
    state.selected.clear();
    if (elements.selectAll.checked) {
      state.charts.forEach((_, index) => state.selected.add(index));
    }
    renderList();
  });

  elements.clearSelection.addEventListener('click', () => {
    state.selected.clear();
    renderList();
  });

  requestParse();
}

init();
