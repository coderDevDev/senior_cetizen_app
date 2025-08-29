import { Class, ClassStudent } from './class';

export interface VARKModuleCategory {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  learning_style: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  icon_name: string;
  color_scheme: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VARKModule {
  id: string;
  category_id: string;
  title: string;
  description: string;
  learning_objectives: string[];
  content_structure: VARKModuleContentStructure;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes: number;
  prerequisites: string[];
  multimedia_content: VARKMultimediaContent;
  interactive_elements: VARKInteractiveElements;
  assessment_questions: VARKAssessmentQuestion[];
  module_metadata: VARKModuleMetadata;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Class targeting fields
  target_class_id?: string;
  target_learning_styles?: string[];
  // Computed fields
  category?: VARKModuleCategory;
  teacher_name?: string;
  progress?: VARKModuleProgress;
  target_class?: Class;
  target_students?: ClassStudent[];
}

export interface VARKModuleContentStructure {
  sections: VARKModuleContentSection[];
  learning_path: VARKModuleLearningPath[];
  prerequisites_checklist: string[];
  completion_criteria: string[];
}

export interface VARKModuleContentSection {
  id: string;
  title: string;
  content_type:
    | 'text'
    | 'video'
    | 'audio'
    | 'interactive'
    | 'activity'
    | 'assessment'
    | 'quick_check'
    | 'highlight'
    | 'table'
    | 'diagram';
  content_data: VARKContentData;
  position: number;
  is_required: boolean;
  time_estimate_minutes: number;
  learning_style_tags: string[];
  interactive_elements: string[];
  metadata: {
    difficulty?: string;
    key_points?: string[];
    visual_aids?: string[];
    audio_clips?: string[];
  };
}

export interface VARKContentData {
  text?: string;
  html?: string;
  markdown?: string;
  table_data?: VARKTableData;
  quiz_data?: VARKQuizData;
  activity_data?: VARKActivityData;
  multimedia_data?: VARKMultimediaData;
  interactive_data?: VARKInteractiveData;
  video_data?: VARKVideoData;
  audio_data?: VARKAudioData;
  highlight_data?: VARKHighlightData;
  diagram_data?: VARKDiagramData;
}

export interface VARKTableData {
  headers: string[];
  rows: string[][];
  caption?: string;
  styling?: {
    zebra_stripes?: boolean;
    highlight_header?: boolean;
    responsive?: boolean;
  };
}

export interface VARKQuizData {
  question: string;
  type:
    | 'multiple_choice'
    | 'true_false'
    | 'matching'
    | 'short_answer'
    | 'interactive';
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  points: number;
  time_limit_seconds?: number;
  hints?: string[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

export interface VARKActivityData {
  title: string;
  description: string;
  type:
    | 'matching'
    | 'labeling'
    | 'drag_drop'
    | 'simulation'
    | 'experiment'
    | 'discussion';
  instructions: string[];
  materials_needed?: string[];
  expected_outcome: string;
  assessment_criteria: string[];
}

export interface VARKMultimediaData {
  type: 'image' | 'video' | 'audio' | 'diagram' | 'animation' | '3d_model';
  url: string;
  alt_text?: string;
  caption?: string;
  duration_seconds?: number;
  interactive_features?: string[];
}

export interface VARKInteractiveData {
  type:
    | 'simulation'
    | 'game'
    | 'virtual_lab'
    | 'interactive_diagram'
    | 'progress_tracker';
  config: Record<string, any>;
  user_interactions: string[];
  feedback_mechanism: string;
}

export interface VARKVideoData {
  title: string;
  url: string;
  description?: string;
  duration: number;
  autoplay?: boolean;
}

export interface VARKAudioData {
  title: string;
  url: string;
  transcript?: string;
  duration: number;
  show_transcript?: boolean;
}

export interface VARKHighlightData {
  title: string;
  concept: string;
  explanation: string;
  examples?: string[];
  style: 'info' | 'warning' | 'success' | 'error';
}

export interface VARKDiagramData {
  title: string;
  type:
    | 'flowchart'
    | 'mind_map'
    | 'venn_diagram'
    | 'timeline'
    | 'hierarchy'
    | 'process';
  image_url: string;
  description: string;
  key_elements?: string[];
  is_interactive?: boolean;
}

export interface VARKMultimediaContent {
  videos?: string[];
  images?: string[];
  diagrams?: string[];
  podcasts?: string[];
  audio_lessons?: string[];
  discussion_guides?: string[];
  interactive_simulations?: string[];
  hands_on_activities?: string[];
  animations?: string[];
  virtual_labs?: string[];
  interactive_diagrams?: string[];
}

export interface VARKInteractiveElements {
  drag_and_drop?: boolean;
  visual_builder?: boolean;
  simulation?: boolean;
  audio_playback?: boolean;
  discussion_forum?: boolean;
  voice_recording?: boolean;
  text_editor?: boolean;
  note_taking?: boolean;
  physical_activities?: boolean;
  experiments?: boolean;
  interactive_quizzes?: boolean;
  progress_tracking?: boolean;
  virtual_laboratory?: boolean;
  gamification?: boolean;
}

export interface VARKModuleMetadata {
  content_standards: string[];
  learning_competencies: string[];
  key_concepts: string[];
  vocabulary: string[];
  real_world_applications: string[];
  extension_activities: string[];
  assessment_rubrics: Record<string, any>;
  accessibility_features: string[];
  estimated_completion_time: number;
  difficulty_indicators: string[];
}

export interface VARKModuleProgress {
  id: string;
  student_id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  current_section_id?: string;
  time_spent_minutes: number;
  completed_sections: string[];
  assessment_scores: Record<string, number>;
  started_at?: string;
  completed_at?: string;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  student_name?: string;
  module_title?: string;
}

export interface VARKModuleAssignment {
  id: string;
  module_id: string;
  assigned_by: string;
  assigned_to_type: 'student' | 'class';
  assigned_to_id: string;
  due_date?: string;
  is_required: boolean;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  module?: VARKModule;
  assigned_by_name?: string;
  assigned_to_name?: string;
}

export interface VARKLearningPath {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  learning_style: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  module_sequence: string[];
  total_duration_hours: number;
  difficulty_progression: 'linear' | 'adaptive' | 'branching';
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  modules?: VARKModule[];
  teacher_name?: string;
}

export interface VARKModuleFeedback {
  id: string;
  module_id: string;
  student_id: string;
  rating: number;
  feedback_text?: string;
  difficulty_rating: number;
  engagement_rating: number;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  student_name?: string;
  module_title?: string;
}

export interface VARKAssessmentQuestion {
  id: string;
  type:
    | 'multiple_choice'
    | 'true_false'
    | 'matching'
    | 'short_answer'
    | 'audio_response'
    | 'visual_response'
    | 'interactive_response';
  question: string;
  options?: string[];
  correct_answer?: any;
  max_duration?: number; // For audio/visual responses
  points?: number;
  interactive_config?: any; // For interactive questions
}

export interface VARKModuleFilters {
  subject: string;
  grade_level: string;
  learning_style: string;
  difficulty_level: string;
  searchTerm: string;
}

export interface VARKModuleStats {
  total_modules: number;
  completed_modules: number;
  in_progress_modules: number;
  not_started_modules: number;
  completion_rate: number;
  average_rating: number;
  total_time_spent: number;
}

export interface CreateVARKModuleData {
  category_id: string;
  title: string;
  description: string;
  learning_objectives: string[];
  content_structure: VARKModuleContentStructure;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes: number;
  prerequisites: string[];
  multimedia_content: VARKMultimediaContent;
  interactive_elements: VARKInteractiveElements;
  assessment_questions: VARKAssessmentQuestion[];
  module_metadata: VARKModuleMetadata;
  is_published: boolean;
  created_by: string;
  // Class targeting fields
  target_class_id?: string;
  target_learning_styles?: string[];
}

export interface UpdateVARKModuleData {
  category_id?: string;
  title?: string;
  description?: string;
  learning_objectives?: string[];
  content_structure?: VARKModuleContentStructure;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes?: number;
  prerequisites?: string[];
  multimedia_content?: VARKMultimediaContent;
  interactive_elements?: VARKInteractiveElements;
  assessment_questions?: VARKAssessmentQuestion[];
  module_metadata?: VARKModuleMetadata;
  is_published?: boolean;
}

export interface VARKModuleFormData {
  category_id: string;
  title: string;
  description: string;
  learning_objectives: string[];
  content_structure: VARKModuleContentStructure;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes: number;
  prerequisites: string[];
  multimedia_content: VARKMultimediaContent;
  interactive_elements: VARKInteractiveElements;
  assessment_questions: VARKAssessmentQuestion[];
  module_metadata: VARKModuleMetadata;
  is_published: boolean;
}

export interface VARKModuleLearningPath {
  id: string;
  name: string;
  description: string;
  modules: VARKModule[];
  current_module_index: number;
  progress_percentage: number;
  estimated_completion_time: number;
}
