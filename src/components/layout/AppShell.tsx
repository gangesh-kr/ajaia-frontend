'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { Header } from './Header';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(1200); // Default to desktop to prevent flicker
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read from localStorage
    try {
      const savedState = localStorage.getItem('docflow_sidebar_open');
      if (savedState !== null) {
        setIsOpen(savedState === 'true');
      }
    } catch (e) {
      console.error('LocalStorage access error:', e);
    }

    // Set initial width
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    try {
      localStorage.setItem('docflow_sidebar_open', String(newState));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Drawer open state logic
  // On desktop: always open.
  // On tablet: open/close by toggle state.
  // On mobile: open/close by toggle state (drawer).
  const sidebarOpen = isDesktop ? true : (mounted ? isOpen : true);

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden font-sans">
      <Header onMenuClick={isMobile || isTablet ? toggleSidebar : undefined} />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Backdrop for mobile and tablet drawer */}
        {(isMobile || isTablet) && sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[2px] z-40 transition-opacity duration-300"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar container */}
        <aside
          className={`
            fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-20
            flex flex-col border-r border-gray-150 bg-white h-full
            transition-all duration-300 ease-in-out
            ${isMobile ? (sidebarOpen ? 'w-full translate-x-0' : 'w-full -translate-x-full') : ''}
            ${isTablet ? (sidebarOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full') : ''}
            ${isDesktop ? 'w-[260px] translate-x-0' : ''}
          `}
        >
          {/* Mobile drawer header with a close button */}
          {isMobile && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-150 bg-gray-50/50">
              <span className="text-sm font-bold text-gray-700">Navigation</span>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            <Sidebar onClose={isMobile || isTablet ? toggleSidebar : undefined} />
          </div>
        </aside>

        {/* Tablet collapse floating chevron button */}
        {isTablet && (
          <button
            onClick={toggleSidebar}
            className={`
              fixed top-1/2 -translate-y-1/2 z-50
              flex items-center justify-center w-8 h-8
              bg-white border border-gray-200 rounded-full shadow-md
              text-gray-500 hover:text-gray-800 focus:outline-none hover:shadow-lg transition-all duration-200
              ${sidebarOpen ? 'left-[244px]' : 'left-4'}
            `}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}

        {/* Main Editor panel */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
