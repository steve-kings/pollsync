require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Election = require('./models/Election');

async function checkElections() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find test user
        const testUser = await User.findOne({ email: 'testuser@example.com' });
        if (!testUser) {
            console.log('❌ Test user not found');
            process.exit(1);
        }

        console.log('👤 Test User:');
        console.log('   ID:', testUser._id);
        console.log('   Username:', testUser.username);
        console.log('   Email:', testUser.email);

        // Find all elections
        console.log('\n🗳️  All Elections in Database:');
        const allElections = await Election.find({}).populate('organizer', 'username email');
        console.log(`   Total: ${allElections.length}\n`);

        if (allElections.length === 0) {
            console.log('   No elections found in database');
        } else {
            allElections.forEach((election, index) => {
                console.log(`   ${index + 1}. ${election.title}`);
                console.log(`      ID: ${election._id}`);
                console.log(`      Organizer ID: ${election.organizer?._id || election.organizer}`);
                console.log(`      Organizer Username: ${election.organizer?.username || 'Unknown'}`);
                console.log(`      Organizer Email: ${election.organizer?.email || 'Unknown'}`);
                console.log(`      Status: ${election.status}`);
                console.log(`      Packages: ${election.packages?.length || 0}`);
                console.log('');
            });
        }

        // Check elections for test user
        console.log('🔍 Elections for Test User:');
        const userElections = await Election.find({ organizer: testUser._id });
        console.log(`   Found: ${userElections.length}`);

        if (userElections.length > 0) {
            userElections.forEach((election, index) => {
                console.log(`   ${index + 1}. ${election.title}`);
                console.log(`      Status: ${election.status}`);
            });
        } else {
            console.log('   ⚠️  No elections found for test user');
            console.log('\n   Checking if elections exist with different organizer...');
            
            // Check if there are elections with different organizers
            const otherElections = await Election.find({ organizer: { $ne: testUser._id } }).populate('organizer', 'username email');
            if (otherElections.length > 0) {
                console.log(`   Found ${otherElections.length} elections belonging to other users:`);
                otherElections.forEach((election, index) => {
                    console.log(`   ${index + 1}. ${election.title}`);
                    console.log(`      Owner: ${election.organizer?.username || 'Unknown'} (${election.organizer?.email || 'Unknown'})`);
                });
            }
        }

        // Check API endpoint simulation
        console.log('\n🌐 Simulating API Call:');
        console.log('   GET /api/elections');
        console.log('   User:', testUser.username);
        
        // This is what the API returns
        const apiElections = await Election.find({ organizer: testUser._id })
            .populate('organizer', 'username email')
            .sort({ createdAt: -1 });
        
        console.log(`   Response: ${apiElections.length} elections`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkElections();
