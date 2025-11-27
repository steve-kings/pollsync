"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface DashboardInsights {
    summary: string;
    highlights: string[];
    recommendations: string[];
    tips: string[];
    nextSteps: string[];
    stats: any;
}

export default function AIInsightsPanel() {
    const [insights, setInsights] = useState<DashboardInsights | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            const res = await api.get('/ai/insights/dashboard');
            setInsights(res.data);
        } catch (error) {
            console.error('Failed to load insights:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-brain text-white"></i>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
                        <p className="text-sm text-gray-600">Powered by Gemini AI</p>
                    </div>
                </div>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-purple-200 rounded w-3/4"></div>
                    <div className="h-4 bg-purple-200 rounded w-1/2"></div>
                    <div className="h-4 bg-purple-200 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    if (!insights) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <i className="fas fa-brain text-white"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
                            <p className="text-sm text-gray-600">Powered by Gemini AI</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    </button>
                </div>

                {/* Summary */}
                <div className="bg-white/60 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{insights.summary}</p>
                </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="px-6 pb-6 space-y-4">
                    {/* Highlights */}
                    {insights.highlights && insights.highlights.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <i className="fas fa-star text-yellow-500 mr-2"></i>
                                Key Highlights
                            </h4>
                            <ul className="space-y-2">
                                {insights.highlights.map((highlight, index) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start">
                                        <span className="text-purple-600 mr-2">•</span>
                                        <span>{highlight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {insights.recommendations && insights.recommendations.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                                Recommendations
                            </h4>
                            <ul className="space-y-2">
                                {insights.recommendations.map((rec, index) => (
                                    <li key={index} className="text-sm text-gray-700 bg-white/60 rounded-lg p-3">
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Next Steps */}
                    {insights.nextSteps && insights.nextSteps.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <i className="fas fa-tasks text-green-500 mr-2"></i>
                                Next Steps
                            </h4>
                            <div className="space-y-2">
                                {insights.nextSteps.map((step, index) => (
                                    <div key={index} className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm text-gray-700">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Refresh Button */}
                    <button
                        onClick={loadInsights}
                        className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                        <i className="fas fa-sync-alt mr-2"></i>
                        Refresh Insights
                    </button>
                </div>
            )}
        </div>
    );
}
