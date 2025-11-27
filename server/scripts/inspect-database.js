/**
 * Database Inspection Script
 * 
 * This script connects to MongoDB and shows you what's actually stored
 * in your database - collections, documents, and data structure.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function inspectDatabase() {
    try {
        console.log('🔍 Inspecting MongoDB Database...\n');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        console.log('Database:', mongoose.connection.name);
        console.log('\n' + '='.repeat(70) + '\n');

        const db = mongoose.connection.db;

        // Get all collections
        const collections = await db.listCollections().toArray();
        console.log(`📚 Total Collections: ${collections.length}\n`);

        // Inspect each collection
        for (const collection of collections) {
            const collectionName = collection.name;
            const coll = db.collection(collectionName);
            
            // Get count
            const count = await coll.countDocuments();
            
            console.log(`\n${'='.repeat(70)}`);
            console.log(`📦 Collection: ${collectionName.toUpperCase()}`);
            console.log(`${'='.repeat(70)}`);
            console.log(`Total Documents: ${count}`);
            
            if (count > 0) {
                // Get sample document
                const sample = await coll.findOne();
                
                // Get indexes
                const indexes = await coll.indexes();
                
                console.log(`\nIndexes: ${indexes.length}`);
                indexes.forEach((index, i) => {
                    const keys = Object.keys(index.key).join(', ');
                    const unique = index.unique ? ' (unique)' : '';
                    console.log(`  ${i + 1}. ${keys}${unique}`);
                });
                
                console.log(`\nSample Document Structure:`);
                console.log(JSON.stringify(sample, null, 2));
                
                // Collection-specific stats
                if (collectionName === 'users') {
                    const withSharedCredits = await coll.countDocuments({ sharedCredits: { $gt: 0 } });
                    const withUnlimited = await coll.countDocuments({ 'unlimitedPackages.0': { $exists: true } });
                    const withLegacy = await coll.countDocuments({ 'electionCredits.0': { $exists: true } });
                    
                    console.log(`\n📊 User Statistics:`);
                    console.log(`  - Users with shared credits: ${withSharedCredits}`);
                    console.log(`  - Users with unlimited packages: ${withUnlimited}`);
                    console.log(`  - Users with legacy packages: ${withLegacy}`);
                    
                    // Get total credits
                    const creditStats = await coll.aggregate([
                        {
                            $group: {
                                _id: null,
                                totalSharedCredits: { $sum: '$sharedCredits' },
                                avgSharedCredits: { $avg: '$sharedCredits' }
                            }
                        }
                    ]).toArray();
                    
                    if (creditStats.length > 0) {
                        console.log(`  - Total shared credits in system: ${creditStats[0].totalSharedCredits}`);
                        console.log(`  - Average credits per user: ${Math.round(creditStats[0].avgSharedCredits)}`);
                    }
                }
                
                if (collectionName === 'elections') {
                    const byStatus = await coll.aggregate([
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ]).toArray();
                    
                    console.log(`\n📊 Election Statistics:`);
                    byStatus.forEach(stat => {
                        console.log(`  - ${stat._id || 'No status'}: ${stat.count}`);
                    });
                    
                    const byPlanType = await coll.aggregate([
                        { $group: { _id: '$planType', count: { $sum: 1 } } }
                    ]).toArray();
                    
                    console.log(`\n  By Plan Type:`);
                    byPlanType.forEach(stat => {
                        console.log(`  - ${stat._id || 'No plan'}: ${stat.count}`);
                    });
                }
                
                if (collectionName === 'transactions') {
                    const byStatus = await coll.aggregate([
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ]).toArray();
                    
                    console.log(`\n📊 Transaction Statistics:`);
                    byStatus.forEach(stat => {
                        console.log(`  - ${stat._id}: ${stat.count}`);
                    });
                    
                    const totalAmount = await coll.aggregate([
                        { $match: { status: 'Success' } },
                        { $group: { _id: null, total: { $sum: '$amount' } } }
                    ]).toArray();
                    
                    if (totalAmount.length > 0) {
                        console.log(`  - Total successful payments: KES ${totalAmount[0].total}`);
                    }
                }
                
                if (collectionName === 'votes') {
                    const uniqueVoters = await coll.distinct('voterId');
                    const uniqueElections = await coll.distinct('election');
                    
                    console.log(`\n📊 Vote Statistics:`);
                    console.log(`  - Unique voters: ${uniqueVoters.length}`);
                    console.log(`  - Elections with votes: ${uniqueElections.length}`);
                }
                
                if (collectionName === 'candidates') {
                    const totalVotes = await coll.aggregate([
                        { $group: { _id: null, total: { $sum: '$voteCount' } } }
                    ]).toArray();
                    
                    console.log(`\n📊 Candidate Statistics:`);
                    if (totalVotes.length > 0) {
                        console.log(`  - Total votes cast: ${totalVotes[0].total}`);
                    }
                }
            } else {
                console.log('\n⚠️  Collection is empty');
            }
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('\n✅ Database inspection complete!');
        
        // Summary
        console.log('\n📋 SUMMARY:');
        console.log('─'.repeat(70));
        
        let totalDocs = 0;
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            totalDocs += count;
            console.log(`${collection.name.padEnd(20)} : ${count.toString().padStart(6)} documents`);
        }
        
        console.log('─'.repeat(70));
        console.log(`${'TOTAL'.padEnd(20)} : ${totalDocs.toString().padStart(6)} documents`);
        console.log('─'.repeat(70));

    } catch (error) {
        console.error('\n❌ Inspection error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run inspection
console.log('🔍 DATABASE INSPECTION TOOL');
console.log('This will show you what\'s actually in your MongoDB database\n');

inspectDatabase();
