'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Eye, EyeOff, Shield, Users, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface LoginScreenProps {
  selectedRole: 'student' | 'teacher';
  onBack: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginScreen({
  selectedRole,
  onBack,
  onRegister,
  onForgotPassword
}: LoginScreenProps) {
  const { login, authState } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  // Handle redirect after successful login
  useEffect(() => {
    console.log('Auth state changed:', {
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      role: authState.user?.role
    });

    if (authState.isAuthenticated && authState.user) {
      const userRole = authState.user.role;
      if (userRole === 'teacher' || userRole === 'student') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [authState.isAuthenticated, authState.user, router]);

  const roleConfig = {
    teacher: {
      icon: Shield,
      title: 'Teacher Login',
      subtitle: 'Educator Portal',
      description: 'Create lessons, quizzes, and manage classes',
      color: 'text-[#00af8f]',
      bgColor: 'bg-[#00af8f]',
      borderColor: 'border-[#00af8f]',
      defaultEmail: 'teacher@example.com'
    },
    student: {
      icon: User,
      title: 'Student Login',
      subtitle: 'Learning Portal',
      description: 'Access lessons, take quizzes, and submit activities',
      color: 'text-[#00af8f]',
      bgColor: 'bg-[#00af8f]',
      borderColor: 'border-[#00af8f]',
      defaultEmail: 'student@example.com'
    }
  } as const;

  const config = roleConfig[selectedRole];
  const Icon = config.icon;

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    console.log('Login attempt:', { email: data.email, role: selectedRole });

    try {
      const result = await login({
        email: data.email,
        password: data.password,
        role: selectedRole
      });

      console.log('Login result:', result);

      if (!result.success) {
        setError(result.message);
      } else {
        console.log('Login successful, waiting for redirect...');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#00af8f]/20 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#ffd416]/20 rounded-full blur-2xl" />
        {/* Desktop decorations */}
        <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-[#00af8f]/15 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-[#ffd416]/15 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute top-4 left-4 text-[#666666] hover:text-[#333333]">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          {/* <div className="flex items-center justify-center mb-6">
            <div
              className={`w-16 h-16 ${config.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
              <Image
                src="https://xieuxyhwjircnbqvfxsd.supabase.co/storage/v1/object/sign/docs/456455332_122108994920407444_6470634652416251609_n-removebg-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNjAzMzBjNS04ZTY1LTQ0YjQtYjlhMS05M2Y3ZTgwMzk1MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2NzLzQ1NjQ1NTMzMl8xMjIxMDg5OTQ5MjA0MDc0NDRfNjQ3MDYzNDY1MjQxNjI1MTYwOV9uLXJlbW92ZWJnLXByZXZpZXcucG5nIiwiaWF0IjoxNzU1MTMxMTgwLCJleHAiOjE3ODY2NjcxODB9.PDZOIIxmxq0K60txHo6Yp88y8fUv0S3GuO2IeuWOF-Q"
                alt="Logo"
                width={64}
                height={64}
              />
            </div>
          </div> */}

          <h1 className="text-3xl font-bold text-[#333333] mb-2">
            {config.title}
          </h1>
          {/* <p className="text-lg text-[#666666] mb-1">{config.subtitle}</p>
          <p className="text-sm text-[#666666]">{config.description}</p> */}
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-[#333333]">
              Welcome Back
            </CardTitle>
            <p className="text-[#666666]">Sign in to access your account</p>
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
                  placeholder={config.defaultEmail}
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
                className={`w-full h-12 text-lg font-semibold text-white shadow-lg transition-all duration-300 rounded-xl ${
                  isLoading
                    ? 'bg-[#666666] cursor-not-allowed'
                    : `${config.bgColor} hover:shadow-xl hover:scale-105 active:scale-95`
                }`}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="space-y-4">
              <Button
                variant="link"
                onClick={onForgotPassword}
                className="w-full text-[#00af8f] hover:text-[#00af90] font-medium">
                Forgot your password?
              </Button>

              <div className="text-center">
                <p className="text-[#666666]">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    onClick={onRegister}
                    className="text-[#00af8f] hover:text-[#00af90] font-medium p-0 h-auto">
                    Sign up here
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
