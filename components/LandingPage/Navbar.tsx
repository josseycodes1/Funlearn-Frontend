'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-lilac-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-black">Funlearn</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-funlearn8 font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-funlearn8 font-medium">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-gray-700 hover:text-funlearn8 font-medium">
              Reviews
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-funlearn8 font-medium"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-funlearn8 text-white px-4 py-2 rounded-lg font-medium hover:bg-funlearn9 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-funlearn8 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-lilac-100">
              <Link href="#features" className="block px-3 py-2 text-gray-700 hover:text-lilac-600">
                Features
              </Link>
              <Link href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:text-lilac-600">
                How It Works
              </Link>
              <Link href="#testimonials" className="block px-3 py-2 text-gray-700 hover:text-lilac-600">
                Reviews
              </Link>
              <div className="pt-4 space-y-2">
                <Link 
                  href="/login" 
                  className="block px-3 py-2 text-gray-700 hover:text-lilac-600"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="block px-3 py-2 bg-funlearn8 text-white rounded-lg text-center font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}