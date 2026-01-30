import AuthModel from '../../../models/AuthModel.js';
import AdminModel from '../../../models/AdminModel.js';
import UserSubscription from '../../../models/UserSubscriptionModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE, USER_DELETED_SUCCESSFULLY } from '../../../constants/index.js';

const deleteUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const requestingAdminId = req.admin._id; // Admin making the deletion request

        // Prevent admin from deleting themselves
        if (id === requestingAdminId.toString()) {
            return res.status(403).json({
                success: false,
                message: "❌ You cannot delete your own admin account"
            });
        }

        // Check if the ID is an admin - prevent deletion of admins through this endpoint
        const admin = await AdminModel.findById(id);
        if (admin) {
            return res.status(403).json({
                success: false,
                message: "❌ Cannot delete admin accounts through this endpoint. Use admin management section."
            });
        }

        // Delete regular user from Auth Model
        const deletedUser = await AuthModel.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete user subscription
        await UserSubscription.findOneAndDelete({ userId: id });

        res.status(200).json({
            success: true,
            message: USER_DELETED_SUCCESSFULLY,
            data: {
                id: deletedUser._id,
                name: deletedUser.name,
                email: deletedUser.email
            }
        });

    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default deleteUserController;
