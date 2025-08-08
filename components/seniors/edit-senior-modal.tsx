'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import { IDPictureUpload } from '@/components/ui/id-picture-upload';
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
  Edit
} from 'lucide-react';
import type { SeniorCitizen } from '@/types/property';

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

const editSeniorSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
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
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'deceased'])
});

type EditSeniorFormData = z.infer<typeof editSeniorSchema>;

interface EditSeniorModalProps {
  isOpen: boolean;
  onClose: () => void;
  senior: SeniorCitizen;
  onSuccess: () => void;
}

export function EditSeniorModal({
  isOpen,
  onClose,
  senior,
  onSuccess
}: EditSeniorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [addressData, setAddressData] = useState<AddressData>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<EditSeniorFormData>({
    resolver: zodResolver(editSeniorSchema)
  });

  // Pre-fill form with senior data
  useEffect(() => {
    if (senior && isOpen) {
      // Mock name data - in real app, this would come from user data
      const mockName =
        senior.oscaId === 'OSCA-2024-001'
          ? { firstName: 'Maria', lastName: 'Santos' }
          : senior.oscaId === 'OSCA-2024-002'
          ? { firstName: 'Juan', lastName: 'Dela Cruz' }
          : senior.oscaId === 'OSCA-2024-003'
          ? { firstName: 'Ana', lastName: 'Reyes' }
          : { firstName: 'Unknown', lastName: 'User' };

      setValue('firstName', mockName.firstName);
      setValue('lastName', mockName.lastName);
      setValue('dateOfBirth', senior.dateOfBirth);
      setValue('gender', senior.gender);
      setValue('barangay', senior.barangay);
      setValue('barangayCode', senior.barangayCode);
      setValue('address', senior.address);
      setValue('contactPerson', senior.contactPerson || '');
      setValue('contactPhone', senior.contactPhone || '');
      setValue('contactRelationship', senior.contactRelationship || '');
      setValue('emergencyContactName', senior.emergencyContactName || '');
      setValue('emergencyContactPhone', senior.emergencyContactPhone || '');
      setValue(
        'emergencyContactRelationship',
        senior.emergencyContactRelationship || ''
      );
      setValue('notes', senior.notes || '');
      setValue('status', senior.status);
      // New fields
      setValue('housingCondition', senior.housingCondition);
      setValue('physicalHealthCondition', senior.physicalHealthCondition);
      setValue('monthlyIncome', senior.monthlyIncome);
      setValue('monthlyPension', senior.monthlyPension);
      setValue('livingCondition', senior.livingCondition);

      setMedicalConditions(senior.medicalConditions);
      setMedications(senior.medications);
      setBeneficiaries(senior.beneficiaries || []);
    }
  }, [senior, isOpen, setValue]);

  const onSubmit = async (data: EditSeniorFormData) => {
    setIsLoading(true);

    try {
      // Add medical conditions, medications, beneficiaries, and address data to the data
      const formData = {
        ...data,
        addressData,
        medicalConditions,
        medications,
        beneficiaries,
        id: senior.id
      };

      console.log('Updating senior citizen:', formData);

      // TODO: Implement API call to update senior citizen
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      onSuccess();
    } catch (error) {
      console.error('Error updating senior citizen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCondition = () => {
    if (
      newCondition.trim() &&
      !medicalConditions.includes(newCondition.trim())
    ) {
      setMedicalConditions([...medicalConditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (condition: string) => {
    setMedicalConditions(medicalConditions.filter(c => c !== condition));
  };

  const handleAddMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (medication: string) => {
    setMedications(medications.filter(m => m !== medication));
  };

  const handleClose = () => {
    reset();
    setMedicalConditions([]);
    setMedications([]);
    setBeneficiaries([]);
    setAddressData({});
    setNewCondition('');
    setNewMedication('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-[#333333]">
            <Edit className="w-6 h-6 text-[#00af8f]" />
            Edit Senior Citizen
          </DialogTitle>
          <DialogDescription className="text-[#666666]">
            Update senior citizen information. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
              <User className="w-5 h-5 text-[#00af8f]" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-[#333333] font-medium">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-[#333333] font-medium">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dateOfBirth"
                  className="text-[#333333] font-medium">
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('dateOfBirth')}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-[#333333] font-medium">
                  Gender *
                </Label>
                <Select
                  onValueChange={value =>
                    setValue('gender', value as 'male' | 'female' | 'other')
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-[#333333] font-medium">
                  Status *
                </Label>
                <Select
                  onValueChange={value =>
                    setValue(
                      'status',
                      value as 'active' | 'inactive' | 'deceased'
                    )
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-sm">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00af8f]" />
              Address Information
            </h3>

            {/* Philippine Address Selector */}
            <PhilippineAddressSelector
              value={addressData}
              onChange={data => {
                setAddressData(data);
                // Update the form values based on address selection
                if (data.barangay) {
                  setValue('barangay', data.barangay.brgy_name);
                  setValue('barangayCode', data.barangay.brgy_code);
                }
                if (
                  data.region &&
                  data.province &&
                  data.city &&
                  data.barangay
                ) {
                  const fullAddress = `${data.barangay.brgy_name}, ${data.city.city_name}, ${data.province.province_name}, ${data.region.region_name}`;
                  setValue('address', fullAddress);
                }
              }}
              required={true}
              className="w-full"
            />

            {/* Additional Address Details */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[#333333] font-medium">
                Additional Address Details
              </Label>
              <Textarea
                id="address"
                placeholder="Enter street address, building number, or additional details"
                className="min-h-[80px] text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#00af8f]" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="contactPerson"
                  className="text-[#333333] font-medium">
                  Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  placeholder="Enter contact person name"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('contactPerson')}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contactPhone"
                  className="text-[#333333] font-medium">
                  Contact Phone
                </Label>
                <Input
                  id="contactPhone"
                  placeholder="Enter contact phone"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('contactPhone')}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contactRelationship"
                  className="text-[#333333] font-medium">
                  Relationship
                </Label>
                <Input
                  id="contactRelationship"
                  placeholder="e.g., Son, Daughter"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('contactRelationship')}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#00af8f]" />
              Emergency Contact *
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="emergencyContactName"
                  className="text-[#333333] font-medium">
                  Emergency Contact Name *
                </Label>
                <Input
                  id="emergencyContactName"
                  placeholder="Enter emergency contact name"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('emergencyContactName')}
                />
                {errors.emergencyContactName && (
                  <p className="text-red-500 text-sm">
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emergencyContactPhone"
                  className="text-[#333333] font-medium">
                  Emergency Contact Phone *
                </Label>
                <Input
                  id="emergencyContactPhone"
                  placeholder="Enter emergency contact phone"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('emergencyContactPhone')}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-red-500 text-sm">
                    {errors.emergencyContactPhone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emergencyContactRelationship"
                  className="text-[#333333] font-medium">
                  Relationship *
                </Label>
                <Input
                  id="emergencyContactRelationship"
                  placeholder="e.g., Son, Daughter, Spouse"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('emergencyContactRelationship')}
                />
                {errors.emergencyContactRelationship && (
                  <p className="text-red-500 text-sm">
                    {errors.emergencyContactRelationship.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00af8f]" />
              Medical Information
            </h3>

            {/* Medical Conditions */}
            <div className="space-y-3">
              <Label className="text-[#333333] font-medium">
                Medical Conditions
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add medical condition"
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value)}
                  className="flex-1 h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={handleAddCondition}
                  className="bg-[#00af8f] hover:bg-[#00af90] text-white px-4">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {medicalConditions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {medicalConditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {condition}
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(condition)}
                        className="ml-2 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Medications */}
            <div className="space-y-3">
              <Label className="text-[#333333] font-medium">Medications</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add medication"
                  value={newMedication}
                  onChange={e => setNewMedication(e.target.value)}
                  className="flex-1 h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={handleAddMedication}
                  className="bg-[#00af8f] hover:bg-[#00af90] text-white px-4">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {medications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {medications.map((medication, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {medication}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(medication)}
                        className="ml-2 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[#333333] font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes or special requirements"
                className="min-h-[80px] text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                {...register('notes')}
              />
            </div>
          </div>

          {/* ID Picture Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00af8f]" />
              ID Picture Upload
            </h3>
            <IDPictureUpload
              value={watch('seniorIdPhoto')}
              onChange={value => setValue('seniorIdPhoto', value)}
              onValidationChange={(isValid, result) => {
                console.log('ID validation result:', result);
              }}
              enableValidation={true}
              onValidationToggle={enabled => {
                console.log('ID validation toggled:', enabled);
              }}
              className="w-full"
            />
          </div>

          {/* Living Conditions & Income */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00af8f]" />
              Living Conditions & Income
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="housingCondition"
                  className="text-[#333333] font-medium">
                  Housing Condition *
                </Label>
                <Select
                  onValueChange={value =>
                    setValue('housingCondition', value as any)
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                    <SelectValue placeholder="Select housing condition" />
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
                {errors.housingCondition && (
                  <p className="text-red-500 text-sm">
                    {errors.housingCondition.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="physicalHealthCondition"
                  className="text-[#333333] font-medium">
                  Physical Health Condition *
                </Label>
                <Select
                  onValueChange={value =>
                    setValue('physicalHealthCondition', value as any)
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
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
                {errors.physicalHealthCondition && (
                  <p className="text-red-500 text-sm">
                    {errors.physicalHealthCondition.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="monthlyIncome"
                  className="text-[#333333] font-medium">
                  Monthly Income (₱) *
                </Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="Enter monthly income"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('monthlyIncome', { valueAsNumber: true })}
                />
                {errors.monthlyIncome && (
                  <p className="text-red-500 text-sm">
                    {errors.monthlyIncome.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="monthlyPension"
                  className="text-[#333333] font-medium">
                  Monthly Pension (₱) *
                </Label>
                <Input
                  id="monthlyPension"
                  type="number"
                  placeholder="Enter monthly pension"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('monthlyPension', { valueAsNumber: true })}
                />
                {errors.monthlyPension && (
                  <p className="text-red-500 text-sm">
                    {errors.monthlyPension.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="livingCondition"
                  className="text-[#333333] font-medium">
                  Living Condition *
                </Label>
                <Select
                  onValueChange={value =>
                    setValue('livingCondition', value as any)
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                    <SelectValue placeholder="Select living condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independent">Independent</SelectItem>
                    <SelectItem value="with_family">
                      Living with Family
                    </SelectItem>
                    <SelectItem value="with_caregiver">
                      With Caregiver
                    </SelectItem>
                    <SelectItem value="institution">In Institution</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.livingCondition && (
                  <p className="text-red-500 text-sm">
                    {errors.livingCondition.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Beneficiaries */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
              <User className="w-5 h-5 text-[#00af8f]" />
              Beneficiaries
            </h3>

            <div className="space-y-4">
              {beneficiaries.map((beneficiary, index) => (
                <div
                  key={index}
                  className="p-4 border-2 border-[#E0DDD8] rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-[#333333]">
                      Beneficiary {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newBeneficiaries = beneficiaries.filter(
                          (_, i) => i !== index
                        );
                        setBeneficiaries(newBeneficiaries);
                      }}
                      className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Name *
                      </Label>
                      <Input
                        placeholder="Enter beneficiary name"
                        value={beneficiary.name || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].name = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Relationship *
                      </Label>
                      <Input
                        placeholder="e.g., Son, Daughter, Grandchild"
                        value={beneficiary.relationship || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].relationship = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Date of Birth *
                      </Label>
                      <Input
                        type="date"
                        value={beneficiary.dateOfBirth || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].dateOfBirth = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Gender *
                      </Label>
                      <Select
                        value={beneficiary.gender || 'other'}
                        onValueChange={value => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].gender = value as
                            | 'male'
                            | 'female'
                            | 'other';
                          setBeneficiaries(newBeneficiaries);
                        }}>
                        <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Address
                      </Label>
                      <Input
                        placeholder="Enter address"
                        value={beneficiary.address || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].address = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Contact Phone
                      </Label>
                      <Input
                        placeholder="Enter contact phone"
                        value={beneficiary.contactPhone || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].contactPhone = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Occupation
                      </Label>
                      <Input
                        placeholder="Enter occupation"
                        value={beneficiary.occupation || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].occupation = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Monthly Income (₱)
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter monthly income"
                        value={beneficiary.monthlyIncome || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].monthlyIncome =
                            parseFloat(e.target.value) || 0;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`dependent-${index}`}
                      checked={beneficiary.isDependent || false}
                      onChange={e => {
                        const newBeneficiaries = [...beneficiaries];
                        newBeneficiaries[index].isDependent = e.target.checked;
                        setBeneficiaries(newBeneficiaries);
                      }}
                      className="w-4 h-4 text-[#00af8f] border-[#E0DDD8] rounded focus:ring-[#00af8f]"
                    />
                    <Label
                      htmlFor={`dependent-${index}`}
                      className="text-[#333333] font-medium">
                      Is Dependent
                    </Label>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                onClick={() => {
                  setBeneficiaries([
                    ...beneficiaries,
                    {
                      name: '',
                      relationship: '',
                      dateOfBirth: '',
                      gender: 'other',
                      address: '',
                      contactPhone: '',
                      occupation: '',
                      monthlyIncome: 0,
                      isDependent: false
                    }
                  ]);
                }}
                className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Beneficiary
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-[#666666] text-[#666666] hover:bg-[#666666]/10">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#00af8f] hover:bg-[#00af90] text-white">
              {isLoading ? 'Updating...' : 'Update Senior Citizen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
