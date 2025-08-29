'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  Target,
  BookOpen,
  Video,
  Image,
  Activity,
  ChevronRight,
  ChevronLeft,
  Eye,
  Brain,
  Zap,
  Headphones,
  PenTool
} from 'lucide-react';
import { VARKModule, VARKModuleContentSection } from '@/types/vark-module';
import { Textarea } from '@/components/ui/textarea';

interface DynamicModuleViewerProps {
  module: VARKModule;
  onProgressUpdate?: (sectionId: string, completed: boolean) => void;
  onSectionComplete?: (sectionId: string) => void;
  initialProgress?: Record<string, boolean>;
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

export default function DynamicModuleViewer({
  module,
  onProgressUpdate,
  onSectionComplete,
  initialProgress = {}
}: DynamicModuleViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionProgress, setSectionProgress] =
    useState<Record<string, boolean>>(initialProgress);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [showQuizResults, setShowQuizResults] = useState<
    Record<string, boolean>
  >({});

  const mountedRef = useRef(true);
  const previousSectionsRef = useRef<string[]>([]);

  const currentSection = module.content_structure.sections[currentSectionIndex];
  const totalSections = module.content_structure.sections.length;
  const completedSections =
    Object.values(sectionProgress).filter(Boolean).length;
  const progressPercentage = (completedSections / totalSections) * 100;

  // Memoize quiz options to prevent unnecessary re-renders
  const memoizedQuizOptions = useMemo(() => {
    const options = ['Option A', 'Option B', 'Option C', 'Option D'];
    return options;
  }, []);

  // Memoize sections to prevent unnecessary re-renders
  const memoizedSections = useMemo(() => {
    return module.content_structure.sections || [];
  }, [module.content_structure.sections]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Initialize progress for all sections
    if (mountedRef.current) {
      const currentSections = memoizedSections;
      const currentSectionIds = currentSections.map(s => s.id);

      // Only update if sections have actually changed
      const sectionsChanged =
        JSON.stringify(currentSectionIds) !==
        JSON.stringify(previousSectionsRef.current);

      if (sectionsChanged) {
        previousSectionsRef.current = currentSectionIds;

        setSectionProgress(prevProgress => {
          // Only update if we don't already have progress for all sections
          const hasAllSections = currentSections.every(
            section => prevProgress[section.id] !== undefined
          );

          if (hasAllSections) {
            return prevProgress;
          }

          const initialSectionProgress: Record<string, boolean> = {};
          currentSections.forEach(section => {
            initialSectionProgress[section.id] =
              initialProgress[section.id] || false;
          });
          return { ...prevProgress, ...initialSectionProgress };
        });
      }
    }
  }, [memoizedSections, initialProgress]);

  const handleSectionComplete = useCallback(
    (sectionId: string) => {
      if (!mountedRef.current) return;

      setSectionProgress(prevProgress => {
        const newProgress = { ...prevProgress, [sectionId]: true };
        return newProgress;
      });

      // Call callbacks after state update, but only if component is still mounted
      // and callbacks are stable functions
      if (mountedRef.current) {
        try {
          if (typeof onProgressUpdate === 'function') {
            onProgressUpdate(sectionId, true);
          }
          if (typeof onSectionComplete === 'function') {
            onSectionComplete(sectionId);
          }
        } catch (error) {
          console.warn('Error calling progress callbacks:', error);
        }
      }
    },
    [onProgressUpdate, onSectionComplete]
  );

  const handleQuizSubmit = useCallback(
    (sectionId: string, answers: any) => {
      setQuizAnswers(prev => ({ ...prev, [sectionId]: answers }));
      setShowQuizResults(prev => ({ ...prev, [sectionId]: true }));
      handleSectionComplete(sectionId);
    },
    [handleSectionComplete]
  );

  const handleQuizAnswerChange = useCallback(
    (sectionId: string, questionIndex: number, value: string) => {
      setQuizAnswers(prev => ({
        ...prev,
        [sectionId]: {
          ...(prev[sectionId] || {}),
          [`question_${questionIndex}`]: value
        }
      }));
    },
    []
  );

  const renderContentSection = (section: VARKModuleContentSection) => {
    const { content_type, content_data, title, learning_style_tags, metadata } =
      section;

    switch (content_type) {
      case 'text':
        return (
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {content_data.text}
            </div>
            {metadata?.key_points && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Key Points:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  {metadata.key_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'table':
        if (content_data.table_data) {
          const { headers, rows, caption, styling } = content_data.table_data;
          return (
            <div className="overflow-x-auto">
              <table
                className={`w-full border-collapse ${
                  styling?.zebra_stripes ? 'striped' : ''
                }`}>
                {caption && (
                  <caption className="text-sm text-gray-600 mb-2">
                    {caption}
                  </caption>
                )}
                <thead>
                  <tr
                    className={`${
                      styling?.highlight_header ? 'bg-gray-100' : 'bg-gray-50'
                    }`}>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`${
                        styling?.zebra_stripes && rowIndex % 2 === 1
                          ? 'bg-gray-50'
                          : ''
                      } hover:bg-gray-100`}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;

      case 'video':
        if (content_data.video_data) {
          const video = content_data.video_data;
          return (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  {video.title || 'Video Content'}
                </h4>

                {video.description && (
                  <p className="text-gray-600 mb-4 text-center">
                    {video.description}
                  </p>
                )}

                {video.url ? (
                  <div className="w-full max-w-2xl mx-auto">
                    {/* Check if it's a YouTube URL and convert to embed */}
                    {video.url.includes('youtube.com/watch') ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={video.url.replace('watch?v=', 'embed/')}
                          title={video.title || 'Video'}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                    ) : video.url.includes('vimeo.com') ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={`https://player.vimeo.com/video/${video.url
                            .split('/')
                            .pop()}`}
                          title={video.title || 'Video'}
                          allow="autoplay; fullscreen; picture-in-picture"
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                    ) : video.url.includes('embed') ||
                      video.url.includes('player') ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={video.url}
                          title={video.title || 'Video'}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                    ) : (
                      /* Direct video file */
                      <video
                        controls
                        className="w-full rounded-lg"
                        autoPlay={video.autoplay || false}
                        preload="metadata">
                        <source src={video.url} type="video/mp4" />
                        <source src={video.url} type="video/webm" />
                        <source src={video.url} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-gray-600">No video URL provided</p>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-4">
                  {video.duration && <span>Duration: {video.duration}s</span>}
                  {video.autoplay && (
                    <Badge variant="outline" className="text-xs">
                      Autoplay
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Video Content
            </h4>
            <p className="text-gray-600">
              Video content will be displayed here
            </p>
          </div>
        );

      case 'audio':
        if (content_data.audio_data) {
          const audio = content_data.audio_data;
          return (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  {audio.title || 'Audio Content'}
                </h4>

                {audio.url ? (
                  <div className="w-full max-w-md mx-auto">
                    <audio controls className="w-full" preload="metadata">
                      <source src={audio.url} type="audio/mpeg" />
                      <source src={audio.url} type="audio/ogg" />
                      <source src={audio.url} type="audio/wav" />
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Headphones className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-gray-600">No audio URL provided</p>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-4">
                  {audio.duration && <span>Duration: {audio.duration}s</span>}
                  {audio.show_transcript && (
                    <Badge variant="outline" className="text-xs">
                      Transcript Available
                    </Badge>
                  )}
                </div>

                {audio.transcript && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-800 mb-2">
                      Transcript:
                    </h5>
                    <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                      {audio.transcript}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Audio Content
            </h4>
            <p className="text-gray-600">
              Audio content will be displayed here
            </p>
          </div>
        );

      case 'highlight':
        if (content_data.highlight_data) {
          const highlight = content_data.highlight_data;
          const styleConfig = {
            info: {
              bg: 'bg-blue-50',
              border: 'border-blue-200',
              icon: Brain,
              color: 'text-blue-600'
            },
            warning: {
              bg: 'bg-yellow-50',
              border: 'border-yellow-200',
              icon: Brain,
              color: 'text-yellow-600'
            },
            success: {
              bg: 'bg-green-50',
              border: 'border-green-200',
              icon: Brain,
              color: 'text-green-600'
            },
            error: {
              bg: 'bg-red-50',
              border: 'border-red-200',
              icon: Brain,
              color: 'text-red-600'
            }
          };
          const config = styleConfig[highlight.style] || styleConfig.info;
          const Icon = config.icon;

          return (
            <div
              className={`${config.bg} ${config.border} border-2 p-4 rounded-lg`}>
              <div className="flex items-start space-x-3">
                <Icon
                  className={`w-5 h-5 ${config.color} mt-0.5 flex-shrink-0`}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {highlight.title || 'Key Highlight'}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Concept:</strong> {highlight.concept}
                  </p>
                  <p className="text-sm text-gray-600">
                    {highlight.explanation}
                  </p>
                  {highlight.examples && highlight.examples.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Examples:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {highlight.examples.map((example, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Highlight Content
            </h4>
            <p className="text-gray-600">
              Highlight content will be displayed here
            </p>
          </div>
        );

      case 'diagram':
        if (content_data.diagram_data) {
          const diagram = content_data.diagram_data;
          return (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {diagram.title || 'Diagram Content'}
                </h4>
                <p className="text-gray-600 mb-3">Type: {diagram.type}</p>
                <p className="text-gray-700 mb-4">{diagram.description}</p>
                {diagram.image_url && (
                  <div className="mt-4">
                    <img
                      src={diagram.image_url}
                      alt={diagram.title || 'Diagram'}
                      className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                    />
                  </div>
                )}
                {diagram.key_elements && diagram.key_elements.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Key Elements:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {diagram.key_elements.map((element, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {diagram.is_interactive && (
                  <Badge variant="outline" className="mt-2">
                    Interactive
                  </Badge>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Diagram Content
            </h4>
            <p className="text-gray-600">
              Diagram content will be displayed here
            </p>
          </div>
        );

      case 'interactive':
        if (content_data.interactive_data) {
          const interactive = content_data.interactive_data;
          return (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Interactive Content
                </h4>
                <p className="text-gray-600 mb-3">Type: {interactive.type}</p>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    Interactive content will be displayed here. This could
                    include:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>
                      •{' '}
                      {interactive.type === 'simulation'
                        ? 'Simulations'
                        : interactive.type === 'game'
                        ? 'Educational Games'
                        : interactive.type === 'virtual_lab'
                        ? 'Virtual Laboratory'
                        : interactive.type === 'interactive_diagram'
                        ? 'Interactive Diagrams'
                        : interactive.type === 'progress_tracker'
                        ? 'Progress Tracking'
                        : 'Interactive Elements'}
                    </li>
                    <li>
                      • User interactions:{' '}
                      {interactive.user_interactions.join(', ')}
                    </li>
                    <li>• Feedback: {interactive.feedback_mechanism}</li>
                  </ul>
                  {interactive.config &&
                    Object.keys(interactive.config).length > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                        <p className="font-medium">Configuration:</p>
                        <pre className="text-gray-600 overflow-x-auto">
                          {JSON.stringify(interactive.config, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Interactive Content
            </h4>
            <p className="text-gray-600">
              Interactive content will be displayed here
            </p>
          </div>
        );

      case 'assessment':
        if (content_data.quiz_data) {
          const quiz = content_data.quiz_data;
          const sectionAnswers = quizAnswers[section.id] || {};
          const showResults = showQuizResults[section.id];

          console.log('Rendering assessment:', {
            sectionId: section.id,
            quiz,
            sectionAnswers
          });

          const renderQuestionInput = () => {
            switch (quiz.type) {
              case 'multiple_choice':
                return (
                  <div className="space-y-4">
                    {(quiz.options || memoizedQuizOptions).map(
                      (option, index) => (
                        <div
                          key={`${section.id}-option-${index}`}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <RadioGroup
                            key={`${section.id}-${index}`}
                            value={sectionAnswers[`question_${index}`] || ''}
                            onValueChange={value => {
                              handleQuizAnswerChange(section.id, index, value);
                            }}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                key={`${section.id}-${index}-${option}`}
                                value={option}
                                id={`option_${section.id}_${index}`}
                              />
                              <Label
                                htmlFor={`option_${section.id}_${index}`}
                                className="text-sm font-medium text-gray-700 cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )
                    )}
                  </div>
                );

              case 'true_false':
                return (
                  <div className="space-y-4">
                    {['True', 'False'].map((option, index) => (
                      <div
                        key={`${section.id}-option-${index}`}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <RadioGroup
                          key={`${section.id}-${index}`}
                          value={sectionAnswers[`question_${index}`] || ''}
                          onValueChange={value => {
                            handleQuizAnswerChange(section.id, index, value);
                          }}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              key={`${section.id}-${index}-${option}`}
                              value={option}
                              id={`option_${section.id}_${index}`}
                            />
                            <Label
                              htmlFor={`option_${section.id}_${index}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                );

              case 'matching':
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Arrange the items in the correct order:
                    </p>
                    {(quiz.options || []).map((option, index) => (
                      <div
                        key={`${section.id}-option-${index}`}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-500 w-8">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-700">{option}</span>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 italic">
                      This is a matching question. Students will arrange items
                      in the correct order.
                    </p>
                  </div>
                );

              case 'short_answer':
                return (
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Your Answer:
                      </Label>
                      <Textarea
                        placeholder="Type your answer here..."
                        value={sectionAnswers[`question_0`] || ''}
                        onChange={e => {
                          handleQuizAnswerChange(section.id, 0, e.target.value);
                        }}
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                    <p className="text-sm text-gray-500 italic">
                      This is a short answer question. Provide a brief response.
                    </p>
                  </div>
                );

              case 'interactive':
                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Interactive Assessment
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        {quiz.correct_answer ||
                          'Complete the interactive element to proceed.'}
                      </p>
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <p className="text-sm text-gray-600">
                          This assessment requires interaction with the content.
                          Complete the required actions to mark this section as
                          complete.
                        </p>
                      </div>
                    </div>
                  </div>
                );

              default:
                return (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      Question type "{quiz.type}" not yet supported in preview.
                    </p>
                  </div>
                );
            }
          };

          return (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  📝 Assessment
                </h4>
                <p className="text-yellow-700">{quiz.question}</p>
                {quiz.time_limit_seconds && quiz.time_limit_seconds > 0 && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">
                      Time limit: {quiz.time_limit_seconds} seconds
                    </span>
                  </div>
                )}
                {quiz.points && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {quiz.points} point{quiz.points !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>

              {!showResults ? (
                <div className="space-y-4">
                  {renderQuestionInput()}

                  {/* Hints */}
                  {quiz.hints && quiz.hints.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">
                        💡 Hints:
                      </h5>
                      <ul className="space-y-1">
                        {quiz.hints.map((hint, index) => (
                          <li
                            key={index}
                            className="text-sm text-blue-700 flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handleQuizSubmit(section.id, sectionAnswers)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={
                      quiz.type === 'multiple_choice' ||
                      quiz.type === 'true_false'
                        ? !Object.values(sectionAnswers).some(answer => answer)
                        : quiz.type === 'short_answer'
                        ? !sectionAnswers[`question_0`]
                        : false
                    }>
                    Submit Answer
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Assessment Complete!
                  </h4>
                  <p className="text-green-700">
                    Great job! You've completed this assessment.
                  </p>
                  {quiz.explanation && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <p className="text-sm text-gray-700">
                        <strong>Explanation:</strong> {quiz.explanation}
                      </p>
                    </div>
                  )}
                  {quiz.feedback?.correct && (
                    <div className="mt-3 p-3 bg-green-100 rounded border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>Feedback:</strong> {quiz.feedback.correct}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }
        return null;

      case 'quick_check':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                ✅ Quick Check
              </h4>
              <div className="whitespace-pre-line text-blue-700">
                {content_data.text}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSectionComplete(section.id)}>
                Yes, let's go!
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))
                }>
                Not yet, I'd like to review a bit more
              </Button>
            </div>
          </div>
        );

      case 'activity':
        if (content_data.activity_data) {
          const activity = content_data.activity_data;
          return (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">
                  🎯 Interactive Activity
                </h4>
                <h5 className="text-lg font-medium text-purple-700 mb-2">
                  {activity.title}
                </h5>
                <p className="text-purple-700 mb-4">{activity.description}</p>

                <div className="space-y-3">
                  <h6 className="font-medium text-purple-800">Instructions:</h6>
                  <ul className="list-decimal list-inside space-y-1 text-purple-700">
                    {activity.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>

                {activity.materials_needed && (
                  <div className="mt-4">
                    <h6 className="font-medium text-purple-800 mb-2">
                      Materials Needed:
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {activity.materials_needed.map((material, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-purple-100 text-purple-800">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h6 className="font-medium text-gray-800 mb-2">
                  Expected Outcome:
                </h6>
                <p className="text-gray-700">{activity.expected_outcome}</p>
              </div>

              <Button
                onClick={() => handleSectionComplete(section.id)}
                className="w-full bg-purple-600 hover:bg-purple-700">
                Mark Activity as Complete
              </Button>
            </div>
          );
        }
        return null;

      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Content type "{content_type}" not yet supported.
            </p>
          </div>
        );
    }
  };

  const renderLearningStyleTags = (tags: string[]) => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => {
          const Icon =
            learningStyleIcons[tag as keyof typeof learningStyleIcons];
          const color =
            learningStyleColors[tag as keyof typeof learningStyleColors];
          return (
            <Badge key={tag} className={`bg-gradient-to-r ${color} text-white`}>
              <Icon className="w-3 h-3 mr-1" />
              {tag.replace('_', ' ')}
            </Badge>
          );
        })}
      </div>
    );
  };

  const goToNextSection = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Module Header */}
      <Card className="mb-6 border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {module.title}
              </CardTitle>
              <p className="text-gray-600 mb-4">{module.description}</p>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Progress: {completedSections} of {totalSections} sections
                  </span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-gray-300">
                <Clock className="w-4 h-4 mr-1" />
                {module.estimated_duration_minutes} min
              </Badge>
              <Badge variant="outline" className="border-gray-300">
                <Target className="w-4 h-4 mr-1" />
                {module.difficulty_level}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Section Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={goToPreviousSection}
          disabled={currentSectionIndex === 0}
          className="flex items-center space-x-2">
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-gray-600">
          Section {currentSectionIndex + 1} of {totalSections}
        </div>

        <Button
          variant="outline"
          onClick={goToNextSection}
          disabled={currentSectionIndex === totalSections - 1}
          className="flex items-center space-x-2">
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Section */}
      <Card className="mb-6 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                {currentSection.title}
              </CardTitle>

              {/* Learning Style Tags */}
              {currentSection.learning_style_tags.length > 0 &&
                renderLearningStyleTags(currentSection.learning_style_tags)}

              {/* Section Info */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentSection.time_estimate_minutes} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>
                    {currentSection.is_required ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Status */}
            <div className="flex items-center space-x-2">
              {sectionProgress[currentSection.id] ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="border-gray-300">
                  <Clock className="w-4 h-4 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {renderContentSection(currentSection)}
        </CardContent>
      </Card>

      {/* Section Navigation Footer */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousSection}
          disabled={currentSectionIndex === 0}
          className="flex items-center space-x-2">
          <ChevronLeft className="w-4 h-4" />
          Previous Section
        </Button>

        <div className="text-sm text-gray-500">
          {currentSectionIndex + 1} of {totalSections} sections
        </div>

        <Button
          onClick={goToNextSection}
          disabled={currentSectionIndex === totalSections - 1}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
          {currentSectionIndex === totalSections - 1
            ? 'Complete Module'
            : 'Next Section'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
