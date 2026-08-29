const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'yy4p2jsg';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'rulesoff_products';

/**
 * Upload a product image file directly to Cloudinary using Unsigned Upload Preset
 * and return the resulting HTTPS `secure_url`.
 */
export const uploadProductImage = async (file: File, _customName?: string): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for image upload.');
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg =
      errorData.error?.message || `Cloudinary upload failed with status ${response.status}`;
    throw new Error(`Image upload failed: ${errorMsg}`);
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error('Cloudinary response did not contain a valid secure_url.');
  }

  return data.secure_url;
};
