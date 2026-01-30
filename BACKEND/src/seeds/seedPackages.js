import Package from '../models/PackagesModel.js';
import { connectDB } from '../config/db.js';

const seedPackages = async () => {
    try {
        await connectDB();
        
        // Clear existing packages
        await Package.deleteMany({});
        
        const packages = [
            {
                planName: 'Free',
                description: 'Perfect for getting started',
                emailLimit: 5, // per hour
                pricing: {
                    monthly: {
                        price: 0,
                        durationInDays: 365
                    },
                    yearly: {
                        price: 0,
                        durationInDays: 365
                    }
                },
                features: [
                    'Randomly Generated Email Addresses',
                    'Emails Auto-Delete After 10 Minutes',
                    'No inbox storage',
                    'Limited to 5 emails per hour',
                    'No custom domain support',
                    'No attachment support',
                    'Public inbox access',
                    'No Customer Support'
                ],
                status: 'Active'
            },
            {
                planName: 'Standard',
                description: 'Best for regular users',
                emailLimit: 20, // per hour
                pricing: {
                    monthly: {
                        price: 10,
                        durationInDays: 30
                    },
                    yearly: {
                        price: 100,
                        durationInDays: 365,
                        discountLabel: 'Save $20/year'
                    }
                },
                features: [
                    'Custom email addresses',
                    'Emails Expire in 12 Hours',
                    '20 emails inbox storage',
                    'Attachment support (up to 1MB)',
                    'Faster email delivery',
                    'Private inbox access',
                    'Ad-free experience',
                    'Priority Email Support'
                ],
                status: 'Active'
            },
            {
                planName: 'Premium',
                description: 'For power users & businesses',
                emailLimit: -1, // unlimited
                pricing: {
                    monthly: {
                        price: 20,
                        durationInDays: 30
                    },
                    yearly: {
                        price: 200,
                        durationInDays: 365,
                        discountLabel: 'Save $40/year'
                    }
                },
                features: [
                    'Permanent email storage',
                    'Custom domain support',
                    'Emails Expire in 24 Hours',
                    '100+ emails inbox storage',
                    'Full attachment support (10MB)',
                    'Priority email delivery',
                    'Advanced spam filtering',
                    'Ad-free experience',
                    'Priority Email Support'
                ],
                status: 'Active'
            }
        ];
        
        await Package.insertMany(packages);
        
        console.log('✅ Packages seeded successfully!');
        console.log(`✅ Created ${packages.length} packages`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding packages:', error);
        process.exit(1);
    }
};

seedPackages();
