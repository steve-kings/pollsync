/**
 * Automated Insights Service
 * Generates automated insights and recommendations
 */

const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { generateJSON, generateContent } = require('../config/geminiService');

/**
 * Generate dashboard insights for user
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Dashboard insights
 */
async function generateDashboardInsights(userId) {
    try {
        const user = await User.findById(userId).lean();
        const elections = await Election.find({ organizer: userId }).lean();
        const transactions = await Transaction.find({ userId }).lean();

        // Calculate statistics
        const stats = {
            totalElections: elections.length,
            activeElections: elections.filter(e => e.status === 'active').length,
            completedElections: elections.filter(e => e.status === 'completed').length,
            totalSpent: transactions
                .filter(t => t.status === 'Success')
                .reduce((sum, t) => sum + (t.amount || 0), 0),
            availableCredits: user.sharedCredits || 0
        };

        // Get vote counts
        const votePromises = elections.map(e => 
            Vote.countDocuments({ election: e._id })
        );
        const voteCounts = await Promise.all(votePromises);
        stats.totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

        const prompt = `As a platform analytics expert, provide insights for this user's dashboard:

User Statistics:
- Total Elections Created: ${stats.totalElections}
- Active Elections: ${stats.activeElections}
- Completed Elections: ${stats.completedElections}
- Total Votes Received: ${stats.totalVotes}
- Available Credits: ${stats.availableCredits}
- Total Spent: KES ${stats.totalSpent}

Recent Activity:
- Last Election: ${elections[0]?.title || 'None'}
- Account Age: ${user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0} days

Provide insights in JSON:
{
  "summary": "Brief overview of user's activity",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "recommendations": ["recommendation1", "recommendation2"],
  "tips": ["tip1", "tip2"],
  "nextSteps": ["step1", "step2"]
}`;

        const insights = await generateJSON(prompt);

        return {
            ...insights,
            stats,
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Dashboard Insights Error:', error);
        throw error;
    }
}

/**
 * Generate insights for completed election
 * @param {string} electionId - Election ID
 * @returns {Promise<object>} - Election insights
 */
async function generateCompletionInsights(electionId) {
    try {
        const election = await Election.findById(electionId)
            .populate('candidates')
            .lean();

        const votes = await Vote.find({ election: electionId }).lean();

        // Calculate metrics
        const candidateVotes = {};
        votes.forEach(v => {
            const candidateId = v.candidate.toString();
            candidateVotes[candidateId] = (candidateVotes[candidateId] || 0) + 1;
        });

        const results = election.candidates.map(c => ({
            name: c.name,
            votes: candidateVotes[c._id.toString()] || 0,
            percentage: votes.length > 0 ? (((candidateVotes[c._id.toString()] || 0) / votes.length) * 100).toFixed(1) : 0
        })).sort((a, b) => b.votes - a.votes);

        const winner = results[0];
        const margin = results.length > 1 ? winner.votes - results[1].votes : winner.votes;

        const prompt = `Analyze this completed election and provide insights:

Election: ${election.title}
Total Votes: ${votes.length}
Voter Limit: ${election.voterLimit === -1 ? 'Unlimited' : election.voterLimit}
Turnout: ${election.voterLimit > 0 ? ((votes.length / election.voterLimit) * 100).toFixed(1) : 'N/A'}%

Results:
${results.map((r, i) => `${i + 1}. ${r.name}: ${r.votes} votes (${r.percentage}%)`).join('\n')}

Winner: ${winner.name}
Winning Margin: ${margin} votes

Provide completion insights in JSON:
{
  "summary": "Brief summary of election outcome",
  "winnerAnalysis": "Analysis of why winner won",
  "turnoutAnalysis": "Analysis of voter turnout",
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"],
  "recommendations": ["recommendation1", "recommendation2"],
  "successMetrics": {
    "participationRate": "high|medium|low",
    "competitiveness": "high|medium|low",
    "overallSuccess": "excellent|good|fair|poor"
  }
}`;

        const insights = await generateJSON(prompt);

        return {
            ...insights,
            results,
            winner: winner.name,
            totalVotes: votes.length,
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Completion Insights Error:', error);
        throw error;
    }
}

/**
 * Generate pricing recommendations for user
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Pricing recommendations
 */
async function generatePricingRecommendations(userId) {
    try {
        const user = await User.findById(userId).lean();
        const elections = await Election.find({ organizer: userId }).lean();
        const transactions = await Transaction.find({ userId }).lean();

        // Calculate usage patterns
        const avgVotersPerElection = elections.length > 0
            ? elections.reduce((sum, e) => sum + (e.voterLimit === -1 ? 100 : e.voterLimit), 0) / elections.length
            : 0;

        const electionsPerMonth = elections.length > 0
            ? elections.length / (Math.max(1, Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 30))))
            : 0;

        const prompt = `As a pricing consultant, recommend the best package for this user:

Usage Pattern:
- Elections Created: ${elections.length}
- Average Voters per Election: ${avgVotersPerElection.toFixed(0)}
- Elections per Month: ${electionsPerMonth.toFixed(1)}
- Current Credits: ${user.sharedCredits || 0}
- Total Spent: KES ${transactions.filter(t => t.status === 'Success').reduce((sum, t) => sum + (t.amount || 0), 0)}

Available Packages:
1. Basic (50 voters) - KES 500
2. Standard (200 voters) - KES 1,500
3. Premium (500 voters) - KES 3,000
4. Enterprise (Unlimited) - KES 5,000

Provide recommendations in JSON:
{
  "recommendedPackage": "package name",
  "reasoning": "why this package",
  "costSavings": "potential savings explanation",
  "alternativeOptions": ["option1", "option2"],
  "usageTips": ["tip1", "tip2"]
}`;

        const recommendations = await generateJSON(prompt);

        return {
            ...recommendations,
            currentUsage: {
                avgVotersPerElection: avgVotersPerElection.toFixed(0),
                electionsPerMonth: electionsPerMonth.toFixed(1)
            },
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Pricing Recommendations Error:', error);
        throw error;
    }
}

/**
 * Generate automated email content
 * @param {string} type - Email type (welcome, reminder, results, etc.)
 * @param {object} data - Email data
 * @returns {Promise<object>} - Email content
 */
async function generateEmailContent(type, data) {
    try {
        let prompt = '';

        switch (type) {
            case 'welcome':
                prompt = `Write a warm welcome email for a new PollSync user named ${data.username}. Include:
- Welcome message
- Brief platform overview
- Next steps to create first election
- Support contact

Keep it friendly and concise.`;
                break;

            case 'election_reminder':
                prompt = `Write a voting reminder email for election "${data.electionTitle}". Include:
- Reminder that election is active
- Voting deadline: ${data.deadline}
- Voting link
- Brief instructions

Keep it clear and urgent but friendly.`;
                break;

            case 'results_summary':
                prompt = `Write an election results email for "${data.electionTitle}". Include:
- Congratulations message
- Winner: ${data.winner}
- Total votes: ${data.totalVotes}
- Brief summary
- Link to full results

Keep it professional and celebratory.`;
                break;

            default:
                prompt = `Write a professional email for: ${type}`;
        }

        const content = await generateContent(prompt);

        return {
            subject: `PollSync: ${type.replace('_', ' ').toUpperCase()}`,
            body: content,
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Email Content Generation Error:', error);
        throw error;
    }
}

module.exports = {
    generateDashboardInsights,
    generateCompletionInsights,
    generatePricingRecommendations,
    generateEmailContent
};
