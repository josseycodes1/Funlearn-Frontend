// app/dashboard/layout.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { UserProvider } from "@/contexts/UserContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (pathname === "/dashboard") return "overview";
    if (pathname.includes("/dashboard/chatbot")) return "chatbot";
    if (pathname.includes("/dashboard/quizpage")) return "quiz";
    if (pathname.includes("/dashboard/chatroom")) return "chatroom";
    if (pathname.includes("/dashboard/profile")) return "profile";
    if (pathname.includes("/dashboard/settings")) return "settings";
    if (pathname.includes("/dashboard/leaderboard")) return "leaderboard";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [pathname]);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token) {
          console.log("No token found, redirecting to login");
          router.push("/login");
          return;
        }

        if (userData) {
          setUser(JSON.parse(userData));
          setIsLoading(false);
        } else {
          const basicUser = {
            userName: "Student",
            email: "student@example.com",
          };
          setUser(basicUser);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // Route to different pages
    switch (tab) {
      case "chatbot":
        router.push("/dashboard/chatbot");
        break;
      case "quiz":
        router.push("/dashboard/quizpage");
        break;
      case "chatroom":
        router.push("/dashboard/chatroom");
        break;
      case "profile":
        router.push("/dashboard/profile-settings");
        break;
      case "settings":
        router.push("/dashboard/settings");
        break;
      case "leaderboard":
        router.push("/dashboard/leaderboard");
        break;
      case "overview":
      default:
        router.push("/dashboard");
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-funlearn1">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-funlearn6 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-funlearn1">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 mb-4">
            Please log in to access the dashboard.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-funlearn6 text-white px-6 py-2 rounded-lg font-semibold hover:bg-funlearn7 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <DashboardContent
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          handleLogout={handleLogout}
        >
          {children}
        </DashboardContent>
      </SidebarProvider>
    </UserProvider>
  );
}

// Separate component to use the sidebar context
function DashboardContent({
  activeTab,
  handleTabChange,
  sidebarOpen,
  setSidebarOpen,
  user,
  handleLogout,
  children,
}: {
  activeTab: string;
  handleTabChange: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: any;
  handleLogout: () => void;
  children: React.ReactNode;
}) {
  const { showGeneralSidebar, sidebarCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
        hideGeneralSidebar={!showGeneralSidebar}
        collapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          showGeneralSidebar={showGeneralSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
