'use client';

import { useState, useEffect } from 'react';
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
import apiClient from '@/lib/api-client';
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
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient => {
      const fullName = `${patient.user.firstName} ${patient.user.lastName}`.toLowerCase();
      const email = patient.user.email.toLowerCase();
      const phone = patient.phone.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || email.includes(search) || phone.includes(search);
    });
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await apiClient.getPatients(token || undefined);
      setPatients(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      await apiClient.deletePatient(id, token);
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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Patients
          </h1>
          <p className="text-muted-foreground">
            Manage patient records and information
          </p>
        </div>
        <Link href="/patients/register">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Register Patient
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => {
                const patientDate = new Date(p.createdAt);
                const now = new Date();
                return patientDate.getMonth() === now.getMonth() && 
                       patientDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.reduce((sum, p) => sum + p.appointments.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.reduce((sum, p) => sum + p.billings.length, 0)}
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Emergency Contact</TableHead>
                  <TableHead>Appointments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="font-medium">
                          {patient.user.firstName} {patient.user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {patient.id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {patient.user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getGenderBadgeColor(patient.gender)}>
                          {patient.gender}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{patient.emergencyContact?.name || 'N/A'}</div>
                          <div className="text-muted-foreground">
                            {patient.emergencyContact?.phone || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {patient.appointments.length} appointments
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
                              className="text-red-600"
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
        </CardContent>
      </Card>
    </div>
  );
}