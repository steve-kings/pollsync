/**
 * Database Optimization Script
 * 
 * This script adds recommended indexes to improve query performance
 * and ensures database is properly optimized.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function optimizeDatabase() {
    try {
        console.log('🔧 Starting Database Optimization...\n');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        console.log('📊 Adding indexes for better performance...\n');

        // User Collection Indexes
        console.log('1. Optimizing users collection...');
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ phoneNumber: 1 });
        await db.collection('users').createIndex({ role: 1 });
        await db.collection('users').createIndex({ 'creditHistory.transactionId': 1 });
        console.log('   ✅ User indexes created\n');

        // Election Collection Indexes
        console.log('2. Optimizing elections collection...');
        await db.collection('elections').createIndex({ organizer: 1 });
        await db.collection('elections').createIndex({ status: 1 });
        await db.collection('elections').createIndex({ startDate: 1, endDate: 1 });
        await db.collection('elections').createIndex({ organizationId: 1 });
        await db.collection('elections').createIndex({ organizer: 1, status: 1, createdAt: -1 });
        console.log('   ✅ Election indexes created\n');

        // Transaction Collection Indexes
        console.log('3. Optimizing transactions collection...');
        await db.collection('transactions').createIndex({ transactionId: 1 }, { unique: true });
        await db.collection('transactions').createIndex({ userId: 1, status: 1 });
        await db.collection('transactions').createIndex({ createdAt: -1 });
        await db.collection('transactions').createIndex({ phoneNumber: 1 });
        console.log('   ✅ Transaction indexes created\n');

        // Vote Collection Indexes
        console.log('4. Optimizing votes collection...');
        await db.collection('votes').createIndex({ election: 1, voterId: 1, position: 1 }, { unique: true });
        await db.collection('votes').createIndex({ election: 1, candidate: 1 });
        await db.collection('votes').createIndex({ createdAt: -1 });
        await db.collection('votes').createIndex({ election: 1, position: 1 });
        console.log('   ✅ Vote indexes created\n');

        // Candidate Collection Indexes
        console.log('5. Optimizing candidates collection...');
        await db.collection('candidates').createIndex({ election: 1 });
        await db.collection('candidates').createIndex({ election: 1, position: 1 });
        console.log('   ✅ Candidate indexes created\n');

        // AllowedVoter Collection Indexes
        console.log('6. Optimizing allowedvoters collection...');
        await db.collection('allowedvoters').createIndex({ election: 1, studentId: 1 }, { unique: true });
        await db.collection('allowedvoters').createIndex({ election: 1 });
        console.log('   ✅ AllowedVoter indexes created\n');

        // Organization Collection Indexes
        console.log('7. Optimizing organizations collection...');
        await db.collection('organizations').createIndex({ name: 1 }, { unique: true });
        await db.collection('organizations').createIndex({ owner: 1 });
        await db.collection('organizations').createIndex({ isActive: 1 });
        console.log('   ✅ Organization indexes created\n');

        // PricingPlan Collection Indexes
        console.log('8. Optimizing pricingplans collection...');
        await db.collection('pricingplans').createIndex({ planId: 1 }, { unique: true });
        await db.collection('pricingplans').createIndex({ enabled: 1 });
        console.log('   ✅ PricingPlan indexes created\n');

        // Get index statistics
        console.log('='.repeat(60));
        console.log('\n📈 Index Statistics:\n');

        const collections = ['users', 'elections', 'transactions', 'votes', 'candidates', 'allowedvoters', 'organizations', 'pricingplans'];
        
        for (const collectionName of collections) {
            const indexes = await db.collection(collectionName).indexes();
            console.log(`${collectionName}: ${indexes.length} indexes`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Database optimization complete!');
        console.log('\nBenefits:');
        console.log('- Faster query performance');
        console.log('- Better dashboard load times');
        console.log('- Improved search functionality');
        console.log('- Efficient data lookups');
        console.log('- Reduced database load');

    } catch (error) {
        console.error('\n❌ Optimization error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run optimization
console.log('⚠️  DATABASE OPTIMIZATION SCRIPT');
console.log('This will add indexes to improve query performance\n');

optimizeDatabase();
