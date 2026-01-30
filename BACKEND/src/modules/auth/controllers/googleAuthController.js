import jwt from 'jsonwebtoken';
import findEmail from "../services/findEmail.js";
import postData from "../services/post.js";
import AuthModel from '../../../models/AuthModel.js';
import UserSubscription from '../../../models/UserSubscriptionModel.js';
import { ENV, INTERNAL_SERVER_ERROR_MESSAGE, LOGIN_SUCCESS_MESSAGE } from '../../../constants/index.js';

const googleAuthController = async (req, res) => {
    try {
        const { name, email, googleId, profileImageUrl } = req.body;

        // Validate required fields
        if (!name || !email || !googleId) {
            return res.status(400).json({ message: 'Name, email, and Google ID are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        let user = await AuthModel.findOne({ 
            $or: [
                { email: normalizedEmail },
                { googleId: googleId }
            ]
        });

        if (user) {
            // User exists - update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, email: user.email },
                ENV.JWT_SECRET,
                { expiresIn: ENV.TOKEN_EXPIRE_TIME }
            );

            // Set HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                signed: true,
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            });

            return res.status(200).json({
                message: LOGIN_SUCCESS_MESSAGE,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImageUrl: user.profileImageUrl
                },
                token: token
            });
        }

        // User doesn't exist - create new user
        const newUser = {
            name: name,
            email: normalizedEmail,
            password: '', // No password for Google users
            profileImageUrl: profileImageUrl || '',
            authProvider: 'google',
            googleId: googleId
        };

        const createdUser = await postData(newUser);

        // Create free subscription for new user
        try {
            await UserSubscription.create({
                userId: createdUser._id,
                currentPlan: 'Free',
                paymentStatus: 'Free',
                accountStatus: 'Active'
            });
        } catch (subError) {
            console.error('Error creating subscription:', subError);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: createdUser._id, email: createdUser.email },
            ENV.JWT_SECRET,
            { expiresIn: ENV.TOKEN_EXPIRE_TIME }
        );

        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            signed: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });

        res.status(201).json({
            message: 'Google Sign-In successful!',
            user: {
                _id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                profileImageUrl: createdUser.profileImageUrl
            },
            token: token
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ 
            message: INTERNAL_SERVER_ERROR_MESSAGE, 
            error: error.message 
        });
    }
};

export default googleAuthController;
