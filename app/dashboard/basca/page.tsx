'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
  CheckCircle,
  GraduationCap,
  BarChart3,
  Search,
  Filter,
  Plus,
  Download,
  Home,
  Menu,
  X,
  ChevronRight,
  Phone,
  Mail,
  Clock,
  Database,
  RefreshCw
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  BascaMembersTable,
  AddBascaMemberModal,
  EditBascaMemberModal,
  ViewBascaMemberModal,
  DeleteBascaMemberDialog
} from '@/components/basca';
import { AddSeniorMobile } from '@/components/seniors';
import { useAuth } from '@/hooks/useAuth';
import { BascaMembersAPI } from '@/lib/api/basca-members';
import { useToast } from '@/hooks/use-toast';
import type { BascaMember } from '@/types/basca';
import { Skeleton } from '@/components/ui/skeleton';

export default function BASCADashboard() {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [bascaMembers, setBascaMembers] = useState<BascaMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSeniorModalOpen, setIsSeniorModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BascaMember | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [barangayFilter, setBarangayFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  useEffect(() => {
    fetchBascaMembers();
  }, []);

  const fetchBascaMembers = async () => {
    try {
      setIsLoading(true);
      const members = await BascaMembersAPI.getAllBascaMembers();
      setBascaMembers(members);
    } catch (error) {
      console.error('Error fetching basca members:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch basca members',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBascaMembers();
    setIsRefreshing(false);
    toast({
      title: 'Success',
      description: 'Dashboard refreshed successfully',
      variant: 'default'
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() && !recentSearches.includes(term.trim())) {
      setRecentSearches(prev => [term.trim(), ...prev.slice(0, 4)]);
    }
    setShowSearchSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (recentSearches.length > 0) {
      setShowSearchSuggestions(true);
    }
  };

  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSenior = () => {
    setIsSeniorModalOpen(true);
  };

  const handleEditMember = (member: BascaMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleViewMember = (member: BascaMember) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleDeleteMember = (member: BascaMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleMemberSuccess = () => {
    fetchBascaMembers();
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  const calculateStats = () => {
    const total = bascaMembers.length;
    const active = bascaMembers.filter(m => m.isActive).length;
    const inactive = total - active;
    const newThisMonth = bascaMembers.filter(m => {
      const joinDate = new Date(m.joinDate);
      const now = new Date();
      return (
        joinDate.getMonth() === now.getMonth() &&
        joinDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, active, inactive, newThisMonth };
  };

  const stats = calculateStats();

  const navigationTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'registrations', label: 'Senior Citizens', icon: UserPlus },
    { id: 'seniors', label: 'Manage Seniors', icon: Users },
    { id: 'offline', label: 'Offline Data', icon: Database },
    { id: 'sync', label: 'Sync Status', icon: Activity },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const quickActions = [
    {
      title: 'New Senior',
      icon: UserPlus,
      action: handleAddSenior,
      color: 'bg-[#00af8f]',
      textColor: 'text-white'
    },
    {
      title: 'Offline Mode',
      icon: Database,
      action: () => setActiveTab('offline'),
      color: 'bg-[#ffd416]',
      textColor: 'text-white'
    },
    {
      title: 'Sync Data',
      icon: Activity,
      action: () => setActiveTab('sync'),
      color: 'bg-[#ff6b6b]',
      textColor: 'text-white'
    },
    {
      title: 'View Seniors',
      icon: Users,
      action: () => setActiveTab('seniors'),
      color: 'bg-[#4ecdc4]',
      textColor: 'text-white'
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">
              Welcome back, {authState.user?.firstName || 'User'}!
            </h2>
            <p className="text-[#e0f2f1] text-xs mb-2">
              Here's what's happening with BASCA today
            </p>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3 text-[#e0f2f1]" />
              <span className="text-xs text-[#e0f2f1]">
                Assigned to: {authState.user?.barangay || 'Unknown Barangay'}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="border-0 bg-white shadow-md rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#00af8f]/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#00af8f]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#333333] text-sm">
                {authState.user?.firstName} {authState.user?.lastName}
              </h3>
              <p className="text-xs text-[#666666]">{authState.user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="w-3 h-3 text-[#00af8f]" />
                <span className="text-xs text-[#00af8f] font-medium">
                  {authState.user?.barangay || 'Unknown Barangay'}
                </span>
              </div>
            </div>
            <Badge className="bg-[#00af8f] text-white text-xs px-2 py-1">
              BASCA Staff
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] font-medium">
                  Total Seniors
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-[#333333]">
                    {stats.total}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-[#00af8f]/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-[#00af8f]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] font-medium">Active</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-[#333333]">
                    {stats.active}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-[#ffd416]/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#ffd416]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] font-medium">
                  New This Month
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-[#333333]">
                    {stats.newThisMonth}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-[#00af8f]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#00af8f]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] font-medium">Inactive</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-[#333333]">
                    {stats.inactive}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                className={`h-16 ${action.color} ${action.textColor} rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex flex-col items-center justify-center space-y-1 transform`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{action.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Recent Activity
        </h3>
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-[#00af8f]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    New member registered
                  </p>
                  <p className="text-xs text-[#666666]">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#ffd416]/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#ffd416]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Meeting scheduled
                  </p>
                  <p className="text-xs text-[#666666]">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#ff6b6b]/10 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#ff6b6b]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Report generated
                  </p>
                  <p className="text-xs text-[#666666]">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4" />
          <Input
            placeholder="Search senior citizens..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={handleSearchFocus}
            className="pl-10 h-12 text-sm border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/10 rounded-xl bg-white transition-all duration-200"
          />

          {/* Search Suggestions */}
          {showSearchSuggestions && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <div className="p-2">
                <p className="text-xs text-[#666666] font-medium mb-2 px-2">
                  Recent Searches
                </p>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 text-sm text-[#333333] hover:bg-gray-50 rounded-lg transition-colors">
                    <Search className="w-3 h-3 inline mr-2 text-[#666666]" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-1">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
            className="whitespace-nowrap rounded-full text-xs px-3 py-1 h-8">
            All
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
            className="whitespace-nowrap rounded-full text-xs px-3 py-1 h-8">
            Active
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('inactive')}
            className="whitespace-nowrap rounded-full text-xs px-3 py-1 h-8">
            Inactive
          </Button>
        </div>
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00af8f] mx-auto mb-3"></div>
            <p className="text-[#666666] text-sm">Loading senior citizens...</p>
          </div>
        </div>
      ) : bascaMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-[#00af8f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-[#00af8f]" />
          </div>
          <h3 className="text-lg font-medium text-[#333333] mb-2">
            No senior citizens registered yet
          </h3>
          <p className="text-[#666666] mb-6 text-sm max-w-sm mx-auto">
            Start building your senior citizen database by registering the first
            person
          </p>
          <Button
            onClick={handleAddSenior}
            className="bg-[#00af8f] hover:bg-[#00af90] text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Register First Senior
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bascaMembers
            .filter(member => {
              const matchesSearch =
                searchTerm === '' ||
                `${member.firstName} ${member.lastName}`
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase());
              const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && member.isActive) ||
                (filterStatus === 'inactive' && !member.isActive);
              return matchesSearch && matchesStatus;
            })
            .map(member => (
              <Card
                key={member.id}
                className="border-0 bg-white shadow-md rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => handleViewMember(member)}>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#00af8f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#333333] text-sm truncate">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-xs text-[#666666] truncate">
                        {member.position}
                      </p>
                      <p className="text-xs text-[#999999] truncate">
                        {member.barangay}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge
                        variant={member.isActive ? 'default' : 'secondary'}
                        className={`text-xs px-2 py-1 ${
                          member.isActive ? 'bg-[#00af8f]' : 'bg-gray-400'
                        }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-[#666666]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );

  const renderRegistrations = () => (
    <div className="space-y-4">
      {/* Registration Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00af8f]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <UserPlus className="w-6 h-6 text-[#00af8f]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">
                Total Senior Citizens
              </p>
              <p className="text-xl font-bold text-[#333333]">
                {isLoading ? '...' : bascaMembers.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffd416]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-[#ffd416]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">
                New Seniors This Month
              </p>
              <p className="text-xl font-bold text-[#333333]">
                {isLoading ? '...' : stats.newThisMonth}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Registration Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleAddSenior}
            className="h-14 bg-[#00af8f] hover:bg-[#00af90] text-white rounded-xl shadow-md">
            <UserPlus className="w-5 h-5 mr-2" />
            Register New Senior Citizen
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ffd416] text-[#ffd416] hover:bg-[#ffd416]/5 rounded-xl">
            <Database className="w-5 h-5 mr-2" />
            Offline Registration Mode
          </Button>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Recent Senior Citizens
        </h3>
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="space-y-3">
              {bascaMembers.slice(0, 3).map(member => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#00af8f]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333333]">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-[#666666]">{member.barangay}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-[#00af8f] text-white">
                    {member.isActive ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOffline = () => (
    <div className="space-y-4">
      {/* Offline Status */}
      <Card className="border-0 bg-white shadow-md rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <Database className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[#333333]">Online Mode</h3>
              <p className="text-xs text-[#666666]">
                Connected to central database
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Connection Status:</span>
              <Badge className="bg-green-500 text-white text-xs">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Last Sync:</span>
              <span className="text-[#333333]">Just now</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Pending Sync:</span>
              <span className="text-[#333333]">0 records</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Features */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Offline Capabilities
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Card className="border-0 bg-white shadow-md rounded-xl">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#00af8f]/10 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#00af8f]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[#333333] text-sm">
                    Offline Registration
                  </h4>
                  <p className="text-xs text-[#666666]">
                    Register seniors without internet
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-md rounded-xl">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#ffd416]/10 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-[#ffd416]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[#333333] text-sm">
                    Local Storage
                  </h4>
                  <p className="text-xs text-[#666666]">
                    Data saved locally on device
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderSync = () => (
    <div className="space-y-4">
      {/* Sync Status */}
      <Card className="border-0 bg-white shadow-md rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#00af8f]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#333333]">Sync Status</h3>
              <p className="text-xs text-[#666666]">
                Data synchronization overview
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Total Records:</span>
              <span className="text-[#333333]">{bascaMembers.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Synced:</span>
              <span className="text-[#333333]">{bascaMembers.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Pending:</span>
              <span className="text-[#333333]">0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Last Sync:</span>
              <span className="text-[#333333]">Just now</span>
            </div>

            {/* Sync Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666666]">Sync Progress:</span>
                <span className="text-[#00af8f] font-medium">100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Sync Actions
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Button className="h-12 bg-[#00af8f] hover:bg-[#00af90] text-white rounded-xl">
            <Activity className="w-4 h-4 mr-2" />
            Sync All Data
          </Button>
          <Button
            variant="outline"
            className="h-12 border-[#ffd416] text-[#ffd416] hover:bg-[#ffd416]/5 rounded-xl">
            <Database className="w-4 h-4 mr-2" />
            View Sync History
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSeniors = () => (
    <div className="space-y-4">
      {/* Senior Citizens Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00af8f]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-[#00af8f]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">
                Total Seniors
              </p>
              <p className="text-xl font-bold text-[#333333]">
                {isLoading ? '...' : bascaMembers.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffd416]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-[#ffd416]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">Active</p>
              <p className="text-xl font-bold text-[#333333]">
                {isLoading ? '...' : stats.active}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Senior Management Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Management Actions
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleAddSenior}
            className="h-14 bg-[#00af8f] hover:bg-[#00af90] text-white rounded-xl shadow-md">
            <UserPlus className="w-5 h-5 mr-2" />
            Add New Senior Citizen
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ffd416] text-[#ffd416] hover:bg-[#ffd416]/5 rounded-xl">
            <Users className="w-5 h-5 mr-2" />
            View All Seniors
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ff6b6b] text-[#ff6b6b] hover:bg-[#ff6b6b]/5 rounded-xl">
            <FileText className="w-5 h-5 mr-2" />
            Generate Reports
          </Button>
        </div>
      </div>

      {/* Recent Senior Activities */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Recent Activities
        </h3>
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-[#00af8f]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    New senior citizen registered
                  </p>
                  <p className="text-xs text-[#666666]">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#ffd416]/10 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#ffd416]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Document updated
                  </p>
                  <p className="text-xs text-[#666666]">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      {/* Reports Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00af8f]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-6 h-6 text-[#00af8f]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">
                Total Reports
              </p>
              <p className="text-xl font-bold text-[#333333]">12</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffd416]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-[#ffd416]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">This Month</p>
              <p className="text-xl font-bold text-[#333333]">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Generate Reports
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Button className="h-14 bg-[#00af8f] hover:bg-[#00af90] text-white rounded-xl shadow-md">
            <BarChart3 className="w-5 h-5 mr-2" />
            Senior Citizen Summary
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ffd416] text-[#ffd416] hover:bg-[#ffd416]/5 rounded-xl">
            <Users className="w-5 h-5 mr-2" />
            Registration Report
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ff6b6b] text-[#ff6b6b] hover:bg-[#ff6b6b]/5 rounded-xl">
            <Calendar className="w-5 h-5 mr-2" />
            Monthly Statistics
          </Button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Recent Reports
        </h3>
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-[#00af8f]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Senior Citizen Summary
                  </p>
                  <p className="text-xs text-[#666666]">
                    Generated 2 hours ago
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  View
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#ffd416]/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#ffd416]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Registration Report
                  </p>
                  <p className="text-xs text-[#666666]">Generated yesterday</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'registrations':
        return renderRegistrations();
      case 'seniors':
        return renderSeniors();
      case 'offline':
        return renderOffline();
      case 'sync':
        return renderSync();
      case 'reports':
        return renderReports();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2">
              <Menu className="w-5 h-5" />
            </Button> */}
            <div>
              <h1 className="text-lg font-bold text-[#333333]">BASCA</h1>
              <p className="text-xs text-[#666666]">
                {authState.user?.firstName} {authState.user?.lastName}
              </p>
              <p className="text-xs text-[#00af8f] font-medium">
                {authState.user?.barangay || 'Unknown Barangay'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleRefresh}
              disabled={isRefreshing}>
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleAddSenior}
              size="sm"
              className="bg-[#00af8f] hover:bg-[#00af90] text-white text-xs px-3 py-2 h-8">
              <Plus className="w-3 h-3 mr-1" />
              Register Senior
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        {/* <div className="px-3 pb-2">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {navigationTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 h-8 rounded-lg text-xs ${
                    isActive
                      ? 'bg-white text-[#00af8f] shadow-sm'
                      : 'text-[#666666] hover:text-[#333333]'
                  }`}>
                  <Icon className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="p-3">{renderContent()}</div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={handleAddSenior}
          className="w-14 h-14 rounded-full bg-[#00af8f] hover:bg-[#00af90] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
        <div className="flex justify-around px-2 py-3">
          {navigationTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center space-y-1.5 h-16 px-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-[#00af8f] bg-[#00af8f]/5'
                    : 'text-[#666666] hover:text-[#333333] hover:bg-gray-50'
                }`}>
                <div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-[#00af8f]/10' : 'bg-transparent'
                  }`}>
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    isActive ? 'text-[#00af8f]' : 'text-[#666666]'
                  }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-[#00af8f] rounded-full mt-1" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Safe Area Indicator for iOS */}
        <div className="h-1 bg-gradient-to-r from-[#00af8f] via-[#ffd416] to-[#00af8f] opacity-20" />
      </div>

      {/* Modals */}
      <AddBascaMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMemberSuccess}
      />

      <AddSeniorMobile
        isOpen={isSeniorModalOpen}
        onClose={() => setIsSeniorModalOpen(false)}
        onSuccess={() => {
          setIsSeniorModalOpen(false);
          toast({
            title: 'Success',
            description: 'Senior citizen registered successfully',
            variant: 'default'
          });
        }}
      />

      {selectedMember && (
        <>
          <EditBascaMemberModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            member={selectedMember}
            onSuccess={handleMemberSuccess}
          />

          <ViewBascaMemberModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            member={selectedMember}
            onEdit={() => {
              setIsViewModalOpen(false);
              setIsEditModalOpen(true);
            }}
          />

          <DeleteBascaMemberDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            member={selectedMember}
            onSuccess={handleMemberSuccess}
          />
        </>
      )}
    </div>
  );
}
