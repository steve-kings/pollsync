"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface DashboardInsights {
    summary: string;
    highlights: string[];
    recommendations: string[];
    tips: string[];
    nextSteps: string[];
    stats: any;
    creditsUsed?: number;
    remainingCredits?: number;
}

export default function AIInsightsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [insights, setInsights] = useState<DashboardInsights | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userCredits, setUserCredits] = useState<number>(0);

    useEffect(() => {
        loadUserCredits();
    }, []);

    const loadUserCredits = async () => {
        try {
            const res = await api.get('/auth/credits');
            setUserCredits(res.data.sharedCredits || 0);
        } catch (error) {
            console.error('Failed to load credits:', error);
        }
    };

    const generateInsights = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const res = await api.get('/ai/insights/dashboard');
            setInsights(res.data);
            setUserCredits(res.data.remainingCredits);
        } catch (error: any) {
            if (error.response?.status === 402) {
                setError(error.response.data.message);
            } else {
                setError('Failed to generate insights. Please try again.');
            }
            console.error('Insights generation failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="text-gray-600 hover:text-purple-600 p-2">
                                <i className="fas fa-arrow-left"></i>
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">AI Dashboard Insights</h1>
                                <p className="text-xs text-gray-500">Powered by Gemini AI</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                                <p className="text-xs text-purple-600 font-medium">Your Credits</p>
                                <p className="text-lg font-bold text-purple-900">{userCredits}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Pricing Info Banner */}
                <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-brain text-white text-xl"></i>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Dashboard Insights</h2>
                            <p className="text-sm text-gray-700 mb-3">
                                Get personalized insights, recommendations, and next steps powered by advanced AI analysis of your election data.
                            </p>
                            <div className="flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <i className="fas fa-check-circle text-green-600"></i>
                                    <span className="text-gray-700">Activity Summary</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <i className="fas fa-check-circle text-green-600"></i>
                                    <span className="text-gray-700">Key Highlights</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <i className="fas fa-check-circle text-green-600"></i>
                                    <span className="text-gray-700">Smart Recommendations</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <i className="fas fa-check-circle text-green-600"></i>
                                    <span className="text-gray-700">Next Steps</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cost Info */}
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <i className="fas fa-coins text-yellow-600 text-2xl"></i>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Cost: 10 Voter Credits</p>
                            <p className="text-xs text-gray-600">One-time payment per analysis</p>
                        </div>
                    </div>
                    {userCredits < 10 && (
                        <Link href="/pricing" className="btn-primary text-sm py-2 px-4">
                            <i className="fas fa-shopping-cart mr-2"></i>
                            Buy Credits
                        </Link>
                    )}
                </div>

                {/* Generate Button */}
                {!insights && (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fas fa-brain text-purple-600 text-4xl"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Get AI Insights?</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Click the button below to generate personalized insights about your election activity, performance, and recommendations.
                        </p>
                        
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={generateInsights}
                            disabled={isLoading || userCredits < 10}
                            className="btn-primary text-lg py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Generating Insights...
                                </>
                            ) : userCredits < 10 ? (
                                <>
                                    <i className="fas fa-lock mr-2"></i>
                                    Insufficient Credits
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-magic mr-2"></i>
                                    Generate AI Insights (10 Credits)
                                </>
                            )}
                        </button>

                        {userCredits < 10 && (
                            <p className="text-sm text-gray-500 mt-4">
                                You need {10 - userCredits} more credits. <Link href="/pricing" className="text-purple-600 hover:underline">Purchase credits</Link>
                            </p>
                        )}
                    </div>
                )}

                {/* Insights Display */}
                {insights && (
                    <div className="space-y-6">
                        {/* Success Banner */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                                <div>
                                    <p className="text-sm font-bold text-green-900">Insights Generated Successfully!</p>
                                    <p className="text-xs text-green-700">10 credits deducted. Remaining: {insights.remainingCredits}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setInsights(null)}
                                className="btn-secondary text-sm py-2 px-4"
                            >
                                <i className="fas fa-sync-alt mr-2"></i>
                                Generate New
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <i className="fas fa-chart-line text-purple-600 mr-2"></i>
                                Summary
                            </h3>
                            <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
                        </div>

                        {/* Highlights */}
                        {insights.highlights && insights.highlights.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <i className="fas fa-star text-yellow-500 mr-2"></i>
                                    Key Highlights
                                </h3>
                                <ul className="space-y-3">
                                    {insights.highlights.map((highlight, index) => (
                                        <li key={index} className="flex items-start space-x-3 bg-yellow-50 rounded-lg p-4">
                                            <span className="text-yellow-600 font-bold">{index + 1}.</span>
                                            <span className="text-gray-700">{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recommendations */}
                        {insights.recommendations && insights.recommendations.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <i className="fas fa-lightbulb text-blue-500 mr-2"></i>
                                    Recommendations
                                </h3>
                                <div className="space-y-3">
                                    {insights.recommendations.map((rec, index) => (
                                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-gray-700">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Next Steps */}
                        {insights.nextSteps && insights.nextSteps.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <i className="fas fa-tasks text-green-500 mr-2"></i>
                                    Next Steps
                                </h3>
                                <div className="space-y-3">
                                    {insights.nextSteps.map((step, index) => (
                                        <div key={index} className="flex items-center space-x-4 bg-green-50 rounded-lg p-4">
                                            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <p className="text-gray-700">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
