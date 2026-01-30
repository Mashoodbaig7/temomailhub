import Package from '../../../models/PackagesModel.js';
import { INTERNAL_SERVER_ERROR_MESSAGE, DELETE_DATA_MESSAGE } from '../../../constants/index.js';

const deletePackageController = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPackage = await Package.findByIdAndDelete(id);

        if (!deletedPackage) {
            return res.status(404).json({
                success: false,
                message: "Package not found"
            });
        }

        res.status(200).json({
            success: true,
            message: DELETE_DATA_MESSAGE,
            data: deletedPackage
        });

    } catch (error) {
        console.error("Delete Package Error:", error);
        res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR_MESSAGE,
            error: error.message
        });
    }
}

export default deletePackageController;
