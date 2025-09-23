import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  // Mock data - this would come from your API
  const stats = {
    totalPatients: 1247,
    todayAppointments: 23,
    pendingBills: 45,
    revenue: 125000,
  };

  const recentAppointments = [
    {
      id: '1',
      patientName: 'John Smith',
      doctorName: 'Dr. Johnson',
      time: '09:00',
      status: 'scheduled' as const,
    },
    {
      id: '2',
      patientName: 'Sarah Wilson',
      doctorName: 'Dr. Brown',
      time: '10:30',
      status: 'completed' as const,
    },
    {
      id: '3',
      patientName: 'Mike Davis',
      doctorName: 'Dr. Smith',
      time: '14:00',
      status: 'scheduled' as const,
    },
  ];

  const alerts = [
    {
      id: '1',
      message: 'Dr. Johnson has cancelled their 3 PM appointment',
      type: 'warning' as const,
    },
    {
      id: '2',
      message: '5 patients have overdue bills',
      type: 'error' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here&apos;s what&apos;s happening at your hospital today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">3 more than yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBills}</div>
            <p className="text-xs text-muted-foreground">-8% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Today&apos;s Appointments</span>
            </CardTitle>
            <CardDescription>Recent and upcoming appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between border-b pb-2 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">with {appointment.doctorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appointment.time}</p>
                    <Badge 
                      variant={appointment.status === 'completed' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Alerts & Notifications</span>
            </CardTitle>
            <CardDescription>Important updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-3 rounded-lg p-3 ${
                    alert.type === 'error' 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <AlertCircle 
                    className={`h-5 w-5 mt-0.5 ${
                      alert.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                    }`} 
                  />
                  <p className={`text-sm ${
                    alert.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
              <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900">Register New Patient</p>
            </div>
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
              <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900">Book Appointment</p>
            </div>
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
              <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900">Generate Invoice</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}