/**
 * opencvLoader.js
 *
 * Lazy-loads OpenCV.js (WASM) from CDN the first time the scanner is used.
 * The `cv` instance is cached in module scope — subsequent calls are instant.
 *
 * Usage:
 *   import { loadOpenCV } from './opencvLoader';
 *   const cv = await loadOpenCV();
 */

let cvInstance = null;
let loadPromise = null;

const OPENCV_CDN_URL = 'https://docs.opencv.org/4.x/opencv.js';

export async function loadOpenCV() {
  if (cvInstance) return cvInstance;
  if (window.cv && window.cv.Mat) {
    cvInstance = window.cv;
    return cvInstance;
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = OPENCV_CDN_URL;
      script.async = true;

      script.onload = () => {
        // OpenCV.js loads asynchronously. Wait for it to be ready.
        if (window.cv && window.cv.onRuntimeInitialized) {
           window.cv.onRuntimeInitialized = () => {
             cvInstance = window.cv;
             resolve(cvInstance);
           };
           // If it's already initialized:
           if (window.cv.Mat) {
             cvInstance = window.cv;
             resolve(cvInstance);
           }
        } else {
           // Poll until cv.Mat is available
           let attempts = 0;
           const interval = setInterval(() => {
             attempts++;
             if (window.cv && window.cv.Mat) {
               clearInterval(interval);
               cvInstance = window.cv;
               resolve(cvInstance);
             } else if (attempts > 100) { // 10 seconds timeout
               clearInterval(interval);
               reject(new Error('OpenCV initialized but cv.Mat is missing after 10 seconds.'));
             }
           }, 100);
        }
      };

      script.onerror = () => {
        loadPromise = null;
        reject(new Error('Failed to load OpenCV.js from CDN.'));
      };

      document.head.appendChild(script);
    } catch (err) {
      loadPromise = null;
      reject(err);
    }
  });

  return loadPromise;
}
