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

    const script = document.createElement('script');
    script.src = OPENCV_CDN_URL;
    script.async = true;

    let pollInterval = null;
    let timeoutId = null;
    let isInitializing = false;

    // Poll for cv.Mat. Modern OpenCV WASM binds can take a few shapes.
    pollInterval = setInterval(() => {
      if (window.cv && !isInitializing) {
        // If cv is a factory function (OpenCV 4.x modularized), call it!
        if (typeof window.cv === 'function' && !window.cv.Mat) {
          isInitializing = true;
          const maybePromise = window.cv();
          if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise.then((target) => {
              clearInterval(pollInterval);
              clearTimeout(timeoutId);
              window.cv = target;
              cvInstance = target;
              resolve(cvInstance);
            }).catch(err => {
              clearInterval(pollInterval);
              clearTimeout(timeoutId);
              loadPromise = null;
              reject(err);
            });
          } else if (maybePromise && maybePromise.Mat) {
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
            window.cv = maybePromise;
            cvInstance = maybePromise;
            resolve(cvInstance);
          }
        }
        // If cv is a Promise (or behaves like one), await it
        else if (typeof window.cv.then === 'function') {
          isInitializing = true;
          window.cv.then((target) => {
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
            window.cv = target;
            cvInstance = target;
            resolve(cvInstance);
          }).catch(err => {
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
            loadPromise = null;
            reject(err);
          });
        } 
        // If it's already the initialized module with Mat
        else if (window.cv.Mat) {
          clearInterval(pollInterval);
          clearTimeout(timeoutId);
          cvInstance = window.cv;
          resolve(cvInstance);
        }
      }
    }, 100);

    // Add a 30-second timeout so it doesn't freeze forever on slow connections
    timeoutId = setTimeout(() => {
      if (pollInterval) clearInterval(pollInterval);
      loadPromise = null;
      reject(new Error('OpenCV.js load timeout (30s). Check your connection.'));
    }, 30000);

    script.onload = () => {
      // We don't resolve here, we let the poll interval handle it, 
      // because WASM might still be compiling asynchronously.
    };

    script.onerror = () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
      loadPromise = null;
      reject(new Error('Failed to load OpenCV.js from CDN.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
