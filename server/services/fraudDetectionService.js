/**
 * AI-Powered Fraud Detection Service
 * Detects suspicious voting patterns and potential fraud
 */

const Vote = require('../models/Vote');
const { generateJSON } = require('../config/geminiService');

/**
 * Analyze voting patterns for fraud detection
 * @param {string} electionId - Election ID to analyze
 * @returns {Promise<object>} - Fraud analysis results
 */
async function analyzeElectionFraud(electionId) {
    try {
        // Gather voting data
        const votes = await Vote.find({ election: electionId })
            .populate('candidate', 'name')
            .lean();

        if (votes.length === 0) {
            return {
                riskLevel: 'low',
                riskScore: 0,
                issues: [],
                recommendations: ['No votes cast yet']
            };
        }

        // Analyze patterns
        const patterns = analyzeVotingPatterns(votes);
        
        // Use AI to detect fraud
        const prompt = `You are an election fraud detection expert. Analyze this voting data and identify potential fraud:

Voting Statistics:
- Total Votes: ${votes.length}
- Unique Voters: ${patterns.uniqueVoters}
- Votes per Minute (avg): ${patterns.votesPerMinute.toFixed(2)}
- Rapid Voting Sequences: ${patterns.rapidVotingCount}
- Time Span: ${patterns.timeSpan} minutes
- Vote Distribution: ${JSON.stringify(patterns.candidateDistribution)}
- Suspicious IP Patterns: ${patterns.suspiciousIPs}
- Duplicate Voter IDs: ${patterns.duplicateVoterIds}

Analyze this data and respond with JSON in this exact format:
{
  "riskLevel": "low|medium|high|critical",
  "riskScore": 0-100,
  "issues": ["issue1", "issue2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "suspiciousActivities": ["activity1", "activity2"]
}`;

        const aiAnalysis = await generateJSON(prompt);
        
        return {
            ...aiAnalysis,
            patterns,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Fraud Detection Error:', error);
        return {
            riskLevel: 'unknown',
            riskScore: 0,
            issues: ['Analysis failed'],
            recommendations: ['Manual review recommended'],
            error: error.message
        };
    }
}

/**
 * Analyze voting patterns from raw vote data
 */
function analyzeVotingPatterns(votes) {
    const voterIds = votes.map(v => v.voterId);
    const uniqueVoters = new Set(voterIds).size;
    const duplicateVoterIds = voterIds.length - uniqueVoters;

    // Time analysis
    const timestamps = votes.map(v => new Date(v.createdAt).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeSpan = (maxTime - minTime) / (1000 * 60); // minutes
    const votesPerMinute = timeSpan > 0 ? votes.length / timeSpan : 0;

    // Rapid voting detection (votes within 5 seconds)
    let rapidVotingCount = 0;
    const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
    for (let i = 1; i < sortedTimestamps.length; i++) {
        if (sortedTimestamps[i] - sortedTimestamps[i - 1] < 5000) {
            rapidVotingCount++;
        }
    }

    // Candidate distribution
    const candidateDistribution = {};
    votes.forEach(v => {
        const candidateName = v.candidate?.name || 'Unknown';
        candidateDistribution[candidateName] = (candidateDistribution[candidateName] || 0) + 1;
    });

    // IP analysis (if available)
    const ips = votes.map(v => v.ipAddress).filter(Boolean);
    const uniqueIPs = new Set(ips).size;
    const suspiciousIPs = ips.length - uniqueIPs;

    return {
        uniqueVoters,
        duplicateVoterIds,
        timeSpan: timeSpan.toFixed(2),
        votesPerMinute,
        rapidVotingCount,
        candidateDistribution,
        suspiciousIPs,
        totalVotes: votes.length
    };
}

/**
 * Real-time fraud check for individual vote
 * @param {object} voteData - Vote data to check
 * @param {string} electionId - Election ID
 * @returns {Promise<object>} - Fraud check result
 */
async function checkVoteFraud(voteData, electionId) {
    try {
        // Check recent votes from same voter
        const recentVotes = await Vote.find({
            election: electionId,
            voterId: voteData.voterId,
            createdAt: { $gte: new Date(Date.now() - 60000) } // Last minute
        });

        // Check IP-based voting
        const ipVotes = voteData.ipAddress ? await Vote.find({
            election: electionId,
            ipAddress: voteData.ipAddress,
            createdAt: { $gte: new Date(Date.now() - 300000) } // Last 5 minutes
        }) : [];

        const flags = [];
        let riskScore = 0;

        if (recentVotes.length > 0) {
            flags.push('Duplicate vote attempt from same voter');
            riskScore += 50;
        }

        if (ipVotes.length > 5) {
            flags.push('Multiple votes from same IP address');
            riskScore += 30;
        }

        return {
            allowed: riskScore < 50,
            riskScore,
            flags,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Vote Fraud Check Error:', error);
        return {
            allowed: true,
            riskScore: 0,
            flags: [],
            error: error.message
        };
    }
}

module.exports = {
    analyzeElectionFraud,
    checkVoteFraud
};
