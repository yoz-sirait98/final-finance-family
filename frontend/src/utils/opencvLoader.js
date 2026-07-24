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

export function loadOpenCV() {
  if (cvInstance) return Promise.resolve(cvInstance);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // If it's already fully loaded
    if (window.cv && window.cv.Mat) {
      cvInstance = window.cv;
      return resolve(cvInstance);
    }

    // Set up Emscripten Module to catch the initialization event
    window.Module = {
      onRuntimeInitialized() {
        if (window.cv && window.cv.Mat) {
          cvInstance = window.cv;
          resolve(cvInstance);
        } else {
          reject(new Error('OpenCV loaded but cv.Mat is missing.'));
        }
      }
    };

    const script = document.createElement('script');
    // Use a specific, stable version to prevent unexpected 301 redirects or changes
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
    script.async = true;

    // Fallback poll in case onRuntimeInitialized is bypassed by a specific build
    const pollInterval = setInterval(() => {
      if (window.cv && window.cv.Mat) {
        clearInterval(pollInterval);
        cvInstance = window.cv;
        resolve(cvInstance);
      }
    }, 200);

    const timeoutId = setTimeout(() => {
      clearInterval(pollInterval);
      loadPromise = null;
      reject(new Error('OpenCV.js load timeout (30s). Check your connection.'));
    }, 30000);

    script.onerror = () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
      loadPromise = null;
      reject(new Error('Failed to load OpenCV.js from CDN.'));
    };
    
    script.onload = () => {
       // We don't resolve here, we wait for onRuntimeInitialized or the poll
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
