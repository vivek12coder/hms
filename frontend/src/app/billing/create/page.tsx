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
import { formatCurrency } from '@/lib/currency';
import apiClient from '@/lib/api-client';
import { CreditCard, ArrowLeft, User, Calendar, DollarSign } from 'lucide-react';
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

interface Appointment {
  id: string;
  patient: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  scheduledAt: string;
  reason: string;
}

interface FormData {
  patientId: string;
  appointmentId?: string;
  amount: string;
  description: string;
  dueDate: string;
}

export default function CreateBillingPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    appointmentId: undefined,
    amount: '',
    description: '',
    dueDate: ''
  });

  const [selectedPatientAppointments, setSelectedPatientAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.patientId) {
      const patientAppointments = appointments.filter(
        apt => apt.patient && apt.patient.user && 
        patients.find(p => p.id === formData.patientId)?.user?.firstName === apt.patient.user.firstName &&
        patients.find(p => p.id === formData.patientId)?.user?.lastName === apt.patient.user.lastName
      );
      setSelectedPatientAppointments(patientAppointments);
      
      // Reset appointment selection when patient changes
      setFormData(prev => ({ ...prev, appointmentId: undefined }));
    } else {
      setSelectedPatientAppointments([]);
    }
  }, [formData.patientId, appointments, patients]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [patientsResponse, appointmentsResponse] = await Promise.all([
        apiClient.getPatients(),
        apiClient.getAppointments()
      ]);
      
      setPatients(Array.isArray(patientsResponse.data) ? patientsResponse.data : []);
      setAppointments(Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : []);
    } catch (error: any) {
      console.error('Error fetching initial data:', error);
      toast.error(error.message || 'Failed to fetch data');
      setPatients([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'appointmentId' && (value === '' || value === 'none') ? undefined : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }
    
    if (!formData.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createBillingRecord({
        patientId: formData.patientId,
        amount: amount,
        description: formData.description.trim(),
        dueDate: formData.dueDate
      });
      
      toast.success('Billing record created successfully!');
      router.push('/billing');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create billing record');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum due date (today)
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
        <Link href="/billing">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Billing
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Create Invoice
          </h1>
          <p className="text-muted-foreground">
            Create a new billing record for a patient
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>
              Fill in the information below to create a new billing record
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
                    {Array.isArray(patients) && patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.user.firstName} {patient.user.lastName} ({patient.user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Appointment Selection (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="appointment" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Related Appointment (Optional)
                </Label>
                <Select
                  value={formData.appointmentId || 'none'}
                  onValueChange={(value) => handleInputChange('appointmentId', value)}
                  disabled={!formData.patientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.patientId ? "Select an appointment (optional)" : "Select a patient first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No appointment</SelectItem>
                    {Array.isArray(selectedPatientAppointments) && selectedPatientAppointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {new Date(appointment.scheduledAt).toLocaleDateString()} - {appointment.reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Link this billing record to a specific appointment if applicable
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter the amount in USD (e.g., 150.00)
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the services provided or items billed..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Provide a detailed description of what this billing is for
                </p>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  Due Date *
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  min={minDate}
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  When should this invoice be paid by?
                </p>
              </div>

              {/* Preview Card */}
              {formData.amount && formData.description && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Invoice Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Patient:</span>
                      <span className="font-medium">
                        {formData.patientId ? 
                          patients.find(p => p.id === formData.patientId)?.user.firstName + ' ' +
                          patients.find(p => p.id === formData.patientId)?.user.lastName 
                          : 'Not selected'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium text-lg">
                        {formatCurrency(parseFloat(formData.amount || '0'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span className="font-medium">
                        {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.description || 'No description provided'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/billing">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}