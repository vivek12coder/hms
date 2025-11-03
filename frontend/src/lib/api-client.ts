// Type definitions for API responses and parameters
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  retryAfter?: number; // seconds
  rawBody?: unknown;
  constructor(public status: number, message: string, opts: { retryAfter?: number; rawBody?: unknown } = {}) {
    super(message);
    this.name = 'ApiError';
    this.retryAfter = opts.retryAfter;
    this.rawBody = opts.rawBody;
  }
}

// API endpoints for easy reference
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  patients: {
    list: '/patients',
    create: '/patients',
    getById: (id: string) => `/patients/${id}`,
    update: (id: string) => `/patients/${id}`,
    delete: (id: string) => `/patients/${id}`,
  },
  doctors: {
    list: '/doctors',
    create: '/doctors',
    getById: (id: string) => `/doctors/${id}`,
    update: (id: string) => `/doctors/${id}`,
    availability: (id: string) => `/doctors/${id}/availability`,
  },
  appointments: {
    list: '/appointments',
    create: '/appointments',
    getById: (id: string) => `/appointments/${id}`,
    update: (id: string) => `/appointments/${id}`,
    delete: (id: string) => `/appointments/${id}`,
    byPatient: (patientId: string) => `/appointments/patient/${patientId}`,
    byDoctor: (doctorId: string) => `/appointments/doctor/${doctorId}`,
  },
  billing: {
    list: '/billing',
    create: '/billing',
    getById: (id: string) => `/billing/${id}`,
    update: (id: string) => `/billing/${id}`,
    delete: (id: string) => `/billing/${id}`,
    byPatient: (patientId: string) => `/billing/patient/${patientId}`,
  },
  dashboard: {
    stats: '/dashboard/stats',
    patientGrowth: '/dashboard/patient-growth',
    revenue: '/dashboard/revenue',
  },
  prescriptions: {
    list: '/prescriptions',
    create: '/prescriptions',
    getById: (id: string) => `/prescriptions/${id}`,
    update: (id: string) => `/prescriptions/${id}`,
    byPatient: (patientId: string) => `/prescriptions/patient/${patientId}`,
  }
};

type RequestOptions = {
  headers?: Record<string, string>;
  token?: string | null;
};

// API client for making HTTP requests
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Add auth token to headers if available with validation
  private getHeaders(options?: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (options?.token) {
      // Validate token format before using
      if (typeof options.token === 'string' && options.token.trim().length > 0) {
        headers.Authorization = `Bearer ${options.token}`;
      }
    } else if (typeof window !== 'undefined') {
      // Try to get token from localStorage in browser environment with validation
      try {
        const token = localStorage.getItem('authToken');
        if (token && typeof token === 'string' && token.trim().length > 0) {
          // Basic JWT format validation (header.payload.signature)
          if (token.split('.').length === 3) {
            headers.Authorization = `Bearer ${token}`;
          } else {
            console.warn('Invalid token format detected, removing from storage');
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }

    return headers;
  }

  // Handle API responses
  private async handleResponse<T>(response: Response): Promise<T> {
    let data: unknown;
    
    try {
      data = await response.json();
    } catch (error) {
      throw new ApiError(
        response.status,
        'Failed to parse response from server'
      );
    }

    // Handle API error responses
    if (!response.ok) {
      const apiResponse = data as { message?: string };
      const errorMessage = apiResponse?.message || `Error: ${response.status} ${response.statusText}`;
      
      // Handle authentication errors (token expired or invalid)
      if (response.status === 401 && typeof window !== 'undefined') {
        console.warn('Authentication failed - token expired or invalid');
        
        // Clear expired token from storage
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
        } catch (error) {
          console.error('Error clearing auth data:', error);
        }
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/auth/login')) {
          console.log('Redirecting to login page...');
          window.location.href = '/auth/login?expired=true';
        }
      }
      
      // Handle rate limiting
      let retryAfter: number | undefined;
      if (response.status === 429) {
        const headerValue = response.headers.get('Retry-After');
        if (headerValue) {
          retryAfter = parseInt(headerValue, 10);
        }
      }
      
      throw new ApiError(response.status, errorMessage, { 
        retryAfter,
        rawBody: data
      });
    }

    return data as T;
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(options),
      credentials: 'include',
    });
    
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(options),
      credentials: 'include',
    });
    
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    return this.handleResponse<T>(response);
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.post<ApiResponse<{ token: string; user: any }>>(endpoints.auth.login, { email, password });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.post<ApiResponse<{ token: string; user: any }>>(endpoints.auth.register, userData);
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(endpoints.auth.me);
  }

  // Patient methods
  async getPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    gender?: string;
  }): Promise<ApiResponse<{
    patients: any[];
    pagination?: {
      current: number;
      total: number;
      count: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.gender) queryParams.append('gender', params.gender);

    const url = `${endpoints.patients.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.get<ApiResponse<{
      patients: any[];
      pagination?: {
        current: number;
        total: number;
        count: number;
      };
    }>>(url);
  }

  async getPatient(id: string): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(endpoints.patients.getById(id));
  }

  async createPatient(patientData: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: string;
    emergencyContact?: any;
    medicalHistory?: any;
  }): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(endpoints.patients.create, patientData);
  }

  async updatePatient(id: string, patientData: any): Promise<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(endpoints.patients.update(id), patientData);
  }

  async deletePatient(id: string): Promise<ApiResponse<any>> {
    return this.delete<ApiResponse<any>>(endpoints.patients.delete(id));
  }

  // Doctor methods
  async getDoctors(params?: {
    page?: number;
    limit?: number;
    search?: string;
    specialization?: string;
  }): Promise<ApiResponse<{
    doctors: any[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.specialization) queryParams.append('specialization', params.specialization);

    const url = `${endpoints.doctors.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<ApiResponse<any>>(url);
  }

  async getDoctor(id: string): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(endpoints.doctors.getById(id));
  }

  async createDoctor(doctorData: any): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(endpoints.doctors.create, doctorData);
  }

  async updateDoctor(id: string, doctorData: any): Promise<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(endpoints.doctors.update(id), doctorData);
  }

  // Appointment methods
  async getAppointments(params?: {
    date?: string;
    doctorId?: string;
    patientId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    appointments: any[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
    if (params?.patientId) queryParams.append('patientId', params.patientId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${endpoints.appointments.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<ApiResponse<any>>(url);
  }

  async getAppointment(id: string): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(endpoints.appointments.getById(id));
  }

  async createAppointment(appointmentData: {
    patientId: string;
    doctorId: string;
    date: string;
    time: string;
    notes?: string;
    duration?: number;
  }): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(endpoints.appointments.create, appointmentData);
  }

  async updateAppointment(id: string, appointmentData: any): Promise<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(endpoints.appointments.update(id), appointmentData);
  }

  async deleteAppointment(id: string): Promise<ApiResponse<any>> {
    return this.delete<ApiResponse<any>>(endpoints.appointments.delete(id));
  }

  // Billing methods
  async getBillingRecords(params?: {
    status?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    bills: any[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.patientId) queryParams.append('patientId', params.patientId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${endpoints.billing.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<ApiResponse<any>>(url);
  }

  async getBillingRecord(id: string): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(endpoints.billing.getById(id));
  }

  async createBillingRecord(billingData: {
    patientId: string;
    amount: number;
    description: string;
    dueDate?: string;
    items?: any[];
  }): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(endpoints.billing.create, billingData);
  }

  async updateBillingRecord(id: string, billingData: any): Promise<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(endpoints.billing.update(id), billingData);
  }

  async deleteBillingRecord(id: string): Promise<ApiResponse<any>> {
    return this.delete<ApiResponse<any>>(endpoints.billing.delete(id));
  }

  // Alias methods for backward compatibility
  async getBillings(params?: {
    status?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    bills: any[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
    };
  }>> {
    return this.getBillingRecords(params);
  }

  async deleteBilling(id: string): Promise<ApiResponse<any>> {
    return this.deleteBillingRecord(id);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse<{
    stats: {
      totalPatients?: number;
      totalDoctors?: number;
      todaysAppointments?: number;
      todayAppointments?: number;
      pendingBills?: number;
      monthlyRevenue?: number;
      overdueBills?: number;
    };
    alerts?: { id?: string; type?: 'error' | 'warning' | 'info'; message: string }[];
  }>> {
    return this.get<ApiResponse<any>>(endpoints.dashboard.stats);
  }
  
  // Rate limiting info
  getRateLimitInfo(): { limit?: string; remaining?: string; reset?: string } | null {
    if (typeof window === 'undefined') return null;
    
    // This would typically come from the last response headers
    // We're using localStorage as a workaround to persist between requests
    const storedInfo = localStorage.getItem('rate_limit_info');
    return storedInfo ? JSON.parse(storedInfo) : null;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Also export as default for backwards compatibility
export default apiClient;