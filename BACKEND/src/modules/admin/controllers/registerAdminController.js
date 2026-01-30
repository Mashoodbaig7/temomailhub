import bcrypt from 'bcrypt';
import AdminModel from '../../../models/AdminModel.js';

const registerAdminController = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        const requestingAdmin = req.admin; // From middleware

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if admin already exists
        const existingAdmin = await AdminModel.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }

        // Only super admins can create new admins
        if (requestingAdmin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admins can create new admin accounts'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = await AdminModel.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'admin', // Default to admin, super_admin can change later
            permissions: [
                'manage_users',
                'manage_subscriptions',
                'view_analytics',
                'view_payments'
            ],
            status: 'active',
            createdBy: requestingAdmin._id
        });

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            data: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
                status: newAdmin.status
            }
        });

    } catch (error) {
        console.error('Register Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating admin account',
            error: error.message
        });
    }
};

export default registerAdminController;
