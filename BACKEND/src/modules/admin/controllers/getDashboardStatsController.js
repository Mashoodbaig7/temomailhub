import AuthModel from '../../../models/AuthModel.js';
import UserSubscription from '../../../models/UserSubscriptionModel.js';
import Package from '../../../models/PackagesModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE } from '../../../constants/index.js';

const getDashboardStatsController = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await AuthModel.countDocuments();

        // Get subscription statistics
        const subscriptionStats = await UserSubscription.aggregate([
            {
                $group: {
                    _id: '$currentPlan',
                    count: { $sum: 1 },
                    totalEmails: { $sum: '$emailsGenerated' }
                }
            }
        ]);

        // Format subscription stats
        const planStats = {
            Free: 0,
            Basic: 0,
            Standard: 0,
            Premium: 0
        };

        const emailStats = {
            Free: 0,
            Basic: 0,
            Standard: 0,
            Premium: 0
        };

        subscriptionStats.forEach(stat => {
            planStats[stat._id] = stat.count;
            emailStats[stat._id] = stat.totalEmails;
        });

        // Get today's email generation count
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayEmailsCount = await UserSubscription.aggregate([
            {
                $match: {
                    updatedAt: { $gte: today }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$emailsGenerated' }
                }
            }
        ]);

        const emailsGeneratedToday = todayEmailsCount[0]?.total || 0;

        // Get total packages
        const totalPackages = await Package.countDocuments({ status: 'Active' });

        // Get user distribution for chart
        const userDistribution = [
            { label: 'Free', value: planStats.Free },
            { label: 'Basic', value: planStats.Basic },
            { label: 'Standard', value: planStats.Standard },
            { label: 'Premium', value: planStats.Premium }
        ];

        // Get email generation by plan for chart
        const emailsByPlan = [
            { label: 'Free', value: emailStats.Free },
            { label: 'Basic', value: emailStats.Basic },
            { label: 'Standard', value: emailStats.Standard },
            { label: 'Premium', value: emailStats.Premium }
        ];

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalUsers,
                    freeUsers: planStats.Free,
                    basicUsers: planStats.Basic,
                    standardUsers: planStats.Standard,
                    premiumUsers: planStats.Premium,
                    emailsGeneratedToday,
                    freeEmailsGeneratedToday: emailStats.Free,
                    totalPackages
                },
                userDistribution,
                emailsByPlan,
                emailStats
            }
        });

    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default getDashboardStatsController;
