import fs from 'fs';
import { createWorker } from 'tesseract.js';

// Node.js implementation of preprocessing (approximate)
import { createCanvas, loadImage } from 'canvas';

async function preprocessImage(imagePath) {
  const img = await loadImage(imagePath);
  
  const MAX_WIDTH = 1500;
  const MAX_HEIGHT = 1500;
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > MAX_WIDTH) {
      height = Math.round((height * MAX_WIDTH) / width);
      width = MAX_WIDTH;
    }
  } else {
    if (height > MAX_HEIGHT) {
      width = Math.round((width * MAX_HEIGHT) / height);
      height = MAX_HEIGHT;
    }
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(img, 0, 0, width, height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    
    // Add binarization (thresholding) to see if it helps with yellow background!
    // Yellow is around 190-210 luminance. Text is black (0-50).
    const threshold = 160;
    const binary = avg > threshold ? 255 : 0;

    data[i] = binary;
    data[i + 1] = binary;
    data[i + 2] = binary;
  }
  ctx.putImageData(imageData, 0, 0);

  const outPath = imagePath + '.processed.png';
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  return outPath;
}

async function run() {
  console.log("Processing...");
  const processedPath = await preprocessImage('C:\\Users\\Yosua Jan\\.gemini\\antigravity-ide\\brain\\655bec7e-b78b-4f1b-a3e4-38f0ad4d57b5\\media__1781057735045.jpg');
  console.log("Processed saved to", processedPath);
  
  const worker = await createWorker('ind');
  const { data: { text } } = await worker.recognize(processedPath);
  console.log("TEXT:");
  console.log(text);
  await worker.terminate();
}

run();
