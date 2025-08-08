'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  AlertTriangle,
  Bell,
  TrendingUp,
  FileText,
  Calendar,
  MapPin,
  Activity
} from 'lucide-react';

export default function OSCADashboard() {
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Senior Citizens',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    },
    {
      title: 'Active Seniors',
      value: '2,634',
      change: '+8%',
      icon: UserPlus,
      color: 'bg-[#ffd416]',
      textColor: 'text-[#ffd416]'
    },
    {
      title: 'New Registrations',
      value: '156',
      change: '+23%',
      icon: TrendingUp,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    },
    {
      title: 'Pending Requests',
      value: '42',
      change: '-5%',
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    }
  ];

  const recentAnnouncements = [
    {
      id: 1,
      title: 'Monthly Pension Distribution',
      content: 'Pension distribution will be held on the 15th of this month.',
      type: 'general',
      date: '2024-01-10',
      urgent: false
    },
    {
      id: 2,
      title: 'Medical Check-up Schedule',
      content: 'Free medical check-up for all registered senior citizens.',
      type: 'benefit',
      date: '2024-01-08',
      urgent: true
    },
    {
      id: 3,
      title: 'OSCA ID Renewal',
      content: 'OSCA ID renewal process has been simplified.',
      type: 'general',
      date: '2024-01-05',
      urgent: false
    }
  ];

  const recentRegistrations = [
    {
      id: 1,
      name: 'Maria Santos',
      barangay: 'Barangay 1',
      age: 68,
      date: '2024-01-10'
    },
    {
      id: 2,
      name: 'Juan Dela Cruz',
      barangay: 'Barangay 2',
      age: 72,
      date: '2024-01-09'
    },
    {
      id: 3,
      name: 'Ana Reyes',
      barangay: 'Barangay 3',
      age: 65,
      date: '2024-01-08'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#333333]">OSCA Dashboard</h1>
          <p className="text-[#666666] mt-2">
            Welcome back! Here's what's happening with senior citizens today.
          </p>
        </div>
        <Button className="bg-[#00af8f] hover:bg-[#00af90] text-white">
          <Bell className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#666666]">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-[#333333] mt-1">
                      {stat.value}
                    </p>
                    <p className={`text-sm font-medium ${stat.textColor} mt-1`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00af8f]" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnnouncements.map(announcement => (
                <div
                  key={announcement.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-[#E0DDD8] hover:bg-[#feffff] transition-colors">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        announcement.urgent ? 'bg-red-500' : 'bg-[#00af8f]'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-[#333333]">
                        {announcement.title}
                      </h4>
                      {announcement.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#666666] mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-[#666666]">
                      {new Date(announcement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#00af8f]" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRegistrations.map(registration => (
                <div
                  key={registration.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#E0DDD8] hover:bg-[#feffff] transition-colors">
                  <div className="w-10 h-10 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#00af8f]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#333333]">
                      {registration.name}
                    </h4>
                    <p className="text-sm text-[#666666]">
                      {registration.barangay} • Age {registration.age}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#666666]">
                      {new Date(registration.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00af8f]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <UserPlus className="w-6 h-6 mb-2 text-[#00af8f]" />
              <span className="text-sm">Add Senior</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <FileText className="w-6 h-6 mb-2 text-[#00af8f]" />
              <span className="text-sm">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Calendar className="w-6 h-6 mb-2 text-[#00af8f]" />
              <span className="text-sm">Schedule Event</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <MapPin className="w-6 h-6 mb-2 text-[#00af8f]" />
              <span className="text-sm">View Map</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
