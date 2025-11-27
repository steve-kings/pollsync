/**
 * AI Chatbot Service
 * Provides 24/7 support for voters and organizers
 */

const { chat, generateContent } = require('../config/geminiService');
const Election = require('../models/Election');
const User = require('../models/User');

/**
 * Process chatbot message
 * @param {string} message - User message
 * @param {object} context - Context (userId, electionId, etc.)
 * @returns {Promise<object>} - Chatbot response
 */
async function processMessage(message, context = {}) {
    try {
        // Build context-aware system prompt
        const systemContext = await buildSystemContext(context);
        
        const fullPrompt = `${systemContext}

User Question: ${message}

Provide a helpful, friendly, and concise response. If you don't know something specific about this platform, be honest and suggest contacting support.`;

        const response = await generateContent(fullPrompt);

        return {
            message: response,
            timestamp: new Date(),
            context: context
        };

    } catch (error) {
        console.error('Chatbot Error:', error);
        return {
            message: "I'm having trouble processing your request right now. Please try again or contact support at kingscreationagency635@gmail.com",
            timestamp: new Date(),
            error: true
        };
    }
}

/**
 * Build context for chatbot based on user and election data
 */
async function buildSystemContext(context) {
    let systemPrompt = `You are PollSync AI Assistant, a helpful chatbot for the PollSync online voting platform.

Platform Information:
- PollSync is a secure online voting platform
- Users can create elections, manage voters, and view real-time results
- We offer different pricing plans with voter credits
- Support email: kingscreationagency635@gmail.com

Your role:
- Answer questions about how to use PollSync
- Help with voting process
- Explain features and pricing
- Troubleshoot common issues
- Be friendly, professional, and concise
`;

    // Add user-specific context
    if (context.userId) {
        try {
            const user = await User.findById(context.userId).lean();
            if (user) {
                const creditSummary = user.sharedCredits || 0;
                systemPrompt += `\nUser Context:
- User: ${user.username}
- Available Credits: ${creditSummary}
- Account Type: ${user.role}
`;
            }
        } catch (error) {
            console.error('Error fetching user context:', error);
        }
    }

    // Add election-specific context
    if (context.electionId) {
        try {
            const election = await Election.findById(context.electionId).lean();
            if (election) {
                systemPrompt += `\nElection Context:
- Election: ${election.title}
- Status: ${election.status}
- Organization: ${election.organization}
- Dates: ${new Date(election.startDate).toLocaleDateString()} to ${new Date(election.endDate).toLocaleDateString()}
`;
            }
        } catch (error) {
            console.error('Error fetching election context:', error);
        }
    }

    return systemPrompt;
}

/**
 * Get quick help suggestions based on user type
 * @param {string} userType - 'voter' or 'organizer'
 * @returns {array} - Array of suggested questions
 */
function getQuickHelp(userType = 'voter') {
    const voterQuestions = [
        "How do I vote in an election?",
        "Can I change my vote after submitting?",
        "Is my vote anonymous?",
        "What if I forgot my voter ID?",
        "How do I know if my vote was counted?"
    ];

    const organizerQuestions = [
        "How do I create an election?",
        "How do I add voters to my election?",
        "What are voter credits?",
        "How do I share my election link?",
        "Can I see who voted?",
        "How do I export election results?"
    ];

    return userType === 'organizer' ? organizerQuestions : voterQuestions;
}

/**
 * Generate FAQ answers using AI
 * @param {string} question - FAQ question
 * @returns {Promise<string>} - AI-generated answer
 */
async function generateFAQAnswer(question) {
    try {
        const prompt = `You are a PollSync platform expert. Answer this FAQ question clearly and concisely:

Question: ${question}

Platform Context:
- PollSync is an online voting platform
- Features: Real-time results, secure voting, voter management, analytics
- Pricing: Credit-based system with different packages
- Support: kingscreationagency635@gmail.com

Provide a clear, helpful answer in 2-3 sentences.`;

        const answer = await generateContent(prompt);
        return answer;

    } catch (error) {
        console.error('FAQ Generation Error:', error);
        return "Please contact our support team at kingscreationagency635@gmail.com for assistance with this question.";
    }
}

/**
 * Analyze user intent from message
 * @param {string} message - User message
 * @returns {Promise<object>} - Intent analysis
 */
async function analyzeIntent(message) {
    try {
        const prompt = `Analyze the user's intent from this message:

"${message}"

Respond with JSON:
{
  "intent": "voting|creating_election|pricing|technical_issue|general_inquiry",
  "urgency": "low|medium|high",
  "sentiment": "positive|neutral|negative",
  "suggestedAction": "brief suggestion"
}`;

        const intent = await generateContent(prompt);
        
        // Try to parse as JSON, fallback to default
        try {
            return JSON.parse(intent.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
        } catch {
            return {
                intent: 'general_inquiry',
                urgency: 'low',
                sentiment: 'neutral',
                suggestedAction: 'Provide general assistance'
            };
        }

    } catch (error) {
        console.error('Intent Analysis Error:', error);
        return {
            intent: 'unknown',
            urgency: 'low',
            sentiment: 'neutral',
            suggestedAction: 'Provide general assistance'
        };
    }
}

module.exports = {
    processMessage,
    getQuickHelp,
    generateFAQAnswer,
    analyzeIntent
};
