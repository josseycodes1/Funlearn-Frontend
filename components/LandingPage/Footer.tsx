import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-funlearn2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand - Full width on mobile, 2 cols on desktop */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-gray-900 mb-4 block">
              Funlearn
            </Link>
            <p className="text-gray-600 max-w-md text-sm">
              Making learning enjoyable for students through gamification, AI-powered tools, and collaborative features.
            </p>
          </div>

          {/* Links - Stack vertically on mobile */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><Link href="#features" className="hover:text-funlearn8 transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-funlearn8 transition-colors">How It Works</Link></li>
              <li><Link href="#testimonials" className="hover:text-funlearn8 transition-colors">Reviews</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><Link href="/about" className="hover:text-funlearn8 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-funlearn8 transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-funlearn8 transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom section - stacked on mobile */}
        <div className="border-t border-funlearn2 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-500 text-sm text-center md:text-left">
            © 2024 Funlearn. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-funlearn8 transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-funlearn8 transition-colors text-sm">
              Facebook
            </a>
            <a href="#" className="text-gray-400 hover:text-funlearn8 transition-colors text-sm">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}