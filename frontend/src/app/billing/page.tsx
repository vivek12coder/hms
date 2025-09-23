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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  CreditCard, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import Link from 'next/link';

interface Billing {
  id: string;
  patient: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    phone: string;
  };
  amount: number;
  description: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  appointment?: {
    id: string;
    scheduledAt: string;
    reason: string;
  };
}

export default function BillingPage() {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredBillings, setFilteredBillings] = useState<Billing[]>([]);

  useEffect(() => {
    fetchBillings();
  }, []);

  useEffect(() => {
    const filtered = billings.filter(billing => {
      const patientName = `${billing.patient.user.firstName} ${billing.patient.user.lastName}`.toLowerCase();
      const email = billing.patient.user.email.toLowerCase();
      const description = billing.description.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = patientName.includes(search) || email.includes(search) || description.includes(search);
      const matchesStatus = statusFilter === 'all' || billing.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort by due date (overdue first, then by due date)
    filtered.sort((a, b) => {
      const aOverdue = new Date(a.dueDate) < new Date() && a.status !== 'PAID';
      const bOverdue = new Date(b.dueDate) < new Date() && b.status !== 'PAID';
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    setFilteredBillings(filtered);
  }, [billings, searchTerm, statusFilter]);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBillings();
      setBillings(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch billings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBilling = async (id: string) => {
    if (!confirm('Are you sure you want to delete this billing record?')) return;

    try {
      await apiClient.deleteBilling(id);
      toast.success('Billing deleted successfully');
      fetchBillings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete billing');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeColor = (status: string, dueDate: string) => {
    if (status === 'OVERDUE' || (status === 'PENDING' && new Date(dueDate) < new Date())) {
      return 'bg-red-100 text-red-800';
    }
    
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'OVERDUE': return <XCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTotalRevenue = () => {
    return billings
      .filter(b => b.status === 'PAID')
      .reduce((sum, b) => sum + b.amount, 0);
  };

  const getPendingAmount = () => {
    return billings
      .filter(b => b.status === 'PENDING')
      .reduce((sum, b) => sum + b.amount, 0);
  };

  const getOverdueAmount = () => {
    return billings
      .filter(b => b.status === 'PENDING' && new Date(b.dueDate) < new Date())
      .reduce((sum, b) => sum + b.amount, 0);
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
            <CreditCard className="h-8 w-8" />
            Billing & Payments
          </h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, and billing records
          </p>
        </div>
        <Link href="/billing/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalRevenue())}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(getPendingAmount())}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(getOverdueAmount())}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Billing Records</CardTitle>
          <CardDescription>
            Manage all billing and payment records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by patient name, email, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Billing Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBillings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No billing records found matching your criteria.' 
                          : 'No billing records created yet.'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBillings.map((billing) => {
                    const isOverdue = new Date(billing.dueDate) < new Date() && billing.status === 'PENDING';
                    const displayStatus = isOverdue ? 'OVERDUE' : billing.status;
                    
                    return (
                      <TableRow key={billing.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {billing.patient.user.firstName} {billing.patient.user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {billing.patient.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{billing.description}</div>
                            <div className="text-sm text-muted-foreground">
                              Created: {formatDate(billing.createdAt)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-lg">
                            {formatCurrency(billing.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {formatDate(billing.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeColor(displayStatus, billing.dueDate)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(displayStatus)}
                            {displayStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {billing.appointment ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(billing.appointment.scheduledAt)}
                              </div>
                              <div className="text-muted-foreground truncate max-w-xs">
                                {billing.appointment.reason}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No appointment</span>
                          )}
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
                                <Link href={`/billing/${billing.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Invoice
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/billing/${billing.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Billing
                                </Link>
                              </DropdownMenuItem>
                              {billing.status === 'PENDING' && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/billing/${billing.id}/payment`}>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Mark as Paid
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteBilling(billing.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}