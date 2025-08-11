'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  PhilippineAddressSelector,
  AddressData
} from '@/components/ui/philippine-address-selector';
import {
  X,
  Plus,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
  Home,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { BascaMembersAPI } from '@/lib/api/basca-members';
import React, { useRef } from 'react';

const beneficiarySchema = z.object({
  name: z.string().min(2, 'Beneficiary name must be at least 2 characters'),
  relationship: z.string().min(2, 'Relationship is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
  occupation: z.string().optional(),
  monthlyIncome: z
    .number()
    .min(0, 'Monthly income must be 0 or greater')
    .optional(),
  isDependent: z.boolean().default(false)
});

const addSeniorSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(date => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      let calculatedAge = age;
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }

      return calculatedAge >= 60;
    }, 'Senior citizen must be at least 60 years old'),
  gender: z.enum(['male', 'female', 'other']),
  barangay: z.string().min(1, 'Barangay is required'),
  barangayCode: z.string().min(1, 'Barangay code is required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  addressData: z
    .object({
      region: z
        .object({
          region_code: z.string(),
          region_name: z.string()
        })
        .optional(),
      province: z
        .object({
          province_code: z.string(),
          province_name: z.string()
        })
        .optional(),
      city: z
        .object({
          city_code: z.string(),
          city_name: z.string()
        })
        .optional(),
      barangay: z
        .object({
          brgy_code: z.string(),
          brgy_name: z.string()
        })
        .optional()
    })
    .optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactRelationship: z.string().optional(),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z
    .string()
    .min(10, 'Emergency contact phone is required'),
  emergencyContactRelationship: z
    .string()
    .min(2, 'Emergency contact relationship is required'),
  medicalConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  seniorIdPhoto: z.string().optional(),
  profilePicture: z.string().optional(),
  // New fields
  housingCondition: z.enum([
    'owned',
    'rented',
    'with_family',
    'institution',
    'other'
  ]),
  physicalHealthCondition: z.enum([
    'excellent',
    'good',
    'fair',
    'poor',
    'critical'
  ]),
  monthlyIncome: z.number().min(0, 'Monthly income must be 0 or greater'),
  monthlyPension: z.number().min(0, 'Monthly pension must be 0 or greater'),
  livingCondition: z.enum([
    'independent',
    'with_family',
    'with_caregiver',
    'institution',
    'other'
  ]),
  beneficiaries: z.array(beneficiarySchema).default([]),
  notes: z.string().optional()
});

type AddSeniorFormData = z.infer<typeof addSeniorSchema>;

interface AddSeniorMobileProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Basic personal details',
    icon: User,
    isRequired: true
  },
  {
    id: 'address',
    title: 'Address Information',
    description: 'Location and address details',
    icon: MapPin,
    isRequired: true
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Primary contact details',
    icon: Phone,
    isRequired: false
  },
  {
    id: 'emergency',
    title: 'Emergency Contact',
    description: 'Emergency contact information',
    icon: AlertTriangle,
    isRequired: true
  },
  {
    id: 'medical',
    title: 'Medical Information',
    description: 'Health conditions and medications',
    icon: FileText,
    isRequired: false
  },
  {
    id: 'living',
    title: 'Living Conditions',
    description: 'Housing and income information',
    icon: Home,
    isRequired: true
  },
  {
    id: 'beneficiaries',
    title: 'Beneficiaries',
    description: 'Family members and dependents',
    icon: Users,
    isRequired: false
  }
];

export function AddSeniorMobile({
  isOpen,
  onClose,
  onSuccess
}: AddSeniorMobileProps) {
  const { authState } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [addressData, setAddressData] = useState<AddressData>({});
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<AddSeniorFormData>({
    resolver: zodResolver(addSeniorSchema),
    defaultValues: {
      gender: 'other',
      medicalConditions: [],
      medications: [],
      housingCondition: 'owned',
      physicalHealthCondition: 'good',
      monthlyIncome: 0,
      monthlyPension: 0,
      livingCondition: 'independent',
      beneficiaries: []
    }
  });

  // Calculate age when date of birth changes
  const watchDateOfBirth = form.watch('dateOfBirth');

  useEffect(() => {
    if (watchDateOfBirth) {
      const birthDate = new Date(watchDateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [watchDateOfBirth]);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill barangay from logged-in user
      if (authState.user?.barangay) {
        form.setValue('barangay', authState.user.barangay);
        // You might need to set barangayCode as well based on your data structure
      }

      // Fetch current user's BASCA member data and pre-fill address selection
      if (authState.user?.id) {
        const fetchBascaMember = async () => {
          try {
            const bascaMember = await BascaMembersAPI.getCurrentUserBascaMember(
              authState.user!.id
            );
            console.log({ bascaMember });
            if (bascaMember && bascaMember.addressData) {
              setAddressData(bascaMember.addressData);
            }
          } catch (error) {
            console.error('Error fetching BASCA member data:', error);
            // Don't show error toast as this is optional
          }
        };
        fetchBascaMember();
      }
    }
  }, [isOpen, authState.user, form]);

  // Check scrollability when step changes or content updates
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const element = scrollContainerRef.current;
        const isScrollable = element.scrollHeight > element.clientHeight;
        setIsScrollable(isScrollable);
      }
    };

    // Check after a short delay to ensure content is rendered
    const timer = setTimeout(checkScroll, 100);

    return () => clearTimeout(timer);
  }, [currentStep, form.watch()]);

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0: // Personal Information
        return await form.trigger([
          'firstName',
          'lastName',
          'dateOfBirth',
          'gender'
        ]);
      case 1: // Address Information
        return await form.trigger(['barangay', 'barangayCode', 'address']);
      case 2: // Contact Information
        return true; // Optional step
      case 3: // Emergency Contact
        return await form.trigger([
          'emergencyContactName',
          'emergencyContactPhone',
          'emergencyContactRelationship'
        ]);
      case 4: // Medical Information
        return true; // Optional step
      case 5: // Living Conditions
        return await form.trigger([
          'housingCondition',
          'physicalHealthCondition',
          'monthlyIncome',
          'monthlyPension',
          'livingCondition'
        ]);
      case 6: // Beneficiaries
        return true; // Optional step
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const canProceed = (): boolean => {
    const formValues = form.watch();
    switch (currentStep) {
      case 0: // Personal Information
        return !!(
          formValues.firstName &&
          formValues.lastName &&
          formValues.dateOfBirth &&
          formValues.gender
        );
      case 1: // Address Information
        return !!(
          formValues.barangay &&
          formValues.barangayCode &&
          formValues.address
        );
      case 2: // Contact Information
        return true; // Optional
      case 3: // Emergency Contact
        return !!(
          formValues.emergencyContactName &&
          formValues.emergencyContactPhone &&
          formValues.emergencyContactRelationship
        );
      case 4: // Medical Information
        return true; // Optional
      case 5: // Living Conditions
        return !!(
          formValues.housingCondition &&
          formValues.physicalHealthCondition &&
          formValues.monthlyIncome !== undefined &&
          formValues.monthlyPension !== undefined &&
          formValues.livingCondition
        );
      case 6: // Beneficiaries
        return true; // Optional
      default:
        return true;
    }
  };

  const onSubmit = async (data: AddSeniorFormData) => {
    setIsLoading(true);

    try {
      // Import the API
      const { SeniorCitizensAPI } = await import('@/lib/api/senior-citizens');

      // Prepare the data for the API
      const apiData = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        barangay: data.barangay,
        barangayCode: data.barangayCode,
        address: data.address,
        addressData,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        contactRelationship: data.contactRelationship,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelationship: data.emergencyContactRelationship,
        medicalConditions,
        medications,
        notes: data.notes,
        housingCondition: data.housingCondition,
        physicalHealthCondition: data.physicalHealthCondition,
        monthlyIncome: data.monthlyIncome,
        monthlyPension: data.monthlyPension,
        livingCondition: data.livingCondition,
        profilePicture,
        seniorIdPhoto: data.seniorIdPhoto,
        beneficiaries
      };

      console.log('Adding senior citizen:', apiData);

      const result = await SeniorCitizensAPI.createSeniorCitizen(apiData);

      if (result.success) {
        console.log('Senior citizen created successfully:', result.data);

        // Reset form and close modal
        form.reset();
        setMedicalConditions([]);
        setMedications([]);
        setBeneficiaries([]);
        setAddressData({});
        setProfilePicture('');
        setNewCondition('');
        setNewMedication('');
        setCurrentStep(0);
        onSuccess();
        onClose();
      } else {
        console.error('Failed to create senior citizen:', result.message);
        toast.error(result.message || 'Failed to create senior citizen');
      }
    } catch (error) {
      console.error('Error creating senior citizen:', error);
      toast.error('Failed to create senior citizen. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCondition = () => {
    const condition = prompt('Enter medical condition:');
    if (condition && condition.trim()) {
      setMedicalConditions(prev => [...prev, condition.trim()]);
    }
  };

  const handleRemoveCondition = (condition: string) => {
    setMedicalConditions(prev => prev.filter(c => c !== condition));
  };

  const handleAddMedication = () => {
    const medication = prompt('Enter medication:');
    if (medication && medication.trim()) {
      setMedications(prev => [...prev, medication.trim()]);
    }
  };

  const handleRemoveMedication = (medication: string) => {
    setMedications(prev => prev.filter(m => m !== medication));
  };

  const handleClose = () => {
    setCurrentStep(0);
    form.reset();
    setMedicalConditions([]);
    setMedications([]);
    setBeneficiaries([]);
    setAddressData({});
    setProfilePicture('');
    setNewCondition('');
    setNewMedication('');
    onClose();
  };

  const checkScrollability = (element: HTMLElement | null) => {
    if (element) {
      const isScrollable = element.scrollHeight > element.clientHeight;
      setIsScrollable(isScrollable);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-6">
            {/* Personal Details Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Personal Details
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    {...form.register('firstName')}
                    placeholder="Enter first name"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    {...form.register('lastName')}
                    placeholder="Enter last name"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dateOfBirth"
                  className="text-sm font-semibold text-gray-700">
                  Date of Birth *
                </Label>
                <div className="relative group">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register('dateOfBirth')}
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white pr-12"
                  />
                  <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00af8f] transition-colors duration-200" />
                </div>
                {form.formState.errors.dateOfBirth && (
                  <p className="text-red-500 text-xs flex items-center mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {form.formState.errors.dateOfBirth.message}
                  </p>
                )}
                {calculatedAge !== null && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      Age:{' '}
                      <span className="font-bold">
                        {calculatedAge} years old
                      </span>
                    </p>
                  </div>
                )}
                {calculatedAge !== null && calculatedAge < 60 && (
                  <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800 font-medium">
                      ⚠️ Person must be at least 60 years old to register as a
                      senior citizen
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="text-sm font-semibold text-gray-700">
                  Gender *
                </Label>
                <Select
                  onValueChange={value =>
                    form.setValue('gender', value as any)
                  }>
                  <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-lg">
                    <SelectItem
                      value="male"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      Male
                    </SelectItem>
                    <SelectItem
                      value="female"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      Female
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Photo and ID Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Photos & Identification
                </h4>
              </div>

              <div className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <User className="w-4 h-4 mr-2 text-[#00af8f]" />
                      Profile Picture
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-[#00af8f] transition-all duration-200 bg-white">
                      {profilePicture ? (
                        <div className="space-y-3">
                          <div className="relative w-20 h-20 mx-auto">
                            <img
                              src={profilePicture}
                              alt="Profile preview"
                              className="w-full h-full object-cover rounded-2xl shadow-lg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white border-red-500 hover:bg-red-600 rounded-full shadow-lg"
                              onClick={() => {
                                setProfilePicture('');
                                form.setValue('profilePicture', '');
                              }}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5 rounded-xl"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = e => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = e => {
                                    const result = e.target?.result as string;
                                    setProfilePicture(result);
                                    form.setValue('profilePicture', result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}>
                            Change Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#00af8f]/10 to-[#00af8f]/20 rounded-2xl flex items-center justify-center">
                            <User className="w-8 h-8 text-[#00af8f]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Upload Profile Picture
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG or JPEG (max 5MB)
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5 rounded-xl"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = e => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = e => {
                                    const result = e.target?.result as string;
                                    setProfilePicture(result);
                                    form.setValue('profilePicture', result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}>
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                      <p className="text-xs text-blue-800">
                        <strong>Optional:</strong> A clear, recent photo of the
                        senior citizen for identification purposes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Valid ID Upload */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-[#00af8f]" />
                      Valid ID Document
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-[#00af8f] transition-all duration-200 bg-white">
                      {form.watch('seniorIdPhoto') ? (
                        <div className="space-y-3">
                          <div className="relative w-20 h-20 mx-auto">
                            <img
                              src={form.watch('seniorIdPhoto')}
                              alt="ID preview"
                              className="w-full h-full object-cover rounded-2xl shadow-lg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white border-red-500 hover:bg-red-600 rounded-full shadow-lg"
                              onClick={() => {
                                form.setValue('seniorIdPhoto', '');
                              }}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5 rounded-xl"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = e => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = e => {
                                    const result = e.target?.result as string;
                                    form.setValue('seniorIdPhoto', result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}>
                            Change ID Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#00af8f]/10 to-[#00af8f]/20 rounded-2xl flex items-center justify-center">
                            <FileText className="w-8 h-8 text-[#00af8f]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Upload Valid ID Document
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG or JPEG (max 5MB)
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5 rounded-xl"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = e => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = e => {
                                    const result = e.target?.result as string;
                                    form.setValue('seniorIdPhoto', result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}>
                            Choose ID File
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <p className="text-xs text-amber-800">
                        <strong>Required:</strong> Upload a clear photo of a
                        valid government ID (e.g., Senior Citizen ID, UMID,
                        Driver's License, Passport).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Address
        return (
          <div className="space-y-6">
            {/* Address Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Location Details
                </h4>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Address Selection *
                </Label>
                <PhilippineAddressSelector
                  value={addressData}
                  onChange={setAddressData}
                  disabled={true}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-sm font-semibold text-gray-700">
                    Detailed Address *
                  </Label>
                  <Textarea
                    id="address"
                    {...form.register('address')}
                    placeholder="Enter detailed address (street, house number, etc.)"
                    className="min-h-[80px] text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="barangay"
                    className="text-sm font-semibold text-gray-700">
                    Barangay *
                  </Label>
                  <Input
                    id="barangay"
                    {...form.register('barangay')}
                    placeholder="Enter barangay"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                    value={form.watch('barangay')}
                    onChange={e => {
                      form.setValue('barangay', e.target.value);
                      form.setValue('barangayCode', e.target.value);
                    }}
                  />
                  {form.formState.errors.barangay && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {form.formState.errors.barangay.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Contact
        return (
          <div className="space-y-6">
            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Contact Details
                </h4>
                <Badge variant="secondary" className="ml-auto text-xs">
                  Optional
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="contactPerson"
                    className="text-sm font-semibold text-gray-700">
                    Contact Person
                  </Label>
                  <Input
                    id="contactPerson"
                    {...form.register('contactPerson')}
                    placeholder="Enter contact person name"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contactPhone"
                    className="text-sm font-semibold text-gray-700">
                    Contact Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    {...form.register('contactPhone')}
                    placeholder="Enter contact phone number"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contactRelationship"
                    className="text-sm font-semibold text-gray-700">
                    Contact Relationship
                  </Label>
                  <Input
                    id="contactRelationship"
                    {...form.register('contactRelationship')}
                    placeholder="e.g., Son, Daughter, Spouse"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  💡 <strong>Tip:</strong> These contact details are optional
                  but helpful for communication purposes.
                </p>
              </div>
            </div>
          </div>
        );

      case 3: // Emergency Contact
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-[#333333]">Emergency Contact *</h4>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">
                Emergency Contact Name *
              </Label>
              <Input
                id="emergencyContactName"
                {...form.register('emergencyContactName')}
                placeholder="Enter emergency contact name"
                className="h-12 text-base"
              />
              {form.formState.errors.emergencyContactName && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.emergencyContactName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelationship">
                Relationship *
              </Label>
              <Input
                id="emergencyContactRelationship"
                {...form.register('emergencyContactRelationship')}
                placeholder="e.g., Son, Daughter, Spouse"
                className="h-12 text-base"
              />
              {form.formState.errors.emergencyContactRelationship && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.emergencyContactRelationship.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">
                Emergency Contact Phone *
              </Label>
              <Input
                id="emergencyContactPhone"
                {...form.register('emergencyContactPhone')}
                placeholder="Enter emergency contact phone"
                className="h-12 text-base"
              />
              {form.formState.errors.emergencyContactPhone && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.emergencyContactPhone.message}
                </p>
              )}
            </div>
          </div>
        );

      case 4: // Medical
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Medical Conditions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                  className="h-8 px-3">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {medicalConditions.length === 0 ? (
                <p className="text-[#666666] text-sm text-center py-4">
                  No medical conditions added
                </p>
              ) : (
                <div className="space-y-2">
                  {medicalConditions.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{condition}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCondition(condition)}
                        className="h-6 w-6 p-0 text-red-500">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Current Medications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedication}
                  className="h-8 px-3">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {medications.length === 0 ? (
                <p className="text-[#666666] text-sm text-center py-4">
                  No medications added
                </p>
              ) : (
                <div className="space-y-2">
                  {medications.map((medication, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{medication}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedication(medication)}
                        className="h-6 w-6 p-0 text-red-500">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5: // Living Conditions
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="housingCondition">Housing Type *</Label>
              <Select
                onValueChange={value =>
                  form.setValue('housingCondition', value as any)
                }>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select housing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owned">Owned</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="with_family">
                    Living with Family
                  </SelectItem>
                  <SelectItem value="institution">Institution</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.housingCondition && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.housingCondition.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="physicalHealthCondition">
                Physical Health Condition *
              </Label>
              <Select
                onValueChange={value =>
                  form.setValue('physicalHealthCondition', value as any)
                }>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select health condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.physicalHealthCondition && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.physicalHealthCondition.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income (₱) *</Label>
              <Input
                id="monthlyIncome"
                type="number"
                {...form.register('monthlyIncome', {
                  valueAsNumber: true
                })}
                placeholder="Enter monthly income"
                className="h-12 text-base"
              />
              {form.formState.errors.monthlyIncome && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.monthlyIncome.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyPension">Monthly Pension (₱) *</Label>
              <Input
                id="monthlyPension"
                type="number"
                {...form.register('monthlyPension', {
                  valueAsNumber: true
                })}
                placeholder="Enter monthly pension"
                className="h-12 text-base"
              />
              {form.formState.errors.monthlyPension && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.monthlyPension.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="livingCondition">Living Condition *</Label>
              <Select
                onValueChange={value =>
                  form.setValue('livingCondition', value as any)
                }>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select living condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent</SelectItem>
                  <SelectItem value="with_family">
                    Living with Family
                  </SelectItem>
                  <SelectItem value="with_caregiver">With Caregiver</SelectItem>
                  <SelectItem value="institution">Institution</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.livingCondition && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.livingCondition.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Any additional information about the senior citizen"
                className="min-h-[80px] text-base"
              />
            </div>
          </div>
        );

      case 6: // Beneficiaries
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-[#00af8f] mx-auto mb-4 opacity-50" />
              <h4 className="font-medium text-[#333333] mb-2">Beneficiaries</h4>
              <p className="text-[#666666] text-sm mb-4">
                Add family members or dependents if needed
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // TODO: Implement beneficiary form
                  toast.info('Beneficiary form coming soon!');
                }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Beneficiary
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#00af8f] via-[#00af90] to-[#00af8f] shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold text-white mb-1">
              {steps[currentStep].title}
            </h2>
            <p className="text-white/80 text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white scrollbar-hide scroll-smooth relative max-h-[calc(100vh-200px)]">
        {/* Top Scroll Fade Indicator */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-50/90 via-gray-50/50 to-transparent h-6 pointer-events-none" />

        <div className="p-4 pb-32">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step Header Card */}
            {/* <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                  {React.createElement(steps[currentStep].icon, {
                    className: 'w-5 h-5 text-white'
                  })}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>
            </div> */}

            {/* Form Content */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {renderStepContent()}
            </div>
          </form>
        </div>

        {/* Bottom Scroll Fade Indicator */}
        <div className="sticky bottom-0 z-10 bg-gradient-to-t from-gray-50/90 via-gray-50/50 to-transparent h-6 pointer-events-none" />

        {/* Scroll Hint (only visible when content is scrollable) */}
        {isScrollable && (
          <div className="absolute bottom-4 right-4 animate-pulse pointer-events-none">
            <div className="w-2 h-8 bg-gradient-to-b from-[#00af8f]/40 to-[#00af8f]/60 rounded-full shadow-lg"></div>
          </div>
        )}
      </div>

      {/* Mobile Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
        <div className="p-4">
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 h-14 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium">
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 h-14 bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canProceed() || isLoading}
                className="flex-1 h-14 bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Save Senior Citizen
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-3 flex justify-center">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-[#00af8f] scale-125'
                      : index < currentStep
                      ? 'bg-[#00af8f]/60'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
