import { INTERNAL_SERVER_ERROR_MESSAGE, USER_UPDATED_SUCCESSFULLY } from "../../../constants/index.js";
import updateData from "../services/update.js";
import { uploadFileToCloudinary } from "../../../config/cloudinary.js";
import bcrypt from 'bcrypt';
import AuthModel from "../../../models/AuthModel.js";

const updateController = async (req, res) => {
    try {
        const { id } = req.params;
        const updatePayload = { ...req.body };

        // Handle profile image upload
        if (req.file && req.file.buffer) {
            const result = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);
            updatePayload.profileImageUrl = result.secure_url;
        }

        // Handle profile image removal
        if (req.body.removeProfileImage === 'true' || req.body.removeProfileImage === true) {
            updatePayload.profileImageUrl = '';
        }

        // Hash password if provided
        if (updatePayload.password) {
            updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
        }

        // Remove non-schema fields
        delete updatePayload.removeProfileImage;

        const updatedUser = await updateData(id, updatePayload);
        
        res.status(200).send({ 
            status: 200, 
            success: true,
            message: USER_UPDATED_SUCCESSFULLY,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                location: updatedUser.location,
                profileImageUrl: updatedUser.profileImageUrl
            }
        });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).send({ status: 500, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
}

export default updateController;