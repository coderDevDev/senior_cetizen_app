'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { VARKModulesAPI } from '@/lib/api/vark-modules';
import { ClassesAPI } from '@/lib/api/classes';
import {
  type VARKModule,
  type VARKModuleCategory,
  type VARKModuleStats
} from '@/types/vark-module';
import { type Class } from '@/types/class';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Headphones,
  PenTool,
  Zap,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreHorizontal,
  Loader2,
  TrendingUp,
  Users,
  Clock,
  Star,
  Target,
  Settings,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import VARKModuleBuilder from '@/components/vark-modules/vark-module-builder';
import DeleteConfirmationModal from '@/components/ui/delete-confirmation-modal';
import { Toaster } from 'sonner';

const learningStyleIcons = {
  visual: Eye,
  auditory: Headphones,
  reading_writing: PenTool,
  kinesthetic: Zap
};

const learningStyleColors = {
  visual: 'from-blue-500 to-blue-600',
  auditory: 'from-green-500 to-green-600',
  reading_writing: 'from-purple-500 to-purple-600',
  kinesthetic: 'from-orange-500 to-orange-600'
};

const learningStyleLabels = {
  visual: 'Visual',
  auditory: 'Auditory',
  reading_writing: 'Reading/Writing',
  kinesthetic: 'Kinesthetic'
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export default function TeacherVARKModulesPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<VARKModule[]>([]);
  const [categories, setCategories] = useState<VARKModuleCategory[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLearningStyle, setSelectedLearningStyle] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<VARKModule | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    moduleId?: string;
    isBulk: boolean;
    count?: number;
  }>({
    isOpen: false,
    moduleId: undefined,
    isBulk: false,
    count: 0
  });

  const varkAPI = new VARKModulesAPI();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // Load categories first
      const categoriesData = await varkAPI.getCategories();
      setCategories(categoriesData);

      // Load teacher classes for module targeting
      if (user?.id) {
        const classesData = await ClassesAPI.getTeacherClasses(user.id);
        setTeacherClasses(classesData);
      }

      // Load all modules (teachers can see all)
      const modulesData = await varkAPI.getModules();
      setModules(modulesData);
    } catch (error) {
      console.error('Error loading VARK modules data:', error);
      toast.error('Failed to load VARK modules data');
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleTogglePublish = async (
    moduleId: string,
    currentStatus: boolean
  ) => {
    try {
      await varkAPI.toggleModulePublish(moduleId, !currentStatus);

      // Update local state
      setModules(prev =>
        prev.map(module =>
          module.id === moduleId
            ? { ...module, is_published: !currentStatus }
            : module
        )
      );

      toast.success(
        `Module ${currentStatus ? 'unpublished' : 'published'} successfully`
      );
    } catch (error) {
      console.error('Error toggling module publish status:', error);
      toast.error('Failed to update module status');
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    setDeleteModal({
      isOpen: true,
      moduleId,
      isBulk: false,
      count: 1
    });
  };

  const confirmDeleteModule = async () => {
    if (!deleteModal.moduleId) return;

    try {
      await varkAPI.deleteModule(deleteModal.moduleId);

      // Update local state
      setModules(prev =>
        prev.filter(module => module.id !== deleteModal.moduleId)
      );

      toast.success('Module deleted successfully');
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    } finally {
      setDeleteModal({
        isOpen: false,
        moduleId: undefined,
        isBulk: false,
        count: 0
      });
    }
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    setIsBuilderOpen(true);
  };

  const handleEditModule = (module: VARKModule) => {
    setEditingModule(module);
    setIsBuilderOpen(true);
  };

  const handleViewModule = (module: VARKModule) => {
    // For now, we'll show module details in a toast
    // In the future, this could open a detailed view modal
    toast.success(
      `${module.title} - Subject: ${module.category?.subject} | Learning Style: ${module.category?.learning_style} | Difficulty: ${module.difficulty_level}`
    );
  };

  const handleBuilderClose = () => {
    setIsBuilderOpen(false);
    setEditingModule(null);
  };

  const handleModuleSave = async (moduleData: VARKModule) => {
    try {
      setIsSaving(true);
      if (editingModule) {
        // Update existing module
        const updatedModule = await varkAPI.updateModule(
          editingModule.id,
          moduleData
        );
        setModules(prev =>
          prev.map(module =>
            module.id === editingModule.id ? updatedModule : module
          )
        );
        toast.success('Module updated successfully');
      } else {
        // Create new module
        const { id, ...moduleDataWithoutId } = moduleData;
        const newModule = await varkAPI.createModule({
          ...moduleDataWithoutId,
          created_by: user!.id
        });
        setModules(prev => [newModule, ...prev]);
        toast.success('Module created successfully');
      }
      handleBuilderClose();
      // Refetch data to show the new/updated module
      await loadData(true);
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error('Failed to save module');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectModule = (moduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedModules(prev => [...prev, moduleId]);
    } else {
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
    }
  };

  const handleSelectAllModules = (checked: boolean) => {
    if (checked) {
      setSelectedModules(filteredModules.map(module => module.id));
    } else {
      setSelectedModules([]);
    }
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedModules.length === 0) return;

    try {
      const promises = selectedModules.map(moduleId =>
        varkAPI.toggleModulePublish(moduleId, publish)
      );
      await Promise.all(promises);

      // Update local state
      setModules(prev =>
        prev.map(module =>
          selectedModules.includes(module.id)
            ? { ...module, is_published: publish }
            : module
        )
      );

      setSelectedModules([]);
      toast.success(
        `${selectedModules.length} modules ${
          publish ? 'published' : 'unpublished'
        } successfully`
      );
    } catch (error) {
      console.error('Error bulk updating modules:', error);
      toast.error('Failed to update some modules');
    }
  };

  const handleBulkDelete = () => {
    if (selectedModules.length === 0) return;

    setDeleteModal({
      isOpen: true,
      moduleId: undefined,
      isBulk: true,
      count: selectedModules.length
    });
  };

  const confirmBulkDelete = async () => {
    if (selectedModules.length === 0) return;

    try {
      const promises = selectedModules.map(moduleId =>
        varkAPI.deleteModule(moduleId)
      );
      await Promise.all(promises);

      // Update local state
      setModules(prev =>
        prev.filter(module => !selectedModules.includes(module.id))
      );

      setSelectedModules([]);
      toast.success(`${selectedModules.length} modules deleted successfully`);
    } catch (error) {
      console.error('Error bulk deleting modules:', error);
      toast.error('Failed to delete some modules');
    } finally {
      setDeleteModal({
        isOpen: false,
        moduleId: undefined,
        isBulk: false,
        count: 0
      });
    }
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === 'all' || module.category?.subject === selectedSubject;
    const matchesLearningStyle =
      selectedLearningStyle === 'all' ||
      (module.target_learning_styles &&
        module.target_learning_styles.includes(selectedLearningStyle as any));
    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      module.difficulty_level === selectedDifficulty;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'published' && module.is_published) ||
      (selectedStatus === 'unpublished' && !module.is_published);

    return (
      matchesSearch &&
      matchesSubject &&
      matchesLearningStyle &&
      matchesDifficulty &&
      matchesStatus
    );
  });

  const subjects = Array.from(new Set(categories.map(cat => cat.subject)));
  const learningStyles = [
    'visual',
    'auditory',
    'reading_writing',
    'kinesthetic'
  ];
  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];
  const statusOptions = ['published', 'unpublished'];

  const getModuleStats = (module: VARKModule) => {
    // This would typically come from the API, but for now we'll show placeholder data
    return {
      totalStudents: Math.floor(Math.random() * 50) + 5,
      completedStudents: Math.floor(Math.random() * 30) + 2,
      averageRating: (Math.random() * 2 + 3).toFixed(1),
      totalTimeSpent: Math.floor(Math.random() * 120) + 30
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00af8f]" />
          <p className="text-lg text-gray-600">Loading VARK modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isBuilderOpen ? (
            // Builder Header
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleBuilderClose}
                className="border-gray-300 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Modules
              </Button>
              {/* <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {editingModule
                      ? 'Edit VARK Module'
                      : 'Create New VARK Module'}
                  </h1>
                  <p className="text-gray-600">
                    Build a comprehensive learning module with VARK learning
                    style integration
                  </p>
                </div>
              </div> */}
            </div>
          ) : (
            // Modules List Header
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    VARK Modules Management
                  </h1>
                  <p className="text-gray-600">
                    Create and manage personalized learning modules
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => loadData(true)}
                  disabled={isRefreshing}
                  className="border-gray-300 hover:bg-gray-50">
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button
                  onClick={handleCreateModule}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Create New Module'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show Builder or Modules List */}
      {isBuilderOpen ? (
        // VARK Module Builder
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VARKModuleBuilder
            onSave={handleModuleSave}
            onCancel={handleBuilderClose}
            initialData={editingModule || undefined}
            categories={categories}
            teacherClasses={teacherClasses}
          />
        </div>
      ) : (
        // Modules List Content
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-[#00af8f]" />
                Filter & Search Modules
              </h3>
              <p className="text-sm text-gray-600">
                Use the filters below to find specific modules quickly. Learning
                Style filter searches through the module's target learning
                styles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-1">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-700 mb-2 block">
                  Search Modules
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-[#00af8f] focus:ring-[#00af8f]"
                  />
                </div>
              </div>

              {/* Subject Filter */}
              <div>
                <Label
                  htmlFor="subject"
                  className="text-sm font-medium text-gray-700 mb-2 block">
                  Subject
                </Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}>
                  <SelectTrigger
                    id="subject"
                    className="border-gray-300 focus:border-[#00af8f] focus:ring-[#00af8f]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Learning Style Filter */}
              <div>
                <Label
                  htmlFor="learning-style"
                  className="text-sm font-medium text-gray-700 mb-2 block">
                  Learning Style
                </Label>
                <Select
                  value={selectedLearningStyle}
                  onValueChange={setSelectedLearningStyle}>
                  <SelectTrigger
                    id="learning-style"
                    className="border-gray-300 focus:border-[#00af8f] focus:ring-[#00af8f]">
                    <SelectValue placeholder="All Styles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Learning Styles</SelectItem>
                    {learningStyles.map(style => (
                      <SelectItem key={style} value={style}>
                        {
                          learningStyleLabels[
                            style as keyof typeof learningStyleLabels
                          ]
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <Label
                  htmlFor="difficulty"
                  className="text-sm font-medium text-gray-700 mb-2 block">
                  Difficulty
                </Label>
                <Select
                  value={selectedDifficulty}
                  onValueChange={setSelectedDifficulty}>
                  <SelectTrigger
                    id="difficulty"
                    className="border-gray-300 focus:border-[#00af8f] focus:ring-[#00af8f]">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}>
                  <SelectTrigger
                    id="status"
                    className="border-gray-300 focus:border-[#00af8f] focus:ring-[#00af8f]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm ||
              selectedSubject !== 'all' ||
              selectedLearningStyle !== 'all' ||
              selectedDifficulty !== 'all' ||
              selectedStatus !== 'all') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      Active Filters:
                    </span>
                    {searchTerm && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800">
                        Search: "{searchTerm}"
                      </Badge>
                    )}
                    {selectedSubject !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800">
                        Subject: {selectedSubject}
                      </Badge>
                    )}
                    {selectedLearningStyle !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800">
                        Learning Style:{' '}
                        {
                          learningStyleLabels[
                            selectedLearningStyle as keyof typeof learningStyleLabels
                          ]
                        }
                      </Badge>
                    )}
                    {selectedDifficulty !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800">
                        Difficulty:{' '}
                        {selectedDifficulty.charAt(0).toUpperCase() +
                          selectedDifficulty.slice(1)}
                      </Badge>
                    )}
                    {selectedStatus !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-800">
                        Status:{' '}
                        {selectedStatus.charAt(0).toUpperCase() +
                          selectedStatus.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSubject('all');
                      setSelectedLearningStyle('all');
                      setSelectedDifficulty('all');
                      setSelectedStatus('all');
                    }}
                    className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400">
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Total Modules
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {modules.length}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Published
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {modules.filter(m => m.is_published).length}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Draft</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {modules.filter(m => !m.is_published).length}
                    </p>
                  </div>
                  <Pause className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      Categories
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {categories.length}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modules Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Bulk Actions */}
            {selectedModules.length > 0 && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-700">
                      {selectedModules.length} module
                      {selectedModules.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkPublish(true)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <Play className="w-4 h-4 mr-1" />
                      Publish All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkPublish(false)}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                      <Pause className="w-4 h-4 mr-1" />
                      Unpublish All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="border-red-300 text-red-700 hover:bg-red-100">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedModules([])}
                      className="text-blue-600 hover:text-blue-800">
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredModules.length === 0
                    ? 'No modules found'
                    : `${filteredModules.length} modules`}
                </h2>
                {filteredModules.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Filter className="w-4 h-4" />
                    <span>Filtered results</span>
                  </div>
                )}
              </div>
            </div>

            {filteredModules.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {modules.length === 0
                    ? 'No modules created yet'
                    : 'No modules match your filters'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {modules.length === 0
                    ? 'Create your first VARK learning module to get started.'
                    : 'Try adjusting your search criteria or filters to find more modules.'}
                </p>
                {modules.length === 0 ? (
                  <Button
                    onClick={handleCreateModule}
                    className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Module
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSubject('all');
                      setSelectedLearningStyle('all');
                      setSelectedDifficulty('all');
                      setSelectedStatus('all');
                    }}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedModules.length ===
                                filteredModules.length &&
                              filteredModules.length > 0
                            }
                            onChange={e =>
                              handleSelectAllModules(e.target.checked)
                            }
                            className="w-4 h-4 text-[#00af8f] bg-gray-100 border-gray-300 rounded focus:ring-[#00af8f] focus:ring-2"
                          />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Learning Styles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredModules.map(module => {
                      const stats = getModuleStats(module);

                      return (
                        <tr key={module.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedModules.includes(module.id)}
                                onChange={e =>
                                  handleSelectModule(
                                    module.id,
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 text-[#00af8f] bg-gray-100 border-gray-300 rounded focus:ring-[#00af8f] focus:ring-2"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {(() => {
                                  // Use target learning styles if available, otherwise fallback to category
                                  let learningStyle: keyof typeof learningStyleIcons;
                                  if (
                                    module.target_learning_styles &&
                                    module.target_learning_styles.length > 0
                                  ) {
                                    // Use the first target learning style for the icon
                                    learningStyle = module
                                      .target_learning_styles[0] as keyof typeof learningStyleIcons;
                                  } else {
                                    learningStyle = (module.category
                                      ?.learning_style ||
                                      'visual') as keyof typeof learningStyleIcons;
                                  }

                                  const Icon =
                                    learningStyleIcons[learningStyle];
                                  return (
                                    <div
                                      className={`h-10 w-10 bg-gradient-to-r ${learningStyleColors[learningStyle]} rounded-lg flex items-center justify-center`}>
                                      <Icon className="h-5 w-5 text-white" />
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {module.title}
                                </div>
                                {module.target_learning_styles &&
                                  module.target_learning_styles.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Targets:{' '}
                                      {module.target_learning_styles
                                        .map(
                                          style =>
                                            learningStyleLabels[
                                              style as keyof typeof learningStyleLabels
                                            ]
                                        )
                                        .join(', ')}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {module.category?.subject}
                            </div>
                            <div className="text-sm text-gray-500">
                              {module.category?.grade_level}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              if (
                                module.target_learning_styles &&
                                module.target_learning_styles.length > 0
                              ) {
                                return (
                                  <div className="flex flex-wrap gap-1">
                                    {module.target_learning_styles.map(
                                      (style, index) => {
                                        const learningStyle =
                                          style as keyof typeof learningStyleIcons;
                                        return (
                                          <Badge
                                            key={index}
                                            className={`bg-gradient-to-r ${learningStyleColors[learningStyle]} text-white text-xs`}>
                                            {learningStyleLabels[learningStyle]}
                                          </Badge>
                                        );
                                      }
                                    )}
                                  </div>
                                );
                              } else {
                                // Fallback to category learning style if no target styles
                                const learningStyle = (module.category
                                  ?.learning_style ||
                                  'visual') as keyof typeof learningStyleIcons;
                                return (
                                  <Badge
                                    className={`bg-gradient-to-r ${learningStyleColors[learningStyle]} text-white`}>
                                    {learningStyleLabels[learningStyle]}
                                  </Badge>
                                );
                              }
                            })()}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                difficultyColors[
                                  module.difficulty_level as keyof typeof difficultyColors
                                ]
                              }>
                              {module.difficulty_level.charAt(0).toUpperCase() +
                                module.difficulty_level.slice(1)}
                            </Badge>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                module.is_published
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }>
                              {module.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span>{stats.totalStudents}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  <span>{stats.averageRating}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>{stats.totalTimeSpent}m</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {/* <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewModule(module)}>
                                <Eye className="w-4 h-4" />
                              </Button> */}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditModule(module)}>
                                <Edit className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleTogglePublish(
                                    module.id,
                                    module.is_published
                                  )
                                }>
                                {module.is_published ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteModule(module.id)}
                                className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            moduleId: undefined,
            isBulk: false,
            count: 0
          })
        }
        onConfirm={deleteModal.isBulk ? confirmBulkDelete : confirmDeleteModule}
        title={
          deleteModal.isBulk
            ? `Delete ${deleteModal.count} Modules`
            : 'Delete Module'
        }
        description={
          deleteModal.isBulk
            ? `Are you sure you want to delete ${deleteModal.count} modules? This action cannot be undone.`
            : 'Are you sure you want to delete this module? This action cannot be undone.'
        }
        confirmText={
          deleteModal.isBulk
            ? `Delete ${deleteModal.count} Modules`
            : 'Delete Module'
        }
        cancelText="Cancel"
      />

      {/* Sonner Toaster for notifications */}
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </div>
  );
}
