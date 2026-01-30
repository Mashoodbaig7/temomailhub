import mongoose from "mongoose";
const authSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Made optional for Google Sign-In
    profileImageUrl: { type: String, required: false },
    phone: { type: String, required: false },
    location: { type: String, required: false },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' }, // Track auth method
    googleId: { type: String, unique: true, sparse: true }, // Google user ID
    role: { type: String, enum: ['user'], default: 'user' }, // Only user role - admins use separate AdminModel
    createdAt: { type: Date, default: Date.now }
});
const AuthModel = mongoose.model("User", authSchema);
export default AuthModel;