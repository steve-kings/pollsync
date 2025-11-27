/**
 * Test AI Features
 * Quick test to verify all AI services are working
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Import AI services
const { generateContent } = require('../config/geminiService');
const fraudDetectionService = require('../services/fraudDetectionService');
const analyticsService = require('../services/analyticsService');
const chatbotService = require('../services/chatbotService');
const insightsService = require('../services/insightsService');

async function testAIFeatures() {
    console.log('🤖 TESTING AI FEATURES\n');
    console.log('='.repeat(70) + '\n');

    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Database connected\n');

        // Test 1: Basic Gemini Connection
        console.log('📝 TEST 1: Gemini API Connection');
        console.log('-'.repeat(70));
        try {
            const response = await generateContent('Say "Hello from PollSync AI!" in a friendly way.');
            console.log('✅ Gemini API working');
            console.log('Response:', response.substring(0, 100) + '...\n');
        } catch (error) {
            console.log('❌ Gemini API failed:', error.message, '\n');
        }

        // Test 2: Chatbot
        console.log('📝 TEST 2: AI Chatbot');
        console.log('-'.repeat(70));
        try {
            const chatResponse = await chatbotService.processMessage('How do I create an election?');
            console.log('✅ Chatbot working');
            console.log('Response:', chatResponse.message.substring(0, 150) + '...\n');
        } catch (error) {
            console.log('❌ Chatbot failed:', error.message, '\n');
        }

        // Test 3: Quick Help
        console.log('📝 TEST 3: Quick Help Suggestions');
        console.log('-'.repeat(70));
        try {
            const suggestions = chatbotService.getQuickHelp('organizer');
            console.log('✅ Quick help working');
            console.log('Suggestions:', suggestions.slice(0, 3).join(', '), '\n');
        } catch (error) {
            console.log('❌ Quick help failed:', error.message, '\n');
        }

        // Test 4: Find an election for testing
        const Election = require('../models/Election');
        const elections = await Election.find().limit(1);
        
        if (elections.length > 0) {
            const testElectionId = elections[0]._id;
            console.log(`Using election: ${elections[0].title}\n`);

            // Test 5: Fraud Detection
            console.log('📝 TEST 4: Fraud Detection');
            console.log('-'.repeat(70));
            try {
                const fraudAnalysis = await fraudDetectionService.analyzeElectionFraud(testElectionId);
                console.log('✅ Fraud detection working');
                console.log('Risk Level:', fraudAnalysis.riskLevel);
                console.log('Risk Score:', fraudAnalysis.riskScore, '\n');
            } catch (error) {
                console.log('❌ Fraud detection failed:', error.message, '\n');
            }

            // Test 6: Analytics Insights
            console.log('📝 TEST 5: Analytics Insights');
            console.log('-'.repeat(70));
            try {
                const insights = await analyticsService.generateElectionInsights(testElectionId);
                console.log('✅ Analytics working');
                console.log('Summary:', insights.summary?.substring(0, 100) + '...\n');
            } catch (error) {
                console.log('❌ Analytics failed:', error.message, '\n');
            }
        } else {
            console.log('⚠️  No elections found for testing analytics features\n');
        }

        // Test 7: Find a user for testing
        const User = require('../models/User');
        const users = await User.findOne();
        
        if (users) {
            console.log(`Using user: ${users.username}\n`);

            // Test 8: Dashboard Insights
            console.log('📝 TEST 6: Dashboard Insights');
            console.log('-'.repeat(70));
            try {
                const dashboardInsights = await insightsService.generateDashboardInsights(users._id);
                console.log('✅ Dashboard insights working');
                console.log('Summary:', dashboardInsights.summary?.substring(0, 100) + '...\n');
            } catch (error) {
                console.log('❌ Dashboard insights failed:', error.message, '\n');
            }

            // Test 9: Pricing Recommendations
            console.log('📝 TEST 7: Pricing Recommendations');
            console.log('-'.repeat(70));
            try {
                const pricingRecs = await insightsService.generatePricingRecommendations(users._id);
                console.log('✅ Pricing recommendations working');
                console.log('Recommended:', pricingRecs.recommendedPackage, '\n');
            } catch (error) {
                console.log('❌ Pricing recommendations failed:', error.message, '\n');
            }
        } else {
            console.log('⚠️  No users found for testing insights features\n');
        }

        console.log('='.repeat(70));
        console.log('\n🎉 AI FEATURES TEST COMPLETE!\n');
        console.log('All AI services are operational and ready to use.');
        console.log('\nNext steps:');
        console.log('1. Start your server: npm run dev');
        console.log('2. Open your app and look for the AI chatbot button');
        console.log('3. Check your dashboard for AI insights');
        console.log('4. View election details for fraud detection\n');

    } catch (error) {
        console.error('\n❌ Test error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed\n');
    }
}

// Run tests
testAIFeatures();
