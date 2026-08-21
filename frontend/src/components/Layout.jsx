import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIHelpWidget from './AIHelpWidget';
import { ToastProvider } from './Toast';

export const Layout = () => {
  return (
    <ToastProvider>
      <div className="h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
        {/* Floating AI Operational Assistant Widget */}
        <AIHelpWidget />
      </div>
    </ToastProvider>
  );
};

export default Layout;
