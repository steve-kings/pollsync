/**
 * Check specific user's credit status
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function checkUserCredits() {
    try {
        console.log('🔍 Checking user credits...\n');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find user
        const user = await User.findOne({ email: 'stephenkingori635@gmail.com' });
        
        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('👤 User:', user.username);
        console.log('📧 Email:', user.email);
        console.log('🆔 ID:', user._id);
        console.log('\n' + '='.repeat(60));
        
        // NEW SHARED CREDIT SYSTEM
        console.log('\n📊 NEW SHARED CREDIT SYSTEM:');
        console.log('─'.repeat(60));
        console.log('Shared Credits:', user.sharedCredits || 0);
        console.log('Unlimited Packages:', user.unlimitedPackages?.length || 0);
        console.log('Credit History:', user.creditHistory?.length || 0);
        
        if (user.unlimitedPackages && user.unlimitedPackages.length > 0) {
            console.log('\nUnlimited Packages Details:');
            user.unlimitedPackages.forEach((pkg, i) => {
                console.log(`  ${i + 1}. Transaction: ${pkg.transactionId}`);
                console.log(`     Used: ${pkg.used}`);
                console.log(`     Election: ${pkg.electionId || 'None'}`);
                console.log(`     Date: ${pkg.purchaseDate}`);
            });
        }
        
        if (user.creditHistory && user.creditHistory.length > 0) {
            console.log('\nCredit History:');
            user.creditHistory.forEach((history, i) => {
                console.log(`  ${i + 1}. Plan: ${history.plan}`);
                console.log(`     Credits: ${history.credits === -1 ? 'Unlimited' : history.credits}`);
                console.log(`     Price: KES ${history.price}`);
                console.log(`     Transaction: ${history.transactionId}`);
                console.log(`     Date: ${history.purchaseDate}`);
                console.log(`     Is Unlimited: ${history.isUnlimited}`);
            });
        }
        
        // LEGACY SYSTEM
        console.log('\n' + '='.repeat(60));
        console.log('\n📦 LEGACY ELECTION PACKAGES:');
        console.log('─'.repeat(60));
        console.log('Total Packages:', user.electionCredits?.length || 0);
        
        if (user.electionCredits && user.electionCredits.length > 0) {
            const available = user.electionCredits.filter(c => !c.used);
            const used = user.electionCredits.filter(c => c.used);
            
            console.log('Available:', available.length);
            console.log('Used:', used.length);
            
            console.log('\nAvailable Packages:');
            available.forEach((credit, i) => {
                console.log(`  ${i + 1}. Plan: ${credit.plan}`);
                console.log(`     Voter Limit: ${credit.voterLimit === -1 ? 'Unlimited' : credit.voterLimit}`);
                console.log(`     Price: KES ${credit.price}`);
                console.log(`     Transaction: ${credit.transactionId || 'N/A'}`);
                console.log(`     Date: ${credit.purchaseDate}`);
            });
            
            if (used.length > 0) {
                console.log('\nUsed Packages:');
                used.forEach((credit, i) => {
                    console.log(`  ${i + 1}. Plan: ${credit.plan}`);
                    console.log(`     Voter Limit: ${credit.voterLimit === -1 ? 'Unlimited' : credit.voterLimit}`);
                    console.log(`     Election: ${credit.electionId || 'N/A'}`);
                    console.log(`     Date: ${credit.purchaseDate}`);
                });
            }
        }
        
        // CREDIT SUMMARY
        console.log('\n' + '='.repeat(60));
        console.log('\n💡 CREDIT SUMMARY (Using getCreditSummary method):');
        console.log('─'.repeat(60));
        const summary = user.getCreditSummary();
        console.log(JSON.stringify(summary, null, 2));
        
        // RECOMMENDATIONS
        console.log('\n' + '='.repeat(60));
        console.log('\n🎯 RECOMMENDATIONS:');
        console.log('─'.repeat(60));
        
        if (user.electionCredits && user.electionCredits.filter(c => !c.used).length > 0) {
            console.log('⚠️  This user has LEGACY packages that can be migrated!');
            console.log('   Run: node scripts/migrate-to-shared-credits.js');
            console.log('   This will convert unused packages to shared credits.');
        }
        
        if (summary.needsCredits) {
            console.log('❌ User needs to purchase credits to create elections');
        } else if (summary.lowCredits) {
            console.log('⚠️  User has low credits, suggest purchasing more');
        } else {
            console.log('✅ User has sufficient credits');
        }
        
        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

checkUserCredits();
