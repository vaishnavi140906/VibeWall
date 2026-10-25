const cloudinary = require('cloudinary').v2;

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('[Cloudinary] Cloudinary configured successfully.');
} else {
  console.log('[Cloudinary] Cloudinary credentials not configured. Image uploads will require configuration; text posts remain fully functional.');
}

const uploadToCloudinary = (buffer, folder = 'vibewall') => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      return reject(new Error('Cloudinary credentials are not configured. To enable image uploads, please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    uploadStream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!isConfigured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[Cloudinary] Failed to delete image:', error.message);
  }
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadToCloudinary,
  deleteFromCloudinary
};
