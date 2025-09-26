'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Users,
  UserPlus,
  ClipboardList,
  Clock,
  PhoneCall,
  Activity,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { useHospitalAuth } from '@/lib/auth';
import StatCard from './common/StatCard';
import { getReceptionistDashboardData } from '@/lib/dashboardDataSource';
import { toast } from 'sonner';

interface ReceptionistStats {
  todaysAppointments: number;
  pendingCheckins: number;
  registrationsToday: number;
  missedAppointments: number;
  avgWaitMinutes?: number;
  trend?: number; // positive/negative % for wait time improvement
}

interface CheckinItem {
  id: string;
  patient: string;
  time: string;
  status: 'waiting' | 'in-progress' | 'completed';
  reason: string;
}

export default function ReceptionistDashboard() {
  const { user, token } = useHospitalAuth();
  const [stats, setStats] = useState<ReceptionistStats | null>(null);
  const [queue, setQueue] = useState<CheckinItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) loadData();
  }, [user, token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data: any = await getReceptionistDashboardData();
      
      // Ensure we have proper data structure
      if (data && data.stats) {
        setStats(data.stats);
        setQueue(data.queue || []);
      } else {
        console.warn('Invalid response format from dashboard data source');
        toast.error('Invalid dashboard data format');
      }
    } catch (e) {
      console.error('Error loading receptionist dashboard:', e);
      toast.error('Failed to load receptionist dashboard');
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

  // Trend badge replaced by shared TrendBadge inside StatCard when needed

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Front Desk Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time patient flow & scheduling</p>
        </header>

        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Today's Appointments" value={stats?.todaysAppointments ?? 0} subtitle={<span>Scheduled sessions</span>} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Pending Check-ins" value={stats?.pendingCheckins ?? 0} subtitle={<span>Waiting in lobby</span>} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Today's Registrations" value={stats?.registrationsToday ?? 0} subtitle={<span>New patient accounts</span>} icon={<UserPlus className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Missed Appointments" value={stats?.missedAppointments ?? 0} subtitle={<span>Follow-up required</span>} icon={<PhoneCall className="h-4 w-4 text-muted-foreground" />} />
        </div>

        {/* Queue & Wait Time */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Check-in Queue</CardTitle>
              <CardDescription>Patients waiting for processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {queue.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-3 bg-muted/30">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.patient}</p>
                    <p className="text-[11px] text-muted-foreground">{item.reason} • {item.time}</p>
                  </div>
                  <Badge variant={item.status === 'waiting' ? 'secondary' : item.status === 'in-progress' ? 'default' : 'outline'} className="text-[10px] px-2 py-0.5 uppercase tracking-wide">{item.status}</Badge>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full"><Search className="h-4 w-4 mr-2" /> Find Patient</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Average Wait Time</CardTitle>
              <CardDescription>Operational efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold">{stats?.avgWaitMinutes ?? 0}m</span>
              </div>
              <p className="text-sm text-muted-foreground">Target &lt; 15 minutes. Improved by {stats?.trend}% this week.</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">Peak</p>
                  <p className="text-sm font-medium">22m</p>
                </div>
                <div className="rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">Median</p>
                  <p className="text-sm font-medium">11m</p>
                </div>
                <div className="rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">Lowest</p>
                  <p className="text-sm font-medium">4m</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">View Detailed Metrics</Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="secondary" className="h-20 flex flex-col gap-2 items-center justify-center">
              <UserPlus className="h-5 w-5" />
              <span className="text-xs">Register Patient</span>
            </Button>
            <Button variant="secondary" className="h-20 flex flex-col gap-2 items-center justify-center">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Schedule Visit</span>
            </Button>
            <Button variant="secondary" className="h-20 flex flex-col gap-2 items-center justify-center">
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs">Check-in Patient</span>
            </Button>
            <Button variant="secondary" className="h-20 flex flex-col gap-2 items-center justify-center">
              <Activity className="h-5 w-5" />
              <span className="text-xs">Live Status</span>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}