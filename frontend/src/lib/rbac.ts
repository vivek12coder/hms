import { HospitalUserData } from '@/lib/auth';
import { USER_ROLES, UserRole } from '@/lib/constants';

export function isAdmin(user: HospitalUserData): boolean {
  return user.role === USER_ROLES.ADMIN;
}

export function isDoctor(user: HospitalUserData): boolean {
  return user.role === USER_ROLES.DOCTOR;
}

export function isPatient(user: HospitalUserData): boolean {
  return user.role === USER_ROLES.PATIENT;
}

export function isDoctorOrAdmin(user: HospitalUserData): boolean {
  return user.role === USER_ROLES.DOCTOR || user.role === USER_ROLES.ADMIN;
}

export function canAccessPatientData(user: HospitalUserData, patientId?: string): boolean {
  // Admin and doctors can access all patient data
  if (isDoctorOrAdmin(user)) {
    return true;
  }
  
  // Patients can only access their own data
  if (isPatient(user) && user.id === patientId) {
    return true;
  }
  
  return false;
}

export function canManageUsers(user: HospitalUserData): boolean {
  return isAdmin(user);
}

export function canManageBilling(user: HospitalUserData): boolean {
  return isDoctorOrAdmin(user);
}

export function canViewReports(user: HospitalUserData): boolean {
  return isDoctorOrAdmin(user);
}

export function canDeleteRecords(user: HospitalUserData): boolean {
  return isAdmin(user);
}

export function getAccessibleRoutes(user: HospitalUserData): string[] {
  const routes = ['/dashboard'];
  
  if (isDoctorOrAdmin(user)) {
    routes.push('/patients', '/doctors', '/billing');
  }
  
  if (isPatient(user)) {
    routes.push('/appointments', '/billing/my-bills');
  }
  
  if (isAdmin(user)) {
    routes.push('/settings', '/users', '/audit-logs');
  }
  
  return routes;
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'Administrator';
    case USER_ROLES.DOCTOR:
      return 'Doctor';
    case USER_ROLES.PATIENT:
      return 'Patient';
    default:
      return 'Unknown';
  }
}

export function getRoleBadgeVariant(role: UserRole): 'destructive' | 'secondary' | 'default' {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'destructive';
    case USER_ROLES.DOCTOR:
      return 'secondary';
    case USER_ROLES.PATIENT:
      return 'default';
    default:
      return 'default';
  }
}