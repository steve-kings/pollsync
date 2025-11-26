require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Election = require('./models/Election');
const Transaction = require('./models/Transaction');
const PricingPlan = require('./models/PricingPlan');
const Organization = require('./models/Organization');

async function verifySystem() {
    try {
        console.log('🔍 POLLSYNC SYSTEM VERIFICATION\n');
        console.log('='.repeat(60));

        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
        console.log('\n📊 DATABASE CONNECTION');
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('   Database:', mongoose.connection.name);
        console.log('   Host:', mongoose.connection.host);

        // 1. Check Pricing Plans
        console.log('\n' + '='.repeat(60));
        console.log('💰 PRICING PLANS');
        const plans = await PricingPlan.find({});
        console.log(`Total plans: ${plans.length}`);
        
        if (plans.length === 0) {
            console.log('⚠️  No pricing plans found. Initializing...');
            await PricingPlan.initializeDefaultPlans();
            const newPlans = await PricingPlan.find({});
            console.log(`✅ Initialized ${newPlans.length} plans`);
        }

        const activePlans = await PricingPlan.find({ enabled: true });
        console.log(`Active plans: ${activePlans.length}`);
        activePlans.forEach(plan => {
            console.log(`   ✓ ${plan.name}: KES ${plan.price} (${plan.voterLimit === -1 ? 'Unlimited' : plan.voterLimit} voters)`);
        });

        // 2. Check Users
        console.log('\n' + '='.repeat(60));
        console.log('👥 USERS');
        const totalUsers = await User.countDocuments();
        const organizers = await User.countDocuments({ role: 'organizer' });
        const admins = await User.countDocuments({ role: 'admin' });
        
        console.log(`Total users: ${totalUsers}`);
        console.log(`   Organizers: ${organizers}`);
        console.log(`   Admins: ${admins}`);

        // Check test user
        const testUser = await User.findOne({ email: 'testuser@example.com' });
        if (testUser) {
            console.log('\n✅ Test user found:');
            console.log(`   Username: ${testUser.username}`);
            console.log(`   Email: ${testUser.email}`);
            console.log(`   Phone: ${testUser.phoneNumber}`);
            console.log(`   Role: ${testUser.role}`);
            
            const creditSummary = testUser.getCreditSummary();
            console.log(`   Packages: ${creditSummary.electionPackages.total}`);
            console.log(`   Available: ${creditSummary.electionPackages.available}`);
            console.log(`   Used: ${creditSummary.electionPackages.used}`);

            if (testUser.electionCredits.length > 0) {
                console.log('\n   Package Details:');
                testUser.electionCredits.forEach((credit, index) => {
                    console.log(`   ${index + 1}. ${credit.plan} - ${credit.voterLimit} voters`);
                    console.log(`      Used: ${credit.used ? 'Yes' : 'No'}`);
                    console.log(`      Transaction: ${credit.transactionId}`);
                    if (credit.electionId) {
                        console.log(`      Election: ${credit.electionId}`);
                    }
                });
            }
        } else {
            console.log('⚠️  Test user not found (testuser@example.com)');
        }

        // 3. Check Transactions
        console.log('\n' + '='.repeat(60));
        console.log('💳 TRANSACTIONS');
        const totalTransactions = await Transaction.countDocuments();
        const successTransactions = await Transaction.countDocuments({ status: 'Success' });
        const pendingTransactions = await Transaction.countDocuments({ status: 'Pending' });
        const failedTransactions = await Transaction.countDocuments({ status: 'Failed' });
        
        console.log(`Total transactions: ${totalTransactions}`);
        console.log(`   Success: ${successTransactions}`);
        console.log(`   Pending: ${pendingTransactions}`);
        console.log(`   Failed: ${failedTransactions}`);

        if (testUser) {
            const userTransactions = await Transaction.find({ userId: testUser._id }).sort({ createdAt: -1 }).limit(5);
            if (userTransactions.length > 0) {
                console.log(`\n   Test user's recent transactions:`);
                userTransactions.forEach((txn, index) => {
                    console.log(`   ${index + 1}. ${txn.transactionId}`);
                    console.log(`      Amount: KES ${txn.amount}`);
                    console.log(`      Status: ${txn.status}`);
                    console.log(`      Plan: ${txn.plan}`);
                    console.log(`      Processed: ${txn.processed ? 'Yes' : 'No'}`);
                    console.log(`      Date: ${txn.createdAt}`);
                });
            }
        }

        // 4. Check Elections
        console.log('\n' + '='.repeat(60));
        console.log('🗳️  ELECTIONS');
        const totalElections = await Election.countDocuments();
        const activeElections = await Election.countDocuments({ status: 'active' });
        const completedElections = await Election.countDocuments({ status: 'completed' });
        const upcomingElections = await Election.countDocuments({ status: 'upcoming' });
        
        console.log(`Total elections: ${totalElections}`);
        console.log(`   Active: ${activeElections}`);
        console.log(`   Completed: ${completedElections}`);
        console.log(`   Upcoming: ${upcomingElections}`);

        if (testUser) {
            const userElections = await Election.find({ creator: testUser._id });
            console.log(`\n   Test user's elections: ${userElections.length}`);
            
            if (userElections.length > 0) {
                userElections.forEach((election, index) => {
                    console.log(`   ${index + 1}. ${election.title}`);
                    console.log(`      Status: ${election.status}`);
                    console.log(`      Packages: ${election.packages?.length || 0}`);
                    console.log(`      Total Credits: ${election.totalCredits || 0}`);
                    console.log(`      Voters: ${election.voters?.length || 0}`);
                    console.log(`      Candidates: ${election.candidates?.length || 0}`);
                });
            }
        }

        // 5. Check Organizations
        console.log('\n' + '='.repeat(60));
        console.log('🏢 ORGANIZATIONS');
        const totalOrgs = await Organization.countDocuments();
        console.log(`Total organizations: ${totalOrgs}`);

        if (testUser) {
            const userOrgs = await Organization.find({ creator: testUser._id });
            console.log(`   Test user's organizations: ${userOrgs.length}`);
        }

        // 6. Data Integrity Checks
        console.log('\n' + '='.repeat(60));
        console.log('🔍 DATA INTEGRITY CHECKS');

        // Check for orphaned transactions
        const orphanedTransactions = await Transaction.find({ 
            userId: { $ne: null },
            processed: true,
            status: 'Success'
        });
        
        let orphanedCount = 0;
        for (const txn of orphanedTransactions) {
            const user = await User.findById(txn.userId);
            if (user) {
                const hasCredit = user.electionCredits.some(c => c.transactionId === txn.transactionId);
                if (!hasCredit) {
                    orphanedCount++;
                }
            }
        }
        
        if (orphanedCount > 0) {
            console.log(`⚠️  Found ${orphanedCount} processed transactions without credits`);
        } else {
            console.log('✅ All processed transactions have corresponding credits');
        }

        // Check for unused packages
        const usersWithPackages = await User.find({ 'electionCredits.0': { $exists: true } });
        let totalPackages = 0;
        let usedPackages = 0;
        let availablePackages = 0;

        usersWithPackages.forEach(user => {
            totalPackages += user.electionCredits.length;
            usedPackages += user.electionCredits.filter(c => c.used).length;
            availablePackages += user.electionCredits.filter(c => !c.used).length;
        });

        console.log(`✅ Package statistics:`);
        console.log(`   Total packages: ${totalPackages}`);
        console.log(`   Used: ${usedPackages}`);
        console.log(`   Available: ${availablePackages}`);

        // 7. API Endpoints Status
        console.log('\n' + '='.repeat(60));
        console.log('🌐 API ENDPOINTS STATUS');
        console.log('✅ Database models loaded:');
        console.log('   ✓ User');
        console.log('   ✓ Election');
        console.log('   ✓ Transaction');
        console.log('   ✓ PricingPlan');
        console.log('   ✓ Organization');

        // 8. Summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 SYSTEM SUMMARY');
        console.log(`✅ Database: Connected`);
        console.log(`✅ Pricing Plans: ${activePlans.length} active`);
        console.log(`✅ Users: ${totalUsers} total`);
        console.log(`✅ Transactions: ${totalTransactions} total (${successTransactions} successful)`);
        console.log(`✅ Elections: ${totalElections} total (${activeElections} active)`);
        console.log(`✅ Packages: ${totalPackages} total (${availablePackages} available)`);

        // 9. Recommendations
        console.log('\n' + '='.repeat(60));
        console.log('💡 RECOMMENDATIONS');
        
        if (!testUser) {
            console.log('⚠️  Create test user:');
            console.log('   POST /api/auth/register');
            console.log('   { email: "testuser@example.com", password: "@king635", username: "testuser", phoneNumber: "0769956286" }');
        }

        if (availablePackages === 0 && testUser) {
            console.log('⚠️  Test user has no available packages. Purchase one:');
            console.log('   1. Login as testuser@example.com');
            console.log('   2. Go to /pricing');
            console.log('   3. Select a plan and pay');
        }

        if (totalElections === 0 && testUser && availablePackages > 0) {
            console.log('💡 Test user has packages but no elections. Create one:');
            console.log('   1. Go to /dashboard/create-election');
            console.log('   2. Fill in election details');
            console.log('   3. System will auto-assign a package');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ VERIFICATION COMPLETE!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
        process.exit(1);
    }
}

verifySystem();
