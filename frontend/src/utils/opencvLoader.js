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

/**
 * Resolves when OpenCV.js is fully initialised.
 * Safe to call multiple times — returns the cached instance immediately.
 *
 * @returns {Promise<object>} The global `cv` object (OpenCV.js runtime)
 */
export function loadOpenCV() {
  // Already loaded — return immediately
  if (cvInstance) return Promise.resolve(cvInstance);

  // Load is already in-flight — return the same promise
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // If somehow OpenCV was already injected globally (e.g. via <script>), use it
    if (window.cv && window.cv.Mat) {
      cvInstance = window.cv;
      return resolve(cvInstance);
    }

    // Emscripten checks `window.Module` at startup.
    window.Module = {
      onRuntimeInitialized: () => {
        if (window.cv) {
          cvInstance = window.cv;
          resolve(cvInstance);
        }
      }
    };

    const script = document.createElement('script');
    script.src = OPENCV_CDN_URL;
    script.async = true;

    script.onload = () => {
      if (window.cv) {
        // Modern OpenCV 4.x factory can return a Promise-like function
        if (typeof window.cv === 'function') {
          window.cv().then((instance) => {
            cvInstance = instance;
            resolve(cvInstance);
          }).catch(reject);
        } 
        // Synchronous or already initialized
        else if (window.cv.Mat) {
          cvInstance = window.cv;
          resolve(cvInstance);
        }
        // If neither, we rely on window.Module.onRuntimeInitialized which will fire shortly
      } else {
        reject(new Error('OpenCV.js loaded but `cv` object not found on window.'));
      }
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load OpenCV.js from CDN.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
