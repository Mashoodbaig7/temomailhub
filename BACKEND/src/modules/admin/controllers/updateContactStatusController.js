import Contact from '../../../models/ContactModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE, UPDATE_DATA_MESSAGE } from '../../../constants/index.js';

const updateContactStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Reviewed', 'Resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'Pending', 'Reviewed', or 'Resolved'"
            });
        }

        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedContact) {
            return res.status(404).json({
                success: false,
                message: "Contact submission not found"
            });
        }

        res.status(200).json({
            success: true,
            message: UPDATE_DATA_MESSAGE,
            data: updatedContact
        });

    } catch (error) {
        console.error("Update Contact Status Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default updateContactStatusController;
