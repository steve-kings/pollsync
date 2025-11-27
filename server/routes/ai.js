/**
 * AI Features Routes
 * Routes for fraud detection, analytics, chatbot, and insights
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const fraudDetectionService = require('../services/fraudDetectionService');
const analyticsService = require('../services/analyticsService');
const chatbotService = require('../services/chatbotService');
const insightsService = require('../services/insightsService');

// ============================================
// FRAUD DETECTION ROUTES
// ============================================

/**
 * @route   GET /api/ai/fraud/analyze/:electionId
 * @desc    Analyze election for fraud (Costs 10 credits)
 * @access  Private
 */
router.get('/fraud/analyze/:electionId', protect, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user._id);

        // Check if user has enough credits
        if (user.sharedCredits < 10) {
            return res.status(402).json({ 
                message: 'Insufficient credits. You need 10 credits to use AI Fraud Detection.',
                required: 10,
                available: user.sharedCredits
            });
        }

        // Deduct 10 credits
        user.sharedCredits -= 10;
        user.creditHistory.push({
            type: 'deduction',
            credits: 10,
            reason: 'AI Fraud Detection Analysis',
            date: new Date()
        });
        await user.save();

        const analysis = await fraudDetectionService.analyzeElectionFraud(req.params.electionId);
        
        res.json({
            ...analysis,
            creditsUsed: 10,
            remainingCredits: user.sharedCredits
        });
    } catch (error) {
        console.error('Fraud Analysis Error:', error);
        res.status(500).json({ message: 'Failed to analyze fraud', error: error.message });
    }
});

/**
 * @route   POST /api/ai/fraud/check-vote
 * @desc    Check individual vote for fraud
 * @access  Private
 */
router.post('/fraud/check-vote', async (req, res) => {
    try {
        const { voteData, electionId } = req.body;
        const result = await fraudDetectionService.checkVoteFraud(voteData, electionId);
        res.json(result);
    } catch (error) {
        console.error('Vote Fraud Check Error:', error);
        res.status(500).json({ message: 'Failed to check vote', error: error.message });
    }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/ai/analytics/insights/:electionId
 * @desc    Get AI-generated insights for election
 * @access  Private
 */
router.get('/analytics/insights/:electionId', protect, async (req, res) => {
    try {
        const insights = await analyticsService.generateElectionInsights(req.params.electionId);
        res.json(insights);
    } catch (error) {
        console.error('Insights Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate insights', error: error.message });
    }
});

/**
 * @route   GET /api/ai/analytics/predictions/:electionId
 * @desc    Get AI predictions for ongoing election
 * @access  Private
 */
router.get('/analytics/predictions/:electionId', protect, async (req, res) => {
    try {
        const predictions = await analyticsService.generatePredictions(req.params.electionId);
        res.json(predictions);
    } catch (error) {
        console.error('Predictions Error:', error);
        res.status(500).json({ message: 'Failed to generate predictions', error: error.message });
    }
});

/**
 * @route   GET /api/ai/analytics/executive-summary/:electionId
 * @desc    Get executive summary report
 * @access  Private
 */
router.get('/analytics/executive-summary/:electionId', protect, async (req, res) => {
    try {
        const summary = await analyticsService.generateExecutiveSummary(req.params.electionId);
        res.json({ summary });
    } catch (error) {
        console.error('Executive Summary Error:', error);
        res.status(500).json({ message: 'Failed to generate summary', error: error.message });
    }
});

// ============================================
// CHATBOT ROUTES
// ============================================

/**
 * @route   POST /api/ai/chatbot/message
 * @desc    Send message to AI chatbot (Free: 5 messages/day, Unlimited with credits)
 * @access  Public
 */
router.post('/chatbot/message', async (req, res) => {
    try {
        const { message, context } = req.body;
        
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Check rate limit for free users
        const userId = context?.userId;
        if (userId) {
            const User = require('../models/User');
            const user = await User.findById(userId);
            
            if (user) {
                // Initialize chatbot usage tracking if not exists
                if (!user.chatbotUsage) {
                    user.chatbotUsage = {
                        count: 0,
                        lastReset: new Date()
                    };
                }

                // Reset daily counter if it's a new day
                const today = new Date().toDateString();
                const lastReset = new Date(user.chatbotUsage.lastReset).toDateString();
                
                if (today !== lastReset) {
                    user.chatbotUsage.count = 0;
                    user.chatbotUsage.lastReset = new Date();
                }

                // Check if user exceeded free limit
                if (user.chatbotUsage.count >= 5) {
                    return res.status(429).json({ 
                        message: 'Daily free chatbot limit reached (5 messages). Purchase credits for unlimited access.',
                        limit: 5,
                        used: user.chatbotUsage.count,
                        resetTime: new Date(new Date(user.chatbotUsage.lastReset).getTime() + 24 * 60 * 60 * 1000)
                    });
                }

                // Increment usage counter
                user.chatbotUsage.count += 1;
                await user.save();
            }
        }

        const response = await chatbotService.processMessage(message, context);
        res.json({
            ...response,
            remainingMessages: userId ? (5 - (await User.findById(userId)).chatbotUsage.count) : null
        });
    } catch (error) {
        console.error('Chatbot Error:', error);
        res.status(500).json({ message: 'Failed to process message', error: error.message });
    }
});

/**
 * @route   GET /api/ai/chatbot/quick-help/:userType
 * @desc    Get quick help suggestions
 * @access  Public
 */
router.get('/chatbot/quick-help/:userType', (req, res) => {
    try {
        const suggestions = chatbotService.getQuickHelp(req.params.userType);
        res.json({ suggestions });
    } catch (error) {
        console.error('Quick Help Error:', error);
        res.status(500).json({ message: 'Failed to get suggestions', error: error.message });
    }
});

/**
 * @route   POST /api/ai/chatbot/faq
 * @desc    Generate FAQ answer
 * @access  Public
 */
router.post('/chatbot/faq', async (req, res) => {
    try {
        const { question } = req.body;
        const answer = await chatbotService.generateFAQAnswer(question);
        res.json({ question, answer });
    } catch (error) {
        console.error('FAQ Error:', error);
        res.status(500).json({ message: 'Failed to generate answer', error: error.message });
    }
});

// ============================================
// INSIGHTS ROUTES
// ============================================

/**
 * @route   GET /api/ai/insights/dashboard
 * @desc    Get dashboard insights for user (Costs 10 credits)
 * @access  Private
 */
router.get('/insights/dashboard', protect, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user._id);

        // Check if user has enough credits
        if (user.sharedCredits < 10) {
            return res.status(402).json({ 
                message: 'Insufficient credits. You need 10 credits to access AI Dashboard Insights.',
                required: 10,
                available: user.sharedCredits
            });
        }

        // Deduct 10 credits
        user.sharedCredits -= 10;
        user.creditHistory.push({
            type: 'deduction',
            credits: 10,
            reason: 'AI Dashboard Insights',
            date: new Date()
        });
        await user.save();

        const insights = await insightsService.generateDashboardInsights(req.user._id);
        
        res.json({
            ...insights,
            creditsUsed: 10,
            remainingCredits: user.sharedCredits
        });
    } catch (error) {
        console.error('Dashboard Insights Error:', error);
        res.status(500).json({ message: 'Failed to generate insights', error: error.message });
    }
});

/**
 * @route   GET /api/ai/insights/completion/:electionId
 * @desc    Get completion insights for election
 * @access  Private
 */
router.get('/insights/completion/:electionId', protect, async (req, res) => {
    try {
        const insights = await insightsService.generateCompletionInsights(req.params.electionId);
        res.json(insights);
    } catch (error) {
        console.error('Completion Insights Error:', error);
        res.status(500).json({ message: 'Failed to generate insights', error: error.message });
    }
});

/**
 * @route   GET /api/ai/insights/pricing
 * @desc    Get pricing recommendations
 * @access  Private
 */
router.get('/insights/pricing', protect, async (req, res) => {
    try {
        const recommendations = await insightsService.generatePricingRecommendations(req.user._id);
        res.json(recommendations);
    } catch (error) {
        console.error('Pricing Recommendations Error:', error);
        res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
    }
});

/**
 * @route   POST /api/ai/insights/email
 * @desc    Generate email content
 * @access  Private
 */
router.post('/insights/email', protect, async (req, res) => {
    try {
        const { type, data } = req.body;
        const content = await insightsService.generateEmailContent(type, data);
        res.json(content);
    } catch (error) {
        console.error('Email Content Error:', error);
        res.status(500).json({ message: 'Failed to generate email', error: error.message });
    }
});

module.exports = router;
