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

    // Poll for cv.Mat. Emscripten attaches C++ bindings (like Mat) only AFTER
    // the WebAssembly binary is fully compiled and instantiated.
    pollInterval = setInterval(() => {
      if (window.cv && window.cv.Mat) {
        clearInterval(pollInterval);
        cvInstance = window.cv;
        resolve(cvInstance);
      }
    }, 100);

    script.onload = () => {
      // We don't resolve here, we let the poll interval handle it, 
      // because WASM might still be compiling asynchronously.
    };

    script.onerror = () => {
      if (pollInterval) clearInterval(pollInterval);
      loadPromise = null;
      reject(new Error('Failed to load OpenCV.js from CDN.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
