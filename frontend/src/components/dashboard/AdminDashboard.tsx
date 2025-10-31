'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle,
  Settings,
  Shield,
  Database,
  BarChart3
} from 'lucide-react';
import StatCard from './common/StatCard';
import DetailDialog from './common/DetailDialog';
import { useHospitalAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/currency';
import { getAdminDashboardData } from '@/lib/dashboardDataSource';

interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingBills: number;
  monthlyRevenue: number;
  overdueBills: number;
  systemAlerts: number;
  revenueGrowth: number;
  patientGrowth: number;
  appointmentGrowth: number;
  systemHealth: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: string;
}

export default function AdminDashboard() {
  const { user, token } = useHospitalAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    description: string;
    content: React.ReactNode;
  } | null>(null);

  useEffect(() => {
    if (user && token) {
      loadDashboardData();
    }
  }, [user, token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardData();
      setStats(data.stats as any);
      setAlerts(data.alerts as any);
      if (data.activity) setRecentActivity(data.activity as any);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // System Management Click Handlers
  const handleManageUsers = () => router.push('/admin/users');
  const handleSystemSettings = () => router.push('/settings');
  const handleDatabaseBackup = () => toast.info('Database backup functionality coming soon');
  const handleAnalytics = () => toast.info('Advanced analytics dashboard coming soon');

  // Quick Reports Click Handlers
  const handlePatientReports = () => toast.info('Patient reports feature coming soon');
  const handleFinancialReports = () => router.push('/billing');
  const handleSecurityAudit = () => toast.info('Security audit reports coming soon');

  // Card Detail Handlers
  const showPatientDetails = () => {
    setDialogContent({
      title: 'Total Patients',
      description: 'Detailed information about registered patients in the system',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Total Patients</div>
              <div className="text-2xl font-bold text-blue-600">{stats?.totalPatients || 0}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Growth Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.patientGrowth ? `${stats.patientGrowth > 0 ? '+' : ''}${stats.patientGrowth}%` : 'N/A'}
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Patient Statistics</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• All patients are registered in the system</li>
              <li>• Each patient has a unique medical record</li>
              <li>• Patient data includes medical history and contact information</li>
            </ul>
          </div>
          <Button onClick={() => router.push('/patients')} className="w-full">
            View All Patients
          </Button>
        </div>
      )
    });
    setDialogOpen(true);
  };

  const showDoctorDetails = () => {
    setDialogContent({
      title: 'Active Doctors',
      description: 'Medical staff currently registered in the system',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Active Doctors</div>
              <div className="text-2xl font-bold text-green-600">{stats?.totalDoctors || 0}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Specializations</div>
              <div className="text-2xl font-bold text-purple-600">Multiple</div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Doctor Information</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Licensed medical professionals</li>
              <li>• Various specializations available</li>
              <li>• Active consultation and treatment services</li>
            </ul>
          </div>
          <Button onClick={() => router.push('/doctors')} className="w-full">
            View All Doctors
          </Button>
        </div>
      )
    });
    setDialogOpen(true);
  };

  const showAppointmentDetails = () => {
    setDialogContent({
      title: "Today's Appointments",
      description: 'Scheduled appointments for today',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Scheduled Today</div>
              <div className="text-2xl font-bold text-purple-600">{stats?.todayAppointments || 0}</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Growth</div>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.appointmentGrowth ? `${stats.appointmentGrowth > 0 ? '+' : ''}${stats.appointmentGrowth}%` : 'N/A'}
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Appointment Status</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Appointments scheduled throughout the day</li>
              <li>• Each appointment assigned to specific doctors</li>
              <li>• Real-time appointment tracking available</li>
            </ul>
          </div>
          <Button onClick={() => router.push('/appointments')} className="w-full">
            View All Appointments
          </Button>
        </div>
      )
    });
    setDialogOpen(true);
  };

  const showRevenueDetails = () => {
    setDialogContent({
      title: 'Monthly Revenue',
      description: 'Financial overview for the current month',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Growth</div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.revenueGrowth ? `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%` : 'N/A'}
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Revenue Breakdown</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Revenue from paid bills</li>
              <li>• Pending bills: {stats?.pendingBills || 0}</li>
              <li>• Overdue bills: {stats?.overdueBills || 0}</li>
            </ul>
          </div>
          <Button onClick={() => router.push('/billing')} className="w-full">
            View Billing Details
          </Button>
        </div>
      )
    });
    setDialogOpen(true);
  };

  const showSystemHealthDetails = () => {
    setDialogContent({
      title: 'System Health',
      description: 'Overall system performance and status',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-teal-50 rounded-lg">
              <div className="text-sm text-gray-600">Performance</div>
              <div className="text-2xl font-bold text-teal-600">{stats?.systemHealth || 0}%</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-2xl font-bold text-green-600">Operational</div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">System Status</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Database connectivity: OK</li>
              <li>✓ API services: Running</li>
              <li>✓ Authentication: Active</li>
            </ul>
          </div>
          <Button onClick={() => router.push('/settings')} className="w-full">
            System Settings
          </Button>
        </div>
      )
    });
    setDialogOpen(true);
  };

  const showAlertsDetails = () => {
    setDialogContent({
      title: 'System Alerts',
      description: 'Important notifications requiring attention',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Alerts</div>
            <div className="text-2xl font-bold text-indigo-600">{stats?.systemAlerts || 0}</div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Recent Alerts</h4>
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg ${
                    alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                    alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`h-4 w-4 ${
                        alert.type === 'error' ? 'text-red-600' :
                        alert.type === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <span className="text-sm">{alert.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No alerts at this time</p>
            )}
          </div>
        </div>
      )
    });
    setDialogOpen(true);
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
            System Administration
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Complete overview and control of the hospital management system.
          </p>
        </div>

        {/* Quick Stats Cards (compact via StatCard) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            compact
            title="Total Patients"
            value={stats?.totalPatients || 0}
            trend={stats?.patientGrowth}
            subtitle={<span>Patients</span>}
            icon={<Users className="h-3.5 w-3.5 text-blue-500" />}
            className="bg-white/70 backdrop-blur border border-white/60"
            onClick={showPatientDetails}
          />
          <StatCard
            compact
            title="Active Doctors"
            value={stats?.totalDoctors || 0}
            subtitle={<span>Medical staff</span>}
            icon={<UserPlus className="h-3.5 w-3.5 text-green-500" />}
            className="bg-white/70 backdrop-blur border border-white/60"
            onClick={showDoctorDetails}
          />
          <StatCard
            compact
            title="Today's Appointments"
            value={stats?.todayAppointments || 0}
            trend={stats?.appointmentGrowth}
            subtitle={<span>Scheduled</span>}
            icon={<Calendar className="h-3.5 w-3.5 text-purple-500" />}
            className="bg-white/70 backdrop-blur border border-white/60"
            onClick={showAppointmentDetails}
          />
            <StatCard
            compact
            title="Monthly Revenue"
            value={formatCurrency(stats?.monthlyRevenue || 0)}
            trend={stats?.revenueGrowth}
            subtitle={<span>Current month</span>}
            icon={<DollarSign className="h-3.5 w-3.5 text-orange-500" />}
            className="bg-white/70 backdrop-blur border border-white/60"
            onClick={showRevenueDetails}
          />
          <StatCard
            compact
            title="System Health"
            value={(stats?.systemHealth || 0) + '%'}
            subtitle={<span>Performance</span>}
            icon={<Activity className="h-3.5 w-3.5 text-teal-500" />}
            className="bg-white/70 backdrop-blur border border-white/60"
            onClick={showSystemHealthDetails}
          />
          <StatCard
            compact
            title="System Alerts"
            value={stats?.systemAlerts || 0}
            subtitle={<span>Require review</span>}
            icon={<Shield className="h-3.5 w-3.5 text-indigo-500" />}
            className="bg-white/70 backdrop-blur border border-white/60"
            onClick={showAlertsDetails}
          />
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            compact
            title="Pending Bills"
            value={stats?.pendingBills || 0}
            subtitle={<span>Awaiting payment</span>}
            icon={<FileText className="h-3.5 w-3.5 text-yellow-500" />}
            className="bg-white/70 backdrop-blur border border-white/60"
            onClick={() => router.push('/billing')}
          />
          <StatCard
            compact
            title="Overdue Bills"
            value={<span className="text-red-600">{stats?.overdueBills || 0}</span>}
            subtitle={<span>Need attention</span>}
            icon={<AlertCircle className="h-3.5 w-3.5 text-red-500" />}
            className="bg-white/70 backdrop-blur border border-white/60"
            onClick={() => router.push('/billing')}
          />
          <StatCard
            compact
            title="System Alerts"
            value={stats?.systemAlerts || 0}
            subtitle={<span>Require review</span>}
            icon={<Shield className="h-3.5 w-3.5 text-indigo-500" />}
            className="bg-white/70 backdrop-blur border border-white/60"
            onClick={showAlertsDetails}
          />
        </div>

        {/* System Alerts & Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* System Alerts */}
          <Card className="bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                System Alerts
              </CardTitle>
              <CardDescription>Recent system notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-3 bg-white/60 backdrop-blur rounded-lg border border-white/50 gap-2 sm:gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertCircle
                        className={`h-4 w-4 mt-1 flex-shrink-0 ${
                          alert.type === 'error' ? 'text-red-500' : alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium break-words">{alert.message}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'secondary' : 'default'}
                      className="self-start text-[10px] sm:text-xs"
                    >
                      {alert.type}
                    </Badge>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  View All Alerts
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity (Audit Trail) */}
          <Card className="bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Recent user actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white/60 backdrop-blur rounded-lg border border-white/50 gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{activity.user}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 break-words">
                        {activity.action} {activity.resource}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={activity.status === 'success' ? 'default' : 'destructive'}
                      className="self-start text-[10px] sm:text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  View Audit Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="mt-8 bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>Administrative functions and system controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                onClick={handleManageUsers}
              >
                <Users className="h-4 w-4 sm:h-6 sm:w-6" />
                <span>Manage Users</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                onClick={handleSystemSettings}
              >
                <Settings className="h-4 w-4 sm:h-6 sm:w-6" />
                <span>System Settings</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                onClick={handleDatabaseBackup}
              >
                <Database className="h-4 w-4 sm:h-6 sm:w-6" />
                <span>Database Backup</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                onClick={handleAnalytics}
              >
                <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6" />
                <span>Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <Card className="mt-8 bg-white/70 backdrop-blur border border-white/60 transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Quick Reports
            </CardTitle>
            <CardDescription>Generate commonly used reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="h-14 sm:h-16 flex-col gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                onClick={handlePatientReports}
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Patient Reports
              </Button>
              <Button
                variant="outline"
                className="h-14 sm:h-16 flex-col gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                onClick={handleFinancialReports}
              >
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Financial Reports
              </Button>
              <Button
                variant="outline"
                className="h-14 sm:h-16 flex-col gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                onClick={handleSecurityAudit}
              >
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                Security Audit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      {dialogContent && (
        <DetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogContent.title}
          description={dialogContent.description}
        >
          {dialogContent.content}
        </DetailDialog>
      )}
    </div>
  );
}