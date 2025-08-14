import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { RegisterData, LoginCredentials } from '@/types/auth';
import { config, validateEnvironment } from '@/lib/config';

// require('dotenv').config({ path: '.env' });

// Validate environment on module load
validateEnvironment();

console.log({ config });
// Create a service client for admin operations that bypass RLS
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

export class AuthAPI {
  static async register(data: RegisterData) {
    try {
      console.log(
        'Starting registration for:',
        data.email,
        'with role:',
        data.role
      );

      // Create user in Supabase Auth with role-specific metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            first_name: data.firstName,
            middle_name: data.middleName,
            last_name: data.lastName,
            role: data.role,
            learning_style: data.learningStyle,
            grade_level: data.gradeLevel
          }
        }
      });

      if (authError) {
        console.error('Auth registration error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Wait a moment for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if profile was created by the trigger using admin client
      const { data: userData, error: userCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (userCheckError || !userData) {
        // If trigger failed, manually create the user record using admin client
        console.log('Trigger failed, manually creating profile record');
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            first_name: data.firstName || null,
            middle_name: data.middleName || null,
            last_name: data.lastName || null,
            role: data.role,
            learning_style: data.learningStyle || null,
            grade_level: data.gradeLevel || null,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Manual user creation failed:', insertError);
          // Don't throw error here as the auth user was created successfully
        }
      }

      // No extra update needed; metadata handled by trigger

      // No additional per-role records in the MS schema

      return {
        success: true,
        message:
          'Registration successful! Please check your email to verify your account.',
        user: authData.user
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(credentials: LoginCredentials) {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Login failed');
      }

      // Get user profile data
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('User data fetch error:', userError);
        throw new Error('Failed to fetch user profile');
      }

      // Check if role matches
      if (userData && userData.role !== credentials.role) {
        await supabase.auth.signOut();
        throw new Error(`Invalid credentials for ${credentials.role} account`);
      }

      // Update last login
      // MS schema: no last_login field on profiles; skipping

      // Convert database user data to frontend format
      const user = userData
        ? {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            firstName: userData.first_name ?? undefined,
            middleName: userData.middle_name ?? undefined,
            lastName: userData.last_name ?? undefined,
            fullName: userData.full_name ?? undefined,
            profilePhoto: userData.profile_photo ?? undefined,
            learningStyle: userData.learning_style ?? undefined,
            gradeLevel: userData.grade_level ?? undefined,
            onboardingCompleted: userData.onboarding_completed ?? undefined,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
          }
        : null;

      return {
        success: true,
        message: 'Login successful',
        user,
        session: authData.session
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }

  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { user: null, session: null };
      }

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('User data fetch error:', userError);
        return { user: null, session: null };
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      // Convert database user data to frontend format
      const convertedUser = userData
        ? {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            firstName: userData.first_name ?? undefined,
            middleName: userData.middle_name ?? undefined,
            lastName: userData.last_name ?? undefined,
            fullName: userData.full_name ?? undefined,
            profilePhoto: userData.profile_photo ?? undefined,
            learningStyle: userData.learning_style ?? undefined,
            gradeLevel: userData.grade_level ?? undefined,
            onboardingCompleted: userData.onboarding_completed ?? undefined,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
          }
        : null;

      return { user: convertedUser, session };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, session: null };
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Password reset failed'
      };
    }
  }

  // Test function to verify database connection and user creation
  static async testDatabaseConnection() {
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      return {
        success: true,
        message: 'Database connection successful',
        data
      };
    } catch (error) {
      console.error('Database connection test error:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Database connection test failed'
      };
    }
  }

  // Test function to verify role-specific registration
  static async testRoleRegistration(role: 'osca' | 'basca' | 'senior') {
    try {
      const testData: RegisterData = {
        email: `test-${role}-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+639123456789',
        role: role,
        // Role-specific fields
        ...(role === 'osca' && {
          department: 'IT Department',
          position: 'System Administrator',
          employeeId: 'EMP-001'
        }),
        ...(role === 'basca' && {
          barangay: 'Test Barangay',
          barangayCode: 'TB001'
        }),
        ...(role === 'senior' && {
          dateOfBirth: '1950-01-01',
          address: '123 Test Street, Test City',
          emergencyContactName: 'Test Contact',
          emergencyContactPhone: '+639123456788',
          emergencyContactRelationship: 'Spouse'
        })
      };

      const result = await AuthAPI.register(testData);
      return result;
    } catch (error) {
      console.error(`Role registration test error for ${role}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Role registration test failed for ${role}`
      };
    }
  }
}
