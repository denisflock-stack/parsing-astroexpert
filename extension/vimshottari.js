(function initAstroVimshottari(global) {
  const RU_WORDS = {
    vimshottari: '\u0412\u0438\u043c\u0448\u043e\u0442\u0442\u0430\u0440\u0438',
    period: '\u041f\u0435\u0440\u0438\u043e\u0434',
    subperiod: '\u041f\u043e\u0434\u043f\u0435\u0440\u0438\u043e\u0434',
    begin: '\u041d\u0430\u0447\u0430\u043b\u043e',
    end: '\u041a\u043e\u043d\u0435\u0446',
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

  function normalizeSpace(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
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

    const match = normalized.match(/^(\d{1,2})\s+(\p{L}+)\s+(\d{4})$/u);
    if (!match) return null;

    const day = Number(match[1]);
    const month = months[match[2].toLowerCase()];
    const year = Number(match[3]);
    if (month == null) return null;

    return new Date(year, month, day).getTime();
  }

  function isVimshottariPage() {
    const href = global.location?.href || '';
    return /vimshottari/i.test(href);
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
    if (!target) return null;

    const highlightedDate = target.querySelector('span.font-medium');
    if (highlightedDate) {
      return normalizeSpace(highlightedDate.textContent) || null;
    }

    const match = normalizeSpace(target.textContent).match(/(\d{1,2}\s+\p{L}+\s+\d{4}(?:\s+\d{2}:\d{2})?)/u);
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
      kind,
      title,
      path,
      code: path[path.length - 1],
      begin: extractDate(body, RU_WORDS.begin + ':'),
      end: extractDate(body, RU_WORDS.end + ':'),
      children: []
    };
  }

  function collectVisibleNodes() {
    const root = findSectionRoot();
    if (!root) return [];

    const nodes = [
      ...findPrimaryRows(root).map((row, index) => parseRow(row, index, 'period')),
      ...findNestedRows(root).map((row, index) => parseRow(row, index, 'subperiod'))
    ].filter(Boolean);

    const unique = new Map();
    nodes.forEach((node) => {
      const key = node.path.join('>') + '|' + (node.begin || '') + '|' + (node.end || '');
      if (!unique.has(key)) {
        unique.set(key, node);
        return;
      }

      const existing = unique.get(key);
      existing.begin = existing.begin || node.begin;
      existing.end = existing.end || node.end;
      existing.title = existing.title || node.title;
    });

    return Array.from(unique.values()).sort((a, b) => {
      if (a.path.length !== b.path.length) return a.path.length - b.path.length;
      return a.index - b.index;
    });
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
          || sameCode[0];
      }

      return sameCode.find((item) => item.begin === data.begin && item.end === data.end)
        || sameCode.find((item) => !item.begin && !item.end)
        || null;
    }

    return sameCode.find((item) => isWithinRange(item, data))
      || sameCode.find((item) => item.begin === data.begin && item.end === data.end)
      || sameCode.find((item) => !item.begin && !item.end)
      || sameCode[0];
  }

  function ensureNode(tree, path, data) {
    let cursor = tree;
    let node = null;

    path.forEach((segment, index) => {
      let current = findSiblingMatch(cursor, segment, data, index);
      if (!current) {
        current = {
          code: segment,
          title: index === 0
            ? RU_WORDS.period + ' ' + (CODE_TO_RU[segment] || segment)
            : RU_WORDS.subperiod + ' ' + path.slice(0, index + 1).join(' / '),
          path: path.slice(0, index + 1),
          begin: null,
          end: null,
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
    }

    return node;
  }

  function mergeVisibleNodes(tree, nodes) {
    nodes.forEach((node) => {
      ensureNode(tree, node.path, node);
    });
    return tree;
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

      if (aBegin != null && bBegin != null && aBegin !== bBegin) return aBegin - bBegin;
      if (aBegin != null && bBegin == null) return -1;
      if (aBegin == null && bBegin != null) return 1;

      const aDepth = a.path?.length || 0;
      const bDepth = b.path?.length || 0;
      if (aDepth !== bDepth) return aDepth - bDepth;

      return String(a.title || '').localeCompare(String(b.title || ''));
    });

    return nodes;
  }

  function parseVisibleTree() {
    return sortTree(mergeVisibleNodes([], collectVisibleNodes()));
  }

  function ensurePanel() {
    let panel = document.getElementById('vimshottari-tree-panel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'vimshottari-tree-panel';
    panel.style.position = 'fixed';
    panel.style.top = '16px';
    panel.style.right = '16px';
    panel.style.width = '480px';
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
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '10px';

    const title = document.createElement('div');
    title.textContent = 'Vimshottari Dasha';
    title.style.fontSize = '14px';
    title.style.fontWeight = '700';

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '6px';

    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Refresh';
    refreshBtn.style.fontSize = '12px';
    refreshBtn.style.padding = '4px 8px';
    refreshBtn.style.cursor = 'pointer';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy JSON';
    copyBtn.style.fontSize = '12px';
    copyBtn.style.padding = '4px 8px';
    copyBtn.style.cursor = 'pointer';

    actions.append(refreshBtn, copyBtn);
    header.append(title, actions);
    panel.appendChild(header);

    const content = document.createElement('div');
    content.dataset.role = 'content';
    panel.appendChild(content);
    document.body.appendChild(panel);

    return { panel, refreshBtn, copyBtn, content };
  }

  function renderNodes(container, nodes, depth) {
    (nodes || []).forEach((node) => {
      const row = document.createElement('div');
      row.style.padding = '6px 0';
      row.style.marginLeft = String((depth || 0) * 14) + 'px';
      row.style.borderBottom = '1px solid #eef2f7';

      const line = document.createElement('div');
      line.style.display = 'flex';
      line.style.flexWrap = 'wrap';
      line.style.gap = '10px';
      line.style.alignItems = 'baseline';

      const title = document.createElement('span');
      title.style.fontWeight = (depth || 0) === 0 ? '700' : '600';
      title.style.fontSize = (depth || 0) === 0 ? '13px' : '12px';
      title.textContent = node.title;

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

      line.append(title, dates);
      row.appendChild(line);
      container.appendChild(row);

      if (node.children?.length) {
        renderNodes(container, node.children, (depth || 0) + 1);
      }
    });
  }

  function createTracker() {
    const state = {
      tree: []
    };

    const panelRefs = ensurePanel();
    const content = panelRefs.content;

    function render(tree) {
      content.innerHTML = '';

      if (!tree.length) {
        const empty = document.createElement('div');
        empty.textContent = RU_WORDS.notFound;
        empty.style.fontSize = '12px';
        empty.style.color = '#6b7280';
        content.appendChild(empty);
        return;
      }

      renderNodes(content, tree, 0);
    }

    function refresh() {
      state.tree = sortTree(mergeVisibleNodes(deepClone(state.tree), collectVisibleNodes()));
      render(state.tree);
      return deepClone(state.tree);
    }

    const observer = new MutationObserver(function () {
      global.clearTimeout(refresh._timer);
      refresh._timer = global.setTimeout(function () {
        refresh();
      }, 250);
    });

    const sectionRoot = findSectionRoot();
    if (sectionRoot) {
      observer.observe(sectionRoot, { childList: true, subtree: true });
    }

    panelRefs.refreshBtn.onclick = function () {
      refresh();
    };

    panelRefs.copyBtn.onclick = async function () {
      await navigator.clipboard.writeText(JSON.stringify(state.tree, null, 2));
      panelRefs.copyBtn.textContent = 'Copied';
      global.setTimeout(function () {
        panelRefs.copyBtn.textContent = 'Copy JSON';
      }, 1200);
    };

    refresh();

    return {
      refresh,
      export() {
        return deepClone(state.tree);
      },
      destroy() {
        observer.disconnect();
        panelRefs.panel.remove();
      }
    };
  }

  global.AstroVimshottari = {
    isVimshottariPage,
    parseVisibleTree,
    createTracker
  };
})(typeof window !== 'undefined' ? window : globalThis);
