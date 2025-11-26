"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PaymentButton from '@/components/payment/payment';
import { useAuth } from '@/context/AuthContext';
import MobileMenu from '@/components/MobileMenu';

interface PricingPlan {
    planId: string;
    name: string;
    price: number;
    voterLimit: number;
    currency: string;
    description?: string;
    features?: string[];
}

export default function PricingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; voters: string; planId: string } | null>(null);
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPricing();
        
        // Restore selected plan if user just logged in
        if (user) {
            const savedPlan = localStorage.getItem('selectedPlan');
            if (savedPlan) {
                try {
                    const plan = JSON.parse(savedPlan);
                    setSelectedPlan(plan);
                    localStorage.removeItem('selectedPlan'); // Clear after restoring
                } catch (error) {
                    console.error('Error restoring selected plan:', error);
                }
            }
        }
    }, [user]);

    const fetchPricing = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            console.log('🔍 Fetching pricing from:', `${API_URL}/pricing`);
            console.log('🌍 Environment:', process.env.NODE_ENV);
            
            const response = await fetch(`${API_URL}/pricing`, {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });
            
            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.ok);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Pricing data received:', data);
                console.log('✅ Plans count:', data.plans?.length);
                
                if (data.success && data.plans && data.plans.length > 0) {
                    setPlans(data.plans);
                } else {
                    console.error('❌ No plans in response');
                }
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to fetch pricing:', response.statusText, errorText);
            }
        } catch (error: any) {
            console.error('❌ Error fetching pricing:', error);
            console.error('❌ Error details:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan: PricingPlan) => {
        const votersText = plan.voterLimit === -1 ? 'Unlimited Voters' : `${plan.voterLimit} Voters`;
        
        // Check if user is logged in
        if (!user) {
            // Store selected plan and redirect to register
            localStorage.setItem('selectedPlan', JSON.stringify({
                planId: plan.planId,
                name: plan.name,
                price: plan.price,
                voters: votersText
            }));
            router.push('/register?redirect=pricing');
            return;
        }
        
        // User is logged in, allow plan selection
        setSelectedPlan({ 
            name: plan.name, 
            price: plan.price, 
            voters: votersText,
            planId: plan.planId 
        });
    };

    const handlePaymentSuccess = () => {
        // User must be logged in to reach this point
        alert('Payment Successful! Redirecting to create your election...');
        window.location.href = '/dashboard/create-election';
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
            {/* Navigation */}
            <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                                <i className="fas fa-vote-yea text-white text-base sm:text-xl"></i>
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                                PollSync
                            </span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/features" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                                Features
                            </Link>
                            <Link href="/how-it-works" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                                How It Works
                            </Link>
                            <Link href="/pricing" className="text-green-600 font-semibold">
                                Pricing
                            </Link>
                            <Link href="/login" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                                Login
                            </Link>
                            <Link href="/register" className="btn-primary">
                                Get Started Free
                            </Link>
                        </div>
                        <MobileMenu />
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base font-semibold text-green-600 tracking-wide uppercase">Pay Per Election</h2>
                    <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Simple, transparent pricing
                    </p>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                        No subscriptions. Just pay for what you need when you create an election.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading pricing plans...</p>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <p className="text-xl font-semibold text-gray-900 mb-2">Unable to load pricing plans</p>
                        <p className="text-gray-600 mb-4">
                            {error ? `Error: ${error}` : 'Please check your connection and try again'}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
                        </p>
                        <button 
                            onClick={fetchPricing}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid max-w-lg mx-auto gap-8 lg:grid-cols-4 lg:max-w-none">
                        {plans.map((plan, index) => {
                            const votersText = plan.voterLimit === -1 ? 'Unlimited Voters' : `${plan.voterLimit} Voters`;
                            const isRecommended = plan.planId === 'standard';
                            
                            return (
                                <div
                                    key={plan.planId}
                                    className={`flex flex-col rounded-2xl shadow-lg overflow-hidden bg-white border transition-all cursor-pointer relative ${selectedPlan?.name === plan.name
                                            ? 'border-green-500 ring-2 ring-green-500 transform scale-105 z-10'
                                            : 'border-gray-100 hover:shadow-xl hover:-translate-y-1'
                                        }`}
                                    onClick={() => handleSelectPlan(plan)}
                                >
                                    {isRecommended && (
                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-8 py-1 transform rotate-45 translate-x-4 translate-y-4 shadow-md">
                                                BEST
                                            </div>
                                        </div>
                                    )}
                                    <div className="px-6 py-8 sm:p-10 sm:pb-6">
                                        <div>
                                            <h3 className={`inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase ${selectedPlan?.name === plan.name ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {plan.name}
                                            </h3>
                                        </div>
                                        <div className="mt-4 flex items-baseline text-5xl font-extrabold text-gray-900">
                                            {plan.currency} {plan.price.toLocaleString()}
                                        </div>
                                        <p className="mt-5 text-lg text-gray-500">
                                            {plan.description || `For elections with up to ${votersText}`}
                                        </p>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-50 space-y-6 sm:p-10 sm:pt-6">
                                        <ul className="space-y-4">
                                            {plan.features && plan.features.length > 0 ? (
                                                plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <div className="flex-shrink-0">
                                                            <i className="fas fa-check text-green-500"></i>
                                                        </div>
                                                        <p className="ml-3 text-base text-gray-700">{feature}</p>
                                                    </li>
                                                ))
                                            ) : (
                                                <>
                                                    <li className="flex items-start">
                                                        <div className="flex-shrink-0">
                                                            <i className="fas fa-check text-green-500"></i>
                                                        </div>
                                                        <p className="ml-3 text-base text-gray-700">Up to {votersText}</p>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <div className="flex-shrink-0">
                                                            <i className="fas fa-check text-green-500"></i>
                                                        </div>
                                                        <p className="ml-3 text-base text-gray-700">Real-time Results</p>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <div className="flex-shrink-0">
                                                            <i className="fas fa-check text-green-500"></i>
                                                        </div>
                                                        <p className="ml-3 text-base text-gray-700">Email Support</p>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                        <div className="rounded-md shadow">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectPlan(plan);
                                                }}
                                                className={`flex items-center justify-center px-5 py-3 border text-base font-medium rounded-md w-full transition-colors ${selectedPlan?.name === plan.name
                                                        ? 'bg-green-600 text-white hover:bg-green-700 border-transparent'
                                                        : 'bg-white text-green-600 hover:bg-gray-50 border-green-200'
                                                    }`}
                                            >
                                                {selectedPlan?.name === plan.name ? 'Selected' : user ? 'Select Plan' : 'Sign Up to Select'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Payment Section - Only show for logged-in users */}
                {user && selectedPlan && (
                    <div className="mt-16 transition-all duration-500 ease-in-out opacity-100 translate-y-0">
                        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-8 sm:p-10">
                                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                                    Complete Payment
                                </h3>
                                <p className="text-gray-500 text-center mb-8">
                                    You are paying <span className="font-bold text-gray-900">KES {selectedPlan?.price.toLocaleString()}</span> for the <span className="font-bold text-green-600">{selectedPlan?.name}</span> plan.
                                </p>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        M-PESA Phone Number
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">🇰🇪 +254</span>
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            id="phone"
                                            className="focus:ring-green-500 focus:border-green-500 block w-full pl-20 sm:text-sm border-gray-300 rounded-md py-3"
                                            placeholder="712 345 678"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Enter the number to receive the M-PESA prompt.</p>
                                </div>

                                <PaymentButton
                                    amount={selectedPlan?.price.toString() || '0'}
                                    phoneNumber={phoneNumber}
                                    onSuccess={handlePaymentSuccess}
                                />
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 sm:px-10 flex justify-center">
                            <p className="text-xs text-gray-500 flex items-center">
                                <i className="fas fa-lock mr-2"></i>
                                Secure payment via Kopokopo & M-PESA
                            </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sign Up Prompt for non-logged-in users */}
                {!user && selectedPlan && (
                    <div className="mt-16 max-w-2xl mx-auto">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl border-2 border-green-200 overflow-hidden p-8 sm:p-12 text-center">
                            <div className="mb-6">
                                <i className="fas fa-user-plus text-5xl text-green-600"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Create an Account to Continue
                            </h3>
                            <p className="text-gray-600 mb-6">
                                You've selected the <span className="font-bold text-green-600">{selectedPlan.name}</span> plan for <span className="font-bold">KES {selectedPlan.price.toLocaleString()}</span>.
                                <br />
                                Please create an account or log in to complete your purchase.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    href="/register?redirect=pricing"
                                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center"
                                >
                                    <i className="fas fa-user-plus mr-2"></i>
                                    Create Account
                                </Link>
                                <Link 
                                    href="/login?redirect=pricing"
                                    className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center justify-center"
                                >
                                    <i className="fas fa-sign-in-alt mr-2"></i>
                                    Log In
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
