"use client";
import { useSidebar } from "@/contexts/SidebarContext";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showGeneralSidebar?: boolean;
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
}: DashboardHeaderProps) {
  const { setShowGeneralSidebar, setSidebarCollapsed } = useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // Get user's first initial for the avatar
  const getUserInitial = () => {
    if (!user) return "U";
    
    // Try firstName first, then userName
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
    
    // Try firstName first, then userName
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
          {/* Mobile menu button */}
          <button
            onClick={handleMobileMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 md:hidden" 
          >
            <svg
              className="w-5 h-5 text-purple-600"
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

      {/* Mobile Menu - No black overlay, just a clean dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-50">
          <div className="px-4 py-3 space-y-2">
            {mobileMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleMobileMenuClose();
                  // You can add navigation logic here if needed
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            
            {/* Logout option */}
            <button
              onClick={() => {
                handleMobileMenuClose();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// "use client";
// import { useSidebar } from "@/contexts/SidebarContext";

// interface DashboardHeaderProps {
//   user: any;
//   sidebarOpen: boolean;
//   setSidebarOpen: (open: boolean) => void;
//   showGeneralSidebar?: boolean;
// }

// export default function DashboardHeader({
//   user,
//   sidebarOpen,
//   setSidebarOpen,
//   showGeneralSidebar = true,
// }: DashboardHeaderProps) {
//   const { setShowGeneralSidebar, setSidebarCollapsed } = useSidebar();

//   const handleToggleGeneralSidebar = () => {
//     setShowGeneralSidebar(true);
//     setSidebarCollapsed(false);
//   };

//   return (
//     <header className="bg-white shadow-sm border-b border-gray-200">
//       <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
//         <div className="flex items-center space-x-3 md:space-x-4">
//           {/* Mobile menu button - Fixed: No overlay needed */}
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="p-2 rounded-lg hover:bg-gray-100 md:hidden" 
//           >
//             <svg
//               className="w-5 h-5 md:w-6 md:h-6 text-purple-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M4 6h16M4 12h16M4 18h16"
//               />
//             </svg>
//           </button>

//           {/* Toggle General Sidebar Button */}
//           {!showGeneralSidebar && (
//             <button
//               onClick={handleToggleGeneralSidebar}
//               className="p-2 rounded-lg hover:bg-gray-100 border border-gray-300 hidden sm:block"
//               title="Show Main Sidebar"
//             >
//               <svg
//                 className="w-4 h-4 md:w-5 md:h-5 text-purple-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 6h16M4 12h16M4 18h16"
//                 />
//               </svg>
//             </button>
//           )}

//           <div className="flex flex-col">
//             <h1 className="text-base md:text-xl font-semibold text-gray-900">
//               Welcome back, {user?.userName || "Student"}! 
//             </h1>
//             <p className="text-xs md:text-sm text-gray-600 hidden sm:block">
//               Ready to continue your learning adventure?
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center space-x-3 md:space-x-4">
//           {/* Notifications */}
//           <button className="relative p-1 md:p-2 rounded-lg hover:bg-gray-100">
//             <svg
//               className="w-5 h-5 md:w-6 md:h-6 text-gray-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 0-6 6v2.25l-2 2V15h15v-.75l-2-2V9.75a6 6 0 0 0-6-6z"
//               />
//             </svg>
//             <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
//           </button>

//           {/* User profile */}
//           <div className="flex items-center space-x-2 md:space-x-3">
//             <div className="w-8 h-8 md:w-10 md:h-10 bg-funlearn8 rounded-full flex items-center justify-center">
//               <span className="text-white font-semibold text-xs md:text-sm">
//                 {user?.userName?.charAt(0).toUpperCase() || "U"}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }