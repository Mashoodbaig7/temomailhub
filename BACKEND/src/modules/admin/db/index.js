import AdminModel from "../../../models/AdminModel.js";
import PackagesModel from "../../../models/PackagesModel.js";

// Admin operations
const getAllAdmins = async () => await AdminModel.find();

const getAdminByEmail = async (email) => {
    try {
        console.log('🔍 [DB] Querying AdminModel for email:', email);
        const admin = await AdminModel.findOne({ email: email.toLowerCase() });
        
        if (admin) {
            console.log('✅ [DB] AdminModel query successful, found admin:', { name: admin.name, id: admin._id });
        } else {
            console.warn('⚠️ [DB] AdminModel query returned null for email:', email);
        }
        
        return admin;
    } catch (error) {
        console.error('❌ [DB] AdminModel query error:', error.message);
        throw error;
    }
};

const getAdminById = async (id) => await AdminModel.findById(id);

const createAdmin = (data) =>
    AdminModel(data).save().then((admin) => admin.toObject());

const deleteAdminById = async (id) => await AdminModel.findByIdAndDelete(id);

const updateAdminById = async (id, data) => await AdminModel.findByIdAndUpdate(id, data);

// Package operations
const getAll = async () => await PackagesModel.find();

const addData = (data) =>
    PackagesModel(data).save().then((pkg) => pkg.toObject());

const deleteById = async (id) => await PackagesModel.findByIdAndDelete(id);

const updateById = async (id, data) => await PackagesModel.findByIdAndUpdate(id, data);

// Legacy findByEmail for backward compatibility - now points to AdminModel
const findByEmail = async (email) => {
    try {
        console.log('🔍 [DB findByEmail] Looking up AdminModel for:', email);
        const result = await AdminModel.findOne({ email: email.toLowerCase() });
        console.log('📊 [DB findByEmail] Query result:', result ? 'Found' : 'Not found');
        return result;
    } catch (error) {
        console.error('❌ [DB findByEmail] Error:', error.message);
        throw error;
    }
};

export {
    // Admin
    getAllAdmins,
    getAdminByEmail,
    getAdminById,
    createAdmin,
    deleteAdminById,
    updateAdminById,
    
    // Package
    getAll,
    addData,
    deleteById,
    updateById,
    
    // Legacy
    findByEmail
}