"use client";
import { useSidebar } from "@/contexts/SidebarContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showGeneralSidebar?: boolean;
  onTabChange?: (tab: string) => void; 
}

interface User {
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function DashboardHeader({
  sidebarOpen,
  setSidebarOpen,
  showGeneralSidebar = true,
  onTabChange, // Add this prop
}: DashboardHeaderProps) {
  const { setShowGeneralSidebar, setSidebarCollapsed } = useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleToggleGeneralSidebar = () => {
    setShowGeneralSidebar(true);
    setSidebarCollapsed(false);
  };

  // Navigation function
  const handleNavigation = (tab: string) => {
    setMobileMenuOpen(false);
    
    if (onTabChange) {
      onTabChange(tab); // Use the passed function if available
    } else {
      // Fallback navigation
      switch (tab) {
        case "overview":
          router.push("/dashboard");
          break;
        case "chatbot":
          router.push("/dashboard/chatbot");
          break;
        case "quiz":
          router.push("/dashboard/quizpage");
          break;
        case "chatroom":
          router.push("/dashboard/chatroom");
          break;
        case "leaderboard":
          router.push("/dashboard/leaderboard");
          break;
        case "profile":
          router.push("/dashboard/profile-settings");
          break;
        case "settings":
          router.push("/dashboard/settings");
          break;
        default:
          router.push("/dashboard");
      }
    }
  };

  // Get user's first initial for the avatar
  const getUserInitial = () => {
    if (!user) return "U";
    
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user.userName) {
      return user.userName.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get display name
  const getDisplayName = () => {
    if (!user) return "Student";
    
    if (user.firstName) {
      return user.firstName;
    }
    if (user.userName) {
      return user.userName;
    }
    return "Student";
  };

  // Mobile menu items with icons and full text
  const mobileMenuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "chatbot", label: "AI Chatbot", icon: "🤖" },
    { id: "quiz", label: "Quiz", icon: "📝" },
    { id: "chatroom", label: "Chat Room", icon: "💬" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Mobile menu button - NOW ON LEFT SIDE */}
          <div 
            className="text-purple-600 text-2xl cursor-pointer md:hidden z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </div>

          {/* Toggle General Sidebar Button */}
          {!showGeneralSidebar && (
            <button
              onClick={handleToggleGeneralSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 border border-gray-300 hidden sm:block"
              title="Show Main Sidebar"
            >
              <svg
                className="w-4 h-4 text-purple-600"
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
            <h1 className="text-base md:text-xl font-semibold text-gray-900">
              Welcome back, {getDisplayName()}! 
            </h1>
            <p className="text-xs md:text-sm text-gray-600 hidden sm:block">
              Ready to continue your learning adventure?
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Notifications */}
          <button className="relative p-1 md:p-2 rounded-lg hover:bg-gray-100">
            <svg
              className="w-5 h-5 text-gray-600"
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
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 bg-funlearn8 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getUserInitial()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - NOW ON LEFT SIDE */}
      <div className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close button at the top */}
        <div className="flex justify-end p-4 border-b border-gray-200">
          <div 
            className="text-purple-600 text-2xl cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            ✕
          </div>
        </div>
        
        {/* Menu items */}
        <div className="p-6">
          <ul className="space-y-4">
            {mobileMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium text-lg">{item.label}</span>
                </button>
              </li>
            ))}
            
            {/* Logout option */}
            <li className="border-t border-gray-200 pt-4 mt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium text-lg">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile overlay - LIGHT OPAQUE (98% transparency) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-5 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}