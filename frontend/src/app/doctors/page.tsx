'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from "@/components/auth/AuthComponents";
import { USER_ROLES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Stethoscope,
  Calendar,
  Award,
  Clock
} from 'lucide-react';

interface Doctor {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  specialization: string;
  licenseNumber: string;
  phone?: string;
  consultationFee?: number;
  availableFrom?: string;
  availableTo?: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/doctors?limit=100') as any;
      // API returns { doctors: [...], pagination: {...} }
      setDoctors(response.data?.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      doctor.specialization.toLowerCase().includes(searchLower) ||
      doctor.user.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
              <p className="text-gray-600 mt-1">
                View and manage doctor profiles and schedules
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Doctor
            </Button>
          </div>

          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, specialization, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{doctors.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {new Set(doctors.map(d => d.specialization)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{doctors.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Doctors List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-500" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No doctors found matching your search' : 'No doctors registered yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Dr. {doctor.user.firstName} {doctor.user.lastName}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {doctor.specialization}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{doctor.user.email}</span>
                    </div>
                    
                    {doctor.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                    
                    {doctor.licenseNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="h-4 w-4" />
                        <span>License: {doctor.licenseNumber}</span>
                      </div>
                    )}
                    
                    {doctor.consultationFee && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-semibold text-green-600">
                          ₹{doctor.consultationFee.toFixed(2)} / consultation
                        </span>
                      </div>
                    )}
                    
                    {doctor.availableFrom && doctor.availableTo && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{doctor.availableFrom} - {doctor.availableTo}</span>
                      </div>
                    )}
                    
                    <div className="pt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}