import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';

// We just copy the heuristics from receiptScanner.js here for testing
const fuzzyMonths = [
  { pattern: /ja[nu|m|n]/i,         val: '01' },
  { pattern: /f[eb|p]|p[eb|p]/i,    val: '02' },
  { pattern: /ma[r|t]/i,            val: '03' },
  { pattern: /ap[r|l]/i,            val: '04' },
  { pattern: /me[iy]|ma[yi]/i,      val: '05' },
  { pattern: /ju[nmrhi][ei]?/i,     val: '06' },
  { pattern: /ju[liy]/i,            val: '07' },
  { pattern: /au[gs]|ag[su]/i,      val: '08' },
  { pattern: /se[pt]/i,             val: '09' },
  { pattern: /ok[tc]|oc[tk]/i,      val: '10' },
  { pattern: /no[vw]/i,             val: '11' },
  { pattern: /de[sc]/i,             val: '12' },
];

function stripDatesAndTimes(line) {
  let s = line.toLowerCase();
  s = s.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ');                             // times
  s = s.replace(/(?<!\d)\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}(?!\d)/g, ' ');           // DD/MM/YY
  s = s.replace(/(?<!\d)\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}(?!\d)/g, ' ');             // YYYY-MM-DD
  const months = '(?:jan|feb|mar|apr|mei|may|jun|jul|ags|aug|sep|okt|oct|nov|des|dec)[a-z]*';
  s = s.replace(new RegExp(`(?<!\\d)\\d{1,2}[\\s/\\-.]*${months}[\\s/\\-.]*\\d{2,4}(?!\\d)`, 'g'), ' ');
  return s;
}

function parseDate(text) {
  const t = text.toLowerCase();
  const m1 = t.match(/(?<!\d)(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})(?!\d)/);
  if (m1) {
    const d = +m1[1], mo = +m1[2]; let y = +m1[3];
    if (m1[3].length === 2) y += 2000;
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 2000 && y <= 2099) return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }
  const m2 = t.match(/(?<!\d)(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?!\d)/);
  if (m2) {
    const y = +m2[1], mo = +m2[2], d = +m2[3];
    if (y >= 2000 && y <= 2099 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }
  const m3 = t.match(/(?<!\d)(\d{1,2})[\s/\-.]*([a-z]{3,9})[\s/\-.]*(\d{2,4})(?!\d)/);
  if (m3) {
    const d = +m3[1]; let y = +m3[3];
    if (m3[3].length === 2) y += 2000;
    const moStr = m3[2];
    let mo = null;
    for (const fm of fuzzyMonths) {
      if (fm.pattern.test(moStr)) { mo = fm.val; break; }
    }
    if (mo && d >= 1 && d <= 31 && y >= 2000 && y <= 2099) return `${y}-${mo}-${String(d).padStart(2,'0')}`;
  }
  return null;
}

function extractRightmostAmount(line) {
  const cleaned = line.replace(/\b(rp\.?|idr\.?)\s*/gi, ' ');
  const matches = [...cleaned.matchAll(/\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?\b/g)];
  if (!matches.length) return 0;
  const raw = matches[matches.length - 1][0];
  let s = raw.replace(/\s/g, '');
  if (s.endsWith(',00') || s.endsWith('.00')) s = s.slice(0, -3);
  s = s.replace(/[.,]/g, '');
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

(async () => {
  console.log('Running Tesseract...');
  const imagePath = 'c:\\Users\\Yosua Jan\\.gemini\\antigravity\\brain\\01d3b96e-3e91-4e8f-a179-e31fe4e26ab9\\media__1784604725768.jpg';
  const ret = await Tesseract.recognize(imagePath, 'eng+ind');
  const rawText = ret.data.text;
  console.log('--- OCR RAW TEXT ---');
  console.log(rawText);
  console.log('--------------------');
  
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let merchantName = '';
  let parsedDate = '';
  for (const line of lines) {
    if (/kopi\s*kenangan/i.test(line)) merchantName = 'Kopi Kenangan';
    const d = parseDate(line);
    if (d && !parsedDate) parsedDate = d;
  }
  
  let totalAmount = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    const ll = lines[i].toLowerCase();
    if (/\btotal\b/.test(ll)) {
      const n = extractRightmostAmount(stripDatesAndTimes(lines[i]));
      if (n > 0) { totalAmount = n; break; }
    }
  }
  
  console.log('--- EXTRACTED DATA ---');
  console.log('Merchant:', merchantName);
  console.log('Date:', parsedDate);
  console.log('Total:', totalAmount);
})();
