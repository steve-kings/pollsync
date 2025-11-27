"use client";

import { useState } from 'react';
import api from '@/lib/api';

interface FraudAnalysis {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    issues: string[];
    recommendations: string[];
    suspiciousActivities?: string[];
    patterns?: any;
}

export default function FraudDetectionPanel({ electionId }: { electionId: string }) {
    const [analysis, setAnalysis] = useState<FraudAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userCredits, setUserCredits] = useState<number>(0);

    const loadUserCredits = async () => {
        try {
            const res = await api.get('/auth/credits');
            setUserCredits(res.data.sharedCredits || 0);
        } catch (error) {
            console.error('Failed to load credits:', error);
        }
    };

    const analyzeElection = async () => {
        setIsLoading(true);
        setIsVisible(true);
        setError(null);
        
        try {
            const res = await api.get(`/ai/fraud/analyze/${electionId}`);
            setAnalysis(res.data);
            setUserCredits(res.data.remainingCredits);
        } catch (error: any) {
            if (error.response?.status === 402) {
                setError(error.response.data.message);
                await loadUserCredits();
            } else {
                setError('Failed to analyze election. Please try again.');
            }
            console.error('Fraud analysis failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low': return 'green';
            case 'medium': return 'yellow';
            case 'high': return 'orange';
            case 'critical': return 'red';
            default: return 'gray';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'low': return 'fa-shield-alt';
            case 'medium': return 'fa-exclamation-triangle';
            case 'high': return 'fa-exclamation-circle';
            case 'critical': return 'fa-skull-crossbones';
            default: return 'fa-question-circle';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-shield-alt text-white"></i>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">AI Fraud Detection</h3>
                        <p className="text-sm text-gray-600">Powered by Gemini AI • Costs 10 Credits</p>
                    </div>
                </div>
                <button
                    onClick={analyzeElection}
                    disabled={isLoading}
                    className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-search mr-2"></i>
                            Analyze (10 Credits)
                        </>
                    )}
                </button>
            </div>

            {/* Cost Warning */}
            {!analysis && !isVisible && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-2">
                    <i className="fas fa-coins text-yellow-600"></i>
                    <p className="text-sm text-gray-700">
                        This analysis costs <strong>10 voter credits</strong>. Make sure you have sufficient credits before proceeding.
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{error}</p>
                    {userCredits < 10 && (
                        <a href="/pricing" className="text-sm text-red-600 hover:underline mt-2 inline-block">
                            Purchase more credits →
                        </a>
                    )}
                </div>
            )}

            {isVisible && analysis && (
                <div className="space-y-4 mt-6">
                    {/* Risk Score */}
                    <div className={`bg-${getRiskColor(analysis.riskLevel)}-50 border-2 border-${getRiskColor(analysis.riskLevel)}-200 rounded-lg p-4`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <i className={`fas ${getRiskIcon(analysis.riskLevel)} text-${getRiskColor(analysis.riskLevel)}-600 text-2xl`}></i>
                                <div>
                                    <p className="text-sm text-gray-600">Risk Level</p>
                                    <p className={`text-2xl font-bold text-${getRiskColor(analysis.riskLevel)}-600 uppercase`}>
                                        {analysis.riskLevel}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Risk Score</p>
                                <p className={`text-3xl font-bold text-${getRiskColor(analysis.riskLevel)}-600`}>
                                    {analysis.riskScore}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Issues */}
                    {analysis.issues && analysis.issues.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                                Detected Issues
                            </h4>
                            <ul className="space-y-2">
                                {analysis.issues.map((issue, index) => (
                                    <li key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-gray-700">
                                        <i className="fas fa-times-circle text-red-500 mr-2"></i>
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Suspicious Activities */}
                    {analysis.suspiciousActivities && analysis.suspiciousActivities.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <i className="fas fa-user-secret text-orange-500 mr-2"></i>
                                Suspicious Activities
                            </h4>
                            <ul className="space-y-2">
                                {analysis.suspiciousActivities.map((activity, index) => (
                                    <li key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-gray-700">
                                        {activity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <i className="fas fa-lightbulb text-blue-500 mr-2"></i>
                                Recommendations
                            </h4>
                            <ul className="space-y-2">
                                {analysis.recommendations.map((rec, index) => (
                                    <li key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                                        <i className="fas fa-check-circle text-blue-500 mr-2"></i>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Patterns */}
                    {analysis.patterns && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <i className="fas fa-chart-line text-purple-500 mr-2"></i>
                                Voting Patterns
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-600">Total Votes</p>
                                    <p className="text-lg font-bold text-gray-900">{analysis.patterns.totalVotes}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-600">Unique Voters</p>
                                    <p className="text-lg font-bold text-gray-900">{analysis.patterns.uniqueVoters}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-600">Votes/Min</p>
                                    <p className="text-lg font-bold text-gray-900">{analysis.patterns.votesPerMinute?.toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-600">Rapid Votes</p>
                                    <p className="text-lg font-bold text-gray-900">{analysis.patterns.rapidVotingCount}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {analysis.riskLevel === 'low' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <i className="fas fa-check-circle text-green-600 text-3xl mb-2"></i>
                            <p className="text-sm font-medium text-green-900">
                                No significant fraud indicators detected. Election appears secure.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {!isVisible && (
                <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-shield-alt text-4xl mb-3 text-gray-300"></i>
                    <p className="text-sm">Click "Analyze Election" to check for fraud indicators</p>
                </div>
            )}
        </div>
    );
}
