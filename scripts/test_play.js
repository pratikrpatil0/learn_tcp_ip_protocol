const puppeteer = require('puppeteer');
(async ()=>{
  const browser = await puppeteer.launch({ args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/finite-state-machine',{waitUntil:'networkidle0'});
  await page.setViewport({width:1366,height:768});
  // find Play button by text and click
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b = buttons.find(el => /\bPlay\b/.test(el.innerText));
    if(!b) return false; b.click(); return true;
  });
  if(!clicked){ console.error('Play button not found'); await browser.close(); return; }
  console.log('Clicked Play');
  // poll current step text 10 times
  for(let i=0;i<12;i++){
    await new Promise(r => setTimeout(r, 800));
    const badge = await page.evaluate(() => {
      const el = document.querySelector('div.inline-flex.items-center');
      return el ? el.innerText : document.body.innerText.slice(0,200);
    });
    console.log('Badge:', badge.replace(/\n/g,' | '));
  }
  const logs = await page.evaluate(() => (window.__fsm_logs || []).slice(-30));
  console.log('FSM logs (last 30):', JSON.stringify(logs, null, 2));
  await browser.close();
})();