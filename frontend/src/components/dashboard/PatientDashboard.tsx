'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, Heart, Activity } from 'lucide-react';
import { useHospitalAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/currency';
import { useState, useEffect } from 'react';
import StatCard from './common/StatCard';
import { getPatientDashboardData } from '@/lib/dashboardDataSource';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PatientStats {
  upcomingAppointments: number;
  totalBills: number;
  overdueBills: number;
  lastVisit?: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: string;
}

interface Bill {
  id: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export default function PatientDashboard() {
  const { user, token } = useHospitalAuth();
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user) {
      loadDashboardData();
    }
  }, [token, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
  const data: any = await getPatientDashboardData(user.id);
  setStats(data.stats);
  setAppointments(data.appointments || []);
  setBills(data.bills || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load patient dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fdfcfb,#e2d1c3)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-600">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Here's an overview of your health information and appointments.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard compact title="Upcoming Appts" value={stats?.upcomingAppointments || 0} subtitle={<span>Next 30 days</span>} icon={<Calendar className="h-3.5 w-3.5 text-blue-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Pending Bills" value={stats?.totalBills || 0} subtitle={<span>Need attention</span>} icon={<FileText className="h-3.5 w-3.5 text-orange-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Overdue Bills" value={<span className="text-red-600">{stats?.overdueBills || 0}</span>} subtitle={<span>Past due date</span>} icon={<Activity className="h-3.5 w-3.5 text-red-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Health Score" value={<span className="text-green-600">Good</span>} subtitle={<span>Recent visits</span>} icon={<Heart className="h-3.5 w-3.5 text-green-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Last Visit" value={stats?.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : 'N/A'} subtitle={<span>Most recent</span>} icon={<Clock className="h-3.5 w-3.5 text-purple-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Status" value={<span className="text-blue-600">Active</span>} subtitle={<span>Account</span>} icon={<Activity className="h-3.5 w-3.5 text-indigo-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
        </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Upcoming Appointments */}
          <Card className="bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur rounded-lg border border-white/50">
                      <div>
                        <p className="font-medium">{appointment.doctorName}</p>
                        <p className="text-sm text-gray-600">{appointment.specialization}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                  <Button className="w-full mt-4" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book New Appointment
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming appointments</p>
                  <Button className="mt-4" size="sm">
                    Schedule Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bills */}
          <Card className="bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Recent Bills
              </CardTitle>
              <CardDescription>Your billing statements</CardDescription>
            </CardHeader>
            <CardContent>
              {bills.length > 0 ? (
                <div className="space-y-4">
                  {bills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur rounded-lg border border-white/50">
                      <div>
                        <p className="font-medium">{formatCurrency(bill.amount)}</p>
                        <p className="text-sm text-gray-600">{bill.description}</p>
                        <p className="text-sm text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                      </div>
                      <Badge 
                        variant={
                          bill.status === 'PAID' ? 'default' : 
                          bill.status === 'OVERDUE' ? 'destructive' : 'secondary'
                        }
                      >
                        {bill.status}
                      </Badge>
                    </div>
                  ))}
                  <Button className="w-full mt-4" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View All Bills
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent bills</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
  <Card className="mt-8 bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/appointments/book">
                <Button variant="outline" className="h-16 flex-col gap-2 w-full hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Book Appointment
                </Button>
              </Link>
              <Link href="/medical-history">
                <Button variant="outline" className="h-16 flex-col gap-2 w-full hover:bg-green-50 hover:border-green-200 transition-colors">
                  <FileText className="h-5 w-5 text-green-600" />
                  View Medical History
                </Button>
              </Link>
              <Link href="/prescriptions/refills">
                <Button variant="outline" className="h-16 flex-col gap-2 w-full hover:bg-purple-50 hover:border-purple-200 transition-colors">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Prescription Refills
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}