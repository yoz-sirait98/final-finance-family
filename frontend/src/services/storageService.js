import { supabase } from '../lib/supabase';

/**
 * Compress an image File to a max width of 1200px using canvas, preserving aspect ratio.
 * Returns a Blob of the compressed image as JPEG.
 */
async function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };
    img.src = url;
  });
}

/**
 * Upload a receipt image to Supabase Storage.
 *
 * Path convention: {familyId}/{timestamp}-{randomId}.jpg
 *
 * @param {File} file - The original image file from the file input
 * @param {string} familyId - The authenticated family's UUID
 * @returns {Promise<string>} The storage path string (not a public URL)
 */
export async function uploadReceipt(file, familyId) {
  if (!file || !familyId) throw new Error('File and familyId are required.');

  const compressed = await compressImage(file);
  const ext = 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const storagePath = `${familyId}/${fileName}`;

  const { error } = await supabase.storage
    .from('receipts')
    .upload(storagePath, compressed, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;
  return storagePath;
}

/**
 * Get a short-lived signed URL to display a receipt image in the browser.
 *
 * @param {string} path - The storage path returned by uploadReceipt()
 * @param {number} expiresIn - Seconds until the URL expires (default: 3600 = 1 hour)
 * @returns {Promise<string>} A signed URL string, or null if path is empty
 */
export async function getReceiptSignedUrl(path, expiresIn = 3600) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data?.signedUrl ?? null;
}

/**
 * Delete a receipt image from Supabase Storage.
 *
 * @param {string} path - The storage path returned by uploadReceipt()
 */
export async function deleteReceipt(path) {
  if (!path) return;
  const { error } = await supabase.storage
    .from('receipts')
    .remove([path]);
  if (error) throw error;
}
