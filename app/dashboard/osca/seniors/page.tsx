'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { SeniorCitizensTable } from '@/components/seniors/senior-citizens-table';
import { AddSeniorModal } from '@/components/seniors/add-senior-modal';
import { EditSeniorModal } from '@/components/seniors/edit-senior-modal';
import { ViewSeniorModal } from '@/components/seniors/view-senior-modal';
import { DeleteSeniorDialog } from '@/components/seniors/delete-senior-dialog';
import type { SeniorCitizen } from '@/types/property';

export default function OSCASeniorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [barangayFilter, setBarangayFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSenior, setSelectedSenior] = useState<SeniorCitizen | null>(
    null
  );

  // Mock data for demonstration
  const mockSeniors: SeniorCitizen[] = [
    {
      id: '1',
      userId: 'user1',
      barangay: 'Barangay 1',
      barangayCode: 'BG001',
      dateOfBirth: '1950-03-15',
      gender: 'female',
      address: '123 Main Street, City',
      contactPerson: 'Maria Santos Jr.',
      contactPhone: '+639123456789',
      contactRelationship: 'Daughter',
      medicalConditions: ['Hypertension', 'Diabetes'],
      medications: ['Metformin', 'Amlodipine'],
      emergencyContactName: 'Juan Santos',
      emergencyContactPhone: '+639123456788',
      emergencyContactRelationship: 'Son',
      oscaId: 'OSCA-2024-001',
      seniorIdPhoto:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9TQ0EgU2VuaW9yIENpdGl6ZW4gSUQ8L3RleHQ+Cjx0ZXh0IHg9IjE1MCIgeT0iMjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1hcmlhIFNhbnRvczwvdGV4dD4KPHN2Zz4K',
      documents: ['OSCA ID', 'Medical Certificate'],
      status: 'active',
      registrationDate: '2024-01-15',
      lastMedicalCheckup: '2024-01-10',
      notes: 'Regular checkup needed',
      // New fields
      housingCondition: 'owned',
      physicalHealthCondition: 'good',
      monthlyIncome: 25000,
      monthlyPension: 15000,
      livingCondition: 'with_family',
      beneficiaries: [
        {
          id: 'ben1',
          seniorCitizenId: '1',
          name: 'Maria Santos Jr.',
          relationship: 'Daughter',
          dateOfBirth: '1980-05-20',
          gender: 'female',
          address: '123 Main Street, City',
          contactPhone: '+639123456789',
          occupation: 'Teacher',
          monthlyIncome: 35000,
          isDependent: false,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ben2',
          seniorCitizenId: '1',
          name: 'Juan Santos',
          relationship: 'Son',
          dateOfBirth: '1982-08-15',
          gender: 'male',
          address: '456 Oak Avenue, City',
          contactPhone: '+639123456788',
          occupation: 'Engineer',
          monthlyIncome: 45000,
          isDependent: false,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin1',
      updatedBy: 'admin1'
    },
    {
      id: '2',
      userId: 'user2',
      barangay: 'Barangay 2',
      barangayCode: 'BG002',
      dateOfBirth: '1945-07-22',
      gender: 'male',
      address: '456 Oak Avenue, City',
      contactPerson: 'Ana Dela Cruz',
      contactPhone: '+639123456787',
      contactRelationship: 'Daughter',
      medicalConditions: ['Arthritis'],
      medications: ['Ibuprofen'],
      emergencyContactName: 'Pedro Dela Cruz',
      emergencyContactPhone: '+639123456786',
      emergencyContactRelationship: 'Son',
      oscaId: 'OSCA-2024-002',
      seniorIdPhoto:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9TQ0EgU2VuaW9yIENpdGl6ZW4gSUQ8L3RleHQ+Cjx0ZXh0IHg9IjE1MCIgeT0iMjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkp1YW4gRGVsYSBDcnV6PC90ZXh0Pgo8c3ZnPgo=',
      documents: ['OSCA ID'],
      status: 'active',
      registrationDate: '2024-01-10',
      lastMedicalCheckup: '2024-01-05',
      notes: 'Mobility assistance needed',
      // New fields
      housingCondition: 'rented',
      physicalHealthCondition: 'fair',
      monthlyIncome: 18000,
      monthlyPension: 12000,
      livingCondition: 'independent',
      beneficiaries: [
        {
          id: 'ben3',
          seniorCitizenId: '2',
          name: 'Ana Dela Cruz',
          relationship: 'Daughter',
          dateOfBirth: '1975-03-10',
          gender: 'female',
          address: '789 Pine Street, City',
          contactPhone: '+639123456787',
          occupation: 'Nurse',
          monthlyIncome: 40000,
          isDependent: false,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        }
      ],
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      createdBy: 'admin1',
      updatedBy: 'admin1'
    },
    {
      id: '3',
      userId: 'user3',
      barangay: 'Barangay 3',
      barangayCode: 'BG003',
      dateOfBirth: '1955-12-08',
      gender: 'female',
      address: '789 Pine Street, City',
      contactPerson: 'Carlos Reyes',
      contactPhone: '+639123456785',
      contactRelationship: 'Son',
      medicalConditions: ['Heart Disease'],
      medications: ['Aspirin', 'Lisinopril'],
      emergencyContactName: 'Sofia Reyes',
      emergencyContactPhone: '+639123456784',
      emergencyContactRelationship: 'Daughter',
      oscaId: 'OSCA-2024-003',
      seniorIdPhoto:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9TQ0EgU2VuaW9yIENpdGl6ZW4gSUQ8L3RleHQ+Cjx0ZXh0IHg9IjE1MCIgeT0iMjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFuYSBSZXllczwvdGV4dD4KPHN2Zz4K',
      documents: ['OSCA ID', 'Medical Certificate', 'Heart Specialist Report'],
      status: 'active',
      registrationDate: '2024-01-08',
      lastMedicalCheckup: '2024-01-03',
      notes: 'Cardiac monitoring required',
      // New fields
      housingCondition: 'with_family',
      physicalHealthCondition: 'poor',
      monthlyIncome: 15000,
      monthlyPension: 10000,
      livingCondition: 'with_caregiver',
      beneficiaries: [
        {
          id: 'ben4',
          seniorCitizenId: '3',
          name: 'Carlos Reyes',
          relationship: 'Son',
          dateOfBirth: '1985-06-25',
          gender: 'male',
          address: '321 Elm Street, City',
          contactPhone: '+639123456785',
          occupation: 'Doctor',
          monthlyIncome: 60000,
          isDependent: false,
          createdAt: '2024-01-08T10:00:00Z',
          updatedAt: '2024-01-08T10:00:00Z'
        },
        {
          id: 'ben5',
          seniorCitizenId: '3',
          name: 'Sofia Reyes',
          relationship: 'Daughter',
          dateOfBirth: '1988-09-12',
          gender: 'female',
          address: '654 Maple Street, City',
          contactPhone: '+639123456784',
          occupation: 'Accountant',
          monthlyIncome: 38000,
          isDependent: false,
          createdAt: '2024-01-08T10:00:00Z',
          updatedAt: '2024-01-08T10:00:00Z'
        }
      ],
      createdAt: '2024-01-08T10:00:00Z',
      updatedAt: '2024-01-08T10:00:00Z',
      createdBy: 'admin1',
      updatedBy: 'admin1'
    }
  ];

  const stats = [
    {
      title: 'Total Seniors',
      value: '15,420',
      change: '+156',
      icon: Users,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    },
    {
      title: 'Active Seniors',
      value: '14,892',
      change: '+89',
      icon: UserPlus,
      color: 'bg-[#ffd416]',
      textColor: 'text-[#ffd416]'
    },
    {
      title: 'New This Month',
      value: '234',
      change: '+23',
      icon: Calendar,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    },
    {
      title: 'Pending Review',
      value: '45',
      change: '-12',
      icon: FileText,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    }
  ];

  const handleAddSenior = () => {
    setIsAddModalOpen(true);
  };

  const handleEditSenior = (senior: SeniorCitizen) => {
    setSelectedSenior(senior);
    setIsEditModalOpen(true);
  };

  const handleViewSenior = (senior: SeniorCitizen) => {
    setSelectedSenior(senior);
    setIsViewModalOpen(true);
  };

  const handleDeleteSenior = (senior: SeniorCitizen) => {
    setSelectedSenior(senior);
    setIsDeleteDialogOpen(true);
  };

  const handleExportData = () => {
    // Export functionality
    console.log('Exporting senior citizens data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#333333]">Senior Citizens</h1>
          <p className="text-[#666666] mt-2">
            Manage and monitor all registered senior citizens
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportData}
            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={handleAddSenior}
            className="bg-[#00af8f] hover:bg-[#00af90] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Senior Citizen
          </Button>
        </div>
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4" />
                <Input
                  placeholder="Search by name, OSCA ID, or barangay..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
              <Select value={barangayFilter} onValueChange={setBarangayFilter}>
                <SelectTrigger className="w-40 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                  <SelectValue placeholder="Barangay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Barangays</SelectItem>
                  <SelectItem value="Barangay 1">Barangay 1</SelectItem>
                  <SelectItem value="Barangay 2">Barangay 2</SelectItem>
                  <SelectItem value="Barangay 3">Barangay 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Senior Citizens Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00af8f]" />
            Senior Citizens ({mockSeniors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SeniorCitizensTable
            seniors={mockSeniors}
            onEdit={handleEditSenior}
            onView={handleViewSenior}
            onDelete={handleDeleteSenior}
          />
        </CardContent>
      </Card>

      {/* Modals and Dialogs */}
      <AddSeniorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          // Refresh data
        }}
      />

      {selectedSenior && (
        <>
          <EditSeniorModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            senior={selectedSenior}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedSenior(null);
              // Refresh data
            }}
          />

          <ViewSeniorModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            senior={selectedSenior}
          />

          <DeleteSeniorDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            senior={selectedSenior}
            onSuccess={() => {
              setIsDeleteDialogOpen(false);
              setSelectedSenior(null);
              // Refresh data
            }}
          />
        </>
      )}
    </div>
  );
}
