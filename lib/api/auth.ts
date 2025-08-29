import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { RegisterData, LoginCredentials, User } from '@/types/auth';
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

      console.log({ authError });
      if (authError) {
        console.error('Auth registration error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Wait a moment for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if profile was created by the trigger using admin client
      try {
        const { data: userData, error: userCheckError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single();

        if (userCheckError || !userData) {
          // If trigger failed, manually create the user record using admin client
          console.log('Trigger failed, manually creating profile record');

          // First, let's check what the profiles table structure looks like
          try {
            const { data: tableInfo, error: tableError } = await supabaseAdmin
              .from('profiles')
              .select('*')
              .limit(1);

            if (tableError) {
              console.error('Cannot access profiles table:', tableError);
            } else {
              console.log('Profiles table accessible, sample data:', tableInfo);
            }
          } catch (tableCheckError) {
            console.error('Table check error:', tableCheckError);
          }

          // Try to create the profile with minimal required fields first
          const profileData = {
            id: authData.user.id,
            email: data.email,
            first_name: data.firstName || null,
            middle_name: data.middleName || null,
            last_name: data.lastName || null,
            full_name:
              data.fullName ||
              `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            role: data.role,
            onboarding_completed: false
          };

          console.log('Attempting to insert profile with data:', profileData);

          const { data: insertData, error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert(profileData)
            .select();

          if (insertError) {
            console.error('Manual profile creation failed:', insertError);
            console.error('Insert error details:', insertError);
            console.error('Error code:', insertError.code);
            console.error('Error message:', insertError.message);
            console.error('Error details:', insertError.details);

            // Try to get more specific error information
            if (insertError.code === '23502') {
              console.error('Missing required field - check table constraints');
            } else if (insertError.code === '23503') {
              console.error('Foreign key constraint violation');
            } else if (insertError.code === '42P01') {
              console.error('Table does not exist');
            }
          } else {
            console.log('Profile created successfully:', insertData);
          }
        } else {
          console.log('Profile already exists, trigger worked');
        }
      } catch (profileError) {
        console.error('Profile check/creation error:', profileError);
        // Continue with registration even if profile creation fails
      }

      // No extra update needed; metadata handled by trigger

      // No additional per-role records in the MS schema

      // Create a User object from the registration data
      const user: User = {
        id: authData.user.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        fullName:
          data.fullName ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        learningStyle: data.learningStyle,
        gradeLevel: data.gradeLevel,
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        message:
          'Registration successful! Please check your email to verify your account.',
        user: user
      };
    } catch (error) {
      console.log({ error });
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

      console.log({ authError });
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

      // Validate role if provided during login
      if (credentials.role && userData && userData.role !== credentials.role) {
        await supabase.auth.signOut();
        throw new Error(`Invalid credentials for ${credentials.role} account. You are registered as a ${userData.role}.`);
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

  static async updateProfile(updates: Partial<User>) {
    try {
      // First try to get the current authenticated user
      const {
        data: { user }
      } = await supabase.auth.getUser();

      let userId: string;

      if (user) {
        // User is authenticated, use their ID
        userId = user.id;
      } else {
        // User might not be authenticated yet (e.g., just registered)
        // Check if we have a user ID in the updates
        if (!updates.id) {
          throw new Error('User not authenticated and no user ID provided');
        }
        userId = updates.id;
      }

      // Convert frontend field names to database field names
      // Note: email is managed by Supabase Auth, not our profiles table
      const dbUpdates: any = {};
      if (updates.learningStyle !== undefined)
        dbUpdates.learning_style = updates.learningStyle;
      if (updates.onboardingCompleted !== undefined)
        dbUpdates.onboarding_completed = updates.onboardingCompleted;
      if (updates.firstName !== undefined)
        dbUpdates.first_name = updates.firstName;
      if (updates.middleName !== undefined)
        dbUpdates.middle_name = updates.middleName;
      if (updates.lastName !== undefined)
        dbUpdates.last_name = updates.lastName;
      if (updates.fullName !== undefined)
        dbUpdates.full_name = updates.fullName;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.gradeLevel !== undefined)
        dbUpdates.grade_level = updates.gradeLevel;

      console.log('Updating profile in database with:', { userId, dbUpdates });

      // Use admin client to update the profile (bypasses RLS)
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw new Error(error.message);
      }

      // Convert the updated profile data to User format
      const updatedUser: User = {
        id: data.id,
        email: data.email,
        role: data.role,
        firstName: data.first_name,
        middleName: data.middle_name,
        lastName: data.last_name,
        fullName: data.full_name,
        learningStyle: data.learning_style,
        gradeLevel: data.grade_level,
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Profile update failed'
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
  static async testRoleRegistration(role: 'student' | 'teacher') {
    try {
      const testData: RegisterData = {
        email: `test-${role}-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: role,
        // Role-specific fields
        ...(role === 'student' && {
          gradeLevel: 'Grade 10'
        }),
        ...(role === 'teacher' &&
          {
            // Teacher-specific fields can be added here
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
