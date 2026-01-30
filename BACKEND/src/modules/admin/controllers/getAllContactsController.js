import Contact from '../../../models/ContactModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE } from '../../../constants/index.js';

const getAllContactsController = async (req, res) => {
    try {
        const { status, search } = req.query;

        const query = {};
        
        if (status && status !== 'All') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const contacts = await Contact.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });

    } catch (error) {
        console.error("Get All Contacts Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default getAllContactsController;
