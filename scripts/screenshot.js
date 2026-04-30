const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:3001/finite-state-machine', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.screenshot({ path: 'fsm_screenshot.png', fullPage: true });
  console.log('Saved screenshot to fsm_screenshot.png');
  await browser.close();
})();