import AdminModel from '../../../models/AdminModel.js';

const deleteAdminController = async (req, res) => {
    try {
        const { id } = req.params;
        const requestingAdmin = req.admin;

        // POLICY: No one can delete admin accounts
        // Admins are critical and can only be deactivated/suspended by super admins
        return res.status(403).json({
            success: false,
            message: '🛡️ Admin accounts cannot be deleted for security reasons. Use the suspend/deactivate function instead.'
        });

    } catch (error) {
        console.error('Delete Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing request',
            error: error.message
        });
    }
};

export default deleteAdminController;
