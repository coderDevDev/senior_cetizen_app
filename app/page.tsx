'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Shield, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect authenticated users based on role and onboarding status
      if (user.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (user.role === 'student') {
        if (user.onboarding_completed) {
          router.push('/student/dashboard');
        } else {
          router.push('/onboarding/vark');
        }
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#00af8f] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg text-[#666666]">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff]">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#00af8f]/20 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#ffd416]/20 rounded-full blur-2xl" />
        <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-[#00af8f]/15 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-[#ffd416]/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#00af8f] rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#333333]">
              Learning Module
            </h1>
          </div>

          <div className="flex space-x-4">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f] hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-[#00af8f] hover:bg-[#00af90]">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-[#333333] mb-6 leading-tight">
              Personalized Learning
              <span className="block text-[#00af8f]">for Every Student</span>
            </h2>

            <p className="text-xl text-[#666666] mb-8 max-w-3xl mx-auto">
              Discover your learning style with our VARK assessment and access
              tailored educational content that matches how you learn best.
              Teachers can create engaging lessons and track student progress.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-[#00af8f] hover:bg-[#00af90] text-lg px-8 py-4">
                  Start Learning <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f] hover:text-white text-lg px-8 py-4">
                  I'm a Teacher
                </Button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#00af8f] rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-[#333333] mb-4">
                    Student Experience
                  </CardTitle>
                  <p className="text-[#666666]">
                    Take the VARK learning style assessment and access
                    personalized lessons, quizzes, and activities tailored to
                    your learning preferences.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#ffd416] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-[#333333] mb-4">
                    Teacher Tools
                  </CardTitle>
                  <p className="text-[#666666]">
                    Create engaging lessons, build assessments, assign
                    activities, and monitor student progress with comprehensive
                    analytics.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#00af8f] rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-[#333333] mb-4">
                    Smart Content
                  </CardTitle>
                  <p className="text-[#666666]">
                    AI-powered content recommendations based on learning styles,
                    progress tracking, and adaptive assessments for optimal
                    learning outcomes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 text-[#666666]">
          <p>
            &copy; 2024 Learning Module. Built with modern web technologies.
          </p>
        </footer>
      </div>
    </div>
  );
}
