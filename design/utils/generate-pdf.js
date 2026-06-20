const puppeteer = require('C:\\Users\\Igor\\AppData\\Roaming\\npm\\node_modules\\md-to-pdf\\node_modules\\puppeteer');
const fs = require('fs');
const path = require('path');

const sport = process.argv[2];

if (!sport) {
  console.error('Usage: node utils/generate-pdf.js <sport-folder>');
  console.error('Example: node utils/generate-pdf.js table-tennis');
  process.exit(1);
}

const dataPath = path.join(__dirname, '..', sport, 'palette-data.json');

if (!fs.existsSync(dataPath)) {
  console.error(`File not found: ${dataPath}`);
  process.exit(1);
}

const { title, subtitle, sections } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function isLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

function buildHTML() {
  const sectionsHTML = sections.map(({ section, note, colors }) => {
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
  <h1>${title}</h1>
  <p class="subtitle">${subtitle}</p>
  ${sectionsHTML}
</body>
</html>`;
}

(async () => {
  const html = buildHTML();
  const htmlPath = path.join(__dirname, '_temp.html');
  const pdfPath = path.join(__dirname, '..', sport, 'color-palette.pdf');

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
  console.log(`PDF создан: ${pdfPath}`);
})();
