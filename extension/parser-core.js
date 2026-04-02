(function initAstroParser(global) {
  const validPlanets = ['Asc', 'Su', 'Mo', 'Ma', 'Me', 'Jp', 'Ve', 'Sa', 'Ra', 'Ke'];
  const signToNumber = {
    'Овен': 1, 'Телец': 2, 'Близнецы': 3, 'Рак': 4, 'Лев': 5, 'Дева': 6,
    'Весы': 7, 'Скорпион': 8, 'Стрелец': 9, 'Козерог': 10, 'Водолей': 11, 'Рыбы': 12
  };

  const perimeterCellsClockwise = [1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5];
  const zodiacByCell = {
    1: 'Рыбы', 2: 'Овен', 3: 'Телец', 4: 'Близнецы', 5: 'Водолей', 8: 'Рак',
    9: 'Козерог', 12: 'Лев', 13: 'Стрелец', 14: 'Скорпион', 15: 'Весы', 16: 'Дева'
  };

  const signTranslations = {
    'Овен': { ru: 'Овен', en: 'Aries' }, 'Телец': { ru: 'Телец', en: 'Taurus' },
    'Близнецы': { ru: 'Близнецы', en: 'Gemini' }, 'Рак': { ru: 'Рак', en: 'Cancer' },
    'Лев': { ru: 'Лев', en: 'Leo' }, 'Дева': { ru: 'Дева', en: 'Virgo' },
    'Весы': { ru: 'Весы', en: 'Libra' }, 'Скорпион': { ru: 'Скорпион', en: 'Scorpio' },
    'Стрелец': { ru: 'Стрелец', en: 'Sagittarius' }, 'Козерог': { ru: 'Козерог', en: 'Capricorn' },
    'Водолей': { ru: 'Водолей', en: 'Aquarius' }, 'Рыбы': { ru: 'Рыбы', en: 'Pisces' }
  };

  const nakshatraTranslations = {
    'Ашвини': { ru: 'Ашвини', en: 'Ashwini' }, 'Бхарани': { ru: 'Бхарани', en: 'Bharani' },
    'Криттика': { ru: 'Криттика', en: 'Krittika' }, 'Рохини': { ru: 'Рохини', en: 'Rohini' },
    'Мригашира': { ru: 'Мригашира', en: 'Mrigashira' }, 'Ардра': { ru: 'Ардра', en: 'Ardra' },
    'Пунарвасу': { ru: 'Пунарвасу', en: 'Punarvasu' }, 'Пушья': { ru: 'Пушья', en: 'Pushya' },
    'Ашлеша': { ru: 'Ашлеша', en: 'Ashlesha' }, 'Магха': { ru: 'Магха', en: 'Magha' },
    'Пурва Пхалгуни': { ru: 'Пурва Пхалгуни', en: 'Purva Phalguni' },
    'Уттара Пхалгуни': { ru: 'Уттара Пхалгуни', en: 'Uttara Phalguni' },
    'Хаста': { ru: 'Хаста', en: 'Hasta' }, 'Читра': { ru: 'Читра', en: 'Chitra' },
    'Свати': { ru: 'Свати', en: 'Swati' }, 'Вишакха': { ru: 'Вишакха', en: 'Vishakha' },
    'Анурадха': { ru: 'Анурадха', en: 'Anuradha' }, 'Джйештха': { ru: 'Джйештха', en: 'Jyeshtha' },
    'Мула': { ru: 'Мула', en: 'Mula' }, 'Пурва Ашадха': { ru: 'Пурва Ашадха', en: 'Purva Ashadha' },
    'Уттара Ашадха': { ru: 'Уттара Ашадха', en: 'Uttara Ashadha' },
    'Шравана': { ru: 'Шравана', en: 'Shravana' }, 'Дхаништха': { ru: 'Дхаништха', en: 'Dhanishta' },
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
    Asc: { ru: 'Asc', en: 'Asc' }, Su: { ru: 'Солнце', en: 'Sun' }, Mo: { ru: 'Луна', en: 'Moon' },
    Ma: { ru: 'Марс', en: 'Mars' }, Me: { ru: 'Меркурий', en: 'Mercury' }, Jp: { ru: 'Юпитер', en: 'Jupiter' },
    Ve: { ru: 'Венера', en: 'Venus' }, Sa: { ru: 'Сатурн', en: 'Saturn' }, Ra: { ru: 'Раху', en: 'Rahu' }, Ke: { ru: 'Кету', en: 'Ketu' }
  };

  const houseLabelByLanguage = { ru: 'дом', en: 'house' };
  const padaLabelByLanguage = { ru: 'пада', en: 'pada' };

  function normalizePlanetName(name = '') {
    return name.replace(/[()↑↓]/g, '').replace(/\s+/g, '').trim();
  }

  function isRetrogradeToken(name = '') {
    return /^\s*\([^()]+\)\s*[↑↓]?\s*$/.test(name);
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

    return { name: ownerName, birthDateTime: detailLines[0] || null, birthPlace: detailLines[1] || null };
  }

  function getAscCellFromSvg(svg, width, height) {
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

  function getHouseByCell(cell, ascCell) {
    if (!ascCell) return null;
    const ascIndex = perimeterCellsClockwise.indexOf(ascCell);
    const cellIndex = perimeterCellsClockwise.indexOf(cell);
    if (ascIndex === -1 || cellIndex === -1) return null;
    return ((cellIndex - ascIndex + 12) % 12) + 1;
  }

  function parseChartPlanets(svg) {
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
        .map((t) => (t.textContent || '').trim())
        .map((raw) => ({ planet: normalizePlanetName(raw), retrograde: isRetrogradeToken(raw) }))
        .filter((token) => token.planet && validPlanets.includes(token.planet))
        .forEach(({ planet, retrograde }) => placements.push({ planet, retrograde, x, y, row, col, cell }));
    });

    return placements;
  }

  function ensureAscFirst(planets, ascCell) {
    const planetsWithoutAsc = (planets || []).filter((planet) => planet.planet !== 'Asc');
    const existingAsc = (planets || []).find((planet) => planet.planet === 'Asc');

    const ascPlanet = existingAsc || (ascCell && zodiacByCell[ascCell]
      ? {
          planet: 'Asc',
          retrograde: false,
          sign: zodiacByCell[ascCell],
          house: 1
        }
      : null);

    return ascPlanet ? [ascPlanet, ...planetsWithoutAsc] : planetsWithoutAsc;
  }

  function translateByLanguage(value, translations, language) {
    if (!value) return value;
    if (translations[value]) return translations[value][language] || value;

    const reverseKey = Object.keys(translations).find(
      (key) => translations[key].ru === value || translations[key].en === value
    );
    return reverseKey ? (translations[reverseKey][language] || value) : value;
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

  function normalizeDegree(degree) {
    return (degree || '').replace(/˚/g, '°').replace(/'/g, '′').replace(/\\"/g, '″').replace(/"/g, '″');
  }

  function formatChart(chart, language) {
    const houseLabel = houseLabelByLanguage[language] || houseLabelByLanguage.ru;
    return {
      chartName: localizeChartName(chart.chartName, language),
      planets: (chart.planets || []).map((planet) => {
        const planetName = translateByLanguage(planet.planet, planetNameTranslations, language);
        const sign = translateByLanguage(planet.sign, signTranslations, language);
        const tail = planet.retrograde ? ' (R)' : '';
        return `${planetName}: ${sign}, ${houseLabel} ${planet.house}${tail}`;
      })
    };
  }

  function formatD1Header(dataWithHouses, language) {
    const owner = dataWithHouses?.owner || {};
    const d1Label = language === 'ru' ? 'Карта D1' : 'D1 Chart';
    return {
      title: `${d1Label}: ${dataWithHouses?.chartName || 'D1'}`,
      userLine: [owner.name, owner.birthDateTime, owner.birthPlace].filter(Boolean).join(' • ')
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
          const sign = translateByLanguage(planet.sign, signTranslations, language);
          const nakshatra = translateByLanguage(planet.nakshatra, nakshatraTranslations, language);
          const baseText = `${planetName}: ${sign} ${normalizeDegree(planet.degree)}, ${nakshatra} - ${padaLabel} ${planet.pada}, ${houseLabel} ${planet.house}`;
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

  function parseAstroPage() {
    const owner = getOwnerData();
    const data = Array.from(document.querySelectorAll('table.planets tbody tr'))
      .map((row) => {
        const cells = row.querySelectorAll('td');
        const [planetRaw, signRaw, nakRaw] = [
          cells[0]?.innerText.trim() || '',
          cells[1]?.innerText.trim() || '',
          cells[2]?.innerText.trim() || ''
        ];
        const [planet] = planetRaw.split('\n');
        const [sign, degree] = signRaw.split('\n');
        const [nakshatra, pada] = nakRaw.split('\n');
        return { planet, sign, degree, nakshatra, pada };
      })
      .filter((item) => validPlanets.includes(item.planet));

    const parsedCharts = Array.from(document.querySelectorAll('svg.render'))
      .map((svg, index) => {
        const viewBox = svg.getAttribute('viewBox') || '';
        const [, , widthRaw, heightRaw] = viewBox.split(/\s+/);
        const width = Number(widthRaw);
        const height = Number(heightRaw);
        const ascCell = (!Number.isNaN(width) && !Number.isNaN(height)) ? getAscCellFromSvg(svg, width, height) : null;
        const planets = ensureAscFirst(parseChartPlanets(svg).map((planet) => ({
          ...planet,
          sign: zodiacByCell[planet.cell] || null,
          house: getHouseByCell(planet.cell, ascCell)
        })), ascCell);

        return { chartIndex: index, chartName: getChartName(svg, index), viewBox, ascCell, planets };
      })
      .filter((chart) => chart.planets.length > 0);

    const d1Chart = parsedCharts.find((chart) => /0 0 600 600/.test(chart.viewBox));
    const d1ByPlanet = new Map((d1Chart?.planets || []).map((item) => [item.planet, item]));

    const ascSign = data.find((x) => x.planet === 'Asc')?.sign;
    const ascSignNumber = signToNumber[ascSign] || null;

    const dataWithHouses = data.map((item) => {
      const signNumber = signToNumber[item.sign] || null;
      const house = (ascSignNumber && signNumber) ? ((signNumber - ascSignNumber + 12) % 12) + 1 : null;
      const placement = d1ByPlanet.get(item.planet);
      return { ...item, house, retrograde: placement?.retrograde ?? false };
    });

    const finalResult = {
      dataWithHouses: {
        chartName: owner.name ? `${owner.name} (D1)` : (d1Chart?.chartName || 'D1'),
        owner,
        planets: dataWithHouses
      },
      parsedCharts: parsedCharts
        .filter((chart) => {
          const name = (chart.chartName || '').trim();
          const isD1 = /\bD1\b/i.test(name);
          const isPlainNavamsha = /^Навамша$/i.test(name);
          return !isD1 && !isPlainNavamsha;
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
    };

    return {
      finalResult,
      finalResultTextRu: formatFinalResultToText(finalResult, 'ru'),
      finalResultTextEn: formatFinalResultToText(finalResult, 'en')
    };
  }

  global.AstroParser = { parseAstroPage, formatChart, formatD1Header, formatFinalResultToText };
})(typeof window !== 'undefined' ? window : globalThis);
