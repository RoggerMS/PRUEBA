'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { FloatingActionButton } from './FloatingActionButton';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-crunevo-gradient">
      {/* Top Navbar */}
      <Navbar />
      
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Content (Quick Actions, Streak, Trending) */}
              <div className="lg:col-span-3 space-y-6">
                {Array.isArray(children) ? children[0] : null}
              </div>
              
              {/* Main Feed */}
              <div className="lg:col-span-6 space-y-6">
                {Array.isArray(children) ? children[1] : children}
              </div>
              
              {/* Right Content (Suggestions, Ads) */}
              <div className="lg:col-span-3 space-y-6">
                {Array.isArray(children) ? children[2] : null}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}