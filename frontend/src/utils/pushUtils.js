// ---------------------------------------------------------------------------
// pushUtils.js — Web Push Helper Utilities
// ---------------------------------------------------------------------------

// Default VAPID Public Key for Web Push Protocol (Valid 65-byte EC P-256 uncompressed point)
export const DEFAULT_VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
  'BFZVN5aWgdI7hAiFH162fQkadhHwewq1WKrcCVN7BaCcRCLGPztolIQTAy3FqlYo6SEiNaIrKSIzN1LDrIBO804';

/**
 * Convert URL base64 string to Uint8Array for PushManager applicationServerKey
 * @param {string} base64String
 * @returns {Uint8Array}
 */
export function urlBase64ToUint8Array(base64String) {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid VAPID public key string.');
  }

  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (e) {
    console.error('[PushUtils] atob decode error for string:', base64String, e);
    throw new Error('Invalid VAPID Public Key format.');
  }
}
