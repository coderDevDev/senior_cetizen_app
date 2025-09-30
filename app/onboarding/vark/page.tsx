'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Eye,
  Headphones,
  PenTool,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Brain,
  Target,
  Users,
  FileText,
  PlayCircle,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LearningStatement {
  id: number;
  statement: string;
  category: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
}

// Updated questions based on the instrument file
const learningStatements: LearningStatement[] = [
  {
    id: 1,
    statement:
      'I prefer to learn through animations and videos that illustrate mitosis and meiosis.',
    category: 'visual'
  },
  {
    id: 2,
    statement:
      "I prefer to learn by listening to someone's instruction and explanation rather than reading about cellular reproduction.",
    category: 'auditory'
  },
  {
    id: 3,
    statement:
      'I prefer to learn when I can participate and actively involve in the discussion.',
    category: 'kinesthetic'
  },
  {
    id: 4,
    statement:
      'I prefer to learn through reading detailed discussions about cellular reproduction.',
    category: 'reading_writing'
  },
  {
    id: 5,
    statement:
      'I prefer to watch video presentations with step-by-step explanations to visualize and understand the concept of cellular reproduction clearly.',
    category: 'visual'
  },
  {
    id: 6,
    statement:
      'I prefer to learn using a recorded discussion as a learning material.',
    category: 'auditory'
  },
  {
    id: 7,
    statement:
      'I prefer to learn through hands-on digital activities like virtual simulations.',
    category: 'kinesthetic'
  },
  {
    id: 8,
    statement:
      'I prefer to take down notes and use them as a learning material.',
    category: 'reading_writing'
  },
  {
    id: 9,
    statement:
      'I prefer to use diagrams and concept maps in learning complex concepts like cellular reproduction.',
    category: 'visual'
  },
  {
    id: 10,
    statement:
      'I prefer to use verbal and audio instructions to guide my learning about cellular reproduction.',
    category: 'auditory'
  },
  {
    id: 11,
    statement:
      'I prefer to learn by doing online tasks that allow me to apply concepts in real-time.',
    category: 'kinesthetic'
  },
  {
    id: 12,
    statement:
      "I prefer to learn when I'm able to read on my own and explore complex topics in detail.",
    category: 'reading_writing'
  },
  {
    id: 13,
    statement:
      'I prefer to learn using interactive charts that visually demonstrate biological processes like cellular reproduction.',
    category: 'visual'
  },
  {
    id: 14,
    statement:
      'I prefer to learn biology topics through a question-and-answer discussion.',
    category: 'auditory'
  },
  {
    id: 15,
    statement:
      'I prefer to learn through various activities that engage my senses and movement to reinforce concepts.',
    category: 'kinesthetic'
  },
  {
    id: 16,
    statement: 'I prefer to learn through reading and writing activities.',
    category: 'reading_writing'
  },
  {
    id: 17,
    statement:
      'I prefer to use colored contents and images materials in learning biological processes.',
    category: 'visual'
  },
  {
    id: 18,
    statement:
      'I prefer to discuss or share my knowledge with others to deepen my understanding of the concepts.',
    category: 'auditory'
  },
  {
    id: 19,
    statement:
      'I prefer to learn through exploring and manipulating various materials to understand cellular reproduction better.',
    category: 'kinesthetic'
  },
  {
    id: 20,
    statement:
      'I prefer to learn and engage with the discussion through text-based explanations.',
    category: 'reading_writing'
  }
];

const learningStyleInfo = {
  visual: {
    title: 'Visual Learner',
    description:
      'You learn best through seeing and observing. You prefer pictures, diagrams, charts, and visual aids.',
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradient: 'from-blue-400 to-blue-600',
    emoji: '👁️'
  },
  auditory: {
    title: 'Auditory Learner',
    description:
      'You learn best through listening and speaking. You prefer discussions, lectures, and verbal explanations.',
    icon: Headphones,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    gradient: 'from-green-400 to-green-600',
    emoji: '🎧'
  },
  reading_writing: {
    title: 'Reading/Writing Learner',
    description:
      'You learn best through reading and writing. You prefer text-based materials, note-taking, and written assignments.',
    icon: PenTool,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    gradient: 'from-purple-400 to-purple-600',
    emoji: '✍️'
  },
  kinesthetic: {
    title: 'Kinesthetic Learner',
    description:
      'You learn best through movement and hands-on experience. You prefer physical activities, experiments, and real-world applications.',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    gradient: 'from-orange-400 to-orange-600',
    emoji: '🖐️'
  }
};

const scaleLabels = {
  1: { label: 'Strongly Disagree', emoji: '😞', color: 'text-red-600' },
  2: { label: 'Disagree', emoji: '😐', color: 'text-red-500' },
  3: { label: 'Undecided', emoji: '🤷', color: 'text-gray-500' },
  4: { label: 'Agree', emoji: '😊', color: 'text-green-500' },
  5: { label: 'Strongly Agree', emoji: '🎉', color: 'text-green-600' }
};

export default function VARKOnboardingPage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  console.log('VARKOnboardingPage render - user:', user);
  console.log('VARKOnboardingPage render - updateProfile:', updateProfile);

  const [currentStatement, setCurrentStatement] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Handle user loading state
  useEffect(() => {
    if (user !== null) {
      setIsLoadingUser(false);
    } else {
      // If user is null, wait a bit for auth state to update
      const timer = setTimeout(() => {
        setIsLoadingUser(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Redirect to login if no user after loading
  useEffect(() => {
    if (!isLoadingUser && !user) {
      console.log('No user found, redirecting to login...');
      router.push('/auth/login');
    }
  }, [isLoadingUser, user, router]);

  const progress = ((currentStatement + 1) / learningStatements.length) * 100;
  const currentStatementData = learningStatements[currentStatement];

  // Update answered count when answers change
  useEffect(() => {
    const count = Object.keys(answers).length;
    setAnsweredCount(count);
  }, [answers]);

  const handleRating = (rating: number) => {
    setAnswers(prev => ({ ...prev, [currentStatementData.id]: rating }));
  };

  const nextStatement = () => {
    if (currentStatement < learningStatements.length - 1) {
      setCurrentStatement(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const previousStatement = () => {
    if (currentStatement > 0) {
      setCurrentStatement(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const scores = {
      visual: 0,
      auditory: 0,
      reading_writing: 0,
      kinesthetic: 0
    };

    // Calculate weighted scores based on ratings
    learningStatements.forEach(statement => {
      const rating = answers[statement.id] || 0;
      scores[statement.category] += rating;
    });

    // Find the dominant learning style
    const dominantStyle = Object.entries(scores).reduce((a, b) =>
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores]
        ? a
        : b
    )[0] as keyof typeof learningStyleInfo;

    setShowResults(true);
  };

  const handleComplete = async () => {
    console.log('=== handleComplete START ===');
    console.log('handleComplete called!');
    console.log('Current user:', user);
    console.log('Current answers:', answers);

    if (!user) {
      toast({
        title: 'Error',
        description: 'User not found. Please log in again.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate final results
      const scores = {
        visual: 0,
        auditory: 0,
        reading_writing: 0,
        kinesthetic: 0
      };

      learningStatements.forEach(statement => {
        const rating = answers[statement.id] || 0;
        scores[statement.category] += rating;
      });

      const dominantStyle = Object.entries(scores).reduce((a, b) =>
        scores[a[0] as keyof typeof scores] >
        scores[b[0] as keyof typeof scores]
          ? a
          : b
      )[0] as keyof typeof learningStyleInfo;

      console.log('Updating profile with:', {
        id: user.id,
        role: user.role,
        learningStyle: dominantStyle,
        onboardingCompleted: true
      });

      console.log('Calling updateProfile...');
      // Update user profile with learning style and mark onboarding as complete
      const result = await updateProfile({
        id: user.id,
        role: user.role,
        learningStyle: dominantStyle as keyof typeof learningStyleInfo,
        onboardingCompleted: true
      });

      console.log('updateProfile result:', result);

      if (result.success) {
        toast({
          title: 'Success!',
          description:
            'Your learning style has been saved. Redirecting to dashboard...'
        });

        // Small delay to show success message
        setTimeout(() => {
          router.push('/student/dashboard');
        }, 1500);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save your learning style. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while waiting for user
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-[#333333] mb-2">
            Loading...
          </h2>
          <p className="text-[#666666]">Setting up your learning profile</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const scores = {
      visual: 0,
      auditory: 0,
      reading_writing: 0,
      kinesthetic: 0
    };

    learningStatements.forEach(statement => {
      const rating = answers[statement.id] || 0;
      scores[statement.category] += rating;
    });

    const dominantStyle = Object.entries(scores).reduce((a, b) =>
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores]
        ? a
        : b
    )[0] as keyof typeof learningStyleInfo;

    const styleInfo = learningStyleInfo[dominantStyle];
    const Icon = styleInfo.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Background Decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-[#00af8f]/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#ffd416]/20 rounded-full blur-2xl animate-pulse" />
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm transform transition-all duration-500 hover:scale-[1.02]">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`w-24 h-24 bg-gradient-to-br ${styleInfo.gradient} rounded-full flex items-center justify-center border-4 ${styleInfo.borderColor} shadow-lg transform animate-bounce`}>
                  <Icon className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold text-[#333333] mb-2">
                🎉 Congratulations!
              </CardTitle>
              <h2 className={`text-3xl font-semibold ${styleInfo.color} mb-4`}>
                {styleInfo.emoji} {styleInfo.title}
              </h2>
              <p className="text-lg text-[#666666] max-w-md mx-auto leading-relaxed">
                {styleInfo.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Score Breakdown */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-[#333333] mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 text-[#00af8f] mr-2" />
                  Your Learning Style Scores
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(scores).map(([style, score]) => {
                    const info =
                      learningStyleInfo[
                        style as keyof typeof learningStyleInfo
                      ];
                    const isDominant = style === dominantStyle;
                    return (
                      <div
                        key={style}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          isDominant
                            ? `${info.bgColor} ${info.borderColor}`
                            : 'bg-white border-gray-200'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg">{info.emoji}</span>
                          {isDominant && (
                            <Badge className="bg-[#00af8f] text-white">
                              Dominant
                            </Badge>
                          )}
                        </div>
                        <div
                          className={`font-bold text-lg ${
                            isDominant ? info.color : 'text-gray-600'
                          }`}>
                          {score}/25
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {info.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-[#333333] mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  What this means for you:
                </h3>
                <ul className="space-y-3 text-[#666666]">
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    You'll see lessons tailored to your learning style
                  </li>
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    Content will be optimized for how you learn best
                  </li>
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    You can always retake this assessment later
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-semibold text-white bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] shadow-lg transition-all duration-300 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving your results...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Complete Setup & Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#00af8f]/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#ffd416]/20 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-[#333333] mb-3">
            Learning Style Assessment
          </h1>
          <p className="text-xl text-[#666666] mb-2">
            Help us personalize your learning experience by understanding how
            you learn best
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-[#666666] bg-blue-50 px-4 py-2 rounded-full inline-block border border-blue-200">
            <Target className="w-4 h-4" />
            <span>
              Rate each statement from 1 (Strongly Disagree) to 5 (Strongly
              Agree)
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-[#333333]">
                  Question {currentStatement + 1} of {learningStatements.length}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-[#00af8f]/10 text-[#00af8f] border-[#00af8f]/20">
                  {answeredCount} answered
                </Badge>
              </div>
              <span className="text-lg font-bold text-[#00af8f]">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200" />

            {/* Progress Indicators */}
            <div className="flex justify-between mt-3">
              {learningStatements.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStatement
                      ? 'bg-[#00af8f] scale-125'
                      : answers[index + 1]
                      ? 'bg-green-400'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm transform transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">
                  {currentStatement + 1}
                </span>
              </div>
              <CardTitle className="text-2xl font-bold text-[#333333] max-w-3xl leading-relaxed">
                {currentStatementData.statement}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Rating Scale */}
            <div className="text-center">
              <div className="flex justify-center items-center space-x-6 mb-6">
                <span className="text-sm text-[#666666] font-medium">
                  Strongly Disagree
                </span>
                <div className="flex space-x-3">
                  {[1, 2, 3, 4, 5].map(rating => {
                    const scaleInfo =
                      scaleLabels[rating as keyof typeof scaleLabels];
                    const isSelected =
                      answers[currentStatementData.id] === rating;
                    return (
                      <Button
                        key={rating}
                        type="button"
                        variant="outline"
                        className={`w-16 h-16 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-110 ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#00af8f] to-[#00af90] text-white border-[#00af8f] shadow-lg scale-110'
                            : 'hover:border-[#00af8f] hover:bg-[#00af8f]/5 hover:shadow-md'
                        }`}
                        onClick={() => handleRating(rating)}>
                        <div className="flex flex-col items-center">
                          <span className="text-sm">{scaleInfo.emoji}</span>
                          <span className="text-xs">{rating}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                <span className="text-sm text-[#666666] font-medium">
                  Strongly Agree
                </span>
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-xs text-[#666666] px-8 font-medium">
                {[1, 2, 3, 4, 5].map(rating => (
                  <span
                    key={rating}
                    className={
                      scaleLabels[rating as keyof typeof scaleLabels].color
                    }>
                    {rating}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Rating Display */}
            {/* {answers[currentStatementData.id] && (
              <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <p className="text-lg text-[#333333] font-semibold">
                  Your rating:{' '}
                  <span className="text-[#00af8f] text-2xl">
                    {answers[currentStatementData.id]}
                  </span>
                </p>
                <p className="text-sm text-[#666666] mt-1">
                  {
                    scaleLabels[
                      answers[
                        currentStatementData.id
                      ] as keyof typeof scaleLabels
                    ].label
                  }
                </p>
              </div>
            )} */}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={previousStatement}
                disabled={currentStatement === 0}
                className="px-8 h-14 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              <Button
                onClick={nextStatement}
                disabled={!answers[currentStatementData.id]}
                className="px-8 h-14 text-lg font-semibold bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {currentStatement === learningStatements.length - 1 ? (
                  <>
                    <span>See Results</span>
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
