// Unified dashboard data source: tries real backend first, falls back to mock data.
// Toggle mock forcing via NEXT_PUBLIC_USE_MOCK_DASHBOARD=true

import { apiClient } from './api-client';
import {
  fetchAdminDashboard,
  fetchDoctorDashboard,
  fetchPatientDashboard,
  fetchReceptionistDashboard
} from './dashboardData';

const FORCE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DASHBOARD === 'true';

export interface AdminUnifiedData {
  stats: {
    totalPatients: number;
    totalDoctors: number;
    todayAppointments: number;
    pendingBills: number;
    monthlyRevenue: number;
    overdueBills: number;
    systemAlerts: number;
    revenueGrowth?: number;
    patientGrowth?: number;
    appointmentGrowth?: number;
    systemHealth?: number;
  };
  alerts: { id: string; type: 'error' | 'warning' | 'info'; message: string; timestamp?: string }[];
  activity?: { id: string; user: string; action: string; resource: string; timestamp: string; status: string }[];
}

export async function getAdminDashboardData(): Promise<AdminUnifiedData> {
  if (!FORCE_MOCK) {
    try {
      const resp = await apiClient.getDashboardStats();
      const payload = resp.data || resp;
      const s = payload.stats || {};
      return {
        stats: {
          totalPatients: s.totalPatients || 0,
            totalDoctors: s.totalDoctors || 0,
            todayAppointments: s.todaysAppointments || s.todayAppointments || 0,
            pendingBills: s.pendingBills || 0,
            monthlyRevenue: s.monthlyRevenue || 0,
            overdueBills: s.overdueBills || 0,
            systemAlerts: (payload.alerts?.length) || 0,
            revenueGrowth: undefined,
            patientGrowth: undefined,
            appointmentGrowth: undefined,
            systemHealth: undefined
        },
        alerts: (payload.alerts || []).map((a: any, i: number) => ({
          id: a.id || String(i + 1),
          type: a.type || 'info',
          message: a.message,
          timestamp: new Date().toISOString()
        }))
      };
    } catch (e) {
      console.warn('[Dashboard] Real admin fetch failed, falling back to mock:', e);
    }
  }
  // Mock fallback
  const mock = await fetchAdminDashboard();
  return {
    stats: {
      totalPatients: mock.stats.totalPatients,
      totalDoctors: mock.stats.totalDoctors,
      todayAppointments: mock.stats.todayAppointments,
      pendingBills: mock.stats.pendingBills,
      monthlyRevenue: mock.stats.monthlyRevenue,
      overdueBills: mock.stats.overdueBills,
      systemAlerts: mock.stats.systemAlerts,
      revenueGrowth: mock.stats.revenueTrend,
      patientGrowth: mock.stats.patientGrowth,
      appointmentGrowth: mock.stats.appointmentGrowth,
      systemHealth: mock.stats.systemHealth
    },
    alerts: mock.alerts,
    activity: mock.activity
  };
}

export async function getDoctorDashboardData() {
  if (!FORCE_MOCK) {
    try {
      const resp = await apiClient.getDashboardStats();
      const s = resp.data?.stats || {};
      return {
        stats: {
          totalPatients: s.totalPatients || 0,
          todayAppointments: s.todaysAppointments || s.todayAppointments || 0,
          pendingBills: s.pendingBills || 0,
          monthlyRevenue: s.monthlyRevenue || 0
        }
      };
    } catch (e) {
      console.warn('[Dashboard] Real doctor fetch failed, using mock:', e);
    }
  }
  return fetchDoctorDashboard();
}

export async function getPatientDashboardData(userId: string) {
  if (!FORCE_MOCK) {
    try {
      const resp = await apiClient.getDashboardStats();
      const s = resp.data?.stats || {};
      return {
        stats: {
          upcomingAppointments: s.todaysAppointments || s.todayAppointments || 0,
          totalBills: s.pendingBills || 0,
          overdueBills: s.overdueBills || 0,
          lastVisit: new Date().toISOString()
        },
        appointments: [],
        bills: []
      };
    } catch (e) {
      console.warn('[Dashboard] Real patient fetch failed, using mock:', e);
    }
  }
  return fetchPatientDashboard(userId);
}

export async function getReceptionistDashboardData() {
  if (!FORCE_MOCK) {
    try {
      const resp = await apiClient.getDashboardStats();
      const s = resp.data?.stats || {};
      return {
        stats: {
          todaysAppointments: s.todaysAppointments || s.todayAppointments || 0,
          pendingCheckins: s.pendingBills || 0,
          registrationsToday: 0,
          missedAppointments: 0,
          avgWaitMinutes: 0,
          trend: 0
        },
        queue: []
      };
    } catch (e) {
      console.warn('[Dashboard] Real receptionist fetch failed, using mock:', e);
    }
  }
  return fetchReceptionistDashboard();
}
