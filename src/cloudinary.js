/**
 * Cloudinary Upload Utility
 * Replaces Firebase Storage for image uploads (no billing required!)
 * Uses unsigned upload preset for client-side uploads.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload an image file to Cloudinary.
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder path (e.g. 'profiles' or 'memories')
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export async function uploadImage(file, folder = '') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Check your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  if (folder) {
    formData.append('folder', folder);
  }

  // Auto-optimize: deliver as webp/avif, auto quality
  formData.append('quality', 'auto');
  formData.append('fetch_format', 'auto');

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || 'Image upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}
