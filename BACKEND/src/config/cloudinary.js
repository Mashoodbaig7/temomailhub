// Cloudinary configuration
import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../constants/index.js";
import streamifier from "streamifier";

cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
});

// Upload file buffer directly to Cloudinary (for multer memory storage)
const uploadFileToCloudinary = async (fileBuffer, filename) => {
    try {
        // Sanitize filename for Cloudinary public_id
        // Remove special characters, emojis, and replace spaces with underscores
        const sanitizedFilename = filename
            .replace(/[^\w\s.-]/g, '') // Remove special chars and emojis (keep alphanumeric, spaces, dots, hyphens)
            .replace(/\s+/g, '_')       // Replace spaces with underscores
            .replace(/_{2,}/g, '_')     // Replace multiple underscores with single
            .replace(/^[._-]+|[._-]+$/g, ''); // Remove leading/trailing dots, underscores, hyphens

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: ENV.CLOUDINARY_FOLDER_NAME,
                    public_id: `${Date.now()}-${sanitizedFilename}`,
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
    } catch (error) {
        console.log('Cloudinary upload error:', error);
        throw error;
    }
}

const deleteFileFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.log('Cloudinary delete error:', error);
        throw error;
    }
}

export { uploadFileToCloudinary, deleteFileFromCloudinary }
