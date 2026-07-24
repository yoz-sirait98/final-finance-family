import Tesseract from 'tesseract.js';
import path from 'path';

const imagePath = 'C:\\Users\\Yosua Jan\\.gemini\\antigravity-ide\\brain\\655bec7e-b78b-4f1b-a3e4-38f0ad4d57b5\\media__1784859777011.jpg';

async function testOCR() {
  console.log('Running OCR on raw image...');
  const ret = await Tesseract.recognize(imagePath, 'eng+ind', {
    tessedit_pageseg_mode: '6'
  });
  console.log('--- RAW OCR RESULT ---');
  console.log(ret.data.text);
  console.log('----------------------');
}

testOCR();
