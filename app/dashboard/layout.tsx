'use client';

import '../globals.css';
import { useAuth } from '@/hooks/useAuth';
import { OSCASidebar } from '@/components/osca-sidebar';
import { BASCASidebar } from '@/components/basca-sidebar';
import { SeniorSidebar } from '@/components/senior-sidebar';
import { MiniPWAStatus } from '@/components/ui/pwa-status';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { authState } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!authState.isLoading) {
      if (!authState.isAuthenticated) {
        router.push('/');
        return;
      }

      // Check if user has a valid role
      if (!authState.user?.role) {
        router.push('/');
        return;
      }

      setIsLoading(false);
    }
  }, [authState, router]);

  // Show loading state while checking authentication
  if (isLoading || authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] to-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f] mx-auto mb-4"></div>
          <p className="text-[#666666]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate sidebar based on user role
  const renderSidebar = () => {
    const sidebarProps = {
      isOpen: sidebarOpen,
      onClose: () => setSidebarOpen(false)
    };

    switch (authState.user?.role) {
      case 'osca':
        return <OSCASidebar {...sidebarProps} />;
      case 'basca':
        return <BASCASidebar {...sidebarProps} />;
      case 'senior':
        return <SeniorSidebar {...sidebarProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#feffff] to-[#ffffff]">
      {renderSidebar()}
      <main className="flex-1 bg-white">
        <div className="max-w-7xl ">
          {/* <div className="flex justify-end mb-4">
            <MiniPWAStatus />
          </div> */}
          {children}
        </div>
      </main>
    </div>
  );
}
