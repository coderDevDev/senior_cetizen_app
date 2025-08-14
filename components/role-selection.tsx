'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Users,
  User,
  ArrowRight,
  Check,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';

interface RoleSelectionProps {
  onRoleSelect: (role: 'student' | 'teacher') => void;
  onBack: () => void;
}

export function RoleSelection({ onRoleSelect, onBack }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<
    'student' | 'teacher' | null
  >(null);

  const roles = [
    {
      id: 'teacher' as const,
      title: 'Teacher',
      subtitle: 'Educator Portal',
      description: 'Create lessons, quizzes, and manage classes',
      icon: Shield,
      features: [
        'Create and publish lessons',
        'Build and assign quizzes',
        'Manage classes and assignments',
        'View and grade submissions'
      ],
      gradient: 'from-[#00af8f] to-[#00af90]',
      bgGradient: 'from-[#feffff] to-[#ffffff]',
      iconColor: 'text-[#00af8f]',
      glowColor: 'shadow-[#00af8f]/25'
    },
    {
      id: 'student' as const,
      title: 'Student',
      subtitle: 'Learning Portal',
      description: 'Access lessons, take quizzes, and submit activities',
      icon: User,
      features: [
        'View lessons by learning style',
        'Take pre/post quizzes',
        'Submit activities and track feedback'
      ],
      gradient: 'from-[#00af8f] to-[#00af90]',
      bgGradient: 'from-[#feffff] to-[#ffffff]',
      iconColor: 'text-[#00af8f]',
      glowColor: 'shadow-[#00af8f]/25'
    }
  ];

  return (
    <div className="h-screen flex flex-col p-4 lg:p-8 relative overflow-x-hidden bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff]">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#00af8f]/20 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#ffd416]/20 rounded-full blur-2xl" />
        {/* Desktop decorations */}
        <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-[#00af8f]/15 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-[#ffd416]/15 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col relative z-10 max-w-7xl mx-auto w-full">
        {/* Modern Navbar Header */}
        <nav className="flex items-center justify-between p-4 lg:p-6 mb-2 lg:mb-8">
          {/* <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-[#666666] hover:text-[#333333] hover:bg-white/50 rounded-xl p-3 transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Button> */}
          <div className="flex items-center gap-3">
            <div
              className="bg-none rounded-xl flex items-center 
            justify-center">
              <Image
                src="https://xieuxyhwjircnbqvfxsd.supabase.co/storage/v1/object/sign/docs/456455332_122108994920407444_6470634652416251609_n-removebg-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNjAzMzBjNS04ZTY1LTQ0YjQtYjlhMS05M2Y3ZTgwMzk1MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2NzLzQ1NjQ1NTMzMl8xMjIxMDg5OTQ5MjA0MDc0NDRfNjQ3MDYzNDY1MjQxNjI1MTYwOV9uLXJlbW92ZWJnLXByZXZpZXcucG5nIiwiaWF0IjoxNzU1MTMxMTgwLCJleHAiOjE3ODY2NjcxODB9.PDZOIIxmxq0K60txHo6Yp88y8fUv0S3GuO2IeuWOF-Q"
                alt="Logo"
                width={64}
                height={64}
              />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-[#333333]">
                Learning Management System
              </h2>
            </div>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-0 lg:mb-8">
          <h1 className="text-2xl lg:text-5xl font-bold text-[#333333] mb-3 lg:mb-4">
            <span className="block bg-gradient-to-r from-[#00af8f] to-[#00af90] bg-clip-text text-transparent">
              Select Your Role
            </span>
          </h1>
        </div>

        {/* Role Cards - Mobile Layout */}
        <div className="flex-1 space-y-2 lg:hidden">
          {roles.map(role => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                className={`group cursor-pointer transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00af8f] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  isSelected
                    ? `bg-gradient-to-r ${role.gradient} border-0 shadow-lg scale-[1.02] ring-2 ring-[#00af8f]`
                    : 'bg-white border border-[#E0DDD8] hover:border-[#00af8f] hover:shadow-md'
                }`}
                onClick={() => setSelectedRole(role.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedRole(role.id);
                  }
                }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? 'bg-white/20 backdrop-blur-sm'
                            : 'bg-[#feffff]'
                        }`}>
                        <Icon
                          className={`w-6 h-6 transition-all duration-300 ${
                            isSelected ? 'text-white' : role.iconColor
                          }`}
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-[#00af8f]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-base font-semibold transition-all duration-300 ${
                          isSelected ? 'text-white' : 'text-[#333333]'
                        }`}>
                        {role.title}
                      </h3>
                      <p
                        className={`mt-0.5 text-xs ${
                          isSelected ? 'text-white/90' : 'text-[#666666]'
                        } line-clamp-1`}>
                        {role.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <div
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                          isSelected
                            ? 'border-white bg-white'
                            : 'border-[#E0DDD8]'
                        }`}>
                        {isSelected && (
                          <div className="w-full h-full rounded-full bg-[#00af8f] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Role Cards - Desktop Layout */}
        <div className="hidden lg:grid grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
          {roles.map(role => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                className={`group cursor-pointer w-full max-w-[520px] mx-auto transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
                  isSelected
                    ? `bg-gradient-to-br ${role.bgGradient} border-2 border-transparent bg-clip-padding shadow-2xl ${role.glowColor} scale-105`
                    : 'bg-white/90 backdrop-blur-sm border border-[#E0DDD8] hover:border-[#00af8f] hover:shadow-xl'
                }`}
                onClick={() => setSelectedRole(role.id)}>
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Icon and Title Section */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-6">
                      {isSelected && (
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${role.gradient} rounded-3xl blur-lg opacity-75 animate-pulse`}
                        />
                      )}
                      <div
                        className={`relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 ${
                          isSelected
                            ? `bg-gradient-to-r ${role.gradient} scale-110`
                            : 'bg-[#feffff] group-hover:scale-105'
                        }`}>
                        <Icon
                          className={`w-12 h-12 transition-all duration-500 ${
                            isSelected ? 'text-white' : role.iconColor
                          }`}
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#00af8f] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-[#333333] mb-2">
                      {role.title}
                    </h3>
                    <p className="text-[#333333] leading-relaxed text-sm">
                      {role.description}
                    </p>
                  </div>

                  {/* Features Section */}
                  <div className="flex-1 space-y-2">
                    <h4 className="text-sm font-semibold text-[#333333]">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              isSelected ? 'bg-[#00af8f]' : 'bg-[#E0DDD8]'
                            }`}
                          />
                          <span
                            className={`text-xs ${
                              isSelected
                                ? 'text-[#333333] font-medium'
                                : 'text-[#666666]'
                            }`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="mt-8 text-center">
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#00af8f]/10 text-[#00af8f] rounded-full text-lg font-medium animate-pulse">
                        <Check className="w-5 h-5" />
                        Selected
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-4 pt-2 pb-4 lg:pb-8 lg:justify-center lg:gap-8">
          {/* <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 lg:flex-none lg:px-12 bg-white/80 backdrop-blur-sm border-[#00af8f] hover:bg-white hover:shadow-lg hover:border-[#00af90] transition-all duration-300 senior-button lg:h-20 lg:text-xl lg:font-semibold lg:rounded-2xl text-[#333333]">
            <ArrowLeft className="w-5 h-5 lg:w-7 lg:h-7 mr-3" />
            Back
          </Button> */}
          <Button
            onClick={() => {
              if (selectedRole) {
                // Check if we're on a specific route and navigate accordingly
                const currentPath = window.location.pathname;
                if (currentPath === '/register') {
                  onRoleSelect(selectedRole); // This will navigate to /register?role=...
                } else if (currentPath === '/forgot-password') {
                  onRoleSelect(selectedRole); // This will navigate to /forgot-password?role=...
                } else {
                  onRoleSelect(selectedRole); // Default to login
                }
              }
            }}
            disabled={!selectedRole}
            className={`flex-1 lg:flex-none lg:px-20 text-white font-medium shadow-lg transition-all duration-300 senior-button lg:h-20 lg:text-xl lg:font-semibold lg:rounded-2xl ${
              selectedRole
                ? `bg-gradient-to-r ${
                    roles.find(r => r.id === selectedRole)?.gradient
                  } hover:shadow-2xl hover:scale-105 active:scale-95 lg:hover:shadow-3xl`
                : 'bg-[#666666] lg:cursor-not-allowed'
            }`}>
            Continue
            <ArrowRight className="w-5 h-5 lg:w-7 lg:h-7 ml-3" />
          </Button>
        </div>

        {/* Help Text */}
        {/* <div className="text-center mt-6 pb-6 lg:pb-8">
          <p className="text-base lg:text-lg text-[#666666]">
            You can change your role later in settings
          </p>
        </div> */}
      </div>
    </div>
  );
}
