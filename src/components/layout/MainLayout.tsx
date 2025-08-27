'use client';

import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { FloatingActionButton } from './FloatingActionButton';
import NotificationToast from '@/components/notifications/NotificationToast';
import { notificationService } from '@/services/notificationService';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    // Initialize notification service only for authenticated users
    notificationService.connect();

    // Request notification permissions
    notificationService.requestNotificationPermission();

    // Cleanup on unmount or when session changes
    return () => {
      notificationService.disconnect();
    };
  }, [session]);
  
  return (
    <div className="min-h-screen bg-crunevo-gradient">
      {/* Top Navbar */}
      <Navbar />
      
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar />
        
        {/* Main Content Area - Full Width Responsive */}
        <main className="flex-1 min-h-screen w-full">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Notification Toast */}
      <NotificationToast />
    </div>
  );
}
