import AuthModel from '../../../models/AuthModel.js';
import UserSubscription from '../../../models/UserSubscriptionModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE } from '../../../constants/index.js';

const getAllUsersController = async (req, res) => {
    try {
        const { search, status, plan } = req.query;

        // Build user query
        const userQuery = {};
        if (search) {
            userQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Get all users with basic info
        const users = await AuthModel.find(userQuery).select('-password');

        // Get subscription info for each user
        const usersWithSubscription = await Promise.all(
            users.map(async (user) => {
                let subscription = await UserSubscription.findOne({ userId: user._id });
                
                // If no subscription exists, create a default Free one
                if (!subscription) {
                    subscription = await UserSubscription.create({
                        userId: user._id,
                        currentPlan: 'Free',
                        accountStatus: 'Active',
                        emailsGenerated: 0
                    });
                }

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImageUrl: user.profileImageUrl,
                    signupDate: user.createdAt || new Date().toISOString().split('T')[0],
                    currentPlan: subscription.currentPlan,
                    accountStatus: subscription.accountStatus,
                    emailsGenerated: subscription.emailsGenerated
                };
            })
        );

        // Apply filters after combining data
        let filteredUsers = usersWithSubscription;
        
        if (status && status !== 'All') {
            filteredUsers = filteredUsers.filter(user => user.accountStatus === status);
        }
        
        if (plan && plan !== 'All') {
            filteredUsers = filteredUsers.filter(user => user.currentPlan === plan);
        }

        res.status(200).json({
            success: true,
            count: filteredUsers.length,
            data: filteredUsers
        });

    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default getAllUsersController;
