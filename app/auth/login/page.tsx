'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowRight, BookOpen, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'teacher'])
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>(
    'student'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'student'
    }
  });

  const roleConfig = {
    teacher: {
      icon: Shield,
      title: 'Teacher Sign In',
      subtitle: 'Educator Portal',
      description: 'Access your dashboard and manage classes',
      color: 'text-[#00af8f]',
      bgColor: 'bg-[#00af8f]',
      borderColor: 'border-[#00af8f]'
    },
    student: {
      icon: User,
      title: 'Student Sign In',
      subtitle: 'Learning Portal',
      description: 'Continue your learning journey',
      color: 'text-[#ffd416]',
      bgColor: 'bg-[#ffd416]',
      borderColor: 'border-[#ffd416]'
    }
  } as const;

  const config = roleConfig[selectedRole];

  const handleRoleChange = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log({ data });
      const result = await login(data.email, data.password, data.role);

      if (result.success && result.user) {
        // Role-based redirect according to features.txt
        if (result.user.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else if (result.user.role === 'student') {
          if (result.user.onboardingCompleted) {
            router.push('/student/dashboard');
          } else {
            router.push('/onboarding/vark');
          }
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#00af8f]/20 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#ffd416]/20 rounded-full blur-2xl" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#00af8f] rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#333333] mb-2">
            Welcome Back
          </h1>
          <p className="text-lg text-[#666666]">Sign in to your account</p>
        </div>

        {/* Role Selection */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-[#333333]">
              Choose Your Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {(['student', 'teacher'] as const).map(role => (
                <Button
                  key={role}
                  type="button"
                  variant={selectedRole === role ? 'default' : 'outline'}
                  className={`h-20 flex flex-col items-center justify-center space-y-2 transition-all ${
                    selectedRole === role
                      ? `${roleConfig[role].bgColor} text-white`
                      : 'border-2 hover:border-[#00af8f]'
                  }`}
                  onClick={() => handleRoleChange(role)}>
                  {(() => {
                    const IconComponent = roleConfig[role].icon;
                    return <IconComponent className="w-6 h-6" />;
                  })()}
                  <span className="font-medium capitalize">{role}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-[#333333]">
              {config.title}
            </CardTitle>
            <p className="text-[#666666]">{config.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#333333] font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[#333333] font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl pr-12"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#333333]"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold text-white bg-[#00af8f] hover:bg-[#00af90] shadow-lg transition-all duration-300 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95">
                {isLoading ? (
                  'Signing In...'
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <Link
                href="/auth/forgot-password"
                className="text-[#00af8f] hover:text-[#00af90] font-medium text-sm block">
                Forgot your password?
              </Link>

              <p className="text-[#666666] text-sm">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-[#00af8f] hover:text-[#00af90] font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
