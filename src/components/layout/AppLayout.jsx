import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Plus } from "lucide-react";
import QuickActionModal from "../common/QuickActionModal";

/**
 * Main Application Layout Shell
 * Wraps top header, responsive navigation sidebar, and main page content viewport.
 */
const AppLayout = () => {
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Sidebar - Desktop fixed & Mobile overlay drawer */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Navbar */}
        <Header
          onMenuToggle={toggleMobileSidebar}
          openQuickAction={() => setIsQuickActionOpen(true)}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        {/* Global Floating Action Button (FAB) */}
        {/* <button
          onClick={() => setIsQuickActionOpen(true)}
          title="Add Transaction, Transfer, or Debt"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800 transition-all transform hover:scale-105"
        >
          <Plus className="h-7 w-7" />
        </button> */}

        {/* Global Quick Action Modal */}
        <QuickActionModal
          isOpen={isQuickActionOpen}
          onClose={() => setIsQuickActionOpen(false)}
        />
      </div>
    </div>
  );
};

export default AppLayout;
