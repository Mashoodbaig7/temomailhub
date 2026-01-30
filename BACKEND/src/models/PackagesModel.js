import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
    planName: { type: String, required: true, trim: true },
    description: { type: String,required: true, trim: true },
    emailLimit: { type: Number, required: true },

    pricing: {
        monthly: {
            price: { type: Number },
            durationInDays: { type: Number, default: 30 }
        },
        yearly: {
            price: { type: Number },
            durationInDays: { type: Number, default: 365 },
            discountLabel: { type: String }
        }
    },

    features: [{ type: String, trim: true }],

    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdAt: { type: Date, default: Date.now }
});

const Package = mongoose.model('Package', packageSchema);
export default Package;