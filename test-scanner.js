const puppeteer = require('C:/Users/Yosua Jan/AppData/Roaming/npm/node_modules/puppeteer');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    console.log('Navigating to http://localhost:5173/transactions ...');
    await page.goto('http://localhost:5173/transactions', { waitUntil: 'networkidle2' });

    console.log('Waiting for Add Transaction button...');
    await page.waitForSelector('#tour-tx-add-btn', { timeout: 10000 });
    
    console.log('Clicking Scan Receipt button...');
    const fileInput = await page.$('input[type="file"][accept="image/*"]');
    if (!fileInput) {
      console.log('File input not found!');
      process.exit(1);
    }
    
    console.log('Uploading image...');
    await fileInput.uploadFile('c:\\Users\\Yosua Jan\\.gemini\\antigravity\\brain\\01d3b96e-3e91-4e8f-a179-e31fe4e26ab9\\media__1784604725768.jpg');
    
    console.log('Image uploaded. Monitoring DOM for status...');
    
    let lastStatus = '';
    for (let i = 0; i < 30; i++) {
      const text = await page.evaluate(() => {
        const h5 = document.querySelector('.ocr-scanner-box + h5');
        return h5 ? h5.innerText : null;
      });
      if (text && text !== lastStatus) {
         console.log('SCAN STATUS:', text);
         lastStatus = text;
      }
      
      const modalText = await page.evaluate(() => {
        const modal = document.querySelector('.vue-modal .modal-title');
        return modal ? modal.innerText : null;
      });
      if (modalText && (modalText.includes('Transaction') || modalText.includes('Transaksi'))) {
        console.log('SUCCESS! Modal opened:', modalText);
        break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    
    await browser.close();
    console.log("Test finished.");
  } catch(e) {
    console.error(e);
  }
})();
