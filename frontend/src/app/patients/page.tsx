'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash,
  Calendar,
  FileText,
  Phone,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';


interface Patient {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  appointments: any[];
  billings: any[];
  createdAt: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAuthToken(token);
  }, [router]);

  useEffect(() => {
    if (authToken) {
      fetchPatients();
    }
  }, [authToken]);

  useEffect(() => {
    if (!Array.isArray(patients)) {
      setFilteredPatients([]);
      return;
    }
    
    const filtered = patients.filter(patient => {
      if (!patient?.user) return false;
      
      const fullName = `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.toLowerCase();
      const email = (patient.user.email || '').toLowerCase();
      const phone = (patient.phone || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || email.includes(search) || phone.includes(search);
    });
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    if (!authToken) {
      setError('Authentication token not found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getPatients({
        page: 1,
        limit: 50, // Get more patients for now
        search: searchTerm || undefined
      });
      console.log('API Response:', response);
      
      let patientsData: Patient[] = [];
      
      if (response?.success && response.data) {
        // Handle different response structures
        if ('patients' in response.data && Array.isArray(response.data.patients)) {
          patientsData = response.data.patients;
        } else if (Array.isArray(response.data)) {
          patientsData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          // Single object response, wrap in array
          patientsData = [response.data];
        }
      }
      
      setPatients(patientsData);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      const errorMessage = error?.message || 'Failed to fetch patients';
      setError(errorMessage);
      toast.error(errorMessage);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    if (!authToken) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      await apiClient.deletePatient(id);
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete patient');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case 'MALE': return 'bg-blue-100 text-blue-800';
      case 'FEMALE': return 'bg-pink-100 text-pink-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-red-600">{error}</p>
            <Button onClick={() => fetchPatients()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8" />
            Patients
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage patient records and information
          </p>
        </div>
        <Link href="/patients/register">
          <Button className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Register Patient</span>
            <span className="sm:hidden">Register</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{Array.isArray(patients) ? patients.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {Array.isArray(patients) ? patients.filter(p => {
                if (!p?.createdAt) return false;
                const patientDate = new Date(p.createdAt);
                const now = new Date();
                return patientDate.getMonth() === now.getMonth() && 
                       patientDate.getFullYear() === now.getFullYear();
              }).length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {Array.isArray(patients) ? patients.reduce((sum, p) => sum + (p?.appointments?.length || 0), 0) : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {Array.isArray(patients) ? patients.reduce((sum, p) => sum + (p?.billings?.length || 0), 0) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>
            Search and manage patient records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Patients Table */}
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Patient</TableHead>
                    <TableHead className="min-w-[200px] hidden sm:table-cell">Contact</TableHead>
                    <TableHead className="min-w-[100px]">Gender</TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">Date of Birth</TableHead>
                    <TableHead className="min-w-[150px] hidden lg:table-cell">Emergency Contact</TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">Appointments</TableHead>
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
                        </div>
                        {!searchTerm && (
                          <Link href="/patients/register" className="mt-2 inline-block">
                            <Button size="sm">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Register First Patient
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-muted/50">
                        <TableCell className="min-w-[200px]">
                          <div className="space-y-1">
                            <div className="font-medium text-sm sm:text-base">
                              {patient.user.firstName} {patient.user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {patient.id.slice(0, 8)}...
                            </div>
                            {/* Mobile-only contact info */}
                            <div className="sm:hidden space-y-1">
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{patient.user.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[200px] hidden sm:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{patient.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              {patient.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getGenderBadgeColor(patient.gender)} text-xs`}>
                            {patient.gender}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">
                            {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-xs sm:text-sm">
                            <div className="font-medium">{patient.emergencyContact?.name || 'N/A'}</div>
                            <div className="text-muted-foreground">
                              {patient.emergencyContact?.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {patient.appointments?.length || 0} appointments
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/patients/${patient.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/patients/${patient.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Patient
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeletePatient(patient.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Patient
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}