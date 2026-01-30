import Package from '../../../models/PackagesModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE } from '../../../constants/index.js';

const getAllPackagesController = async (req, res) => {
    try {
        const { status } = req.query;
        
        // Build query based on filters
        const query = {};
        if (status && status !== 'All') {
            query.status = status;
        }

        const packages = await Package.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: packages.length,
            data: packages
        });

    } catch (error) {
        console.error("Get All Packages Error:", error);
        res.status(500).json({ 
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE, 
            error: error.message 
        });
    }
}

export default getAllPackagesController;
