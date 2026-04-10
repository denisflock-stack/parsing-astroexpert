(function initVimshottariDashaTracker(window) {
  const ROOT_KEY = 'vimshottariDashaTree';
  const RU_WORDS = {
    vimshottari: '\u0412\u0438\u043c\u0448\u043e\u0442\u0442\u0430\u0440\u0438',
    period: '\u041f\u0435\u0440\u0438\u043e\u0434',
    subperiod: '\u041f\u043e\u0434\u043f\u0435\u0440\u0438\u043e\u0434',
    begin: '\u041d\u0430\u0447\u0430\u043b\u043e',
    end: '\u041a\u043e\u043d\u0435\u0446',
    selectAll: '\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0432\u0441\u0435',
    notFound: '\u0412\u0438\u0434\u0438\u043c\u044b\u0435 \u043f\u0435\u0440\u0438\u043e\u0434\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b.',
    ketu: '\u041a\u0435\u0442\u0443',
    venus: '\u0412\u0435\u043d\u0435\u0440\u044b',
    sun: '\u0421\u043e\u043b\u043d\u0446\u0430',
    moon: '\u041b\u0443\u043d\u044b',
    mars: '\u041c\u0430\u0440\u0441\u0430',
    rahu: '\u0420\u0430\u0445\u0443',
    jupiter: '\u042e\u043f\u0438\u0442\u0435\u0440\u0430',
    saturn: '\u0421\u0430\u0442\u0443\u0440\u043d\u0430',
    mercury: '\u041c\u0435\u0440\u043a\u0443\u0440\u0438\u044f'
  };

  const RU_TO_CODE = {
    [RU_WORDS.ketu]: 'Ke',
    [RU_WORDS.venus]: 'Ve',
    [RU_WORDS.sun]: 'Su',
    [RU_WORDS.moon]: 'Mo',
    [RU_WORDS.mars]: 'Ma',
    [RU_WORDS.rahu]: 'Ra',
    [RU_WORDS.jupiter]: 'Jp',
    [RU_WORDS.saturn]: 'Sa',
    [RU_WORDS.mercury]: 'Me'
  };

  const CODE_TO_RU = {
    Ke: RU_WORDS.ketu,
    Ve: RU_WORDS.venus,
    Su: RU_WORDS.sun,
    Mo: RU_WORDS.moon,
    Ma: RU_WORDS.mars,
    Ra: RU_WORDS.rahu,
    Jp: RU_WORDS.jupiter,
    Sa: RU_WORDS.saturn,
    Me: RU_WORDS.mercury
  };

  const LANGUAGE_STORAGE_KEY = 'uiLanguage';
  const UI_TEXT = {
    en: {
      panelTitle: 'Vimshottari Dasha',
      selectAll: 'Select all',
      refresh: 'Refresh',
      copy: 'Copy text',
      copied: 'Copied',
      close: 'Close',
      antardasha: 'Ant.',
      pratyantardasha: 'Praty.',
      today: 'today',
      manualDate: 'data',
      open: 'Open',
      working: 'Working...',
      chooseLevel: 'Choose level 2 or 3',
      invalidDate: 'Enter a valid date',
      invalidFromDate: 'Enter a valid start date',
      preparing: 'Preparing branches on the page...',
      noMatchingBranches: 'No matching branches found',
      markedBranches: 'Done. Marked branches: {count}',
      openingBranch: 'Opening branch on the site...',
      branchNotFound: 'Branch not found on the page',
      collapsingBranch: 'Collapsing branch on the site...',
      collapseFailed: 'Failed to collapse branch',
      branchCollapsed: 'Branch collapsed on the site',
      branchOpened: 'Branch opened on the site'
    },
    ru: {
      panelTitle: 'Вимшоттари Даша',
      selectAll: 'Выбрать все',
      refresh: 'Обновить',
      copy: 'Копировать',
      copied: 'Скопировано',
      close: 'Закрыть',
      antardasha: 'Ант.',
      pratyantardasha: 'Прать.',
      today: 'сегодня',
      manualDate: 'дата',
      open: 'Открыть',
      working: 'Обработка...',
      chooseLevel: 'Выберите уровень 2 или 3',
      invalidDate: 'Укажите корректную дату',
      invalidFromDate: 'Укажите корректную дату начала',
      preparing: 'Подготавливаю ветки на странице...',
      noMatchingBranches: 'Подходящие ветки не найдены',
      markedBranches: 'Готово. Отмечено веток: {count}',
      openingBranch: 'Открываю ветку на сайте...',
      branchNotFound: 'Ветка не найдена на странице',
      collapsingBranch: 'Сворачиваю ветку на сайте...',
      collapseFailed: 'Не удалось свернуть ветку',
      branchCollapsed: 'Ветка свернута на сайте',
      branchOpened: 'Ветка открыта на сайте'
    }
  };

  let currentUiLanguage = 'en';

  function normalizeSpace(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }

  function getUiText(key, replacements) {
    const table = UI_TEXT[currentUiLanguage] || UI_TEXT.en;
    let text = table[key] || UI_TEXT.en[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(function ([name, value]) {
        text = text.replace(`{${name}}`, String(value));
      });
    }
    return text;
  }

  function loadStoredLanguage() {
    return new Promise(function (resolve) {
      if (!chrome?.storage?.local) {
        resolve('en');
        return;
      }

      chrome.storage.local.get({ [LANGUAGE_STORAGE_KEY]: 'en' }, function (result) {
        resolve(result?.[LANGUAGE_STORAGE_KEY] === 'ru' ? 'ru' : 'en');
      });
    });
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function parseDateValue(dateText) {
    const normalized = normalizeSpace(dateText);
    if (!normalized) return null;

    const months = {
      '\u044f\u043d\u0432\u0430\u0440\u044f': 0,
      '\u0444\u0435\u0432\u0440\u0430\u043b\u044f': 1,
      '\u043c\u0430\u0440\u0442\u0430': 2,
      '\u0430\u043f\u0440\u0435\u043b\u044f': 3,
      '\u043c\u0430\u044f': 4,
      '\u0438\u044e\u043d\u044f': 5,
      '\u0438\u044e\u043b\u044f': 6,
      '\u0430\u0432\u0433\u0443\u0441\u0442\u0430': 7,
      '\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044f': 8,
      '\u043e\u043a\u0442\u044f\u0431\u0440\u044f': 9,
      '\u043d\u043e\u044f\u0431\u0440\u044f': 10,
      '\u0434\u0435\u043a\u0430\u0431\u0440\u044f': 11
    };

    const match = normalized.match(/^(\d{1,2})\s+(\p{L}+)\s+(\d{4})(?:\s+\d{2}:\d{2})?$/u);
    if (!match) return null;

    const day = Number(match[1]);
    const month = months[match[2].toLowerCase()];
    const year = Number(match[3]);
    if (month == null) return null;

    return new Date(year, month, day).getTime();
  }

  function formatDateForExport(dateText) {
    const value = parseDateValue(dateText);
    if (value == null) return normalizeSpace(dateText);

    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}.${month}.${year}`;
  }

  function buildExportLines(nodes, lines, depth) {
    (nodes || []).forEach((node) => {
      const label = (node.path || []).join(' - ');
      const begin = formatDateForExport(node.begin);
      const end = formatDateForExport(node.end);
      const level = depth || 0;

      if (label && begin && end) {
        lines.push(`${label}: ${begin} - ${end}`);
      } else if (label && begin && level >= 2) {
        lines.push(`${label}: ${begin}`);
      }

      buildExportLines(node.children, lines, level + 1);
    });
  }

  function buildExportText(tree) {
    const lines = [];
    buildExportLines(tree, lines, 0);
    return ['Vimshottari Dasha', '', ...lines].join('\n');
  }

  function getOwnerData() {
    const ownerName =
      document.querySelector('main .text-gray-700.font-bold.text-xl.leading-tight')?.innerText.trim()
      || document.querySelector('span.text-sm.font-bold.text-gray-700')?.innerText.trim()
      || null;

    const detailsBlock = document.querySelector('main .text-gray-500.text-sm');
    const detailLines = detailsBlock
      ? Array.from(detailsBlock.querySelectorAll(':scope > div'))
        .map((el) => el.innerText.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
      : [];

    return {
      name: ownerName,
      birthDateTime: detailLines[0] || null,
      birthPlace: detailLines[1] || null
    };
  }

  function findSectionRoot() {
    const heading = Array.from(document.querySelectorAll('h3')).find((el) => {
      const text = normalizeSpace(el.textContent);
      return text.includes('vimshottari') || text.includes(RU_WORDS.vimshottari);
    });

    return heading?.nextElementSibling
      || heading?.parentElement?.querySelector(':scope > div:last-child')
      || null;
  }

  function isVimshottariPage() {
    return /vimshottari/i.test(window.location.href) || !!findSectionRoot();
  }

  function findPrimaryRows(root) {
    return root ? Array.from(root.querySelectorAll('div.flex.sm\\:rounded-md')) : [];
  }

  function findNestedRows(root) {
    return root ? Array.from(root.querySelectorAll('div.group.flex.rounded-r-md')) : [];
  }

  function getBody(row) {
    return row.querySelector('.px-2.sm\\:px-4.py-2.w-full.self-center, .w-full.self-center') || row;
  }

  function getTitleElement(row) {
    return row.querySelector('.text-base.font-medium, .text-sm.font-semibold');
  }

  function extractDate(container, label) {
    const blocks = Array.from(container.querySelectorAll('div, td'));
    const target = blocks.find((el) => {
      const text = normalizeSpace(el.textContent);
      return text.startsWith(label) || text.startsWith(label.replace(':', ''));
    });
    if (!target) {
      if (!label.startsWith(RU_WORDS.begin)) {
        return null;
      }

      const fullText = normalizeSpace(container.textContent);
      const allDates = Array.from(fullText.matchAll(/(\d{1,2}\s+\p{L}+\s+\d{4})/gu)).map((m) => m[1]);
      if (!allDates.length) return null;
      return allDates[0];
    }

    const highlightedDate = target.querySelector('span.font-medium');
    if (highlightedDate) {
      return normalizeSpace(highlightedDate.textContent) || null;
    }

    const match = normalizeSpace(target.textContent).match(/(\d{1,2}\s+\p{L}+\s+\d{4})/u);
    return match ? match[1] : null;
  }

  function getRootCodeFromTitle(title) {
    const match = title.match(new RegExp('^' + RU_WORDS.period + '\\s+(.+)$', 'i'));
    if (!match) return null;
    return RU_TO_CODE[normalizeSpace(match[1])] || null;
  }

  function getPathFromTitle(title) {
    const normalized = normalizeSpace(title);

    if (normalized.startsWith(RU_WORDS.subperiod)) {
      return normalized
        .slice(RU_WORDS.subperiod.length)
        .trim()
        .split('/')
        .map((part) => normalizeSpace(part))
        .filter(Boolean);
    }

    const rootCode = getRootCodeFromTitle(normalized);
    return rootCode ? [rootCode] : null;
  }

  function parseRow(row, index, kind) {
    const body = getBody(row);
    const title = normalizeSpace(getTitleElement(body)?.textContent);
    const path = getPathFromTitle(title);
    if (!title || !path?.length) return null;

    return {
      index,
      order: index,
      kind,
      title,
      path,
      code: path[path.length - 1],
      begin: extractDate(body, RU_WORDS.begin + ':'),
      end: extractDate(body, RU_WORDS.end + ':'),
      children: []
    };
  }

  function collectVisibleRowEntries() {
    const root = findSectionRoot();
    if (!root) return [];

    const rawEntries = [
      ...findPrimaryRows(root).map((row, index) => ({ row, node: parseRow(row, index, 'period') })),
      ...findNestedRows(root).map((row, index) => ({ row, node: parseRow(row, index, 'subperiod') }))
    ].filter((entry) => !!entry.node);

    const unique = new Map();
    rawEntries.forEach((entry, order) => {
      entry.node.order = order;
      const key = getNodeKey(entry.node);
      if (!unique.has(key)) {
        unique.set(key, entry);
        return;
      }

      const existing = unique.get(key);
      existing.node.begin = existing.node.begin || entry.node.begin;
      existing.node.end = existing.node.end || entry.node.end;
      existing.node.title = existing.node.title || entry.node.title;
      if (existing.node.order == null || (entry.node.order != null && entry.node.order < existing.node.order)) {
        existing.node.order = entry.node.order;
      }
    });

    return Array.from(unique.values()).sort((a, b) => {
      if (a.node.path.length !== b.node.path.length) return a.node.path.length - b.node.path.length;
      return a.node.index - b.node.index;
    });
  }

  function collectVisibleNodes() {
    return collectVisibleRowEntries().map((entry) => entry.node);
  }

  function isWithinRange(node, data) {
    const nodeBegin = parseDateValue(node.begin);
    const nodeEnd = parseDateValue(node.end);
    const dataBegin = parseDateValue(data.begin);
    const dataEnd = parseDateValue(data.end);

    if (nodeBegin == null || dataBegin == null) return false;
    if (dataBegin < nodeBegin) return false;
    if (nodeEnd != null && dataBegin > nodeEnd) return false;
    if (nodeEnd != null && dataEnd != null && dataEnd > nodeEnd) return false;
    return true;
  }

  function findSiblingMatch(cursor, segment, data, depth) {
    const sameCode = cursor.filter((item) => item.code === segment);
    if (!sameCode.length) return null;

    if (depth === 0) {
      if ((data.path?.length || 0) > 1) {
        return sameCode.find((item) => isWithinRange(item, data))
          || sameCode.find((item) => item.begin === data.begin && item.end === data.end)
          || sameCode.find((item) => !item.begin && !item.end)
          || null;
      }

      return sameCode.find((item) => item.begin === data.begin && item.end === data.end)
        || sameCode.find((item) => !item.begin && !item.end)
        || null;
    }

    return sameCode.find((item) => isWithinRange(item, data))
      || sameCode.find((item) => item.begin === data.begin && item.end === data.end)
      || sameCode.find((item) => !item.begin && !item.end)
      || null;
  }

  function findRootMetaForNode(segment, data, fullPath) {
    const metas = state.rootMetaByCode[segment] || [];
    if (!metas.length) return null;

    if ((fullPath?.length || 0) > 1) {
      return metas.find((meta) => isWithinRange(meta, data))
        || metas.find((meta) => meta.begin === data.begin && meta.end === data.end)
        || metas[0];
    }

    return metas.find((meta) => meta.begin === data.begin && meta.end === data.end)
      || metas[0];
  }

  function ensureNode(tree, path, data) {
    let cursor = tree;
    let node = null;
    const nestedRootMeta = (path?.length || 0) > 1 ? findRootMetaForNode(path[0], data, path) : null;

    path.forEach((segment, index) => {
      let current = null;

      if (index === 0) {
        const rootMeta = nestedRootMeta || findRootMetaForNode(segment, data, path);
        current = cursor.find((item) =>
          item.code === segment
          && (item.begin || null) === (rootMeta?.begin || data.begin || null)
          && (item.end || null) === (rootMeta?.end || data.end || null));
      }

      if (!current) {
        current = findSiblingMatch(cursor, segment, data, index);
      }

      if (!current) {
        const rootMeta = index === 0 ? (nestedRootMeta || findRootMetaForNode(segment, data, path)) : null;
        current = {
          code: segment,
          title: index === 0
            ? (rootMeta?.title || (RU_WORDS.period + ' ' + (CODE_TO_RU[segment] || segment)))
            : RU_WORDS.subperiod + ' ' + path.slice(0, index + 1).join(' / '),
          path: path.slice(0, index + 1),
          begin: index === 0 ? (rootMeta?.begin || null) : null,
          end: index === 0 ? (rootMeta?.end || null) : null,
          order: data.order ?? null,
          children: []
        };
        cursor.push(current);
      }

      node = current;
      cursor = current.children;
    });

    if (node) {
      node.title = data.title || node.title;
      node.begin = data.begin || node.begin;
      node.end = data.end || node.end;
      if (node.order == null || (data.order != null && data.order < node.order)) {
        node.order = data.order;
      }
    }

    return node;
  }

  function mergeVisibleNodes(tree, nodes) {
    nodes.forEach((node) => {
      ensureNode(tree, node.path, node);
    });
    return tree;
  }

  function rememberRootMeta(nodes) {
    (nodes || []).forEach((node) => {
      if ((node.path?.length || 0) !== 1) return;
      const meta = {
        title: node.title || null,
        begin: node.begin || null,
        end: node.end || null
      };

      const list = state.rootMetaByCode[node.code] || [];
      const already = list.some((item) => item.begin === meta.begin && item.end === meta.end);
      if (!already) {
        list.push(meta);
        list.sort((a, b) => {
          const av = parseDateValue(a.begin);
          const bv = parseDateValue(b.begin);
          if (av != null && bv != null && av !== bv) return av - bv;
          if (av != null && bv == null) return -1;
          if (av == null && bv != null) return 1;
          return 0;
        });
        state.rootMetaByCode[node.code] = list;
      }
    });
  }

  function sortTree(nodes) {
    (nodes || []).forEach((node) => {
      if (node.children?.length) {
        sortTree(node.children);
      }
    });

    nodes.sort((a, b) => {
      const aBegin = parseDateValue(a.begin);
      const bBegin = parseDateValue(b.begin);

      if (aBegin != null && bBegin != null && aBegin !== bBegin) {
        return aBegin - bBegin;
      }

      if (aBegin != null && bBegin == null) return -1;
      if (aBegin == null && bBegin != null) return 1;

      const aDepth = a.path?.length || 0;
      const bDepth = b.path?.length || 0;
      if (aDepth !== bDepth) return aDepth - bDepth;

      const aOrder = a.order;
      const bOrder = b.order;
      if (aOrder != null && bOrder != null && aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      if (aOrder != null && bOrder == null) return -1;
      if (aOrder == null && bOrder != null) return 1;

      return String(a.title || '').localeCompare(String(b.title || ''));
    });

    return nodes;
  }

  function ensurePanel() {
    let panel = document.getElementById('vimshottari-tree-panel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'vimshottari-tree-panel';
    panel.style.position = 'fixed';
    panel.style.top = '16px';
    panel.style.right = '16px';
    panel.style.width = '570px';
    panel.style.maxHeight = '80vh';
    panel.style.overflow = 'auto';
    panel.style.zIndex = '999999';
    panel.style.background = 'rgba(255,255,255,0.97)';
    panel.style.border = '1px solid rgba(59,130,246,0.22)';
    panel.style.borderRadius = '12px';
    panel.style.boxShadow = '0 10px 28px rgba(15,23,42,0.15)';
    panel.style.padding = '12px';
    panel.style.fontFamily = 'Arial, sans-serif';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.flexDirection = 'column';
    header.style.gap = '8px';
    header.style.marginBottom = '10px';

    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.justifyContent = 'space-between';
    topRow.style.alignItems = 'center';
    topRow.style.gap = '8px';

    const title = document.createElement('div');
    title.dataset.role = 'panel-title';
    title.textContent = getUiText('panelTitle');
    title.style.fontSize = '14px';
    title.style.fontWeight = '700';

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '6px';
    actions.style.alignItems = 'center';
    actions.style.flexWrap = 'wrap';

    const selectAllLabel = document.createElement('label');
    selectAllLabel.style.display = 'inline-flex';
    selectAllLabel.style.alignItems = 'center';
    selectAllLabel.style.gap = '5px';
    selectAllLabel.style.fontSize = '12px';
    selectAllLabel.style.color = '#374151';
    selectAllLabel.style.cursor = 'pointer';

    const selectAllInput = document.createElement('input');
    selectAllInput.type = 'checkbox';
    selectAllInput.checked = true;
    selectAllInput.dataset.role = 'select-all';

    const selectAllText = document.createElement('span');
    selectAllText.dataset.role = 'select-all-text';
    selectAllText.textContent = getUiText('selectAll');

    selectAllLabel.append(selectAllInput, selectAllText);

    const refreshBtn = document.createElement('button');
    refreshBtn.dataset.role = 'refresh-btn';
    refreshBtn.textContent = getUiText('refresh');
    refreshBtn.style.fontSize = '12px';
    refreshBtn.style.padding = '4px 8px';
    refreshBtn.style.cursor = 'pointer';
    refreshBtn.onclick = function () {
      window.VimshottariDashaTracker?.refresh();
    };

    const copyBtn = document.createElement('button');
    copyBtn.dataset.role = 'copy-btn';
    copyBtn.textContent = getUiText('copy');
    copyBtn.style.fontSize = '12px';
    copyBtn.style.padding = '4px 8px';
    copyBtn.style.cursor = 'pointer';
    copyBtn.onclick = async function () {
      const text = window.VimshottariDashaTracker?.exportText?.() || '';
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = getUiText('copied');
      window.setTimeout(function () {
        copyBtn.textContent = getUiText('copy');
      }, 1200);
    };

    const closeBtn = document.createElement('button');
    closeBtn.dataset.role = 'close-btn';
    closeBtn.textContent = getUiText('close');
    closeBtn.style.fontSize = '12px';
    closeBtn.style.padding = '4px 8px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function () {
      document.getElementById('vimshottari-tree-panel')?.remove();
    };

    actions.append(refreshBtn, copyBtn, closeBtn);
    topRow.append(title, actions);
    header.append(topRow, selectAllLabel);

    const autoRow = document.createElement('div');
    autoRow.style.display = 'flex';
    autoRow.style.flexWrap = 'wrap';
    autoRow.style.alignItems = 'center';
    autoRow.style.gap = '6px';

    const levelSelect = document.createElement('select');
    levelSelect.dataset.role = 'horizon-level';
    levelSelect.style.fontSize = '12px';
    levelSelect.style.padding = '3px 6px';
    levelSelect.style.minWidth = '72px';

    [
      { value: '2', label: getUiText('antardasha') },
      { value: '3', label: getUiText('pratyantardasha') }
    ].forEach(function (item) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      levelSelect.appendChild(option);
    });
    levelSelect.value = '2';

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.dataset.role = 'horizon-date';
    dateInput.style.fontSize = '12px';
    dateInput.style.padding = '3px 6px';
    dateInput.style.width = '100px';
    dateInput.value = formatIsoDate(new Date());

    const fromDateInput = document.createElement('input');
    fromDateInput.type = 'date';
    fromDateInput.dataset.role = 'horizon-from-date';
    fromDateInput.style.fontSize = '12px';
    fromDateInput.style.padding = '3px 6px';
    fromDateInput.style.width = '100px';
    fromDateInput.value = formatIsoDate(new Date());

    const fromPresetSelect = document.createElement('select');
    fromPresetSelect.dataset.role = 'horizon-from-preset';
    fromPresetSelect.style.fontSize = '12px';
    fromPresetSelect.style.padding = '3px 20px 3px 6px';
    fromPresetSelect.style.minWidth = '66px';
    [
      { value: 'today', label: getUiText('today') },
      { value: '-1', label: '-1' },
      { value: '-2', label: '-2' },
      { value: '-3', label: '-3' },
      { value: '-4', label: '-4' },
      { value: '-5', label: '-5' }
    ].forEach(function (item) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      fromPresetSelect.appendChild(option);
    });
    fromPresetSelect.value = 'today';
    fromPresetSelect.onchange = function () {
      const value = fromPresetSelect.value;
      if (value === 'data') return;
      if (value === 'today') {
        fromDateInput.value = formatIsoDate(new Date());
      } else {
        fromDateInput.value = formatIsoDate(shiftYears(new Date(), Number(value)));
      }

      syncPresetFromDate(fromPresetSelect, fromDateInput, [-1, -2, -3, -4, -5]);
    };

    const toPresetSelect = document.createElement('select');
    toPresetSelect.dataset.role = 'horizon-to-preset';
    toPresetSelect.style.fontSize = '12px';
    toPresetSelect.style.padding = '3px 20px 3px 6px';
    toPresetSelect.style.minWidth = '66px';
    [
      { value: 'today', label: getUiText('today') },
      { value: '1', label: '+1' },
      { value: '2', label: '+2' },
      { value: '3', label: '+3' },
      { value: '4', label: '+4' },
      { value: '5', label: '+5' }
    ].forEach(function (item) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      toPresetSelect.appendChild(option);
    });
    toPresetSelect.value = 'today';
    toPresetSelect.onchange = function () {
      const value = toPresetSelect.value;
      if (value === 'data') return;

      if (value === 'today') {
        dateInput.value = formatIsoDate(new Date());
      } else {
        dateInput.value = formatIsoDate(shiftYears(new Date(), Number(value)));
      }

      syncPresetFromDate(toPresetSelect, dateInput, [1, 2, 3, 4, 5]);
    };

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
        manualOption.textContent = getUiText('manualDate');
        manualOption.dataset.role = 'manual-temp';
        select.appendChild(manualOption);
      } else {
        manualOption.textContent = getUiText('manualDate');
      }
    }

    function syncPresetFromDate(select, input, offsets) {
      const value = input.value;
      if (!value) {
        ensureTemporaryManualOption(select);
        select.value = 'data';
        return;
      }

      const todayIso = formatIsoDate(new Date());
      if (value === todayIso) {
        removeTemporaryManualOption(select);
        select.value = 'today';
        return;
      }

      const matched = offsets.find(function (offset) {
        return value === formatIsoDate(shiftYears(new Date(), offset));
      });

      if (matched == null) {
        ensureTemporaryManualOption(select);
        select.value = 'data';
        return;
      }

      removeTemporaryManualOption(select);
      select.value = String(matched);
    }

    fromDateInput.addEventListener('change', function () {
      syncPresetFromDate(fromPresetSelect, fromDateInput, [-1, -2, -3, -4, -5]);
    });
    dateInput.addEventListener('change', function () {
      syncPresetFromDate(toPresetSelect, dateInput, [1, 2, 3, 4, 5]);
    });
    syncPresetFromDate(fromPresetSelect, fromDateInput, [-1, -2, -3, -4, -5]);
    syncPresetFromDate(toPresetSelect, dateInput, [1, 2, 3, 4, 5]);

    const applyHorizonBtn = document.createElement('button');
    applyHorizonBtn.type = 'button';
    applyHorizonBtn.dataset.role = 'horizon-apply';
    applyHorizonBtn.textContent = getUiText('open');
    applyHorizonBtn.style.fontSize = '12px';
    applyHorizonBtn.style.padding = '0 10px';
    applyHorizonBtn.style.background = '#ffffff';
    applyHorizonBtn.style.color = '#111827';
    applyHorizonBtn.style.border = '1px solid #2b6cff';
    applyHorizonBtn.style.borderRadius = '0';
    applyHorizonBtn.style.fontWeight = '600';
    applyHorizonBtn.style.height = '30px';
    applyHorizonBtn.style.lineHeight = '28px';
    applyHorizonBtn.style.boxSizing = 'border-box';
    applyHorizonBtn.onclick = async function () {
      const tracker = window.VimshottariDashaTracker;
      if (!tracker?.applyHorizonSelection) return;

      applyHorizonBtn.disabled = true;
      applyHorizonBtn.textContent = getUiText('working');
      try {
        await tracker.applyHorizonSelection(levelSelect.value, dateInput.value, fromDateInput.value);
      } finally {
        applyHorizonBtn.disabled = false;
        applyHorizonBtn.textContent = getUiText('open');
      }
    };

    autoRow.append(levelSelect, fromPresetSelect, fromDateInput, dateInput, toPresetSelect, applyHorizonBtn);
    header.appendChild(autoRow);

    const status = document.createElement('div');
    status.dataset.role = 'status';
    status.style.fontSize = '12px';
    status.style.minHeight = '16px';
    status.style.color = '#6b7280';

    header.appendChild(status);
    panel.appendChild(header);

    const content = document.createElement('div');
    content.dataset.role = 'content';
    panel.appendChild(content);
    document.body.appendChild(panel);
    return panel;
  }

  function getPanelIfOpen() {
    return document.getElementById('vimshottari-tree-panel');
  }

  function getNodeKey(node) {
    return (node.path || []).join('>') + '|' + (node.begin || '') + '|' + (node.end || '');
  }

  function getPathKey(path) {
    return (path || []).join('>');
  }

  function setStatus(message, tone) {
    state.statusMessage = message || '';
    state.statusTone = tone || 'info';

    const panel = getPanelIfOpen();
    const status = panel?.querySelector('[data-role="status"]');
    if (!status) return;

    status.textContent = state.statusMessage;
    if (tone === 'success') {
      status.style.color = '#15803d';
      return;
    }
    if (tone === 'error') {
      status.style.color = '#b91c1c';
      return;
    }
    status.style.color = '#6b7280';
  }

  function updatePanelLanguage() {
    const panel = getPanelIfOpen();
    if (!panel) return;

    const title = panel.querySelector('[data-role="panel-title"]');
    const selectAllText = panel.querySelector('[data-role="select-all-text"]');
    const refreshBtn = panel.querySelector('[data-role="refresh-btn"]');
    const copyBtn = panel.querySelector('[data-role="copy-btn"]');
    const closeBtn = panel.querySelector('[data-role="close-btn"]');
    const levelSelect = panel.querySelector('[data-role="horizon-level"]');
    const fromPresetSelect = panel.querySelector('[data-role="horizon-from-preset"]');
    const toPresetSelect = panel.querySelector('[data-role="horizon-to-preset"]');
    const applyBtn = panel.querySelector('[data-role="horizon-apply"]');

    if (title) title.textContent = getUiText('panelTitle');
    if (selectAllText) selectAllText.textContent = getUiText('selectAll');
    if (refreshBtn) refreshBtn.textContent = getUiText('refresh');
    if (copyBtn) copyBtn.textContent = getUiText('copy');
    if (closeBtn) closeBtn.textContent = getUiText('close');
    if (applyBtn && !applyBtn.disabled) applyBtn.textContent = getUiText('open');

    if (levelSelect) {
      Array.from(levelSelect.options).forEach(function (option) {
        option.textContent = option.value === '2' ? getUiText('antardasha') : getUiText('pratyantardasha');
      });
    }

    const updatePresetSelect = function (select, positive) {
      if (!select) return;
      Array.from(select.options).forEach(function (option) {
        if (option.value === 'today') {
          option.textContent = getUiText('today');
        } else if (option.value === 'data') {
          option.textContent = getUiText('manualDate');
        } else if (positive) {
          option.textContent = `+${option.value}`;
        } else {
          option.textContent = option.value;
        }
      });
    };

    updatePresetSelect(fromPresetSelect, false);
    updatePresetSelect(toPresetSelect, true);
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

  function parseInputDateValue(dateText) {
    const normalized = normalizeSpace(dateText);
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(year, month, day).getTime();
  }

  function startOfDayTimestamp(value) {
    const date = new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  function getDerivedNodeEnd(node, parentNode, siblings, index) {
    const explicitEnd = parseDateValue(node.end);
    if (explicitEnd != null) return explicitEnd;

    const nextNode = Array.isArray(siblings) ? siblings[index + 1] : null;
    const nextBegin = parseDateValue(nextNode?.begin);
    if (nextBegin != null) {
      return startOfDayTimestamp(nextBegin) - 24 * 60 * 60 * 1000;
    }

    const parentEnd = parseDateValue(parentNode?.end);
    if (parentEnd != null) return parentEnd;

    return null;
  }

  function isNodeInRange(node, rangeStart, rangeEnd, parentNode, siblings, index) {
    const begin = parseDateValue(node.begin);
    const end = getDerivedNodeEnd(node, parentNode, siblings, index);
    if (begin == null) return false;

    const normalizedStart = startOfDayTimestamp(rangeStart);
    const normalizedEnd = startOfDayTimestamp(rangeEnd);

    if (end == null) {
      return begin >= normalizedStart && begin <= normalizedEnd;
    }

    return end >= normalizedStart && begin <= normalizedEnd;
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function waitForVisiblePath(path, timeoutMs) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const entries = collectVisibleRowEntries();
      const found = entries.find((entry) => getPathKey(entry.node.path) === getPathKey(path));
      if (found) {
        return found;
      }
      await sleep(120);
    }
    return null;
  }

  async function ensurePathVisible(path) {
    if (!Array.isArray(path) || !path.length) return false;

    for (let depth = 0; depth < path.length - 1; depth += 1) {
      const prefix = path.slice(0, depth + 1);
      const nextPrefix = path.slice(0, depth + 2);
      const nextVisible = await waitForVisiblePath(nextPrefix, 160);
      if (nextVisible) continue;

      const currentVisible = await waitForVisiblePath(prefix, 450);
      if (!currentVisible) {
        return false;
      }

      triggerRowOpen(currentVisible.row, prefix.length);
      const revealed = await waitForVisiblePath(nextPrefix, 1600);
      if (!revealed) {
        return false;
      }
    }

    return !!(await waitForVisiblePath(path, 450));
  }

  async function ensureBranchExpanded(path) {
    const targetVisible = await waitForVisiblePath(path, 600);
    if (!targetVisible) return false;
    if (hasVisibleDescendant(path)) return true;

    const alreadyAppeared = await waitForVisibleDescendant(path, 500);
    if (alreadyAppeared) return true;

    const toggleTarget = findSiteToggleTarget(targetVisible.node) || targetVisible.row;
    triggerRowOpen(toggleTarget);
    return await waitForVisibleDescendant(path, 1800);
  }

  async function waitForVisiblePathOrDescendant(path, timeoutMs) {
    const pathKey = getPathKey(path);
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const entries = collectVisibleRowEntries();
      const found = entries.find((entry) => {
        const entryKey = getPathKey(entry.node.path);
        return entryKey === pathKey || entryKey.startsWith(pathKey + '>');
      });
      if (found) {
        return found;
      }
      await sleep(120);
    }
    return null;
  }

  function hasVisibleDescendant(path) {
    const pathKey = getPathKey(path);
    return collectVisibleRowEntries().some((entry) => {
      const entryKey = getPathKey(entry.node.path);
      return entryKey.startsWith(pathKey + '>');
    });
  }

  async function waitForVisibleDescendant(path, timeoutMs) {
    const pathKey = getPathKey(path);
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const found = collectVisibleRowEntries().some((entry) => {
        const entryKey = getPathKey(entry.node.path);
        return entryKey.startsWith(pathKey + '>');
      });
      if (found) return true;
      await sleep(120);
    }
    return false;
  }

  async function waitForDescendantsToDisappear(path, timeoutMs) {
    const pathKey = getPathKey(path);
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const stillVisible = collectVisibleRowEntries().some((entry) => {
        const entryKey = getPathKey(entry.node.path);
        return entryKey.startsWith(pathKey + '>');
      });
      if (!stillVisible) {
        return true;
      }
      await sleep(120);
    }
    return false;
  }

  function getWireSelectPath(row) {
    const clickable = row?.matches?.('[wire\\:click]') ? row : row?.querySelector?.('[wire\\:click]');
    const wireClick = clickable?.getAttribute?.('wire:click') || '';
    const emitMatch = wireClick.match(/\$emit\('selectDasha',\s*(\[[^\]]*\])\)/);
    if (!emitMatch) return null;

    try {
      return JSON.parse(emitMatch[1]);
    } catch (error) {
      console.warn('Failed to parse wire:click path', error);
      return null;
    }
  }

  function emitSelectDasha(sitePath) {
    if (!Array.isArray(sitePath) || !window.Livewire?.emit) return false;
    window.Livewire.emit('selectDasha', sitePath);
    return true;
  }

  function findSiteToggleTarget(node) {
    const normalizedTitle = normalizeSpace(node?.title);
    if (!normalizedTitle) return null;

    const clickable = Array.from(document.querySelectorAll('[wire\\:click]')).find((el) => {
      const text = normalizeSpace(el.textContent);
      if (!text.includes(normalizedTitle)) return false;
      if (node.begin && !text.includes(node.begin)) return false;
      if (node.end && !text.includes(node.end)) return false;
      return true;
    });

    return clickable || null;
  }

  function triggerRowOpen(row, depth) {
    if (!row) return false;

    const clickable = row.matches('[wire\\:click]') ? row : (row.querySelector('[wire\\:click]') || row);
    const wirePath = getWireSelectPath(clickable);
    if (wirePath?.length) {
      const effectivePath = typeof depth === 'number' ? wirePath.slice(0, depth) : wirePath;
      if (emitSelectDasha(effectivePath)) {
        return true;
      }
    }

    if (typeof clickable.click === 'function') {
      clickable.click();
      return true;
    }

    clickable.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
    return true;
  }

  async function navigateToNode(node) {
    const path = node?.path || [];
    if (!path.length) return false;

    setStatus(getUiText('openingBranch'), 'info');

    for (let depth = 0; depth < path.length - 1; depth += 1) {
      const prefix = path.slice(0, depth + 1);
      const nextPrefix = path.slice(0, depth + 2);
      const nextVisible = await waitForVisiblePath(nextPrefix, 150);
      if (nextVisible) continue;

      const currentVisible = await waitForVisiblePath(prefix, 400);
      if (!currentVisible) return false;

      triggerRowOpen(currentVisible.row, prefix.length);
      const revealed = await waitForVisiblePath(nextPrefix, 1500);
      if (!revealed) {
        return false;
      }
    }

    const targetVisible = await waitForVisiblePathOrDescendant(path, 500);
    if (!targetVisible) {
      setStatus(getUiText('branchNotFound'), 'error');
      return false;
    }

    if (hasVisibleDescendant(path)) {
      setStatus(getUiText('collapsingBranch'), 'info');
      const collapseTarget = findSiteToggleTarget(node) || targetVisible.row;
      triggerRowOpen(collapseTarget, path.length);
      const collapsed = await waitForDescendantsToDisappear(path, 1500);
      if (!collapsed) {
        setStatus(getUiText('collapseFailed'), 'error');
        return false;
      }
      setStatus(getUiText('branchCollapsed'), 'success');
      window.setTimeout(function () {
        setStatus('', 'info');
      }, 1400);
      return true;
    }

    if (getPathKey(targetVisible.node.path) === getPathKey(path)) {
      triggerRowOpen(targetVisible.row, path.length);
    }
    setStatus(getUiText('branchOpened'), 'success');
    window.setTimeout(function () {
      setStatus('', 'info');
    }, 1400);
    return true;
  }

  function walkTree(nodes, visitor, parentNode) {
    (nodes || []).forEach((node) => {
      visitor(node, parentNode || null);
      if (node.children?.length) {
        walkTree(node.children, visitor, node);
      }
    });
  }

  function walkTreeWithDepth(nodes, visitor, parentNode, depth) {
    (nodes || []).forEach((node, index) => {
      const currentDepth = depth || 0;
      visitor(node, parentNode || null, currentDepth, nodes || [], index);
      if (node.children?.length) {
        walkTreeWithDepth(node.children, visitor, node, currentDepth + 1);
      }
    });
  }

  function setMarkerForBranch(node, checked) {
    state.markerByKey[getNodeKey(node)] = checked;
    (node.children || []).forEach((child) => {
      setMarkerForBranch(child, checked);
    });
  }

  function findNodeByKey(nodes, key) {
    for (const node of (nodes || [])) {
      if (getNodeKey(node) === key) return node;
      const found = findNodeByKey(node.children || [], key);
      if (found) return found;
    }
    return null;
  }

  function setMarkerForBranchByKey(key, checked) {
    const node = findNodeByKey(state.fullTree, key);
    if (node) {
      setMarkerForBranch(node, checked);
      return;
    }
    state.markerByKey[key] = checked;
  }

  function setMarkerForAncestors(node) {
    let cursor = node;
    while (cursor) {
      state.markerByKey[getNodeKey(cursor)] = true;
      cursor = state.parentByKey[getNodeKey(cursor)] || null;
    }
  }

  function syncMarkerDefaults(tree) {
    walkTree(tree, function (node, parentNode) {
      const key = getNodeKey(node);
      if (state.markerByKey[key] == null) {
        state.markerByKey[key] = !!state.markerDefaultChecked;
      }

      if (parentNode) {
        state.parentByKey[key] = parentNode;
      } else {
        delete state.parentByKey[key];
      }
    });
  }

  function buildRememberedTree(nodes) {
    return (nodes || [])
      .map(function (node) {
        const key = getNodeKey(node);
        const rememberedChildren = buildRememberedTree(node.children || []);
        if (!state.markerByKey[key] && !rememberedChildren.length) {
          return null;
        }

        return {
          code: node.code,
          title: node.title,
          path: deepClone(node.path || []),
          begin: node.begin || null,
          end: node.end || null,
          order: node.order ?? null,
          children: rememberedChildren
        };
      })
      .filter(Boolean);
  }

  function buildDisplayTreeFromState() {
    const baseTree = deepClone(state.savedTree);
    return sortTree(mergeVisibleNodes(baseTree, state.lastVisibleNodes || []));
  }

  function buildTreeSnapshot(nodes) {
    return (nodes || []).map(function (node) {
      const key = getNodeKey(node);
      return {
        code: node.code,
        title: node.title,
        path: deepClone(node.path || []),
        begin: node.begin || null,
        end: node.end || null,
        order: node.order ?? null,
        checked: !!state.markerByKey[key],
        children: buildTreeSnapshot(node.children || [])
      };
    });
  }

  function buildTrackerState() {
    const tree = buildTreeSnapshot(state.tree);
    let nodeCount = 0;
    let selectedCount = 0;

    walkTree(tree, function (node) {
      nodeCount += 1;
      if (node.checked) {
        selectedCount += 1;
      }
    });

    return {
      isVimshottariPage: isVimshottariPage(),
      trackerReady: !!getTracker(),
      panelOpen: !!getPanelIfOpen(),
      owner: getOwnerData(),
      nodeCount: nodeCount,
      selectedCount: selectedCount,
      allChecked: nodeCount > 0 && selectedCount === nodeCount,
      partiallyChecked: selectedCount > 0 && selectedCount < nodeCount,
      statusMessage: state.statusMessage || '',
      statusTone: state.statusTone || 'info',
      tree: tree
    };
  }

  function syncSelectAllCheckbox() {
    const panel = getPanelIfOpen();
    const selectAllInput = panel?.querySelector('[data-role="select-all"]');
    if (!selectAllInput) return;

    const keys = [];
    walkTree(state.tree, function (node) {
      keys.push(getNodeKey(node));
    });

    if (!keys.length) {
      selectAllInput.indeterminate = false;
      selectAllInput.checked = false;
      return;
    }

    const checkedCount = keys.reduce(function (count, key) {
      return count + (state.markerByKey[key] ? 1 : 0);
    }, 0);

    selectAllInput.checked = checkedCount === keys.length;
    selectAllInput.indeterminate = checkedCount > 0 && checkedCount < keys.length;
  }

  function renderNodes(container, nodes, depth) {
    (nodes || []).forEach((node) => {
      const key = getNodeKey(node);
      const row = document.createElement('div');
      row.style.padding = '6px 0';
      row.style.marginLeft = String((depth || 0) * 14) + 'px';
      row.style.borderBottom = '1px solid #eef2f7';

      const line = document.createElement('div');
      line.style.display = 'flex';
      line.style.flexWrap = 'wrap';
      line.style.gap = '10px';
      line.style.alignItems = 'baseline';

      const marker = document.createElement('input');
      marker.type = 'checkbox';
      marker.checked = !!state.markerByKey[key];
      marker.onchange = function () {
        setMarkerForBranchByKey(key, marker.checked);
        if (marker.checked) {
          setMarkerForAncestors(node);
        }
        state.savedTree = buildRememberedTree(state.fullTree);
        state.tree = buildDisplayTreeFromState();
        render(state.tree);
      };
      marker.onclick = function (event) {
        event.stopPropagation();
      };

      const title = document.createElement('span');
      title.style.fontWeight = (depth || 0) === 0 ? '700' : '600';
      title.style.fontSize = (depth || 0) === 0 ? '13px' : '12px';
      title.style.cursor = 'pointer';
      title.style.textDecoration = 'underline';
      title.style.textDecorationStyle = 'dotted';
      title.textContent = node.title;
      title.onclick = async function (event) {
        event.preventDefault();
        event.stopPropagation();
        const clicked = await navigateToNode(node);
        if (clicked) {
          title.style.color = '#2563eb';
          window.setTimeout(function () {
            title.style.color = '';
          }, 700);
          return;
        }
        title.style.color = '#b91c1c';
        window.setTimeout(function () {
          title.style.color = '';
        }, 1000);
      };

      const dates = document.createElement('span');
      dates.style.fontSize = '12px';
      dates.style.color = '#4b5563';
      if (node.begin && node.end) {
        dates.textContent = node.begin + ' -> ' + node.end;
      } else if (node.begin) {
        dates.textContent = node.begin;
      } else if (node.end) {
        dates.textContent = node.end;
      } else {
        dates.textContent = '';
      }

      dates.style.cursor = 'pointer';
      dates.onclick = title.onclick;

      line.append(marker, title, dates);
      row.appendChild(line);
      container.appendChild(row);

      if (node.children?.length) {
        renderNodes(container, node.children, (depth || 0) + 1);
      }
    });
  }

  function render(tree) {
    const panel = getPanelIfOpen();
    const content = panel?.querySelector('[data-role="content"]');
    if (!content) return;
    content.innerHTML = '';

    if (!tree.length) {
      const empty = document.createElement('div');
      empty.textContent = RU_WORDS.notFound;
      empty.style.fontSize = '12px';
      empty.style.color = '#6b7280';
      content.appendChild(empty);
      syncSelectAllCheckbox();
      return;
    }

    renderNodes(content, tree, 0);
    syncSelectAllCheckbox();
  }

  function buildTree() {
    const visibleNodes = collectVisibleNodes();
    state.lastVisibleNodes = deepClone(visibleNodes);
    rememberRootMeta(visibleNodes);
    const fullBaseTree = deepClone(state.fullTree);
    state.fullTree = sortTree(mergeVisibleNodes(fullBaseTree, visibleNodes));
    syncMarkerDefaults(state.fullTree);
    state.savedTree = buildRememberedTree(state.fullTree);
    return buildDisplayTreeFromState();
  }

  async function preloadNodesForLevel(level, rangeStart, rangeEnd) {
    const targetDepth = Math.max(0, (Number(level) || 2) - 1);
    if (targetDepth <= 0) return;

    for (let depthToExpand = 0; depthToExpand < targetDepth; depthToExpand += 1) {
      refresh();

      const candidates = [];
      walkTreeWithDepth(state.fullTree, function (node, parentNode, depth, siblings, index) {
        if (depth !== depthToExpand) return;
        if (!isNodeInRange(node, rangeStart, rangeEnd, parentNode, siblings, index)) return;
        candidates.push(node);
      }, null, 0);

      const uniquePathKeys = new Set();
      for (const node of candidates) {
        const pathKey = getPathKey(node.path || []);
        if (!pathKey || uniquePathKeys.has(pathKey)) continue;
        uniquePathKeys.add(pathKey);

        const visible = await ensurePathVisible(node.path || []);
        if (!visible) continue;
        const expanded = await ensureBranchExpanded(node.path || []);
        if (!expanded) continue;
        // Persist every successfully revealed branch before switching to another one.
        refresh();
        await sleep(140);
      }
    }
  }

  async function applyHorizonSelection(level, targetDateText, fromDateText) {
    const parsedLevel = Number(level);
    if (parsedLevel !== 2 && parsedLevel !== 3) {
      setStatus(getUiText('chooseLevel'), 'error');
      return { ok: false, selectedCount: 0 };
    }

    const targetDate = parseInputDateValue(targetDateText);
    if (targetDate == null) {
      setStatus(getUiText('invalidDate'), 'error');
      return { ok: false, selectedCount: 0 };
    }

    const parsedFromDate = fromDateText
      ? parseInputDateValue(fromDateText)
      : startOfDayTimestamp(Date.now());
    if (parsedFromDate == null) {
      setStatus(getUiText('invalidFromDate'), 'error');
      return { ok: false, selectedCount: 0 };
    }

    const rangeStart = startOfDayTimestamp(Math.min(parsedFromDate, targetDate));
    const rangeEnd = startOfDayTimestamp(Math.max(parsedFromDate, targetDate));

    state.isAutoSelecting = true;
    try {
      // In auto-selection mode, any newly discovered nodes should stay unchecked by default.
      state.markerDefaultChecked = false;
      setStatus(getUiText('preparing'), 'info');
      await preloadNodesForLevel(parsedLevel, rangeStart, rangeEnd);
      refresh();
    } finally {
      state.isAutoSelecting = false;
    }

    const targetDepth = parsedLevel - 1;
    const matchedKeys = [];
    walkTreeWithDepth(state.fullTree, function (node, parentNode, depth, siblings, index) {
      if (depth !== targetDepth) return;
      if (!isNodeInRange(node, rangeStart, rangeEnd, parentNode, siblings, index)) return;
      matchedKeys.push(getNodeKey(node));
    }, null, 0);

    const selectedCount = matchedKeys.length;
    if (!selectedCount) {
      setStatus(getUiText('noMatchingBranches'), 'error');
      return { ok: true, selectedCount: 0 };
    }

    walkTree(state.fullTree, function (node) {
      state.markerByKey[getNodeKey(node)] = false;
    });
    matchedKeys.forEach(function (key) {
      state.markerByKey[key] = true;
    });

    state.savedTree = buildRememberedTree(state.fullTree);
    state.tree = buildDisplayTreeFromState();
    render(state.tree);

    setStatus(getUiText('markedBranches', { count: selectedCount }), 'success');
    window.setTimeout(function () {
      setStatus('', 'info');
    }, 1600);
    return { ok: true, selectedCount };
  }

  function refresh() {
    state.tree = buildTree();
    render(state.tree);
    return deepClone(state.savedTree);
  }

  function syncStateAfterMarkerChange() {
    state.savedTree = buildRememberedTree(state.fullTree);
    state.tree = buildDisplayTreeFromState();
    render(state.tree);
    return buildTrackerState();
  }

  function setAllMarkers(checked) {
    state.markerDefaultChecked = !!checked;
    walkTree(state.tree, function (node) {
      state.markerByKey[getNodeKey(node)] = !!checked;
    });
    return syncStateAfterMarkerChange();
  }

  function setNodeMarker(path, checked) {
    const key = getPathKey(path || []);
    let targetNode = null;

    walkTree(state.fullTree, function (node) {
      if (!targetNode && getPathKey(node.path || []) === key) {
        targetNode = node;
      }
    });

    if (!targetNode) {
      return buildTrackerState();
    }

    setMarkerForBranchByKey(getNodeKey(targetNode), !!checked);
    if (checked) {
      setMarkerForAncestors(targetNode);
    }

    return syncStateAfterMarkerChange();
  }

  async function navigateToPath(path) {
    const pathKey = getPathKey(path || []);
    let targetNode = null;

    walkTree(state.fullTree, function (node) {
      if (!targetNode && getPathKey(node.path || []) === pathKey) {
        targetNode = node;
      }
    });

    if (!targetNode) {
      return { ok: false, state: buildTrackerState() };
    }

    const ok = await navigateToNode(targetNode);
    refresh();
    return { ok: ok, state: buildTrackerState() };
  }

  async function applyPopupHorizonSelection(level, targetDateText, fromDateText) {
    const result = await applyHorizonSelection(level, targetDateText, fromDateText);
    refresh();
    return {
      ok: !!result?.ok,
      selectedCount: result?.selectedCount || 0,
      state: buildTrackerState()
    };
  }

  function destroy() {
    observer?.disconnect();
    document.getElementById('vimshottari-tree-panel')?.remove();
    delete window.VimshottariDashaTracker;
  }

  const state = {
    key: ROOT_KEY,
    tree: [],
    fullTree: [],
    savedTree: [],
    lastVisibleNodes: [],
    rootMetaByCode: Object.create(null),
    markerByKey: Object.create(null),
    parentByKey: Object.create(null),
    markerDefaultChecked: true,
    isAutoSelecting: false,
    statusMessage: '',
    statusTone: 'info'
  };

  let refreshTimer = null;
  const observer = new MutationObserver(function () {
    if (state.isAutoSelecting) return;
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(function () {
      refresh();
    }, 250);
  });

  const sectionRoot = findSectionRoot();
  if (sectionRoot) {
    observer.observe(sectionRoot, { childList: true, subtree: true });
  }

  function bindPanelEvents() {
    const panel = getPanelIfOpen();
    const selectAllInput = panel?.querySelector('[data-role="select-all"]');
    if (selectAllInput) {
      selectAllInput.onchange = function () {
        const checked = !!selectAllInput.checked;
        state.markerDefaultChecked = checked;
        walkTree(state.tree, function (node) {
          state.markerByKey[getNodeKey(node)] = checked;
        });
        state.savedTree = buildRememberedTree(state.fullTree);
        state.tree = buildDisplayTreeFromState();
        render(state.tree);
      };
    }
  }

  function startTracker() {
    window.VimshottariDashaTracker?.destroy?.();
    getPanelIfOpen()?.remove();
    window.VimshottariDashaTracker = {
      key: ROOT_KEY,
      get tree() {
        return deepClone(state.savedTree);
      },
      refresh: refresh,
      export: function () {
        return deepClone(state.savedTree);
      },
      exportText: function () {
        return buildExportText(state.savedTree);
      },
      applyHorizonSelection: applyHorizonSelection,
      destroy: destroy
    };
    refresh();
  }

  function stopTracker() {
    window.VimshottariDashaTracker?.destroy?.();
  }

  function getTracker() {
    return window.VimshottariDashaTracker || null;
  }

  function ensureTrackerStarted() {
    syncAutoStart();
    return getTracker();
  }

  function parseVisibleTree() {
    const tracker = ensureTrackerStarted();
    if (tracker?.refresh) {
      return tracker.refresh();
    }

    return sortTree(mergeVisibleNodes([], collectVisibleNodes()));
  }

  function exportTree() {
    const tracker = ensureTrackerStarted();
    return tracker?.export?.() || parseVisibleTree();
  }

  function exportText() {
    const tracker = ensureTrackerStarted();
    return tracker?.exportText?.() || buildExportText(exportTree());
  }

  function openPanel() {
    const tracker = ensureTrackerStarted();
    ensurePanel();
    bindPanelEvents();
    if (tracker?.refresh) {
      tracker.refresh();
    }
    return getPanelState();
  }

  function getPanelState() {
    return buildTrackerState();
  }

  window.__vimshottariDashaAutoRunner?.stop?.();

  let watchTimer = null;
  let lastHref = window.location.href;
  let trackerStarted = false;

  function syncAutoStart() {
    const shouldRun = isVimshottariPage();

    if (shouldRun && !trackerStarted) {
      trackerStarted = true;
      startTracker();
      return;
    }

    if (!shouldRun && trackerStarted) {
      trackerStarted = false;
      stopTracker();
    }
  }

  function startAutoRunner() {
    syncAutoStart();

    watchTimer = window.setInterval(function () {
      if (window.location.href !== lastHref) {
        lastHref = window.location.href;
        syncAutoStart();
        return;
      }

      if (!trackerStarted && isVimshottariPage()) {
        syncAutoStart();
      }
    }, 500);
  }

  function stopAutoRunner() {
    if (watchTimer) {
      window.clearInterval(watchTimer);
      watchTimer = null;
    }
    trackerStarted = false;
    stopTracker();
  }

  window.__vimshottariDashaAutoRunner = {
    sync: syncAutoStart,
    stop: stopAutoRunner
  };

  window.AstroVimshottari = {
    isVimshottariPage: isVimshottariPage,
    ensureTracker: ensureTrackerStarted,
    openPanel: openPanel,
    refresh: parseVisibleTree,
    parseVisibleTree: parseVisibleTree,
    exportTree: exportTree,
    exportText: exportText,
    getPanelState: getPanelState,
    setAllMarkers: setAllMarkers,
    setNodeMarker: setNodeMarker,
    navigateToPath: navigateToPath,
    applyPopupHorizonSelection: applyPopupHorizonSelection
  };

  loadStoredLanguage().then(function (language) {
    currentUiLanguage = language;
    updatePanelLanguage();
  });

  if (chrome?.storage?.onChanged) {
    chrome.storage.onChanged.addListener(function (changes, areaName) {
      if (areaName !== 'local' || !changes[LANGUAGE_STORAGE_KEY]) return;
      currentUiLanguage = changes[LANGUAGE_STORAGE_KEY].newValue === 'ru' ? 'ru' : 'en';
      updatePanelLanguage();
    });
  }

  startAutoRunner();
})(window);
