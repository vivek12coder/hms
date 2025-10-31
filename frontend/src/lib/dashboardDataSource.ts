// Unified dashboard data source: fetches real-time data from backend API

import { apiClient } from './api-client';

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
  try {
    const resp = await apiClient.getDashboardStats();
    const payload = resp.data || resp;
    const s = payload?.stats || {};
    
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
      alerts: (payload.alerts || []).map((a: {id?: string; type?: 'error' | 'warning' | 'info'; message: string}, i: number) => ({
        id: a.id || String(i + 1),
        type: a.type || 'info',
        message: a.message,
        timestamp: new Date().toISOString()
      })),
      activity: []
    };
  } catch (error) {
    console.error('[Dashboard] Failed to fetch admin dashboard data:', error);
    throw new Error('Unable to load dashboard data. Please check your connection and try again.');
  }
}

export async function getDoctorDashboardData() {
  try {
    const resp = await apiClient.getDashboardStats();
    const s = resp?.data?.stats || {};
    return {
      stats: {
        totalPatients: s.totalPatients || 0,
        todayAppointments: s.todaysAppointments || s.todayAppointments || 0,
        pendingBills: s.pendingBills || 0,
        monthlyRevenue: s.monthlyRevenue || 0
      }
    };
  } catch (error) {
    console.error('[Dashboard] Failed to fetch doctor dashboard data:', error);
    throw new Error('Unable to load dashboard data. Please check your connection and try again.');
  }
}

export async function getPatientDashboardData(userId: string) {
  try {
    const resp = await apiClient.getDashboardStats();
    const s = resp?.data?.stats || {};
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
  } catch (error) {
    console.error('[Dashboard] Failed to fetch patient dashboard data:', error);
    throw new Error('Unable to load dashboard data. Please check your connection and try again.');
  }
}

export async function getReceptionistDashboardData() {
  try {
    const resp = await apiClient.getDashboardStats();
    const s = resp?.data?.stats || {};
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
  } catch (error) {
    console.error('[Dashboard] Failed to fetch receptionist dashboard data:', error);
    throw new Error('Unable to load dashboard data. Please check your connection and try again.');
  }
}
