import UserSubscription from '../../../models/UserSubscriptionModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE, UPDATE_DATA_MESSAGE } from '../../../constants/index.js';

const updateUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPlan, accountStatus } = req.body;

        const updateData = {};
        if (currentPlan) updateData.currentPlan = currentPlan;
        if (accountStatus) updateData.accountStatus = accountStatus;
        updateData.updatedAt = new Date();

        const updatedSubscription = await UserSubscription.findOneAndUpdate(
            { userId: id },
            updateData,
            { new: true, upsert: true }
        );

        if (!updatedSubscription) {
            return res.status(404).json({
                success: false,
                message: "User subscription not found"
            });
        }

        res.status(200).json({
            success: true,
            message: UPDATE_DATA_MESSAGE,
            data: updatedSubscription
        });

    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default updateUserController;
