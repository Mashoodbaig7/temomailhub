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

        const user = await findEmail(normalizedEmail);
        console.log(user);


        if (!user) {
            return res.status(404).json({ message: USER_NOT_FOUND_MESSAGE });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: INVALID_PASSWORD_MESSAGE });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, ENV.JWT_SECRET, { expiresIn: ENV.TOKEN_EXPIRE_TIME });

        // console.log(token);

        res.cookie('token', token, {
            httpOnly: true,
            signed: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });
        console.log(`token=>`, token);

        res.status(200).json({ 
            message: LOGIN_SUCCESS_MESSAGE, 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                role: user.role || 'user'
            }, 
            token 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: INTERNAL_SERVER_ERROR_MESSAGE, error: error.message });
    }
};
export default loginUserController;
