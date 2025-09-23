'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PatientForm } from '@/components/forms/PatientForm';

type PatientFormData = {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  allergies?: string;
  currentMedications?: string;
  medicalConditions?: string;
};
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPatientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      console.log('Patient data:', data);
      // Here you would make an API call to create the patient
      // await api.post('/patients', data);
      
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to patients list on success
      router.push('/patients');
    } catch (error) {
      console.error('Error creating patient:', error);
      // Handle error (show toast notification, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/patients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Register New Patient</h1>
          <p className="mt-2 text-gray-600">Create a new patient record in the system</p>
        </div>
      </div>

      <PatientForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}