"use client";
import { useState } from "react";
import Link from 'next/link';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: any;
  onLogout: () => void;
  hideGeneralSidebar?: boolean;
  collapsed?: boolean;
}

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  user,
  onLogout,
  hideGeneralSidebar = false,
  collapsed = false,
}: DashboardSidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: "◼️" },
    { id: "chatbot", label: "AI Chat Bot", icon: "⚫" },
    { id: "quiz", label: "Take Quiz", icon: "🎱" },
    { id: "chatroom", label: "Chat Room", icon: "⚪" },
    { id: "leaderboard", label: "Leaderboard", icon: "⬜" },
    { id: "profile", label: "Profile", icon: "⬛" },
  ];

  if (hideGeneralSidebar) {
    return null;
  }

  const sidebarWidth = collapsed ? "w-20" : "w-64";

  return (
    <>
      {/* Mobile overlay*/}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-30 bg-white shadow-xl transform transition-all duration-300 ease-in-out 
        md:translate-x-0 md:static md:inset-0 // CHANGED: lg: → md:
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${sidebarWidth}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={`flex items-center ${
              collapsed ? "justify-center p-4" : "justify-between p-4"
            } border-b border-gray-200`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-funlearn8 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              {!collapsed && (
                <Link href="/">
                    <span className="text-xl font-bold text-gray-900 cursor-pointer hover:text-funlearn6 transition-colors">
                      Funlearn
                    </span>
                  </Link>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100" // CHANGED: lg:hidden → md:hidden
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* User info - hide when collapsed */}
          {!collapsed && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-funlearn4 rounded-full flex items-center justify-center">
                  <span className="text-funlearn8 font-semibold">
                    {user?.userName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.userName || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-3" : "space-x-3 px-4"
                } py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-funlearn8 text-white shadow-lg"
                    : "text-gray-700 hover:bg-funlearn2 hover:text-funlearn8"
                }`}
                title={collapsed ? item.label : ""}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className={`w-full flex items-center ${
                collapsed ? "justify-center px-3" : "space-x-3 px-4"
              } py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
              title={collapsed ? "Logout" : ""}
            >
              <span className="text-lg">◼️</span>
              {!collapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}