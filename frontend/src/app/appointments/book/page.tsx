'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, User, Stethoscope } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Doctor {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  specialization?: string
  experience?: number
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    serviceType: '',
    symptoms: '',
    notes: ''
  })

  const serviceTypes = [
    'General Consultation',
    'Follow-up Visit',
    'Emergency Consultation',
    'Specialist Consultation',
    'Health Checkup',
    'Vaccination',
    'Laboratory Tests',
    'Radiology'
  ]

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/doctors')
      if (response.data.success) {
        // API returns { doctors: [], pagination: {} } structure
        setDoctors(response.data.data.doctors || [])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      // Set some fallback doctors if API fails
      setDoctors([
        {
          id: '1',
          user: {
            firstName: 'John',
            lastName: 'Smith',
            email: 'doctor@hospital.com'
          },
          specialization: 'Cardiology'
        },
        {
          id: '2',
          user: {
            firstName: 'Emily',
            lastName: 'Johnson',
            email: 'doctor2@hospital.com'
          },
          specialization: 'Pediatrics'
        }
      ])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combine date and time
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`)
      
      const appointmentData = {
        doctorId: formData.doctorId,
        appointmentDateTime: appointmentDateTime.toISOString(),
        serviceType: formData.serviceType,
        symptoms: formData.symptoms,
        notes: formData.notes
      }

      console.log('Submitting appointment data:', appointmentData)

      const response = await apiClient.post('/appointments', appointmentData)
      
      console.log('Appointment response:', response)
      
      if (response.data && response.data.success) {
        alert('Appointment booked successfully!')
        router.push('/dashboard')
      } else {
        console.error('Appointment booking failed:', response)
        alert('Failed to book appointment: ' + (response.data?.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      
      // More detailed error handling
      if (error instanceof Error) {
        alert('Error booking appointment: ' + error.message)
      } else {
        alert('Error booking appointment. Please check console for details.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]
  
  // Get maximum date (3 months from now)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Appointment
          </h1>
          <p className="text-gray-600">
            Schedule your appointment with our healthcare professionals
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Doctor Selection */}
              <div className="space-y-2 relative z-30">
                <Label htmlFor="doctor" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Select Doctor
                </Label>
                <Select 
                  value={formData.doctorId} 
                  onValueChange={(value) => handleChange('doctorId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.user.firstName} {doctor.user.lastName}
                        {doctor.specialization && ` - ${doctor.specialization}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type */}
              <div className="space-y-2 relative z-20">
                <Label htmlFor="serviceType" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Service Type
                </Label>
                <Select 
                  value={formData.serviceType} 
                  onValueChange={(value) => handleChange('serviceType', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Appointment Date
                  </Label>
                  <Input
                    type="date"
                    id="date"
                    min={today}
                    max={maxDateStr}
                    value={formData.appointmentDate}
                    onChange={(e) => handleChange('appointmentDate', e.target.value)}
                    required
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Appointment Time
                  </Label>
                  <Select 
                    value={formData.appointmentTime} 
                    onValueChange={(value) => handleChange('appointmentTime', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
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
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <Label htmlFor="symptoms">
                  Symptoms / Reason for Visit
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Please describe your symptoms or reason for the appointment..."
                  value={formData.symptoms}
                  onChange={(e) => handleChange('symptoms', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information you'd like to share..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}