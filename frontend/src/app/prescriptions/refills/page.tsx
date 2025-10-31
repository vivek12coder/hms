'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Pill, 
  Plus, 
  Trash2, 
  Clock, 
  User,
  MapPin,
  Phone,
  AlertCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  lastPrescribed: string
  remainingRefills: number
  prescribedBy: string
}

interface RefillRequest {
  medicationId: string
  quantity: string
  urgency: 'routine' | 'urgent' | 'emergency'
  notes: string
}

export default function PrescriptionRefillsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([])
  const [refillRequests, setRefillRequests] = useState<RefillRequest[]>([])
  const [deliveryInfo, setDeliveryInfo] = useState({
    method: 'pickup', // pickup or delivery
    address: '',
    phone: '',
    instructions: ''
  })

  // Fetch medications from backend
  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
      }>('/prescriptions')
      if (response.success) {
        const medicationsData = response.data.map((prescription: any) => ({
          id: prescription.id,
          name: prescription.medicationName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          lastPrescribed: prescription.prescribedDate,
          remainingRefills: prescription.remainingRefills,
          prescribedBy: prescription.prescribedBy
        }))
        setMedications(medicationsData)
      } else {
        setMedications([])
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
      setMedications([])
    }
  }

  const addToRefillRequest = (medication: Medication) => {
    const exists = refillRequests.find(req => req.medicationId === medication.id)
    if (exists) return

    const newRequest: RefillRequest = {
      medicationId: medication.id,
      quantity: '30', // Default 30 days supply
      urgency: 'routine',
      notes: ''
    }

    setRefillRequests([...refillRequests, newRequest])
  }

  const removeFromRefillRequest = (medicationId: string) => {
    setRefillRequests(refillRequests.filter(req => req.medicationId !== medicationId))
  }

  const updateRefillRequest = (medicationId: string, field: keyof RefillRequest, value: string) => {
    setRefillRequests(refillRequests.map(req => 
      req.medicationId === medicationId 
        ? { ...req, [field]: value }
        : req
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (refillRequests.length === 0) {
      alert('Please add at least one medication to refill.')
      return
    }

    setLoading(true)

    try {
      const requestData = {
        refillRequests,
        deliveryInfo
      }

      const response = await apiClient.post<{
        success: boolean;
        data?: any;
      }>('/prescriptions/refill', requestData)
      
      if (response.success) {
        alert('Prescription refill request submitted successfully! You will receive a confirmation email shortly.')
        
        // Reset form
        setRefillRequests([])
        setDeliveryInfo({
          method: 'pickup',
          address: '',
          phone: '',
          instructions: ''
        })
        
        router.push('/dashboard')
      } else {
        alert('Failed to submit refill request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting refill request:', error)
      alert('Error submitting refill request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'routine':
        return 'bg-green-100 text-green-800'
      case 'urgent':
        return 'bg-yellow-100 text-yellow-800'
      case 'emergency':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prescription Refills
          </h1>
          <p className="text-gray-600">
            Request refills for your prescribed medications
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Your Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No current medications found.</p>
                </div>
              ) : (
                medications.map((medication) => {
                  const isInCart = refillRequests.some(req => req.medicationId === medication.id)
                  const canRefill = medication.remainingRefills > 0

                  return (
                    <div key={medication.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{medication.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Dosage:</span> {medication.dosage}
                            </div>
                            <div>
                              <span className="font-medium">Frequency:</span> {medication.frequency}
                            </div>
                            <div>
                              <span className="font-medium">Prescribed by:</span> {medication.prescribedBy}
                            </div>
                            <div>
                              <span className="font-medium">Last prescribed:</span> {formatDate(medication.lastPrescribed)}
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge 
                              className={
                                medication.remainingRefills > 0 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {medication.remainingRefills} refills remaining
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-4">
                          {isInCart ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeFromRefillRequest(medication.id)}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => addToRefillRequest(medication)}
                              disabled={!canRefill}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add to Refill
                            </Button>
                          )}
                        </div>
                      </div>

                      {!canRefill && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">
                              No refills remaining. Contact your doctor for a new prescription.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Refill Requests */}
          {refillRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Refill Requests ({refillRequests.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {refillRequests.map((request) => {
                  const medication = medications.find(m => m.id === request.medicationId)!
                  
                  return (
                    <div key={request.medicationId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{medication.name}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromRefillRequest(request.medicationId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`quantity-${request.medicationId}`}>
                            Quantity (days supply)
                          </Label>
                          <Select
                            value={request.quantity}
                            onValueChange={(value) => updateRefillRequest(request.medicationId, 'quantity', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="14">14 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="60">60 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`urgency-${request.medicationId}`}>
                            Urgency
                          </Label>
                          <Select
                            value={request.urgency}
                            onValueChange={(value) => updateRefillRequest(request.medicationId, 'urgency', value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="routine">Routine (3-5 days)</SelectItem>
                              <SelectItem value="urgent">Urgent (1-2 days)</SelectItem>
                              <SelectItem value="emergency">Emergency (Same day)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Current Urgency</Label>
                          <div className="pt-2">
                            <Badge className={getUrgencyColor(request.urgency)}>
                              {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label htmlFor={`notes-${request.medicationId}`}>
                          Special Instructions (Optional)
                        </Label>
                        <Textarea
                          id={`notes-${request.medicationId}`}
                          placeholder="Any special instructions for this medication..."
                          value={request.notes}
                          onChange={(e) => updateRefillRequest(request.medicationId, 'notes', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Delivery Information */}
          {refillRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Method */}
                <div>
                  <Label>Delivery Method</Label>
                  <Select
                    value={deliveryInfo.method}
                    onValueChange={(value) => setDeliveryInfo(prev => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Pharmacy Pickup</SelectItem>
                      <SelectItem value="delivery">Home Delivery (+₹50.00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Delivery Address (if delivery selected) */}
                {deliveryInfo.method === 'delivery' && (
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete delivery address..."
                      value={deliveryInfo.address}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                      required
                      rows={3}
                    />
                  </div>
                )}

                {/* Contact Phone */}
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={deliveryInfo.phone}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                {/* Special Instructions */}
                <div>
                  <Label htmlFor="instructions">
                    Special Delivery Instructions (Optional)
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Gate code, building instructions, preferred delivery time, etc..."
                    value={deliveryInfo.instructions}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
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
              disabled={loading || refillRequests.length === 0}
              className="flex-1"
            >
              {loading ? 'Submitting...' : `Submit Refill Request (${refillRequests.length})`}
            </Button>
          </div>
        </form>

        {/* Info Section */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Important Information</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Refill requests are processed during business hours (Mon-Fri, 9AM-6PM)</li>
                  <li>• You will receive an SMS/Email notification when your refill is ready</li>
                  <li>• Emergency refills may require doctor approval and additional fees</li>
                  <li>• Home delivery is available within 10 miles of the pharmacy</li>
                  <li>• Contact the pharmacy at (555) 123-MEDS for urgent questions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}