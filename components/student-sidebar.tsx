'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  BookOpen,
  Target,
  FileText,
  Activity,
  User,
  Settings,
  Bell,
  Trophy,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Bookmark,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface StudentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/student/dashboard',
    icon: Home,
    description: 'Overview of your learning progress',
    badge: null
  },
  {
    name: 'VARK Modules',
    href: '/student/vark-modules',
    icon: Target,
    description: 'Personalized learning modules',
    badge: 'New'
  },
  {
    name: 'Lessons',
    href: '/student/lessons',
    icon: BookOpen,
    description: 'Structured learning content',
    badge: null
  },
  {
    name: 'Activities',
    href: '/student/activities',
    icon: Activity,
    description: 'Interactive learning tasks',
    badge: null
  },
  {
    name: 'Quizzes',
    href: '/student/quizzes',
    icon: FileText,
    description: 'Test your knowledge',
    badge: null
  },
  {
    name: 'Progress',
    href: '/student/progress',
    icon: TrendingUp,
    description: 'Track your learning journey',
    badge: null
  },
  {
    name: 'Achievements',
    href: '/student/achievements',
    icon: Trophy,
    description: 'Your earned badges & rewards',
    badge: null
  },
  {
    name: 'Schedule',
    href: '/student/schedule',
    icon: Calendar,
    description: 'Learning calendar & deadlines',
    badge: null
  }
];

const quickActions = [
  {
    name: 'Continue Learning',
    href: '/student/vark-modules',
    icon: PlayCircle,
    color: 'bg-gradient-to-r from-[#00af8f] to-[#00af90]'
  },
  {
    name: 'Take Quiz',
    href: '/student/quizzes',
    icon: FileText,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600'
  },
  {
    name: 'Submit Activity',
    href: '/student/activities',
    icon: Activity,
    color: 'bg-gradient-to-r from-orange-500 to-orange-600'
  }
];

export function StudentSidebar({ isOpen, onToggle }: StudentSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [showQuickActions, setShowQuickActions] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
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
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Student Portal
                </h1>
                <p className="text-sm text-gray-500">VARK Learning System</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-[#00af8f] to-[#00af90] text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.user_metadata?.full_name || user?.email || 'Student'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'student@example.com'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {user?.user_metadata?.learning_style || 'Visual'} Learner
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Quick Actions
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickActions(false)}
                  className="h-6 w-6 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {quickActions.map(action => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div
                      className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {action.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Learning Navigation
              </h3>
            </div>

            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-[#00af8f]/10 to-[#00af90]/10 border border-[#00af8f]/20 text-[#00af8f]'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}>
                  <div
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-[#00af8f] text-white'
                        : 'text-gray-400 group-hover:text-gray-600'
                    )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </Button>
            </div>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
