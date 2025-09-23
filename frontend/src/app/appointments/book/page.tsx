'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { CalendarIcon, Clock, User, Stethoscope, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Patient {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Doctor {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  specialization: string;
}

interface FormData {
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  reason: string;
  notes: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    doctorId: '',
    scheduledAt: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [patientsResponse, doctorsResponse] = await Promise.all([
        apiClient.getPatients(),
        apiClient.getDoctors()
      ]);
      
      setPatients(patientsResponse.data);
      setDoctors(doctorsResponse.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!formData.doctorId) {
      toast.error('Please select a doctor');
      return;
    }
    if (!formData.scheduledAt) {
      toast.error('Please select date and time');
      return;
    }
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the appointment');
      return;
    }

    // Check if appointment is in the past
    const scheduledDate = new Date(formData.scheduledAt);
    if (scheduledDate < new Date()) {
      toast.error('Appointment cannot be scheduled in the past');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createAppointment({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        scheduledAt: formData.scheduledAt,
        reason: formData.reason,
        notes: formData.notes || undefined
      });
      
      toast.success('Appointment booked successfully!');
      router.push('/appointments');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to book appointment';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Generate time slots (9 AM to 5 PM, every 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 17 && minute === 30) break; // Don't go past 5:00 PM
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-96 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/appointments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-8 w-8" />
            Book Appointment
          </h1>
          <p className="text-muted-foreground">
            Schedule a new appointment for a patient
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>
              Fill in the information below to book a new appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patient" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient *
                </Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) => handleInputChange('patientId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.user.firstName} {patient.user.lastName} ({patient.user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Selection */}
              <div className="space-y-2">
                <Label htmlFor="doctor" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Doctor *
                </Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(value) => handleInputChange('doctorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={minDate}
                  value={formData.scheduledAt.split('T')[0] || ''}
                  onChange={(e) => {
                    const currentTime = formData.scheduledAt.split('T')[1] || '09:00:00.000Z';
                    handleInputChange('scheduledAt', `${e.target.value}T${currentTime}`);
                  }}
                  required
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time *
                </Label>
                <Select
                  value={formData.scheduledAt.split('T')[1]?.substring(0, 5) || ''}
                  onValueChange={(value) => {
                    const currentDate = formData.scheduledAt.split('T')[0] || minDate;
                    handleInputChange('scheduledAt', `${currentDate}T${value}:00.000Z`);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for Visit *
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Describe the reason for this appointment..."
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or special instructions..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/appointments">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}