import multer from "multer";

// Use memory storage instead of disk storage
// This stores files in memory as Buffer objects, which is better for direct Cloudinary uploads
// No need to create local files and then delete them
const storage = multer.memoryStorage();

// Configure multer with memory storage and file validation
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

const uploadFile = upload.single("image");

export default uploadFile;
export { upload };