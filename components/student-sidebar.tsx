'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  BookOpen,
  Target,
  FileText,
  Activity,
  Settings,
  Trophy,
  Calendar,
  TrendingUp,
  Award,
  HelpCircle,
  LogOut,
  PlayCircle,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface StudentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { icon: Home, label: 'Dashboard', href: '/student/dashboard' },
  { icon: Target, label: 'VARK Modules', href: '/student/vark-modules' },
  { icon: BookOpen, label: 'My Classes', href: '/student/classes' },
  { icon: Activity, label: 'Activities', href: '/student/activities' },
  { icon: FileText, label: 'Quizzes', href: '/student/quizzes' },
  { icon: TrendingUp, label: 'Progress', href: '/student/progress' },
  { icon: Trophy, label: 'Achievements', href: '/student/achievements' },
  { icon: Calendar, label: 'Schedule', href: '/student/schedule' },
  { icon: Settings, label: 'Settings', href: '/student/settings' }
];

const quickActions = [
  {
    icon: PlayCircle,
    label: 'Continue Learning',
    href: '/student/vark-modules'
  },
  { icon: Target, label: 'Take Assessment', href: '/student/assessment' },
  { icon: Lightbulb, label: 'Learning Tips', href: '/student/tips' }
];

export function StudentSidebar({ isOpen, onToggle }: StudentSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EduHub</h1>
                <p className="text-sm text-gray-500">Student Portal</p>
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.profilePhoto} />
                <AvatarFallback className="bg-gradient-to-r from-[#00af8f] to-[#00af90] text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName ||
                    user?.firstName ||
                    user?.email ||
                    'Student'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'student@example.com'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {user?.learningStyle || 'Visual'} Learner
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-4 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                    onClick={() => onToggle()}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{action.label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto text-gray-400" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00af8f] to-[#00af90] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => onToggle()}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Links */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link
                href="/help"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">Help & Support</span>
              </Link>
              <Link
                href="/feedback"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200">
                <Award className="w-4 h-4" />
                <span className="text-sm">Feedback</span>
              </Link>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:border-red-300">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
