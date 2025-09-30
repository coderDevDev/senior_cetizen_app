'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Headphones,
  PenTool,
  Zap,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Settings,
  FileText,
  Activity,
  Brain,
  Video,
  Image,
  Play,
  Mic,
  Type,
  Table,
  BarChart3,
  Sparkles,
  GraduationCap,
  Lightbulb,
  Rocket,
  Database
} from 'lucide-react';
import {
  VARKModule,
  VARKModuleContentSection,
  VARKModuleCategory
} from '@/types/vark-module';
import { Class } from '@/types/class';
import { sampleCellDivisionModule } from '@/data/sample-cell-division-module';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import BasicInfoStep from './steps/basic-info-step';
import ContentStructureStep from './steps/content-structure-step';
import MultimediaStep from './steps/multimedia-step';
import InteractiveElementsStep from './steps/interactive-elements-step';
import AssessmentStep from './steps/assessment-step';
import ReviewStep from './steps/review-step';
import DynamicModuleViewer from './dynamic-module-viewer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface VARKModuleBuilderProps {
  onSave: (module: VARKModule) => void;
  onCancel: () => void;
  initialData?: Partial<VARKModule>;
  categories?: VARKModuleCategory[];
  teacherClasses?: Class[];
}

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

const contentTypeIcons = {
  text: Type,
  video: Video,
  audio: Mic,
  interactive: Play,
  activity: Activity,
  assessment: FileText,
  quick_check: CheckCircle,
  highlight: Brain,
  table: Table,
  diagram: BarChart3
};

const stepConfig = [
  {
    step: 1,
    title: 'Basic Info',
    description: 'Module fundamentals',
    icon: BookOpen,
    color: 'from-teal-500 to-teal-600'
  },
  {
    step: 2,
    title: 'Content Structure',
    description: 'Build your sections',
    icon: Activity,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    step: 3,
    title: 'Multimedia',
    description: 'Add rich content',
    icon: Video,
    color: 'from-teal-600 to-emerald-600'
  },
  {
    step: 4,
    title: 'Interactive Elements',
    description: 'Engage learners',
    icon: Play,
    color: 'from-emerald-600 to-teal-700'
  },
  {
    step: 5,
    title: 'Assessment',
    description: 'Test knowledge',
    icon: FileText,
    color: 'from-teal-700 to-emerald-700'
  },
  {
    step: 6,
    title: 'Review & Save',
    description: 'Finalize module',
    icon: CheckCircle,
    color: 'from-emerald-700 to-teal-800'
  }
];

export default function VARKModuleBuilder({
  onSave,
  onCancel,
  initialData,
  categories = [],
  teacherClasses = []
}: VARKModuleBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Modal states
  const [sampleDataModal, setSampleDataModal] = useState({
    isOpen: false,
    type: 'warning' as const
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: ''
  });
  const [formData, setFormData] = useState<Partial<VARKModule>>({
    id: initialData?.id || crypto.randomUUID(),
    category_id: initialData?.category_id || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    learning_objectives: initialData?.learning_objectives || [''],
    content_structure:
      initialData?.content_structure ||
      ({
        sections: [],
        learning_path: [],
        prerequisites_checklist: [''],
        completion_criteria: ['']
      } as any),
    difficulty_level: initialData?.difficulty_level || 'beginner',
    estimated_duration_minutes: initialData?.estimated_duration_minutes || 30,
    prerequisites: initialData?.prerequisites || [''],
    multimedia_content: initialData?.multimedia_content || {
      videos: [''],
      images: [''],
      diagrams: [''],
      podcasts: [''],
      audio_lessons: [''],
      discussion_guides: [''],
      interactive_simulations: [''],
      hands_on_activities: [''],
      animations: [''],
      virtual_labs: [''],
      interactive_diagrams: ['']
    },
    interactive_elements: initialData?.interactive_elements || {
      drag_and_drop: false,
      visual_builder: false,
      simulation: false,
      audio_playback: false,
      discussion_forum: false,
      voice_recording: false,
      text_editor: false,
      note_taking: false,
      physical_activities: false,
      experiments: false,
      interactive_quizzes: false,
      progress_tracking: false,
      virtual_laboratory: false,
      gamification: false
    },
    assessment_questions: initialData?.assessment_questions || [],
    module_metadata: initialData?.module_metadata || {
      content_standards: [''],
      learning_competencies: [''],
      key_concepts: [''],
      vocabulary: [''],
      real_world_applications: [''],
      extension_activities: [''],
      assessment_rubrics: {},
      accessibility_features: [''],
      estimated_completion_time: 30,
      difficulty_indicators: ['']
    },
    is_published: initialData?.is_published || false,
    created_by: initialData?.created_by || 'teacher-001',
    created_at: initialData?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Class targeting fields
    target_class_id: initialData?.target_class_id || '',
    target_learning_styles: initialData?.target_learning_styles || []
  });

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = (updates: Partial<VARKModule>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addArrayItem = (field: keyof VARKModule, item: string) => {
    const currentArray = formData[field] as string[];
    updateFormData({ [field]: [...(currentArray || []), item] });
  };

  const removeArrayItem = (field: keyof VARKModule, index: number) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    updateFormData({ [field]: newArray });
  };

  const updateArrayItem = (
    field: keyof VARKModule,
    index: number,
    value: string
  ) => {
    const currentArray = formData[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    updateFormData({ [field]: newArray });
  };

  const addContentSection = () => {
    const newSection: VARKModuleContentSection = {
      id: crypto.randomUUID(),
      title: '',
      content_type: 'text',
      content_data: { text: '' },
      position: (formData.content_structure?.sections?.length || 0) + 1,
      is_required: true,
      time_estimate_minutes: 5,
      learning_style_tags: ['reading_writing'],
      interactive_elements: [],
      metadata: {
        key_points: ['']
      }
    };

    const updatedSections = [
      ...(formData.content_structure?.sections || []),
      newSection
    ];
    updateFormData({
      content_structure: {
        ...formData.content_structure,
        sections: updatedSections
      } as any
    });
  };

  const updateContentSection = (
    index: number,
    updates: Partial<VARKModuleContentSection>
  ) => {
    const updatedSections = [...(formData.content_structure?.sections || [])];
    updatedSections[index] = { ...updatedSections[index], ...updates };
    updateFormData({
      content_structure: {
        ...formData.content_structure,
        sections: updatedSections
      } as any
    });
  };

  const removeContentSection = (index: number) => {
    const updatedSections =
      formData.content_structure?.sections?.filter((_, i) => i !== index) || [];
    updateFormData({
      content_structure: {
        ...formData.content_structure,
        sections: updatedSections
      } as any
    });
  };

  const handleSave = () => {
    if (formData.content_structure?.sections?.length === 0) {
      alert('Please add at least one content section before saving.');
      return;
    }
    onSave(formData as VARKModule);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  const populateSampleData = () => {
    setSampleDataModal({ isOpen: true, type: 'warning' });
  };

  const confirmPopulateSampleData = () => {
    // Populate form with sample data from the cell division module
    const populatedData = {
      id: crypto.randomUUID(),
      category_id: sampleCellDivisionModule.category_id,
      title: sampleCellDivisionModule.title,
      description: sampleCellDivisionModule.description,
      learning_objectives: sampleCellDivisionModule.learning_objectives,
      content_structure: sampleCellDivisionModule.content_structure,
      difficulty_level: sampleCellDivisionModule.difficulty_level,
      estimated_duration_minutes:
        sampleCellDivisionModule.estimated_duration_minutes,
      prerequisites: sampleCellDivisionModule.prerequisites,
      multimedia_content: sampleCellDivisionModule.multimedia_content,
      interactive_elements: sampleCellDivisionModule.interactive_elements,
      assessment_questions: sampleCellDivisionModule.assessment_questions,
      module_metadata: sampleCellDivisionModule.module_metadata,
      is_published: false, // Keep as draft for editing
      created_by: initialData?.created_by || 'teacher-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Class targeting fields
      target_class_id: '',
      target_learning_styles: [
        'visual',
        'auditory',
        'reading_writing',
        'kinesthetic'
      ]
    };

    console.log('Populating sample data:', populatedData);
    console.log('Assessment questions:', populatedData.assessment_questions);

    setFormData(populatedData);

    // Show success message
    setSuccessModal({
      isOpen: true,
      message:
        'Sample data populated successfully! You can now navigate through all steps to see how the form looks with real content.'
    });

    // Close the confirmation modal
    setSampleDataModal({ isOpen: false, type: 'warning' });
  };

  const getPreviewModuleData = useCallback((): VARKModule => {
    // Ensure we have at least one content section for preview
    const contentStructure = formData.content_structure || {
      sections: [],
      learning_path: [],
      prerequisites_checklist: [''],
      completion_criteria: ['']
    };

    const sections =
      (contentStructure.sections?.length || 0) > 0
        ? contentStructure.sections
        : [
            {
              id: 'preview-section',
              title: 'Preview Section',
              content_type: 'text',
              content_data: {
                text: 'This is a preview section. Add content sections to see the full preview.'
              },
              position: 1,
              is_required: true,
              time_estimate_minutes: 5,
              learning_style_tags: ['visual'],
              interactive_elements: [],
              metadata: { key_points: ['Preview mode'] }
            }
          ];

    // Ensure assessment questions have proper structure to prevent RadioGroup issues
    const safeAssessmentQuestions = (formData.assessment_questions || []).map(
      q => ({
        id: q.id || crypto.randomUUID(),
        type: q.type || 'multiple_choice',
        question: q.question || 'Question text',
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: q.correct_answer || 'Option A',
        points: q.points || 1,
        max_duration: q.max_duration || null,
        interactive_config: q.interactive_config || null
      })
    );

    return {
      ...formData,
      id: formData.id || crypto.randomUUID(),
      content_structure: {
        sections,
        learning_path: contentStructure.learning_path || [],
        prerequisites_checklist: contentStructure.prerequisites_checklist || [
          ''
        ],
        completion_criteria: contentStructure.completion_criteria || ['']
      },
      // Ensure other required fields have defaults
      multimedia_content: formData.multimedia_content || {
        videos: [''],
        images: [''],
        diagrams: [''],
        podcasts: [''],
        audio_lessons: [''],
        discussion_guides: [''],
        interactive_simulations: [''],
        hands_on_activities: [''],
        animations: [''],
        virtual_labs: [''],
        interactive_diagrams: ['']
      },
      interactive_elements: formData.interactive_elements || {
        drag_and_drop: false,
        visual_builder: false,
        simulation: false,
        audio_playback: false,
        discussion_forum: false,
        voice_recording: false,
        text_editor: false,
        note_taking: false,
        physical_activities: false,
        experiments: false,
        interactive_quizzes: false,
        progress_tracking: false
      },
      assessment_questions: safeAssessmentQuestions
    } as VARKModule;
  }, [formData]);

  // Memoize preview module data to prevent unnecessary re-renders
  const previewModuleData = useMemo(() => {
    return getPreviewModuleData();
  }, [getPreviewModuleData]);

  // Memoize callback functions to prevent infinite loops
  const handleProgressUpdate = useCallback(
    (sectionId: string, completed: boolean) => {
      // In preview mode, we can track progress but not save it
      console.log(
        `Section ${sectionId} ${completed ? 'completed' : 'in progress'}`
      );
    },
    []
  );

  const handleSectionComplete = useCallback((sectionId: string) => {
    // In preview mode, we can track completion but not save it
    console.log(`Section ${sectionId} completed`);
  }, []);

  const currentStepConfig = stepConfig.find(
    config => config.step === currentStep
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full blur-3xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="p-3 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent mb-4">
                Create VARK Learning Module
              </h1>
              {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Build an interactive, dynamic learning experience tailored to
                different learning styles. Create engaging content that adapts
                to visual, auditory, reading/writing, and kinesthetic learners.
              </p> */}
              {/*                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                 <div className="flex items-center space-x-2">
                   <Rocket className="w-4 h-4 text-teal-500" />
                   <span>AI-Powered Builder</span>
                 </div>
                 <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                 <div className="flex items-center space-x-2">
                   <CheckCircle className="w-4 h-4 text-emerald-500" />
                   <span>Multi-Format Support</span>
                 </div>
                 <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                 <div className="flex items-center space-x-2">
                   <Eye className="w-4 h-4 text-teal-600" />
                   <span>Live Preview</span>
                 </div>
               </div> */}
            </div>
          </div>
        </div>

        {/* Sample Data Info */}
        {/* <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800">
                    Quick Start with Sample Data
                  </h3>
                  <p className="text-emerald-700">
                    Click "Populate Sample Data" above to see how all form
                    fields look with real content. This will populate all steps
                    with a complete Cell Division module example.
                  </p>
                  <div className="mt-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800 font-medium">
                      💾 <strong>Database Integration:</strong> When you click
                      "Save Module" on the final step, your module will be saved
                      to the database and appear in the teacher's VARK modules
                      list where you can view, edit, update, and delete it.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={populateSampleData}
                size="sm"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                <Database className="w-4 h-4 mr-2" />
                Try Sample Data
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* Enhanced Progress Bar */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Step Progress */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Progress
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      Step {currentStep} of {totalSteps}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">
                    Completion
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(progressPercentage)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <Progress
                  value={progressPercentage}
                  className="h-3 bg-gray-100 rounded-full overflow-hidden"
                />
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Getting Started</span>
                  <span>Almost Done</span>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="grid grid-cols-6 gap-4">
                {stepConfig.map(step => {
                  const isActive = step.step === currentStep;
                  const isCompleted = step.step < currentStep;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.step}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        isActive ? 'scale-110' : 'hover:scale-105'
                      }`}
                      onClick={() => setCurrentStep(step.step)}>
                      <div
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-br ${step.color} border-transparent shadow-lg`
                            : isCompleted
                            ? 'bg-green-50 border-green-200 shadow-md'
                            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}>
                        <div
                          className={`flex flex-col items-center space-y-2 ${
                            isActive
                              ? 'text-white'
                              : isCompleted
                              ? 'text-green-700'
                              : 'text-gray-600'
                          }`}>
                          <div
                            className={`p-2 rounded-lg ${
                              isActive
                                ? 'bg-white/20'
                                : isCompleted
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                            }`}>
                            <Icon
                              className={`w-5 h-5 ${
                                isActive
                                  ? 'text-white'
                                  : isCompleted
                                  ? 'text-green-600'
                                  : 'text-gray-500'
                              }`}
                            />
                          </div>
                          <div className="text-center">
                            <p
                              className={`text-xs font-semibold ${
                                isActive
                                  ? 'text-white'
                                  : isCompleted
                                  ? 'text-green-800'
                                  : 'text-gray-700'
                              }`}>
                              {step.title}
                            </p>
                            <p
                              className={`text-xs ${
                                isActive
                                  ? 'text-white/80'
                                  : isCompleted
                                  ? 'text-green-600'
                                  : 'text-gray-500'
                              }`}>
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {/* Completion Check */}
                        {isCompleted && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-br ${
                    currentStepConfig?.color || 'from-gray-500 to-gray-600'
                  }`}>
                  {currentStepConfig?.icon &&
                    React.createElement(currentStepConfig.icon, {
                      className: 'w-8 h-8 text-white'
                    })}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {currentStepConfig?.title}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {currentStepConfig?.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Populate Sample Data Button */}
                <Button
                  variant="outline"
                  onClick={populateSampleData}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200 shadow-md hover:shadow-lg">
                  <Database className="w-4 h-4 mr-2" />
                  Populate Sample Data
                </Button>

                {/* Preview Button */}
                <Button
                  variant="outline"
                  onClick={openPreview}
                  className="border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 shadow-md hover:shadow-lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Module
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {currentStep === 1 && (
              <BasicInfoStep
                formData={formData}
                updateFormData={updateFormData}
                categories={categories}
                teacherClasses={teacherClasses}
              />
            )}

            {currentStep === 2 && (
              <ContentStructureStep
                formData={formData}
                updateFormData={updateFormData}
                addContentSection={addContentSection}
                updateContentSection={updateContentSection}
                removeContentSection={removeContentSection}
              />
            )}

            {currentStep === 3 && (
              <MultimediaStep
                formData={formData}
                updateFormData={updateFormData}
                addArrayItem={addArrayItem}
                removeArrayItem={removeArrayItem}
                updateArrayItem={updateArrayItem}
              />
            )}

            {currentStep === 4 && (
              <InteractiveElementsStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {currentStep === 5 && (
              <AssessmentStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {currentStep === 6 && (
              <ReviewStep formData={formData} onSave={handleSave} />
            )}
          </CardContent>
        </Card>

        {/* Enhanced Navigation */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 border-2 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Previous</span>
              </Button>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200">
                  Cancel
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                    <span>Next Step</span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                    <Save className="w-5 h-5" />
                    <span>Save Module</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced VARK Module Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 border-b border-teal-100">
            <DialogTitle className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <span>Module Preview</span>
                <p className="text-lg font-normal text-gray-600 mt-1">
                  See exactly how your module will appear to students
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] pr-2 p-6">
            {previewModuleData ? (
              <DynamicModuleViewer
                key={previewModuleData.id}
                module={previewModuleData}
                onProgressUpdate={handleProgressUpdate}
                onSectionComplete={handleSectionComplete}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-gray-500 text-lg">Loading preview...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sample Data Confirmation Modal */}
      <ConfirmationModal
        isOpen={sampleDataModal.isOpen}
        onClose={() => setSampleDataModal({ isOpen: false, type: 'warning' })}
        onConfirm={confirmPopulateSampleData}
        title="Populate Sample Data"
        description="This will populate all form fields with sample data from a Cell Division module. Any existing data will be replaced. Continue?"
        confirmText="Yes, Populate Data"
        cancelText="Cancel"
        type="warning"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        onConfirm={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Success!"
        description={successModal.message}
        confirmText="OK"
        cancelText=""
        type="success"
      />
    </div>
  );
}
