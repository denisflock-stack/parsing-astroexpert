export function drawNorthChart(ctx, data, sizes) {
  drawGridNorth(ctx, sizes);
  const positions = getHousePositionsNorth(sizes);

  
  ctx.font = `${sizes.cellSize * 0.15}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';

  // Сортируем планеты по домам
  const housePlanets = {};

  Object.entries(data.planets).forEach(([name, p]) => {
    const house = p.house;
    if (!housePlanets[house]) {
      housePlanets[house] = [];
    }

    const label = p.retrograde ? `(${name})` : name;
    housePlanets[house].push(label);
  });

  // Добавляем Asc в 1 дом
  //if (!housePlanets[1]) {
  //  housePlanets[1] = [];
  //}
  //housePlanets[1].push('Asc');


  // Рисуем планеты в домах С   ПЕРЕносом по стракам
  for (let i = 0; i < 12; i++) {
  const houseNumber = i + 1;
  const pos = positions[i];

  const planets = housePlanets[houseNumber] || [];

  const spacing = sizes.cellSize * 0.05;
  const lineHeight = sizes.cellSize * 0.18;

  // Устанавливаем максимальную ширину строки в зависимости от типа дома
  let maxLineWidth;
  if ([1, 4, 7, 10].includes(houseNumber)) {
    maxLineWidth = sizes.cellSize * 0.8; // ромбы
  } else if ([2, 6, 8, 12].includes(houseNumber)) {
    maxLineWidth = sizes.cellSize * 0.8; // боковые треугольники
  } else if ([3, 5, 9, 11].includes(houseNumber)) {
    maxLineWidth = sizes.cellSize * 0.6; // угловые треугольники
  }

  let lines = [[]];
  let currentLineWidth = 0;

  planets.forEach(p => {
    const textWidth = ctx.measureText(p).width + spacing;
    if (currentLineWidth + textWidth <= maxLineWidth) {
      lines[lines.length - 1].push(p);
      currentLineWidth += textWidth;
    } else {
      lines.push([p]);
      currentLineWidth = textWidth;
    }
  });

  const totalHeight = lines.length * lineHeight;
  const startY = pos[1] - totalHeight / 2 + lineHeight / 2;

  lines.forEach((line, lineIndex) => {
    const lineWidth = line.reduce(
      (sum, p) => sum + ctx.measureText(p).width + spacing,
      -spacing
    );

    const startX = pos[0] - lineWidth / 2;

    let currentX = startX;
    line.forEach(p => {
      ctx.fillText(p, currentX + ctx.measureText(p).width / 2, startY + lineIndex * lineHeight);
      currentX += ctx.measureText(p).width + spacing;
    });
  });
}


// ✅ Функция рисует сетку северного стиля
function drawGridNorth(ctx, sizes) {
  const { startX, startY, cellSize } = sizes;

  const gridSize = cellSize * 4;
  const centerX = startX + gridSize / 2;
  const centerY = startY + gridSize / 2;

  const left = startX;
  const right = startX + gridSize;
  const top = startY;
  const bottom = startY + gridSize;

  // Наружный квадрат
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.strokeRect(left, top, gridSize, gridSize);

  // Внутренний ромб
  ctx.beginPath();
  ctx.moveTo(centerX, top);           // верх
  ctx.lineTo(right, centerY);         // право
  ctx.lineTo(centerX, bottom);        // низ
  ctx.lineTo(left, centerY);          // лево
  ctx.closePath();
  ctx.stroke();

  // Диагонали
  ctx.beginPath();
  ctx.moveTo(left, top);              // левая верхняя
  ctx.lineTo(right, bottom);          // правая нижняя

  ctx.moveTo(right, top);             // правая верхняя
  ctx.lineTo(left, bottom);           // левая нижняя

  ctx.stroke();
}


  //центры домов
function getHousePositionsNorth(sizes) {
  const { startX, startY, cellSize } = sizes;

  const gridSize = cellSize * 4;
  const centerX = startX + gridSize / 2;
  const centerY = startY + gridSize / 2;

  const left = startX;
  const right = startX + gridSize;
  const top = startY;
  const bottom = startY + gridSize;

  // Центры ромбов (дома 1, 4, 7, 10)
  const centerHouse1 = [centerX, (top + centerY) / 2];       // верхний ромб
  const centerHouse4 = [(left + centerX) / 2, centerY];      // левый ромб
  const centerHouse7 = [centerX, (bottom + centerY) / 2];    // нижний ромб
  const centerHouse10 = [(right + centerX) / 2, centerY];   // правый ромб

  // Точки середины сторон
  const topCenter = [centerX, top];
  const bottomCenter = [centerX, bottom];
  const leftCenter = [left, centerY];
  const rightCenter = [right, centerY];

  // Углы
  const topLeft = [left, top];
  const topRight = [right, top];
  const bottomLeft = [left, bottom];
  const bottomRight = [right, bottom];

  // Вспомогательные функции
  function midPoint(p1, p2) {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  }

  function centerOnHeight(vertex, basePoint1, basePoint2) {
    const midBase = midPoint(basePoint1, basePoint2);
    return midPoint(vertex, midBase);
  }

    // Центры треугольников
  const centerHouse2 = centerOnHeight(topLeft, topCenter, centerHouse1);
  const centerHouse3 = centerOnHeight(topLeft, leftCenter, centerHouse4);
  const centerHouse5 = centerOnHeight(bottomLeft, leftCenter, centerHouse4);
  const centerHouse6 = centerOnHeight(bottomLeft, bottomCenter, centerHouse7);
  const centerHouse12 = centerOnHeight(topRight, topCenter, centerHouse1);
  const centerHouse11 = centerOnHeight(topRight, rightCenter, centerHouse10);
  const centerHouse9 = centerOnHeight(bottomRight, rightCenter, centerHouse10);
  const centerHouse8 = centerOnHeight(bottomRight, bottomCenter, centerHouse7);

  return [
    centerHouse1,  // 1
    centerHouse2,  // 2
    centerHouse3,  // 3
    centerHouse4,  // 4
    centerHouse5,  // 5
    centerHouse6,  // 6
    centerHouse7,  // 7
    centerHouse8,  // 8
    centerHouse9,  // 9
    centerHouse10, // 10
    centerHouse11, // 11
    centerHouse12  // 12
  ];
}



  // Рисуем номера домов
  //positions.forEach((pos, index) => {
  //  ctx.fillText(index + 1, pos[0], pos[1]);
  //});
}