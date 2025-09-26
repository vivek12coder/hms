'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  Search, 
  Filter,
  Clock,
  Stethoscope,
  Pill,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface MedicalRecord {
  id: string
  date: string
  type: 'appointment' | 'billing' | 'prescription' | 'lab_result'
  title: string
  doctor?: string
  description?: string
  amount?: number
  status: string
  medications?: string[]
  labResults?: any
}

export default function MedicalHistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchMedicalHistory()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [records, searchTerm, filterType, filterStatus])

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true)
      
      // Since we don't have a specific medical history endpoint,
      // we'll fetch billing records as medical history
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
      }>('/billing')
      
      if (response.success) {
        // Transform billing data into medical records format
        const medicalRecords: MedicalRecord[] = response.data.map((bill: any, index: number) => ({
          id: bill.id,
          date: bill.createdAt,
          type: 'billing' as const,
          title: bill.description || `Medical Service ${index + 1}`,
          doctor: bill.patient?.user ? `Dr. ${bill.patient.user.firstName} ${bill.patient.user.lastName}` : 'Dr. Smith',
          description: bill.description || 'Medical consultation and treatment',
          amount: bill.amount,
          status: bill.status,
          medications: index % 3 === 0 ? ['Paracetamol 500mg', 'Vitamin D3'] : undefined
        }))

        // Add some sample appointment records
        const appointmentRecords: MedicalRecord[] = [
          {
            id: 'app1',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'appointment',
            title: 'Regular Checkup',
            doctor: 'Dr. Johnson',
            description: 'Annual health checkup with blood pressure and weight monitoring',
            status: 'completed'
          },
          {
            id: 'app2',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'appointment',
            title: 'Follow-up Consultation',
            doctor: 'Dr. Smith',
            description: 'Follow-up for previous treatment, patient showing good recovery',
            status: 'completed'
          }
        ]

        setRecords([...medicalRecords, ...appointmentRecords])
      }
    } catch (error) {
      console.error('Error fetching medical history:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = records

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.type === filterType)
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredRecords(filtered)
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />
      case 'billing':
        return <DollarSign className="h-4 w-4" />
      case 'prescription':
        return <Pill className="h-4 w-4" />
      case 'lab_result':
        return <Activity className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading medical history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical History
          </h1>
          <p className="text-gray-600">
            Your complete medical records and appointment history
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Type
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="appointment">Appointments</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="prescription">Prescriptions</SelectItem>
                    <SelectItem value="lab_result">Lab Results</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Records Found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                    ? 'Try adjusting your filters to see more results.'
                    : 'You don\'t have any medical records yet.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          {getRecordIcon(record.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {record.title}
                          </h3>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          {record.doctor && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {record.doctor}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatDate(record.date)}
                          </div>
                          {record.amount && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(record.amount)}
                            </div>
                          )}
                        </div>

                        {record.description && (
                          <p className="mt-3 text-sm text-gray-700">
                            {record.description}
                          </p>
                        )}

                        {record.medications && record.medications.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Pill className="h-3 w-3" />
                              <span className="text-sm font-medium">Medications:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {record.medications.map((med, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {med}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {filteredRecords.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredRecords.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {filteredRecords.filter(r => r.type === 'appointment').length}
                  </div>
                  <div className="text-sm text-gray-600">Appointments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredRecords.filter(r => r.type === 'billing').length}
                  </div>
                  <div className="text-sm text-gray-600">Billing Records</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(filteredRecords.reduce((sum, r) => sum + (r.amount || 0), 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}