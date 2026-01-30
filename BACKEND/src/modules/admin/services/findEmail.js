import { findByEmail } from "../db/index.js";

const findEmail = async (email) => {
    try {
        console.log('🔍 [findEmail] Searching for admin with email:', email);
        const admin = await findByEmail(email);
        
        if (admin) {
            console.log('✅ [findEmail] Admin found:', { name: admin.name, email: admin.email });
        } else {
            console.warn('⚠️ [findEmail] No admin found with email:', email);
        }
        
        return admin;
    } catch (error) {
        console.error('❌ [findEmail] Database query error:', error.message);
        throw error;
    }
}

export default findEmail;