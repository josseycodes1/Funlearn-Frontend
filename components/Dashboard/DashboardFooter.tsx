// components/DashboardFooter.tsx
"use client";

interface DashboardFooterProps {
  className?: string;
}

export default function DashboardFooter({ className = "" }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-gray-200 py-3 md:py-4 ${className}`}>
      <div className="px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <div className="text-xs md:text-sm text-gray-600 text-center md:text-left">
            © {currentYear} Funlearn. All rights reserved.
          </div>
          <div className="flex items-center justify-center space-x-3 md:space-x-4 text-xs md:text-sm text-gray-600">
            <a href="#" className="hover:text-funlearn6 transition-colors whitespace-nowrap">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-funlearn6 transition-colors whitespace-nowrap">
              Terms of Service
            </a>
            <a href="#" className="hover:text-funlearn6 transition-colors whitespace-nowrap">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}