import bcrypt from 'bcrypt';
import AuthModel from '../../../models/AuthModel.js';

// Get admin profile
export const getAdminProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        console.log('📤 [Admin Profile] Getting profile for user:', userId);

        const user = await AuthModel.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Admin user not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User is not an admin'
            });
        }

        console.log('✅ [Admin Profile] Profile retrieved successfully');

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('❌ [Admin Profile] Error getting profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin profile'
        });
    }
};

// Update admin email
export const updateAdminEmail = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        console.log('📤 [Admin Profile] Updating email for user:', userId);

        const user = await AuthModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Admin user not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User is not an admin'
            });
        }

        // Check if email already exists
        const existingUser = await AuthModel.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }

        user.email = email.toLowerCase();
        await user.save();

        console.log('✅ [Admin Profile] Email updated successfully');

        res.status(200).json({
            success: true,
            message: 'Email updated successfully',
            data: {
                email: user.email
            }
        });
    } catch (error) {
        console.error('❌ [Admin Profile] Error updating email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update email'
        });
    }
};

// Update admin password
export const updateAdminPassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        console.log('📤 [Admin Profile] Updating password for user:', userId);

        const user = await AuthModel.findById(userId);

        if (!user) {
            console.error('❌ [Admin Profile] User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'Admin user not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User is not an admin'
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        console.log('✅ [Admin Profile] Password updated successfully');

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('❌ [Admin Profile] Error updating password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update password'
        });
    }
};

export default {
    getAdminProfile,
    updateAdminEmail,
    updateAdminPassword
};
