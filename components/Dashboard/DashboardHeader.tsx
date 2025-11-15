// components/Dashboard/DashboardHeader.tsx
"use client";
import { useSidebar } from "@/contexts/SidebarContext";

interface DashboardHeaderProps {
  user: any;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showGeneralSidebar?: boolean;
}

export default function DashboardHeader({
  user,
  sidebarOpen,
  setSidebarOpen,
  showGeneralSidebar = true,
}: DashboardHeaderProps) {
  const { setShowGeneralSidebar, setSidebarCollapsed } = useSidebar();

  const handleToggleGeneralSidebar = () => {
    setShowGeneralSidebar(true);
    setSidebarCollapsed(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Toggle General Sidebar Button - Only show when in chatbot and general sidebar is hidden */}
          {!showGeneralSidebar && (
            <button
              onClick={handleToggleGeneralSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 border border-gray-300"
              title="Show Main Sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.userName || "Student"}! 👋
            </h1>
            <p className="text-sm text-gray-600">
              Ready to continue your learning adventure?
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 0-6 6v2.25l-2 2V15h15v-.75l-2-2V9.75a6 6 0 0 0-6-6z"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-funlearn8 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.userName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
