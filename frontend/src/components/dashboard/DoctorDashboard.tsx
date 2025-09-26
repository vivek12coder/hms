'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock,
  UserPlus,
  Activity,
  DollarSign,
  Stethoscope
} from 'lucide-react';
import { useHospitalAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/currency';
import { useState, useEffect } from 'react';
import StatCard from './common/StatCard';
import { getDoctorDashboardData } from '@/lib/dashboardDataSource';
import { toast } from 'sonner';

interface DoctorStats {
  totalPatients: number;
  todayAppointments: number;
  pendingBills: number;
  monthlyRevenue: number;
}

interface RecentPatient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  status: string;
}

interface TodayAppointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

export default function DoctorDashboard() {
  const { user, token } = useHospitalAuth();
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user) {
      loadDashboardData();
    }
  }, [token, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
  const data: any = await getDoctorDashboardData();
  setStats(data.stats);
  setRecentPatients(data.patients || []);
  setTodayAppointments(data.today || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load doctor dashboard');
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
            Good morning, Dr. {user?.lastName}!
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            You have {todayAppointments.length} appointments scheduled for today.
          </p>
        </div>

        {/* Quick Stats Cards via StatCard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard compact title="Total Patients" value={stats?.totalPatients || 0} subtitle={<span>Under your care</span>} icon={<Users className="h-3.5 w-3.5 text-blue-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Today's Appointments" value={stats?.todayAppointments || 0} subtitle={<span>Scheduled today</span>} icon={<Calendar className="h-3.5 w-3.5 text-green-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Pending Bills" value={stats?.pendingBills || 0} subtitle={<span>Awaiting processing</span>} icon={<FileText className="h-3.5 w-3.5 text-orange-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Monthly Revenue" value={formatCurrency(stats?.monthlyRevenue || 0)} subtitle={<span>This month</span>} icon={<DollarSign className="h-3.5 w-3.5 text-purple-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Avg/day" value={Math.round((stats?.todayAppointments || 0)/ (stats?.totalPatients||1))} subtitle={<span>Appt / patient</span>} icon={<TrendingUp className="h-3.5 w-3.5 text-teal-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
          <StatCard compact title="Care Index" value={<span className="text-green-600">Good</span>} subtitle={<span>Quality</span>} icon={<Activity className="h-3.5 w-3.5 text-indigo-500" />} className="bg-white/70 backdrop-blur border border-white/60" />
        </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2 bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Today's Schedule
              </CardTitle>
              <CardDescription>Your appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur rounded-lg border border-white/50">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-100/70 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-600 mb-1" />
                          <span className="text-xs font-medium text-blue-600">
                            {appointment.time}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                      </div>
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Recent Patients
              </CardTitle>
              <CardDescription>Recently seen patients</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPatients.length > 0 ? (
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur rounded-lg border border-white/50">
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">Age: {patient.age}</p>
                        <p className="text-sm text-gray-500">
                          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={patient.status === 'stable' ? 'default' : 'secondary'}
                      >
                        {patient.status}
                      </Badge>
                    </div>
                  ))}
                  <Button className="w-full mt-4" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    View All Patients
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent patients</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
  <Card className="mt-8 bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for patient management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Patient
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Appointment
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <FileText className="h-5 w-5" />
                Create Bill
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Activity className="h-5 w-5" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Specialization Info */}
  <Card className="mt-8 bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-500" />
              Your Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Specialization</p>
                <p className="text-lg font-medium">Cardiology</p> {/* This should come from user.doctor.specialization */}
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="text-lg font-medium">Internal Medicine</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">License Number</p>
                <p className="text-lg font-medium">MD12345</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}