import AuthModel from '../../../models/AuthModel.js';
import UserSubscription from '../../../models/UserSubscriptionModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE } from '../../../constants/index.js';

const getEmailAnalyticsController = async (req, res) => {
    try {
        // Get email analytics summary by plan
        const emailSummary = await UserSubscription.aggregate([
            {
                $group: {
                    _id: '$currentPlan',
                    totalEmails: { $sum: '$emailsGenerated' }
                }
            }
        ]);

        const summaryData = {
            freeUsersEmails: 0,
            basicUsersEmails: 0,
            standardUsersEmails: 0,
            premiumUsersEmails: 0
        };

        emailSummary.forEach(item => {
            if (item._id === 'Free') summaryData.freeUsersEmails = item.totalEmails;
            if (item._id === 'Basic') summaryData.basicUsersEmails = item.totalEmails;
            if (item._id === 'Standard') summaryData.standardUsersEmails = item.totalEmails;
            if (item._id === 'Premium') summaryData.premiumUsersEmails = item.totalEmails;
        });

        // Get top users by email activity
        const topUsers = await UserSubscription.find()
            .populate('userId', 'name email')
            .sort({ emailsGenerated: -1 })
            .limit(10);

        const userEmailActivity = topUsers.map(sub => ({
            id: sub.userId._id,
            userName: sub.userId.name,
            userEmail: sub.userId.email,
            emailsGenerated: sub.emailsGenerated,
            currentPlan: sub.currentPlan
        }));

        // Get weekly trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyTrend = await UserSubscription.aggregate([
            {
                $match: {
                    updatedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        plan: '$currentPlan',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }
                    },
                    emails: { $sum: '$emailsGenerated' }
                }
            },
            {
                $sort: { '_id.date': 1 }
            }
        ]);

        // Format weekly data
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push({
                date: date.toISOString().split('T')[0],
                day: days[date.getDay()]
            });
        }

        const trendByPlan = {
            Free: last7Days.map(d => ({ date: d.date, day: d.day, count: 0 })),
            Basic: last7Days.map(d => ({ date: d.date, day: d.day, count: 0 })),
            Standard: last7Days.map(d => ({ date: d.date, day: d.day, count: 0 })),
            Premium: last7Days.map(d => ({ date: d.date, day: d.day, count: 0 }))
        };

        weeklyTrend.forEach(item => {
            const plan = item._id.plan;
            const date = item._id.date;
            const dayIndex = last7Days.findIndex(d => d.date === date);
            if (dayIndex !== -1 && trendByPlan[plan]) {
                trendByPlan[plan][dayIndex].count = item.emails;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                summary: summaryData,
                userEmailActivity,
                weeklyTrend: {
                    labels: last7Days.map(d => d.day),
                    Free: trendByPlan.Free.map(d => d.count),
                    Basic: trendByPlan.Basic.map(d => d.count),
                    Standard: trendByPlan.Standard.map(d => d.count),
                    Premium: trendByPlan.Premium.map(d => d.count)
                }
            }
        });

    } catch (error) {
        console.error("Get Email Analytics Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default getEmailAnalyticsController;
