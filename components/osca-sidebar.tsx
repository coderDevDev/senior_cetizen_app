'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  FileText,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Search,
  Plus,
  Download,
  Database,
  MessageSquare,
  AlertTriangle,
  Calendar,
  MapPin,
  UserCheck,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

interface OSCASidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OSCASidebar({ isOpen, onClose }: OSCASidebarProps) {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('dashboard');

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard/osca'
    },
    {
      id: 'seniors',
      label: 'Senior Citizens',
      icon: Users,
      href: '/dashboard/osca/seniors',
      badge: '15,420'
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Bell,
      href: '/dashboard/osca/announcements'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      href: '/dashboard/osca/reports'
    },
    {
      id: 'census',
      label: 'Census Data',
      icon: Database,
      href: '/dashboard/osca/census'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      href: '/dashboard/osca/alerts'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      href: '/dashboard/osca/messages'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/osca/settings'
    }
  ];

  const handleNavigation = (item: any) => {
    setActiveItem(item.id);
    router.push(item.href);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-none rounded-xl flex items-center justify-center">
            {/* <Shield className="w-6 h-6 text-white" /> */}
            <Image
              src="https://mpqicxgtlmnwalwjmaov.supabase.co/storage/v1/object/sign/senior/f57b19189e96ff73ad61a12301a7ab147cdfe857.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzUzNjYxYi1hZjkzLTQ1MGUtYWZkOS00NDg2MzM4NmJiZDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzZW5pb3IvZjU3YjE5MTg5ZTk2ZmY3M2FkNjFhMTIzMDFhN2FiMTQ3Y2RmZTg1Ny5wbmciLCJpYXQiOjE3NTQ2NDM4NjMsImV4cCI6MTc4NjE3OTg2M30.iC2Ik1M4KZwvZuHiRHU1FeBNX0jRzHCkmqCow-i5Syw"
              alt="Logo"
              width={40}
              height={40}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">OSCA</h2>
            <p className="text-xs text-gray-500">Superadmin</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="lg:hidden">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* User Info */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-[#00af8f]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {authState.user?.firstName} {authState.user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {authState.user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start h-12 ${
                isActive
                  ? 'bg-[#00af8f] text-white hover:bg-[#00af90]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleNavigation(item)}>
              <Icon className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {/* {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )} */}
            </Button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Plus className="w-4 h-4 mr-2" />
            Add Senior Citizen
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Bell className="w-4 h-4 mr-2" />
            Post Announcement
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
