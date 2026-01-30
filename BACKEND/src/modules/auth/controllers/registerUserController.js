import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import findEmail from "../services/findEmail.js";
import postData from "../services/post.js";
import { uploadFileToCloudinary } from "../../../config/cloudinary.js";
import { ENV, INTERNAL_SERVER_ERROR_MESSAGE, EMAIL_ALREADY_REGISTERED_MESSAGE, ALL_FIELDS_REQUIRED_MESSAGE, REGISTERED_SUCCESS_MESSAGE } from '../../../constants/index.js';
import UserSubscription from '../../../models/UserSubscriptionModel.js';

const registerUserController = async (req, res) => {
    try {
        const { name, email, password, image } = req.body; // 'image' bhi extract karein body se (Google case)
        const file = req.file; // File upload case (now contains buffer instead of path)

        // 1. Validation: Name, Email, Password hone chahiye (Image OPTIONAL hai)
        if (!name || !email || !password) {
            return res.status(400).json({ message: ALL_FIELDS_REQUIRED_MESSAGE });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 2. Check duplicate user
        const existingUser = await findEmail(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({ message: EMAIL_ALREADY_REGISTERED_MESSAGE });
        }

        // 3. Image Handling Logic (Hybrid) - Image is OPTIONAL
        let profileImageUrl = "";

        if (file && file.buffer) {
            // CASE A: User ne file upload ki hai (Normal Signup)
            // Upload buffer directly to Cloudinary (no local file storage)
            const result = await uploadFileToCloudinary(file.buffer, file.originalname);
            profileImageUrl = result.secure_url;
        } else if (image && image.trim() !== '') {
            // CASE B: User Google se aaya hai (Direct URL)
            profileImageUrl = image;
        }
        // CASE C: Agar na file hai na image URL, to profileImageUrl empty string rahega

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Create new user object
        const newUser = {
            name: name,
            email: normalizedEmail,
            password: hashedPassword,
            profileImageUrl: profileImageUrl, // Jo bhi uper decide hua wo URL
            authProvider: 'local' // Set auth provider as local for regular registration
        };

        // 6. Save user to database
        const data = await postData(newUser);

        // 7. Create free subscription for new user
        try {
            await UserSubscription.create({
                userId: data._id,
                currentPlan: 'Free',
                paymentStatus: 'Free',
                accountStatus: 'Active'
            });
        } catch (subError) {
            console.error('Error creating subscription:', subError);
            // Don't fail registration if subscription creation fails
        }

        // 8. Generate JWT token for auto-login
        const token = jwt.sign(
            { id: data._id, email: data.email },
            ENV.JWT_SECRET,
            { expiresIn: ENV.TOKEN_EXPIRE_TIME }
        );

        // 9. Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            signed: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });

        // 10. Send response with user data and token
        res.status(201).json({
            message: REGISTERED_SUCCESS_MESSAGE,
            data: {
                _id: data._id,
                name: data.name,
                email: data.email,
                profileImageUrl: data.profileImageUrl
            },
            token: token // Token for auto-login
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: INTERNAL_SERVER_ERROR_MESSAGE, error: error.message });
    }
}

export default registerUserController;