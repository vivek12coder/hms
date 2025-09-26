'use client';

import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import { useHospitalAuth } from '@/lib/auth';

export default function RoleDashboard() {
  const { user } = useHospitalAuth();
  const role = (user?.role || '').toUpperCase();

  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'PATIENT':
      return <PatientDashboard />;
    case 'RECEPTIONIST':
      return <ReceptionistDashboard />;
    default:
      return <AdminDashboard />; // fallback
  }
}