"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Hamburger Button - Always visible */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg"
                aria-label="Toggle menu"
                style={{ position: 'relative', zIndex: 10000 }}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Mobile Menu Overlay - Covers everything */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 md:hidden"
                    onClick={closeMenu}
                    style={{ 
                        zIndex: 99998,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}
                />
            )}

            {/* Mobile Menu Panel - Slides from right */}
            <div
                className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ 
                    zIndex: 99999,
                    position: 'fixed',
                    height: '100vh',
                    overflowY: 'auto'
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                        <Link href="/" onClick={closeMenu} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                                <i className="fas fa-vote-yea text-white text-sm"></i>
                            </div>
                            <span className="text-xl font-bold text-gray-900">PollSync</span>
                        </Link>
                        <button
                            onClick={closeMenu}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Close menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto p-6">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/features"
                                    onClick={closeMenu}
                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
                                >
                                    <i className="fas fa-star w-6 text-center mr-3"></i>
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/how-it-works"
                                    onClick={closeMenu}
                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
                                >
                                    <i className="fas fa-cog w-6 text-center mr-3"></i>
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pricing"
                                    onClick={closeMenu}
                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
                                >
                                    <i className="fas fa-tag w-6 text-center mr-3"></i>
                                    Pricing
                                </Link>
                            </li>
                            <li className="pt-4 border-t border-gray-200">
                                <Link
                                    href="/login"
                                    onClick={closeMenu}
                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
                                >
                                    <i className="fas fa-sign-in-alt w-6 text-center mr-3"></i>
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* CTA Button */}
                    <div className="p-6 border-t border-gray-200">
                        <Link
                            href="/pricing"
                            onClick={closeMenu}
                            className="block w-full btn-primary text-center"
                        >
                            <i className="fas fa-rocket mr-2"></i>
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
