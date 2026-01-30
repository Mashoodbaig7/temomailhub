import bcrypt from 'bcrypt';
import findEmail from "../services/findEmail.js";
import jwt from 'jsonwebtoken';
import {
    ENV,
    LOGIN_SUCCESS_MESSAGE,
    ALL_FIELDS_REQUIRED_MESSAGE,
    USER_NOT_FOUND_MESSAGE,
    INVALID_PASSWORD_MESSAGE,
    INTERNAL_SERVER_ERROR_MESSAGE
} from '../../../constants/index.js';

const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: ALL_FIELDS_REQUIRED_MESSAGE });
        }

        const normalizedEmail = email.trim().toLowerCase();
        console.log('🔐 [Admin Login] Attempting login for:', normalizedEmail);

        // Find admin in AdminModel
        const admin = await findEmail(normalizedEmail);
        console.log('🔍 [Admin Login] Query result:', admin);

        if (!admin) {
            console.error('❌ [Admin Login] Admin not found for email:', normalizedEmail);
            return res.status(404).json({ 
                message: USER_NOT_FOUND_MESSAGE,
                debug: `No admin found with email: ${normalizedEmail}`
            });
        }

        console.log('✅ [Admin Login] Admin found:', { name: admin.name, email: admin.email, status: admin.status });

        // Check if admin account is active
        if (admin.status !== 'active') {
            console.warn('⚠️ [Admin Login] Admin account status:', admin.status);
            return res.status(403).json({ 
                message: `❌ Admin account is ${admin.status}. Contact a super admin.` 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            console.warn('❌ [Admin Login] Invalid password for:', normalizedEmail);
            return res.status(401).json({ message: INVALID_PASSWORD_MESSAGE });
        }

        // Update last login
        admin.lastLogin = new Date();
        admin.loginAttempts = 0; // Reset failed attempts
        await admin.save();

        // Generate JWT token with userId (for consistency with frontend)
        const token = jwt.sign(
            { userId: admin._id, email: admin.email, role: admin.role },
            ENV.JWT_SECRET,
            { expiresIn: ENV.TOKEN_EXPIRE_TIME }
        );

        res.cookie('token', token, {
            httpOnly: true,
            signed: true,
            maxAge: 1000 * 60 * 60,
        });

        console.log(`✅ [Admin Login] Successful for: ${admin.email}`);

        res.status(200).json({
            message: LOGIN_SUCCESS_MESSAGE,
            user: {
                userId: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                status: admin.status,
                permissions: admin.permissions
            },
            token
        });

    } catch (error) {
        console.error("❌ [Admin Login] Error:", error.message);
        console.error("Stack:", error.stack);
        res.status(500).json({ message: INTERNAL_SERVER_ERROR_MESSAGE, error: error.message });
    }
};

export default loginUserController;
