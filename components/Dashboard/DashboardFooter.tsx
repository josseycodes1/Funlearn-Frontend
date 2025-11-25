// components/DashboardFooter.tsx
"use client";

interface DashboardFooterProps {
  className?: string;
}

export default function DashboardFooter({ className = "" }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-gray-200 py-4 ${className}`}>
      <div className="px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-gray-600 mb-2 md:mb-0">
            © {currentYear} Funlearn. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <a href="#" className="hover:text-funlearn6 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-funlearn6 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-funlearn6 transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}