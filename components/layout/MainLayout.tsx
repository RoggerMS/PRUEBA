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
        
        {/* Main Content Area - Full Width Responsive */}
        <main className="flex-1 min-h-screen w-full pt-0 md:pt-0">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
