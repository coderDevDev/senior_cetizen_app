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
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function BASCADashboard() {
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Seniors',
      value: '847',
      change: '+8%',
      icon: Users,
      color: 'bg-[#E6B800]',
      textColor: 'text-[#E6B800]'
    },
    {
      title: 'Active Seniors',
      value: '823',
      change: '+5%',
      icon: UserPlus,
      color: 'bg-[#00B5AD]',
      textColor: 'text-[#00B5AD]'
    },
    {
      title: 'New Registrations',
      value: '24',
      change: '+15%',
      icon: TrendingUp,
      color: 'bg-[#00B5AD]',
      textColor: 'text-[#00B5AD]'
    },
    {
      title: 'Pending Requests',
      value: '12',
      change: '-3%',
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    }
  ];

  const recentRegistrations = [
    {
      id: 1,
      name: 'Maria Santos',
      age: 68,
      address: '123 Main St.',
      date: '2024-01-10',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Juan Dela Cruz',
      age: 72,
      address: '456 Oak Ave.',
      date: '2024-01-09',
      status: 'approved'
    },
    {
      id: 3,
      name: 'Ana Reyes',
      age: 65,
      address: '789 Pine Rd.',
      date: '2024-01-08',
      status: 'pending'
    }
  ];

  const pendingRequests = [
    {
      id: 1,
      type: 'OSCA ID',
      senior: 'Maria Santos',
      date: '2024-01-10',
      priority: 'high'
    },
    {
      id: 2,
      type: 'Medical Certificate',
      senior: 'Juan Dela Cruz',
      date: '2024-01-09',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'Endorsement Letter',
      senior: 'Ana Reyes',
      date: '2024-01-08',
      priority: 'low'
    }
  ];

  const bhwAppointments = [
    {
      id: 1,
      senior: 'Maria Santos',
      purpose: 'Health Check-up',
      date: '2024-01-15',
      time: '09:00 AM',
      status: 'confirmed'
    },
    {
      id: 2,
      senior: 'Juan Dela Cruz',
      purpose: 'Vaccination',
      date: '2024-01-16',
      time: '10:30 AM',
      status: 'pending'
    },
    {
      id: 3,
      senior: 'Ana Reyes',
      purpose: 'Home Visit',
      date: '2024-01-17',
      time: '02:00 PM',
      status: 'confirmed'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EDE8] to-[#E6B800]/20 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#333333] mb-2">
            BASCA Admin Dashboard
          </h1>
          <p className="text-lg lg:text-xl text-[#666666]">
            Manage senior citizen records in Barangay 1
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#666666] mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-[#333333]">
                        {stat.value}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          stat.change.startsWith('+')
                            ? 'text-[#00B5AD]'
                            : 'text-red-500'
                        }`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Registrations */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#333333]">
                  Recent Registrations
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00B5AD] text-[#333333] hover:bg-[#F8F5F0]">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRegistrations.map(registration => (
                <div
                  key={registration.id}
                  className="p-4 rounded-lg border border-[#E0DDD8] hover:border-[#00B5AD] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#333333]">
                      {registration.name}
                    </h4>
                    <Badge
                      className={
                        registration.status === 'approved'
                          ? 'bg-[#00B5AD] text-white'
                          : 'bg-[#E6B800] text-white'
                      }>
                      {registration.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-[#666666]">
                    <div className="flex items-center gap-2">
                      <span>Age: {registration.age}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{registration.address}</span>
                    </div>
                    <div className="text-xs">
                      Registered: {registration.date}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#333333]">
                  Pending Requests
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00B5AD] text-[#333333] hover:bg-[#F8F5F0]">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map(request => (
                <div
                  key={request.id}
                  className="p-4 rounded-lg border border-[#E0DDD8] hover:border-[#00B5AD] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#333333]">
                      {request.type}
                    </h4>
                    <Badge
                      className={
                        request.priority === 'high'
                          ? 'bg-red-500 text-white'
                          : request.priority === 'medium'
                          ? 'bg-[#E6B800] text-white'
                          : 'bg-[#666666] text-white'
                      }>
                      {request.priority}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-[#666666]">
                    <div>Senior: {request.senior}</div>
                    <div className="text-xs">Requested: {request.date}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* BHW Appointments */}
        <div className="mt-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#333333]">
                  BHW Appointments
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00B5AD] text-[#333333] hover:bg-[#F8F5F0]">
                  Schedule New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bhwAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-lg border border-[#E0DDD8] hover:border-[#00B5AD] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#333333]">
                        {appointment.senior}
                      </h4>
                      <Badge
                        className={
                          appointment.status === 'confirmed'
                            ? 'bg-[#00B5AD] text-white'
                            : 'bg-[#E6B800] text-white'
                        }>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-[#666666]">
                      <div>{appointment.purpose}</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#333333]">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="bg-[#E6B800] hover:bg-[#D4A600] text-white h-16 text-lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register Senior
                </Button>
                <Button className="bg-[#00B5AD] hover:bg-[#009B94] text-white h-16 text-lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Process Request
                </Button>
                <Button className="bg-[#00B5AD] hover:bg-[#009B94] text-white h-16 text-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule BHW
                </Button>
                <Button className="bg-[#666666] hover:bg-[#555555] text-white h-16 text-lg">
                  <Activity className="w-5 h-5 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
