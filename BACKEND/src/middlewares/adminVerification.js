import AdminModel from '../models/AdminModel.js';

export const verifyAdmin = async (req, res, next) => {
    try {
        const adminId = req.user?.userId;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Admin ID not found'
            });
        }

        // Get admin from AdminModel database
        const admin = await AdminModel.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check if admin status is active
        if (admin.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin account is not active'
            });
        }

        // Attach admin to request
        req.admin = admin;
        next();
    } catch (error) {
        console.error('❌ Admin verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying admin status'
        });
    }
};

export default verifyAdmin;
