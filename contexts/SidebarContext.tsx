// contexts/SidebarContext.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  showGeneralSidebar: boolean;
  setShowGeneralSidebar: (show: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [showGeneralSidebar, setShowGeneralSidebar] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        showGeneralSidebar,
        setShowGeneralSidebar,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
