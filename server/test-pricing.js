require('dotenv').config();
const mongoose = require('mongoose');
const PricingPlan = require('./models/PricingPlan');

async function testPricing() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check existing plans
        console.log('\n📊 Checking existing pricing plans...');
        let plans = await PricingPlan.find({});
        console.log(`Found ${plans.length} plans in database`);
        
        if (plans.length > 0) {
            console.log('\nExisting plans:');
            plans.forEach(plan => {
                console.log(`- ${plan.name}: KES ${plan.price} (${plan.voterLimit} voters) - Enabled: ${plan.enabled}`);
            });
        }

        // Initialize default plans if none exist
        if (plans.length === 0) {
            console.log('\n⚠️ No plans found, initializing defaults...');
            await PricingPlan.initializeDefaultPlans();
            plans = await PricingPlan.find({});
            console.log(`✅ Initialized ${plans.length} default plans`);
        }

        // Test getActivePlans
        console.log('\n🔍 Testing getActivePlans()...');
        const activePlans = await PricingPlan.getActivePlans();
        console.log(`Found ${activePlans.length} active plans`);
        activePlans.forEach(plan => {
            console.log(`- ${plan.name}: KES ${plan.price}`);
        });

        console.log('\n✅ Pricing test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testPricing();
