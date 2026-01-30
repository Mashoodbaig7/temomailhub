import Contact from '../../../models/ContactModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE, POST_DATA_MESSAGE } from '../../../constants/index.js';

const submitContactController = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required"
            });
        }

        const newContact = new Contact({
            name,
            email,
            subject: subject || 'General Inquiry',
            message,
            status: 'Pending'
        });

        const savedContact = await newContact.save();

        res.status(201).json({
            success: true,
            message: "Thank you! Your message has been sent successfully.",
            data: savedContact
        });

    } catch (error) {
        console.error("Submit Contact Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default submitContactController;
