(function initAstroParser(global) {
  const validPlanets = ['Asc', 'Su', 'Mo', 'Ma', 'Me', 'Jp', 'Ve', 'Sa', 'Ra', 'Ke'];

  const signToNumber = {
    'Овен': 1,
    'Телец': 2,
    'Близнецы': 3,
    'Рак': 4,
    'Лев': 5,
    'Дева': 6,
    'Весы': 7,
    'Скорпион': 8,
    'Стрелец': 9,
    'Козерог': 10,
    'Водолей': 11,
    'Рыбы': 12
  };

  const signNumberToName = Object.fromEntries(
    Object.entries(signToNumber).map(([name, number]) => [number, name])
  );

  const perimeterCellsClockwise = [1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5];
  const zodiacByCell = {
    1: 'Рыбы',
    2: 'Овен',
    3: 'Телец',
    4: 'Близнецы',
    5: 'Водолей',
    8: 'Рак',
    9: 'Козерог',
    12: 'Лев',
    13: 'Стрелец',
    14: 'Скорпион',
    15: 'Весы',
    16: 'Дева'
  };

  const signTranslations = {
    'Овен': { ru: 'Овен', en: 'Aries' },
    'Телец': { ru: 'Телец', en: 'Taurus' },
    'Близнецы': { ru: 'Близнецы', en: 'Gemini' },
    'Рак': { ru: 'Рак', en: 'Cancer' },
    'Лев': { ru: 'Лев', en: 'Leo' },
    'Дева': { ru: 'Дева', en: 'Virgo' },
    'Весы': { ru: 'Весы', en: 'Libra' },
    'Скорпион': { ru: 'Скорпион', en: 'Scorpio' },
    'Стрелец': { ru: 'Стрелец', en: 'Sagittarius' },
    'Козерог': { ru: 'Козерог', en: 'Capricorn' },
    'Водолей': { ru: 'Водолей', en: 'Aquarius' },
    'Рыбы': { ru: 'Рыбы', en: 'Pisces' }
  };

  const nakshatraTranslations = {
    'Ашвини': { ru: 'Ашвини', en: 'Ashwini' },
    'Бхарани': { ru: 'Бхарани', en: 'Bharani' },
    'Криттика': { ru: 'Криттика', en: 'Krittika' },
    'Рохини': { ru: 'Рохини', en: 'Rohini' },
    'Мригашира': { ru: 'Мригашира', en: 'Mrigashira' },
    'Ардра': { ru: 'Ардра', en: 'Ardra' },
    'Пунарвасу': { ru: 'Пунарвасу', en: 'Punarvasu' },
    'Пушья': { ru: 'Пушья', en: 'Pushya' },
    'Ашлеша': { ru: 'Ашлеша', en: 'Ashlesha' },
    'Магха': { ru: 'Магха', en: 'Magha' },
    'Пурва Пхалгуни': { ru: 'Пурва Пхалгуни', en: 'Purva Phalguni' },
    'Уттара Пхалгуни': { ru: 'Уттара Пхалгуни', en: 'Uttara Phalguni' },
    'Хаста': { ru: 'Хаста', en: 'Hasta' },
    'Читра': { ru: 'Читра', en: 'Chitra' },
    'Свати': { ru: 'Свати', en: 'Swati' },
    'Вишакха': { ru: 'Вишакха', en: 'Vishakha' },
    'Анурадха': { ru: 'Анурадха', en: 'Anuradha' },
    'Джьештха': { ru: 'Джьештха', en: 'Jyeshtha' },
    'Мула': { ru: 'Мула', en: 'Mula' },
    'Пурва Ашадха': { ru: 'Пурва Ашадха', en: 'Purva Ashadha' },
    'Уттара Ашадха': { ru: 'Уттара Ашадха', en: 'Uttara Ashadha' },
    'Шравана': { ru: 'Шравана', en: 'Shravana' },
    'Дхаништха': { ru: 'Дхаништха', en: 'Dhanishta' },
    'Шатабхиша': { ru: 'Шатабхиша', en: 'Shatabhisha' },
    'Пурва Бхадрапада': { ru: 'Пурва Бхадрапада', en: 'Purva Bhadrapada' },
    'Уттара Бхадрапада': { ru: 'Уттара Бхадрапада', en: 'Uttara Bhadrapada' },
    'Ревати': { ru: 'Ревати', en: 'Revati' }
  };

  const chartNameTranslations = {
    'Хора (D2)': { ru: 'Хора (D2)', en: 'Hora (D2)' },
    'Дреккана (D3)': { ru: 'Дреккана (D3)', en: 'Drekkana (D3)' },
    'Чатуртамша (D4)': { ru: 'Чатуртамша (D4)', en: 'Chaturthamsha (D4)' },
    'Панчамша (D5)': { ru: 'Панчамша (D5)', en: 'Panchamsha (D5)' },
    'Шаштамша (D6)': { ru: 'Шаштамша (D6)', en: 'Shashtamsha (D6)' },
    'Саптамша (D7)': { ru: 'Саптамша (D7)', en: 'Saptamsha (D7)' },
    'Аштамша (D8)': { ru: 'Аштамша (D8)', en: 'Ashtamsha (D8)' },
    'Навамша (D9)': { ru: 'Навамша (D9)', en: 'Navamsha (D9)' },
    'Дашамша (D10)': { ru: 'Дашамша (D10)', en: 'Dashamsha (D10)' },
    'Экадашамша (D11)': { ru: 'Экадашамша (D11)', en: 'Ekadashamsha (D11)' },
    'Двадашамша (D12)': { ru: 'Двадашамша (D12)', en: 'Dvadashamsha (D12)' },
    'Шодашамша (D16)': { ru: 'Шодашамша (D16)', en: 'Shodashamsha (D16)' },
    'Карта': { ru: 'Карта', en: 'Chart' }
  };

  const planetNameTranslations = {
    Asc: { ru: 'Asc', en: 'Asc' },
    Su: { ru: 'Солнце', en: 'Sun' },
    Mo: { ru: 'Луна', en: 'Moon' },
    Ma: { ru: 'Марс', en: 'Mars' },
    Me: { ru: 'Меркурий', en: 'Mercury' },
    Jp: { ru: 'Юпитер', en: 'Jupiter' },
    Ve: { ru: 'Венера', en: 'Venus' },
    Sa: { ru: 'Сатурн', en: 'Saturn' },
    Ra: { ru: 'Раху', en: 'Rahu' },
    Ke: { ru: 'Кету', en: 'Ketu' }
  };

  const houseLabelByLanguage = { ru: 'дом', en: 'house' };
  const padaLabelByLanguage = { ru: 'пада', en: 'pada' };

  function normalizePlanetName(name = '') {
    return name.replace(/[()↑↓]/g, '').replace(/\s+/g, '').trim();
  }

  function isRetrogradeToken(name = '') {
    return /^\s*\([^()]+\)\s*[↑↓]?\s*$/.test(name) || /[↑↓]/.test(name);
  }

  function translateByLanguage(value, translations, language) {
    if (!value) return value;
    if (translations[value]) return translations[value][language] || value;

    const reverseKey = Object.keys(translations).find(
      (key) => translations[key].ru === value || translations[key].en === value
    );
    return reverseKey ? (translations[reverseKey][language] || value) : value;
  }

  function normalizeDegree(degree) {
    return (degree || '')
      .replace(/љ/g, '°')
      .replace(/'/g, '′')
      .replace(/\\"/g, '″')
      .replace(/"/g, '″');
  }

  function getChartCode(chartName = '') {
    const match = chartName.match(/\bD(\d+)\b/i);
    return match ? `D${match[1]}` : null;
  }

  function getChartName(svg, index) {
    const directPrevHeading = svg.previousElementSibling?.matches?.('h5, h4, h3') ? svg.previousElementSibling : null;
    const containerHeading = svg.parentElement?.querySelector?.('h5, h4, h3');
    const headingText = (directPrevHeading?.innerText || containerHeading?.innerText || '').trim();
    if (headingText) return headingText;

    const viewBox = svg.getAttribute('viewBox') || '';
    if (/0 0 600 600/.test(viewBox)) return 'D1';
    if (/0 0 500 500/.test(viewBox)) return `Карта #${index + 1}`;
    return `Карта #${index + 1}`;
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

  function parseTablePlanets() {
    return Array.from(document.querySelectorAll('table.planets tbody tr'))
      .map((row) => {
        const cells = row.querySelectorAll('td');
        const [planetRaw, signRaw, nakRaw, extraRaw] = [
          cells[0]?.innerText.trim() || '',
          cells[1]?.innerText.trim() || '',
          cells[2]?.innerText.trim() || '',
          cells[3]?.innerText.trim() || ''
        ];

        const [planet, karaka] = planetRaw.split('\n');
        const [sign, degree] = signRaw.split('\n');
        const [nakshatra, pada] = nakRaw.split('\n');
        const extra = extraRaw ? extraRaw.split(/\s+/).filter(Boolean) : [];

        return {
          planet,
          karaka: karaka || null,
          sign,
          degree,
          nakshatra,
          pada,
          extra
        };
      })
      .filter((item) => validPlanets.includes(item.planet));
  }

  function localizeChartName(chartName, language) {
    if (!chartName) return chartName;
    if (/\bD1\b/i.test(chartName)) return chartName;

    const directMatch = translateByLanguage(chartName, chartNameTranslations, language);
    if (directMatch !== chartName) return directMatch;

    const chartNumberMatch = chartName.match(/^(Карта|Chart)\s*#\s*(\d+)$/i);
    if (chartNumberMatch) {
      const label = chartNameTranslations.Карта[language] || chartNameTranslations.Карта.ru;
      return `${label} #${chartNumberMatch[2]}`;
    }

    return chartName;
  }

  function formatChart(chart, language) {
    const houseLabel = houseLabelByLanguage[language] || houseLabelByLanguage.ru;
    return {
      chartName: localizeChartName(chart.chartName, language),
      planets: (chart.planets || []).map((planet) => {
        const planetName = translateByLanguage(planet.planet, planetNameTranslations, language);
        const sign = translateByLanguage(planet.sign, signTranslations, language) || '?';
        const housePart = planet.house == null ? '?' : planet.house;
        const tail = planet.retrograde ? ' (R)' : '';
        return `${planetName}: ${sign}, ${houseLabel} ${housePart}${tail}`;
      })
    };
  }

  function formatD1Header(dataWithHouses, language) {
    const owner = dataWithHouses?.owner || {};
    const titleLabel = language === 'ru' ? 'Карта' : 'Chart';
    const rawName = (dataWithHouses?.chartName || 'D1').replace(/\s*\(D1\)\s*$/i, '').trim();
    return {
      title: `${titleLabel}: ${rawName}`,
      userLine: [owner.birthDateTime, owner.birthPlace].filter(Boolean).join(' • ')
    };
  }

  function formatFinalResultSingleLanguage(result, language = 'ru') {
    const houseLabel = houseLabelByLanguage[language] || houseLabelByLanguage.ru;
    const padaLabel = padaLabelByLanguage[language] || padaLabelByLanguage.ru;

    return {
      dataWithHouses: {
        chartName: localizeChartName(result.dataWithHouses?.chartName || null, language),
        owner: result.dataWithHouses?.owner || null,
        planets: (result.dataWithHouses?.planets || []).map((planet) => {
          const planetName = translateByLanguage(planet.planet, planetNameTranslations, language);
          const sign = translateByLanguage(planet.sign, signTranslations, language) || '?';
          const nakshatra = translateByLanguage(planet.nakshatra, nakshatraTranslations, language) || '?';
          const housePart = planet.house == null ? '?' : planet.house;
          const baseText = `${planetName}: ${sign} ${normalizeDegree(planet.degree)}, ${nakshatra} - ${padaLabel} ${planet.pada}, ${houseLabel} ${housePart}`;
          return planet.retrograde ? `${baseText} (R)` : baseText;
        })
      },
      parsedCharts: (result.parsedCharts || []).map((chart) => formatChart(chart, language))
    };
  }

  function formatFinalResultToText(result, language = 'ru') {
    if (language === 'both') {
      return {
        ru: formatFinalResultSingleLanguage(result, 'ru'),
        en: formatFinalResultSingleLanguage(result, 'en')
      };
    }

    return formatFinalResultSingleLanguage(result, language);
  }

  function isNorthStyleChart(svg) {
    return svg?.querySelectorAll('text.chart-sign').length >= 12;
  }

  function detectChartStyle() {
    const d1Svg = Array.from(document.querySelectorAll('svg.render')).find((svg) => /0 0 600 600/.test(svg.getAttribute('viewBox') || ''))
      || document.querySelector('svg.render');

    return isNorthStyleChart(d1Svg) ? 'north' : 'south';
  }

  function isSupportedAstroPage() {
    const pathname = window.location?.pathname || '';
    if (/^\/h\/\d+(?:\/)?$/i.test(pathname)) {
      return true;
    }

    const hasPlanetsTable = document.querySelectorAll('table.planets tbody tr').length > 0;
    const hasCharts = document.querySelectorAll('svg.render').length > 0;
    return hasPlanetsTable && hasCharts;
  }

  function isVimshottariPage() {
    const href = window.location?.href || '';
    return /vimshottari/i.test(href);
  }

  function getAscCellFromSouthSvg(svg, width, height) {
    const ascText = Array.from(svg.querySelectorAll('text.chart-planet.text-gray-900')).find((textEl) => {
      const rawText = textEl.textContent || '';
      if (/\bAsc\b/.test(rawText)) return true;

      return Array.from(textEl.querySelectorAll('tspan'))
        .some((tspan) => normalizePlanetName(tspan.textContent || '') === 'Asc');
    });

    if (ascText) {
      const x = Number(ascText.getAttribute('x'));
      const y = Number(ascText.getAttribute('y'));
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        const cellW = width / 4;
        const cellH = height / 4;
        const col = Math.max(0, Math.min(3, Math.floor(x / cellW)));
        const row = Math.max(0, Math.min(3, Math.floor(y / cellH)));
        return row * 4 + col + 1;
      }
    }

    const paths = Array.from(svg.querySelectorAll('path[stroke-width="2"]'));
    const arrowPath = paths.at(-1);
    if (!arrowPath) return null;

    const d = arrowPath.getAttribute('d') || '';
    const match = d.match(/M\s*([0-9.]+)\s+([0-9.]+)/i);
    if (!match) return null;

    const x = Number(match[1]);
    const y = Number(match[2]);
    if (Number.isNaN(x) || Number.isNaN(y)) return null;

    const cellW = width / 4;
    const cellH = height / 4;
    const col = Math.max(0, Math.min(3, Math.floor(x / cellW)));
    const row = Math.max(0, Math.min(3, Math.floor(y / cellH)));
    return row * 4 + col + 1;
  }

  function getHouseBySouthCell(cell, ascCell) {
    if (!ascCell) return null;
    const ascIndex = perimeterCellsClockwise.indexOf(ascCell);
    const cellIndex = perimeterCellsClockwise.indexOf(cell);
    if (ascIndex === -1 || cellIndex === -1) return null;
    return ((cellIndex - ascIndex + 12) % 12) + 1;
  }

  function parseSouthChartPlanets(svg) {
    const viewBox = svg.getAttribute('viewBox') || '';
    const [, , widthRaw, heightRaw] = viewBox.split(/\s+/);
    const width = Number(widthRaw);
    const height = Number(heightRaw);
    if (!width || !height || ![500, 600].includes(width) || ![500, 600].includes(height)) return [];

    const cellW = width / 4;
    const cellH = height / 4;
    const placements = [];

    svg.querySelectorAll('text.chart-planet.text-gray-900').forEach((textEl) => {
      const x = Number(textEl.getAttribute('x'));
      const y = Number(textEl.getAttribute('y'));
      if (Number.isNaN(x) || Number.isNaN(y)) return;

      const col = Math.max(0, Math.min(3, Math.floor(x / cellW)));
      const row = Math.max(0, Math.min(3, Math.floor(y / cellH)));
      const cell = row * 4 + col + 1;

      Array.from(textEl.querySelectorAll('tspan[dx="-4"]'))
        .map((tspan) => (tspan.textContent || '').trim())
        .map((raw) => ({ planet: normalizePlanetName(raw), retrograde: isRetrogradeToken(raw) }))
        .filter((token) => token.planet && validPlanets.includes(token.planet))
        .forEach(({ planet, retrograde }) => placements.push({ planet, retrograde, x, y, row, col, cell }));
    });

    return placements;
  }

  function ensureSouthAscFirst(planets, ascCell) {
    const planetsWithoutAsc = (planets || []).filter((planet) => planet.planet !== 'Asc');
    const existingAsc = (planets || []).find((planet) => planet.planet === 'Asc');

    const ascPlanet = existingAsc || (ascCell && zodiacByCell[ascCell]
      ? { planet: 'Asc', retrograde: false, sign: zodiacByCell[ascCell], house: 1 }
      : null);

    return ascPlanet ? [ascPlanet, ...planetsWithoutAsc] : planetsWithoutAsc;
  }

  function parseSouthCharts(owner, tablePlanets) {
    const onlyD1 = isVimshottariPage();
    const parsedCharts = Array.from(document.querySelectorAll('svg.render'))
      .map((svg, index) => {
        const viewBox = svg.getAttribute('viewBox') || '';
        const [, , widthRaw, heightRaw] = viewBox.split(/\s+/);
        const width = Number(widthRaw);
        const height = Number(heightRaw);
        const ascCell = (!Number.isNaN(width) && !Number.isNaN(height)) ? getAscCellFromSouthSvg(svg, width, height) : null;
        const planets = ensureSouthAscFirst(
          parseSouthChartPlanets(svg).map((planet) => ({
            ...planet,
            sign: zodiacByCell[planet.cell] || null,
            house: getHouseBySouthCell(planet.cell, ascCell)
          })),
          ascCell
        );

        return { chartIndex: index, chartName: getChartName(svg, index), viewBox, ascCell, planets };
      })
      .filter((chart) => chart.planets.length > 0);

    const d1Chart = parsedCharts.find((chart) => /0 0 600 600/.test(chart.viewBox));
    const d1ByPlanet = new Map((d1Chart?.planets || []).map((item) => [item.planet, item]));

    const ascSign = tablePlanets.find((item) => item.planet === 'Asc')?.sign;
    const ascSignNumber = signToNumber[ascSign] || null;

    const dataWithHouses = tablePlanets.map((item) => {
      const signNumber = signToNumber[item.sign] || null;
      const house = ascSignNumber && signNumber ? ((signNumber - ascSignNumber + 12) % 12) + 1 : null;
      const placement = d1ByPlanet.get(item.planet);
      return { ...item, house, retrograde: placement?.retrograde ?? false };
    });

    return {
      finalResult: {
        dataWithHouses: {
          chartName: owner.name ? `${owner.name} (D1)` : (d1Chart?.chartName || 'D1'),
          owner,
          planets: dataWithHouses
        },
        parsedCharts: onlyD1 ? [] : parsedCharts
          .filter((chart) => {
            const name = (chart.chartName || '').trim();
            return !/\bD1\b/i.test(name) && !/^Навамша$/i.test(name);
          })
          .map((chart) => ({
            chartName: chart.chartName,
            planets: chart.planets.map((planet) => ({
              planet: planet.planet,
              sign: planet.sign,
              house: planet.house,
              retrograde: planet.retrograde
            }))
          }))
      }
    };
  }

  function getViewBoxSize(svg) {
    const viewBox = (svg.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number);
    return {
      width: viewBox[2] || svg.viewBox?.baseVal?.width || 500,
      height: viewBox[3] || svg.viewBox?.baseVal?.height || 500
    };
  }

  function getNorthGeometryPoints(svg) {
    const { width: W, height: H } = getViewBoxSize(svg);
    return {
      C: [W / 2, H / 2],
      T: [W / 2, 0],
      B: [W / 2, H],
      L: [0, H / 2],
      R: [W, H / 2],
      TL: [0, 0],
      TR: [W, 0],
      BL: [0, H],
      BR: [W, H],
      ITL: [W / 4, H / 4],
      ITR: [(3 * W) / 4, H / 4],
      IBL: [W / 4, (3 * H) / 4],
      IBR: [(3 * W) / 4, (3 * H) / 4]
    };
  }

  function getNorthHousePolygons(svg) {
    const P = getNorthGeometryPoints(svg);
    return {
      1: [P.T, P.ITR, P.C, P.ITL],
      2: [P.TL, P.T, P.ITL],
      3: [P.TL, P.ITL, P.L],
      4: [P.L, P.ITL, P.C, P.IBL],
      5: [P.L, P.IBL, P.BL],
      6: [P.IBL, P.B, P.BL],
      7: [P.C, P.IBR, P.B, P.IBL],
      8: [P.IBR, P.BR, P.B],
      9: [P.R, P.BR, P.IBR],
      10: [P.C, P.ITR, P.R, P.IBR],
      11: [P.ITR, P.TR, P.R],
      12: [P.T, P.TR, P.ITR]
    };
  }

  function isPointOnSegment(point, start, end, epsilon = 0.5) {
    const [px, py] = point;
    const [x1, y1] = start;
    const [x2, y2] = end;
    const cross = Math.abs((py - y1) * (x2 - x1) - (px - x1) * (y2 - y1));
    if (cross > epsilon) return false;
    const dot = (px - x1) * (px - x2) + (py - y1) * (py - y2);
    return dot <= epsilon;
  }

  function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      if (isPointOnSegment(point, polygon[j], polygon[i])) return true;

      const intersects = ((yi > y) !== (yj > y))
        && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
      if (intersects) inside = !inside;
    }

    return inside;
  }

  function getHouseByNorthPoint(housePolygons, point) {
    if (!point || point.x == null || point.y == null) return null;
    const target = [point.x, point.y];
    const houseEntry = Object.entries(housePolygons || {}).find(([, polygon]) => pointInPolygon(target, polygon));
    return houseEntry ? Number(houseEntry[0]) : null;
  }

  function assignNorthSignsToHouses(signs, housePolygons) {
    return (signs || [])
      .map((sign) => {
        const house = getHouseByNorthPoint(housePolygons, sign);
        if (house == null) return null;
        const signNumber = Number(sign.text);
        return {
          ...sign,
          house,
          signNumber,
          signName: signNumberToName[signNumber] || null
        };
      })
      .filter(Boolean);
  }

  function findNorthAscPlacement(svg) {
    const ascText = Array.from(svg.querySelectorAll('text.chart-planet.text-gray-900')).find((textEl) => {
      const text = textEl.textContent || '';
      if (/\bAsc\b/.test(text)) return true;
      return Array.from(textEl.querySelectorAll('tspan')).some(
        (tspan) => normalizePlanetName(tspan.textContent || '') === 'Asc'
      );
    });

    if (!ascText) return null;
    return {
      x: Number(ascText.getAttribute('x')),
      y: Number(ascText.getAttribute('y'))
    };
  }

  function collectNorthChartGeometry(svg) {
    return {
      signs: Array.from(svg.querySelectorAll('text.chart-sign')).map((el) => ({
        text: (el.textContent || '').trim(),
        x: Number(el.getAttribute('x')),
        y: Number(el.getAttribute('y'))
      }))
    };
  }

  function parseNorthChartPlanets(svg) {
    const hosts = Array.from(new Set(
      Array.from(svg.querySelectorAll('text.chart-planet.text-gray-900, g.chart-planet.text-gray-900, text.fill-current'))
        .map((textEl) => (textEl.matches('text') ? textEl : textEl.querySelector('text')))
        .filter(Boolean)
    ));

    return hosts.flatMap((host) => {
      const x = Number(host.getAttribute('x'));
      const y = Number(host.getAttribute('y'));

      const childTokens = Array.from(host.children)
        .filter((child) => child.tagName?.toLowerCase() === 'tspan')
        .map((tspan) => (tspan.childNodes[0]?.textContent || tspan.textContent || '').trim())
        .filter(Boolean);

      const lineTokens = (host.textContent || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const rawTokens = childTokens.length ? childTokens : lineTokens;
      const tokens = rawTokens
        .map((raw) => ({
          planet: normalizePlanetName(raw),
          retrograde: isRetrogradeToken(raw)
        }))
        .filter((token) => token.planet && validPlanets.includes(token.planet));

      if (!tokens.length) return [];

      return tokens.map((token) => ({
        planet: token.planet,
        retrograde: token.retrograde,
        x,
        y
      }));
    });
  }

  function getNorthAscFromTable(tablePlanets) {
    const ascPlanet = (tablePlanets || []).find((planet) => planet.planet === 'Asc');
    if (!ascPlanet) return null;
    return {
      sign: ascPlanet.sign || null,
      signNumber: signToNumber[ascPlanet.sign] || null
    };
  }

  function ensureNorthAscFirst(planets, ascPlacement, ascSign) {
    const withoutAsc = (planets || []).filter((planet) => planet.planet !== 'Asc');
    const existingAsc = (planets || []).find((planet) => planet.planet === 'Asc');
    const ascPlanet = existingAsc || ((ascPlacement || ascSign)
      ? {
          planet: 'Asc',
          retrograde: false,
          x: ascPlacement?.x ?? null,
          y: ascPlacement?.y ?? null,
          house: 1,
          sign: ascSign?.signName || null
        }
      : null);

    return ascPlanet ? [ascPlanet, ...withoutAsc] : withoutAsc;
  }

  function ensureNorthNodePair(planets) {
    const result = [...(planets || [])];
    const rahu = result.find((planet) => planet.planet === 'Ra');
    const ketu = result.find((planet) => planet.planet === 'Ke');

    if (rahu && !ketu && rahu.house != null && rahu.sign) {
      const rahuSignNumber = signToNumber[rahu.sign] || null;
      const ketuSignNumber = rahuSignNumber ? ((rahuSignNumber + 5) % 12) + 1 : null;
      result.push({
        planet: 'Ke',
        retrograde: rahu.retrograde,
        x: null,
        y: null,
        sign: ketuSignNumber ? signNumberToName[ketuSignNumber] : null,
        house: ((rahu.house + 5) % 12) + 1,
        debugSignNumber: ketuSignNumber,
        debugDistance: null
      });
    }

    if (ketu && !rahu && ketu.house != null && ketu.sign) {
      const ketuSignNumber = signToNumber[ketu.sign] || null;
      const rahuSignNumber = ketuSignNumber ? ((ketuSignNumber + 5) % 12) + 1 : null;
      result.push({
        planet: 'Ra',
        retrograde: ketu.retrograde,
        x: null,
        y: null,
        sign: rahuSignNumber ? signNumberToName[rahuSignNumber] : null,
        house: ((ketu.house + 5) % 12) + 1,
        debugSignNumber: rahuSignNumber,
        debugDistance: null
      });
    }

    return result;
  }

  function buildNorthD1Result(tablePlanets, d1Chart) {
    const ascInfo = getNorthAscFromTable(tablePlanets);
    const d1ByPlanet = (d1Chart?.planets || []).reduce((map, planet) => {
      const existing = map.get(planet.planet);
      if (!existing || (!existing.retrograde && planet.retrograde)) {
        map.set(planet.planet, planet);
      }
      return map;
    }, new Map());
    return (tablePlanets || []).map((planet) => {
      const signNumber = signToNumber[planet.sign] || null;
      const placement = d1ByPlanet.get(planet.planet);
      return {
        ...planet,
        house: planet.planet === 'Asc'
          ? 1
          : (signNumber && ascInfo?.signNumber ? ((signNumber - ascInfo.signNumber + 12) % 12) + 1 : null),
        retrograde: placement?.retrograde ?? false
      };
    });
  }

  function parseNorthCharts(owner, tablePlanets) {
    const onlyD1 = isVimshottariPage();
    const tableAsc = getNorthAscFromTable(tablePlanets);

    const parsedCharts = Array.from(document.querySelectorAll('svg.render'))
      .map((svg, index) => {
        const chartName = getChartName(svg, index);
        const chartCode = getChartCode(chartName);
        const ascPlacement = findNorthAscPlacement(svg);
        const geometry = collectNorthChartGeometry(svg);
        const housePolygons = getNorthHousePolygons(svg);
        const signPlacements = assignNorthSignsToHouses(geometry.signs, housePolygons);
        const firstHouseSign = signPlacements.find((placement) => placement.house === 1) || null;
        const ascSign = ascPlacement
          ? signPlacements.find((placement) => placement.house === getHouseByNorthPoint(housePolygons, ascPlacement)) || null
          : firstHouseSign || (
              chartCode === 'D1' && tableAsc?.signNumber
                ? { signNumber: tableAsc.signNumber, signName: tableAsc.sign, house: 1, x: null, y: null, source: 'table' }
                : null
            );

        const basePlanets = ensureNorthAscFirst(parseNorthChartPlanets(svg), ascPlacement, ascSign);
        const planets = ensureNorthNodePair(
          basePlanets.map((planet) => {
            const house = planet.planet === 'Asc' ? 1 : getHouseByNorthPoint(housePolygons, planet);
            const signPlacement = house != null ? signPlacements.find((placement) => placement.house === house) || null : null;
            const signNumber = signPlacement?.signNumber || (planet.planet === 'Asc' ? ascSign?.signNumber : null) || null;

            return {
              ...planet,
              sign: signNumber ? signNumberToName[signNumber] : (planet.sign || null),
              house,
              debugSignNumber: signNumber,
              debugDistance: null
            };
          })
        );

        return {
          chartIndex: index,
          chartName,
          chartCode,
          viewBox: svg.getAttribute('viewBox') || '',
          planets
        };
      })
      .filter((chart) => chart.planets.length > 0);

    const d1Chart = parsedCharts.find((chart) => /\bD1\b/i.test(chart.chartName || '') || /0 0 600 600/.test(chart.viewBox || ''));

    return {
      finalResult: {
        dataWithHouses: {
          chartName: owner.name ? `${owner.name} (D1)` : 'D1',
          owner,
          planets: buildNorthD1Result(tablePlanets, d1Chart)
        },
        parsedCharts: onlyD1 ? [] : parsedCharts
          .filter((chart) => {
            const name = (chart.chartName || '').trim();
            return !/\bD1\b/i.test(name) && !/^Навамша$/i.test(name);
          })
          .map((chart) => ({
            chartName: chart.chartName,
            planets: chart.planets.map((planet) => ({
              planet: planet.planet,
              sign: planet.sign,
              house: planet.house,
              retrograde: planet.retrograde
            }))
          }))
      }
    };
  }

  function parseAstroPage() {
    if (!isSupportedAstroPage()) {
      throw new Error('This page is not a supported Astro.Expert chart page.');
    }

    const owner = getOwnerData();
    const tablePlanets = parseTablePlanets();
    if (!tablePlanets.length) {
      throw new Error('No chart data found on this page.');
    }

    const chartStyle = detectChartStyle();
    const parsed = chartStyle === 'north'
      ? parseNorthCharts(owner, tablePlanets)
      : parseSouthCharts(owner, tablePlanets);

    return {
      chartStyle,
      finalResult: parsed.finalResult,
      finalResultTextRu: formatFinalResultToText(parsed.finalResult, 'ru'),
      finalResultTextEn: formatFinalResultToText(parsed.finalResult, 'en')
    };
  }

  global.AstroParser = {
    isSupportedAstroPage,
    parseAstroPage,
    formatChart,
    formatD1Header,
    formatFinalResultToText
  };
})(typeof window !== 'undefined' ? window : globalThis);
