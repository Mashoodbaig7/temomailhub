import Package from '../../../models/PackagesModel.js';
import postData from '../services/post.js';

const createPkgController = async (req, res) => {
    try {
        const { planName, description, pricing, emailLimit, features, status } = req.body;
        
        console.log("Incoming Data:", req.body);
        
        // Validation Fix: Agar price 0 hai to JS usse false manta hai, 
        // isliye undefined check karna zaroori hai.
        const isMonthlyPriceMissing = pricing?.monthly?.price === undefined || pricing?.monthly?.price === null;
        const isYearlyPriceMissing = pricing?.yearly?.price === undefined || pricing?.yearly?.price === null;

        if (!planName || !description || !emailLimit || !pricing || isMonthlyPriceMissing || isYearlyPriceMissing) {
            return res.status(400).json({ 
                message: "All fields are required. Set price to 0 for Free/Starter plans." 
            });
        }

        // Schema ke mutabiq naya object
        const newPackage = new Package({
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
        });

        // Data save karne ke liye service call
        const savedPackage = await postData(newPackage);
        
        res.status(201).json({ 
            message: "Package created successfully", 
            data: savedPackage 
        });

    } catch (error) {
        console.error("Create Package Error:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
}

export default createPkgController;