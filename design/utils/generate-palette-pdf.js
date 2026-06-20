const puppeteer = require('C:\\Users\\Igor\\AppData\\Roaming\\npm\\node_modules\\md-to-pdf\\node_modules\\puppeteer');
const fs = require('fs');
const path = require('path');

const palette = [
  {
    section: 'Накладка ракетки — сторона A',
    note: 'По правилам ITTF одна сторона всегда чёрная — без исключений.',
    colors: [
      { name: 'Чёрный', hex: '#1A1A1A', rgb: '26, 26, 26' },
    ],
  },
  {
    section: 'Накладка ракетки — сторона B',
    note: 'С октября 2021 ITTF расширила список допустимых цветов.',
    colors: [
      { name: 'Красный (классика)', hex: '#C8102E', rgb: '200, 16, 46' },
      { name: 'Синий', hex: '#1455C0', rgb: '20, 85, 192' },
      { name: 'Зелёный', hex: '#1E8A4C', rgb: '30, 138, 76' },
      { name: 'Розовый', hex: '#E0408A', rgb: '224, 64, 138' },
      { name: 'Фиолетовый', hex: '#6E3FA3', rgb: '110, 63, 163' },
    ],
  },
  {
    section: 'Стол',
    note: 'Синий — приоритетный (доступнее для людей с дальтонизмом).',
    colors: [
      { name: 'Тёмно-синий', hex: '#1B3A6B', rgb: '27, 58, 107' },
      { name: 'Сине-фиолетовый оттенок', hex: '#2A4D7A', rgb: '42, 77, 122' },
      { name: 'Тёмно-зелёный', hex: '#1F5C44', rgb: '31, 92, 68' },
      { name: 'Линии разметки (белые)', hex: '#FFFFFF', rgb: '255, 255, 255', border: true },
    ],
  },
  {
    section: 'Мяч',
    note: 'Цвет подбирается под контраст со столом.',
    colors: [
      { name: 'Белый', hex: '#F5F2EA', rgb: '245, 242, 234', border: true },
      { name: 'Оранжевый', hex: '#F2901E', rgb: '242, 144, 30' },
    ],
  },
  {
    section: 'Пол игровой зоны',
    note: 'Определяется производителями спортивных покрытий, не ITTF.',
    colors: [
      { name: 'Красный (самый частый)', hex: '#B3242A', rgb: '179, 36, 42' },
      { name: 'Синий', hex: '#1D4F8C', rgb: '29, 79, 140' },
      { name: 'Фиолетовый', hex: '#5B2E78', rgb: '91, 46, 120' },
    ],
  },
  {
    section: 'Ограждения площадки (Butterfly)',
    note: 'По ассортименту ограждений Butterfly.',
    colors: [
      { name: 'Тёмно-синий', hex: '#142840', rgb: '20, 40, 64' },
      { name: 'Светло-синий', hex: '#4F9FE0', rgb: '79, 159, 224' },
      { name: 'Золотой', hex: '#C7A23A', rgb: '199, 162, 58' },
      { name: 'Фиолетовый', hex: '#7C4FA0', rgb: '124, 79, 160' },
      { name: 'Розовый', hex: '#D45A8C', rgb: '212, 90, 140' },
    ],
  },
];

function isLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

function buildHTML() {
  const sections = palette.map(({ section, note, colors }) => {
    const cards = colors.map(({ name, hex, rgb, border }) => {
      const textColor = isLight(hex) ? '#1A1A1A' : '#FFFFFF';
      const borderStyle = border ? 'border: 1px solid #D0D0D0;' : '';
      return `
        <div class="card">
          <div class="swatch" style="background:${hex};${borderStyle}">
            <span class="hex" style="color:${textColor}">${hex}</span>
          </div>
          <div class="info">
            <div class="name">${name}</div>
            <div class="rgb">RGB ${rgb}</div>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="section">
        <h2>${section}</h2>
        <p class="note">${note}</p>
        <div class="cards">${cards}</div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8F8F8; color: #1A1A1A; padding: 40px; }
  h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #666; margin-bottom: 40px; }
  .section { margin-bottom: 36px; }
  h2 { font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #444; margin-bottom: 4px; border-bottom: 1px solid #E0E0E0; padding-bottom: 6px; }
  .note { font-size: 12px; color: #888; margin: 6px 0 14px; }
  .cards { display: flex; flex-wrap: wrap; gap: 12px; }
  .card { display: flex; flex-direction: column; width: 140px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.10); background: #fff; }
  .swatch { height: 80px; display: flex; align-items: flex-end; padding: 8px; }
  .hex { font-size: 11px; font-weight: 600; font-family: monospace; opacity: 0.9; }
  .info { padding: 8px 10px 10px; }
  .name { font-size: 12px; font-weight: 600; line-height: 1.3; }
  .rgb { font-size: 10px; color: #999; margin-top: 2px; }
</style>
</head>
<body>
  <h1>Цветовая палитра настольного тенниса</h1>
  <p class="subtitle">Источник: правила ITTF + практика производителей (Butterfly, JOOLA, Stiga, Double Fish, Cornilleau)</p>
  ${sections}
</body>
</html>`;
}

(async () => {
  const html = buildHTML();
  const htmlPath = path.join(__dirname, '_palette-temp.html');
  const pdfPath = path.join(__dirname, '..', 'table-tennis', 'color-palette.pdf');

  fs.writeFileSync(htmlPath, html, 'utf8');

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
    printBackground: true,
  });

  await browser.close();
  fs.unlinkSync(htmlPath);
  console.log('PDF создан:', pdfPath);
})();
