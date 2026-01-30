import AdminModel from '../../../models/AdminModel.js';

const suspendAdminController = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'suspend' or 'activate'
        const requestingAdmin = req.admin;

        // Only super admins can suspend/activate admins
        if (requestingAdmin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admins can suspend/activate admin accounts'
            });
        }

        // Prevent self-suspension
        if (id === requestingAdmin._id.toString() && action === 'suspend') {
            return res.status(403).json({
                success: false,
                message: '❌ You cannot suspend your own admin account. Contact another super admin.'
            });
        }

        // Validate action
        if (!['suspend', 'activate', 'inactive'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use: suspend, activate, or inactive'
            });
        }

        // Find admin
        const admin = await AdminModel.findById(id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Map action to status
        const statusMap = {
            'suspend': 'suspended',
            'activate': 'active',
            'inactive': 'inactive'
        };

        // Update status
        admin.status = statusMap[action];
        await admin.save();

        const messages = {
            'suspend': '🔒 Admin account has been suspended',
            'activate': '✅ Admin account has been activated',
            'inactive': '⏸️ Admin account has been set to inactive'
        };

        res.status(200).json({
            success: true,
            message: messages[action],
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                status: admin.status
            }
        });

    } catch (error) {
        console.error('Suspend Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating admin status',
            error: error.message
        });
    }
};

export default suspendAdminController;
