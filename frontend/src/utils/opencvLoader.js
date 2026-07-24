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
  if (loadPromise) return loadPromise;

  loadPromise = new Promise(async (resolve, reject) => {
    try {
      // Dynamically import the npm package so it gets code-split by Vite
      // and doesn't conflict with other Emscripten globals (like Tesseract's window.Module)
      const cvModule = await import('@techstark/opencv-js');
      
      // Depending on the bundler/environment, the default export might be nested
      const cv = cvModule.default || cvModule;

      // The techstark opencv-js might need to initialize WASM asynchronously
      if (cv instanceof Promise) {
        cvInstance = await cv;
      } else if (cv.onRuntimeInitialized) {
        // If it's a module that requires initialization
        cv.onRuntimeInitialized = () => {
          cvInstance = cv;
          resolve(cvInstance);
        };
        // It might already be initialized if Mat exists
        if (cv.Mat) {
           cvInstance = cv;
           resolve(cvInstance);
        }
        return; 
      } else {
        // Already initialized synchronously
        cvInstance = cv;
      }
      
      // Wait a tiny bit just to ensure Mat is ready if it's doing some lazy init
      if (!cvInstance.Mat) {
         let attempts = 0;
         const interval = setInterval(() => {
           attempts++;
           if (cvInstance.Mat) {
             clearInterval(interval);
             resolve(cvInstance);
           } else if (attempts > 50) { // 5 seconds
             clearInterval(interval);
             reject(new Error('OpenCV initialized but cv.Mat is missing after 5 seconds.'));
           }
         }, 100);
         return;
      }

      resolve(cvInstance);
    } catch (err) {
      loadPromise = null;
      reject(err);
    }
  });

  return loadPromise;
}
