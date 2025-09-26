// Centralized mock data + lightweight fetch wrappers for dashboards.
// Replace these implementations later with real API calls.

export interface AdminDashboardData {
  stats: {
    totalPatients: number;
    totalDoctors: number;
    todayAppointments: number;
    pendingBills: number;
    monthlyRevenue: number;
    overdueBills: number;
    systemAlerts: number;
    revenueTrend: number;
    patientGrowth: number;
    appointmentGrowth?: number;
    systemHealth?: number;
  };
  alerts: { id: string; type: 'error' | 'warning' | 'info'; message: string; timestamp: string }[];
  activity: { id: string; user: string; action: string; resource: string; timestamp: string; status: string }[];
}

export interface DoctorDashboardData {
  stats: {
    totalPatients: number;
    todayAppointments: number;
    pendingBills: number;
    monthlyRevenue: number;
  };
  patients: { id: string; name: string; age: number; lastVisit: string; status: string }[];
  today: { id: string; patientName: string; time: string; type: string; status: string }[];
}

export interface PatientDashboardData {
  stats: {
    upcomingAppointments: number;
    totalBills: number;
    overdueBills: number;
    lastVisit?: string;
  };
  appointments: { id: string; doctorName: string; specialization: string; date: string; time: string; status: string }[];
  bills: { id: string; amount: number; description: string; dueDate: string; status: 'PENDING' | 'PAID' | 'OVERDUE' }[];
}

export interface ReceptionistDashboardData {
  stats: {
    todaysAppointments: number;
    pendingCheckins: number;
    registrationsToday: number;
    missedAppointments: number;
    avgWaitMinutes: number;
    trend: number;
  };
  queue: { id: string; patient: string; time: string; status: 'waiting' | 'in-progress' | 'completed'; reason: string }[];
}

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  await delay(150); // simulate latency
  const now = Date.now();
  return {
    stats: {
      totalPatients: 1280,
      totalDoctors: 54,
      todayAppointments: 112,
      pendingBills: 23,
      monthlyRevenue: 125000,
      overdueBills: 7,
      systemAlerts: 3,
      revenueTrend: 12.5,
      patientGrowth: 8.2,
      appointmentGrowth: 6.1,
      systemHealth: 97
    },
    alerts: [
      { id: '1', type: 'warning', message: 'Database backup completed with warnings', timestamp: new Date(now).toISOString() },
      { id: '2', type: 'info', message: '5 new user registrations pending approval', timestamp: new Date(now - 3600000).toISOString() },
      { id: '3', type: 'error', message: 'Multiple failed login attempts detected', timestamp: new Date(now - 7200000).toISOString() }
    ],
    activity: [
      { id: '1', user: 'Dr. Smith', action: 'CREATE', resource: 'Patient Record', timestamp: new Date(now).toISOString(), status: 'success' },
      { id: '2', user: 'Billing Bot', action: 'UPDATE', resource: 'Invoice #INV-1023', timestamp: new Date(now - 1800000).toISOString(), status: 'success' },
      { id: '3', user: 'Admin', action: 'DELETE', resource: 'Temp File', timestamp: new Date(now - 3600000).toISOString(), status: 'critical' }
    ]
  };
}

export async function fetchDoctorDashboard(): Promise<DoctorDashboardData> {
  await delay(120);
  return {
    stats: { totalPatients: 220, todayAppointments: 14, pendingBills: 5, monthlyRevenue: 42000 },
    patients: [
      { id: '1', name: 'Jane Doe', age: 34, lastVisit: '2025-09-20', status: 'stable' },
      { id: '2', name: 'Michael Johnson', age: 45, lastVisit: '2025-09-18', status: 'needs-follow-up' }
    ],
    today: [
      { id: '1', patientName: 'Sarah Williams', time: '10:00 AM', type: 'Consultation', status: 'confirmed' },
      { id: '2', patientName: 'Robert Brown', time: '2:00 PM', type: 'Follow-up', status: 'pending' }
    ]
  };
}

export async function fetchPatientDashboard(userId: string): Promise<PatientDashboardData> {
  await delay(100);
  return {
    stats: { upcomingAppointments: 1, totalBills: 2, overdueBills: 1, lastVisit: new Date().toISOString() },
    appointments: [
      { id: '1', doctorName: 'Dr. John Smith', specialization: 'Cardiology', date: '2025-09-30', time: '10:00 AM', status: 'confirmed' }
    ],
    bills: [
      { id: '1', amount: 250, description: 'Consultation', dueDate: '2025-10-05', status: 'PENDING' },
      { id: '2', amount: 120, description: 'Lab Tests', dueDate: '2025-10-02', status: 'OVERDUE' }
    ]
  };
}

export async function fetchReceptionistDashboard(): Promise<ReceptionistDashboardData> {
  await delay(130);
  return {
    stats: {
      todaysAppointments: 18,
      pendingCheckins: 4,
      registrationsToday: 7,
      missedAppointments: 1,
      avgWaitMinutes: 12,
      trend: 5
    },
    queue: [
      { id: '1', patient: 'Sarah Miles', time: '09:05', status: 'waiting', reason: 'Consultation' },
      { id: '2', patient: 'Mark Davis', time: '09:10', status: 'waiting', reason: 'Follow-up' },
      { id: '3', patient: 'Emily Carter', time: '09:15', status: 'in-progress', reason: 'Vitals' },
      { id: '4', patient: 'John Reed', time: '08:55', status: 'completed', reason: 'Check-up' }
    ]
  };
}
