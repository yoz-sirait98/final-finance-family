import { createWorker } from 'tesseract.js';
import fs from 'fs';

async function run() {
  const worker = await createWorker('ind');
  const { data: { text } } = await worker.recognize('C:\\Users\\Yosua Jan\\.gemini\\antigravity-ide\\brain\\655bec7e-b78b-4f1b-a3e4-38f0ad4d57b5\\media__1781057735045.jpg');
  console.log("TEXT:");
  console.log(text);
  await worker.terminate();
}

run();
