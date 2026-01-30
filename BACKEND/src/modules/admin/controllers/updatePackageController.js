import Package from '../../../models/PackagesModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE, UPDATE_DATA_MESSAGE } from '../../../constants/index.js';

const updatePackageController = async (req, res) => {
    try {
        const { id } = req.params;
        const { planName, description, pricing, emailLimit, features, status } = req.body;

        const updatedPackage = await Package.findByIdAndUpdate(
            id,
            {
                planName,
                description,
                emailLimit,
                pricing: {
                    monthly: {
                        price: pricing.monthly.price,
                        durationInDays: pricing.monthly.durationInDays || 30
                    },
                    yearly: {
                        price: pricing.yearly.price,
                        durationInDays: pricing.yearly.durationInDays || 365,
                        discountLabel: pricing.yearly.discountLabel || ""
                    }
                },
                status: status || 'Active',
                features: features || []
            },
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({
                success: false,
                message: "Package not found"
            });
        }

        res.status(200).json({
            success: true,
            message: UPDATE_DATA_MESSAGE,
            data: updatedPackage
        });

    } catch (error) {
        console.error("Update Package Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default updatePackageController;
