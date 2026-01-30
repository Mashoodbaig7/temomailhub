import { deleteFileFromCloudinary } from "../../../config/cloudinary.js";
// import getPublicId from "../services/deleteFileCloudinary.js";

const deleteImageController = async (req, res) => {
    console.log("posttt");

    try {
        const { url } = req.body;
        console.log(url);

        // const publicId = getPublicId(url);
        if (!url) {
            return res.status(400).json({ message: "Public ID is required" });
        }       
        const result = await deleteFileFromCloudinary(url);
        if (result.result === 'not found') {
            return res.status(404).json({ message: "Image not found" });
        }
        res.status(200).json({ message: "Image deleted successfully",result });
    } catch (error) {
        console.error("Delete Image Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export default deleteImageController;