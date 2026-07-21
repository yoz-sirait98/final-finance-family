const puppeteer = require('C:/Users/Yosua Jan/AppData/Roaming/npm/node_modules/puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://localhost:5173/test_receipt.html');
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: 'processed_receipt.png', fullPage: true });

    await browser.close();
    console.log("Test passed, screenshot saved to processed_receipt.png");
  } catch(e) {
    console.error(e);
  }
})();
