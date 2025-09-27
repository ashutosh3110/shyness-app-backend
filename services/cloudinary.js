const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
  // Upload video to Cloudinary
  async uploadVideo(videoBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'shyness-app/videos',
          public_id: options.publicId || `video_${Date.now()}`,
          chunk_size: 6000000, // 6MB chunks for large files
          eager: [
            { width: 320, height: 240, crop: 'scale', format: 'jpg' }
          ],
          eager_async: true,
          ...options
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(videoBuffer);
      bufferStream.push(null);
      
      bufferStream.pipe(uploadStream);
    });
  }

  // Upload thumbnail to Cloudinary
  async uploadThumbnail(thumbnailBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'shyness-app/thumbnails',
          public_id: options.publicId || `thumb_${Date.now()}`,
          ...options
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(thumbnailBuffer);
      bufferStream.push(null);
      
      bufferStream.pipe(uploadStream);
    });
  }

  // Delete video from Cloudinary
  async deleteVideo(publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: 'video' }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Delete thumbnail from Cloudinary
  async deleteThumbnail(publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: 'image' }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get video info
  async getVideoInfo(publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.api.resource(publicId, { resource_type: 'video' }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Generate signed URL for video access
  generateSignedUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      sign_url: true,
      ...options
    });
  }
}

module.exports = new CloudinaryService();

