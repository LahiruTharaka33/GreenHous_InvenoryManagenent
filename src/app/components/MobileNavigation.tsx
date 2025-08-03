"use client";
import { useState } from "react";
import Link from "next/link";
import InstallButton from "./InstallButton";

export default function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg bg-white shadow-sm border border-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle mobile menu"
      >
        <svg 
          className="w-5 h-5 text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl">
            <div className="p-6">
              {/* Close Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu Items */}
              <nav className="space-y-4">
                <Link
                  href="/auth/signin"
                  onClick={toggleMenu}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={toggleMenu}
                  className="block w-full text-left px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 min-h-[44px] flex items-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/dashboard/admin"
                  onClick={toggleMenu}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  View Demo
                </Link>
                <a
                  href="#features"
                  onClick={toggleMenu}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  Features
                </a>
                <a
                  href="#about"
                  onClick={toggleMenu}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  About
                </a>
              </nav>

              {/* Install App Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Install App</h3>
                <InstallButton />
                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Offline Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Push Notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Native Performance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 