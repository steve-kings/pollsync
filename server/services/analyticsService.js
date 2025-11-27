/**
 * AI-Powered Smart Analytics Service
 * Generates intelligent insights and predictions for elections
 */

const Election = require('../models/Election');
const Vote = require('../models/Vote');
const { generateJSON, generateContent } = require('../config/geminiService');

/**
 * Generate comprehensive AI insights for an election
 * @param {string} electionId - Election ID
 * @returns {Promise<object>} - AI-generated insights
 */
async function generateElectionInsights(electionId) {
    try {
        const election = await Election.findById(electionId)
            .populate('candidates')
            .lean();

        if (!election) {
            throw new Error('Election not found');
        }

        const votes = await Vote.find({ election: electionId }).lean();
        const stats = calculateElectionStats(election, votes);

        const prompt = `You are an election analytics expert. Analyze this election data and provide insights:

Election: ${election.title}
Status: ${election.status}
Duration: ${new Date(election.startDate).toLocaleDateString()} to ${new Date(election.endDate).toLocaleDateString()}
Total Votes: ${stats.totalVotes}
Voter Turnout: ${stats.turnoutPercentage}%
Candidates: ${stats.candidateCount}

Candidate Performance:
${stats.candidateStats.map(c => `- ${c.name}: ${c.votes} votes (${c.percentage}%)`).join('\n')}

Voting Timeline:
- Peak Hour: ${stats.peakHour}
- Average Votes/Hour: ${stats.avgVotesPerHour}
- Voting Trend: ${stats.votingTrend}

Provide insights in this JSON format:
{
  "summary": "Brief 2-3 sentence overview",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "predictions": {
    "winner": "predicted winner name",
    "confidence": "percentage",
    "reasoning": "why this prediction"
  },
  "recommendations": ["recommendation1", "recommendation2"],
  "trends": ["trend1", "trend2"],
  "voterEngagement": "high|medium|low with explanation"
}`;

        const insights = await generateJSON(prompt);

        return {
            ...insights,
            stats,
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Analytics Generation Error:', error);
        throw error;
    }
}

/**
 * Calculate election statistics
 */
function calculateElectionStats(election, votes) {
    const totalVotes = votes.length;
    const candidateCount = election.candidates.length;
    const voterLimit = election.voterLimit === -1 ? totalVotes : election.voterLimit;
    const turnoutPercentage = voterLimit > 0 ? ((totalVotes / voterLimit) * 100).toFixed(1) : 0;

    // Candidate statistics
    const candidateVotes = {};
    votes.forEach(v => {
        const candidateId = v.candidate.toString();
        candidateVotes[candidateId] = (candidateVotes[candidateId] || 0) + 1;
    });

    const candidateStats = election.candidates.map(c => ({
        name: c.name,
        votes: candidateVotes[c._id.toString()] || 0,
        percentage: totalVotes > 0 ? (((candidateVotes[c._id.toString()] || 0) / totalVotes) * 100).toFixed(1) : 0
    })).sort((a, b) => b.votes - a.votes);

    // Time-based analysis
    const votesByHour = {};
    votes.forEach(v => {
        const hour = new Date(v.createdAt).getHours();
        votesByHour[hour] = (votesByHour[hour] || 0) + 1;
    });

    const peakHour = Object.entries(votesByHour)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const electionDuration = (new Date(election.endDate) - new Date(election.startDate)) / (1000 * 60 * 60);
    const avgVotesPerHour = electionDuration > 0 ? (totalVotes / electionDuration).toFixed(2) : 0;

    // Voting trend
    const recentVotes = votes.filter(v => 
        new Date(v.createdAt) > new Date(Date.now() - 3600000)
    ).length;
    const votingTrend = recentVotes > avgVotesPerHour ? 'increasing' : 'stable';

    return {
        totalVotes,
        candidateCount,
        turnoutPercentage,
        candidateStats,
        peakHour: `${peakHour}:00`,
        avgVotesPerHour,
        votingTrend
    };
}

/**
 * Generate predictive analytics for ongoing election
 * @param {string} electionId - Election ID
 * @returns {Promise<object>} - Predictions
 */
async function generatePredictions(electionId) {
    try {
        const election = await Election.findById(electionId)
            .populate('candidates')
            .lean();

        const votes = await Vote.find({ election: electionId }).lean();
        
        if (votes.length < 10) {
            return {
                message: 'Insufficient data for predictions',
                minimumVotesRequired: 10,
                currentVotes: votes.length
            };
        }

        const stats = calculateElectionStats(election, votes);
        const now = new Date();
        const endDate = new Date(election.endDate);
        const timeRemaining = (endDate - now) / (1000 * 60 * 60); // hours

        const prompt = `As an election forecasting expert, predict the final outcome:

Current Status:
- Total Votes: ${stats.totalVotes}
- Time Remaining: ${timeRemaining.toFixed(1)} hours
- Current Leader: ${stats.candidateStats[0].name} with ${stats.candidateStats[0].votes} votes
- Voting Rate: ${stats.avgVotesPerHour} votes/hour

Candidate Standings:
${stats.candidateStats.map((c, i) => `${i + 1}. ${c.name}: ${c.votes} votes (${c.percentage}%)`).join('\n')}

Predict final results in JSON:
{
  "projectedWinner": "candidate name",
  "confidence": "percentage",
  "projectedFinalVotes": {
    "candidate1": number,
    "candidate2": number
  },
  "keyFactors": ["factor1", "factor2"],
  "uncertainties": ["uncertainty1", "uncertainty2"]
}`;

        const predictions = await generateJSON(prompt);

        return {
            ...predictions,
            currentStats: stats,
            timeRemaining: `${timeRemaining.toFixed(1)} hours`,
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Prediction Error:', error);
        throw error;
    }
}

/**
 * Generate executive summary report
 * @param {string} electionId - Election ID
 * @returns {Promise<string>} - Formatted report
 */
async function generateExecutiveSummary(electionId) {
    try {
        const insights = await generateElectionInsights(electionId);
        
        const prompt = `Create a professional executive summary report for this election:

${JSON.stringify(insights, null, 2)}

Format as a clear, professional report with sections:
1. Executive Summary
2. Key Findings
3. Performance Analysis
4. Recommendations

Keep it concise and business-focused.`;

        const summary = await generateContent(prompt);
        return summary;

    } catch (error) {
        console.error('Executive Summary Error:', error);
        throw error;
    }
}

module.exports = {
    generateElectionInsights,
    generatePredictions,
    generateExecutiveSummary
};
