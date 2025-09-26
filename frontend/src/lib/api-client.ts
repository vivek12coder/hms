const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  retryAfter?: number; // seconds
  rawBody?: any;
  constructor(public status: number, message: string, opts: { retryAfter?: number; rawBody?: any } = {}) {
    super(message);
    this.name = 'ApiError';
    this.retryAfter = opts.retryAfter;
    this.rawBody = opts.rawBody;
  }
}

// API endpoints for easy reference
export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
  },
  patients: {
    list: '/api/patients',
    create: '/api/patients',
    getById: (id: string) => `/api/patients/${id}`,
    update: (id: string) => `/api/patients/${id}`,
    delete: (id: string) => `/api/patients/${id}`,
  },
  doctors: {
    list: '/api/doctors',
    create: '/api/doctors',
    getById: (id: string) => `/api/doctors/${id}`,
    update: (id: string) => `/api/doctors/${id}`,
    availability: (id: string) => `/api/doctors/${id}/availability`,
  },
  appointments: {
    list: '/api/appointments',
    create: '/api/appointments',
    getById: (id: string) => `/api/appointments/${id}`,
    update: (id: string) => `/api/appointments/${id}`,
    delete: (id: string) => `/api/appointments/${id}`,
    byPatient: (patientId: string) => `/api/appointments/patient/${patientId}`,
    byDoctor: (doctorId: string) => `/api/appointments/doctor/${doctorId}`,
  },
  billing: {
    list: '/api/billing',
    create: '/api/billing',
    getById: (id: string) => `/api/billing/${id}`,
    update: (id: string) => `/api/billing/${id}`,
    byPatient: (patientId: string) => `/api/billing/patient/${patientId}`,
  },
};

class ApiClient {
  private lastResponseHeaders: Headers | null = null;

  getLastHeader(name: string): string | null {
    return this.lastResponseHeaders?.get(name) || null;
  }

  getRateLimitInfo() {
    if (!this.lastResponseHeaders) return null;
    return {
      limit: this.lastResponseHeaders.get('RateLimit-Limit') || this.lastResponseHeaders.get('X-RateLimit-Limit'),
      remaining: this.lastResponseHeaders.get('RateLimit-Remaining') || this.lastResponseHeaders.get('X-RateLimit-Remaining'),
      reset: this.lastResponseHeaders.get('RateLimit-Reset') || this.lastResponseHeaders.get('X-RateLimit-Reset')
    };
  }
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
      
  const response = await fetch(url, config);
  this.lastResponseHeaders = response.headers;
      
      if (!response.ok) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const message = errorData.message || errorData.error || `HTTP ${response.status}`;
        throw new ApiError(response.status, message, { retryAfter, rawBody: errorData });
      }

      const data = await response.json();
      console.log(`✅ API Response: ${options.method || 'GET'} ${url}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${options.method || 'GET'} ${url}`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(500, `Connection failed: Unable to connect to backend server at ${API_BASE_URL}`);
      }
      
      throw new ApiError(500, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generic HTTP Methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication Methods
  async login(email: string, password: string) {
    return this.request<{success: boolean; data: {token: string; user: any}}>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request<{success: boolean; data: any; message: string}>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Dashboard Methods
  async getDashboardStats() {
    return this.get<{
      success: boolean;
      data: {
        stats: {
          totalPatients: number;
          totalDoctors: number;
          todaysAppointments: number;
          pendingBills: number;
          pendingBillsAmount: number;
          monthlyRevenue: number;
          overdueBills?: number;
        };
        recentAppointments: Array<{
          id: string;
          patientName: string;
          doctorName: string;
          time: string;
          status: string;
          amount: number;
          description: string;
        }>;
        alerts: Array<{
          id: string;
          message: string;
          type: 'error' | 'warning' | 'info';
        }>;
      } | any;
    }>('/api/dashboard/stats');
  }

  async getPatientGrowthData() {
    return this.get<{success: boolean; data: Record<string, number>}>('/api/dashboard/patient-growth');
  }

  async getRevenueData() {
    return this.get<{success: boolean; data: Record<string, number>}>('/api/dashboard/revenue');
  }

  // Patient Methods
  async getPatients(options: {page?: number; limit?: number; search?: string} = {}) {
    const params = new URLSearchParams();
    params.append('page', (options.page || 1).toString());
    params.append('limit', (options.limit || 10).toString());
    if (options.search) params.append('search', options.search);
    
    return this.get<{success: boolean; data: any[]; count: number}>(`/api/patients?${params}`);
  }

  async getPatient(id: string) {
    return this.get<{success: boolean; data: any}>(`/api/patients/${id}`);
  }

  async createPatient(patientData: any) {
    return this.post<{success: boolean; data: any; message: string}>('/api/patients', patientData);
  }

  async updatePatient(id: string, patientData: any) {
    return this.put<{success: boolean; data: any}>(`/api/patients/${id}`, patientData);
  }

  async deletePatient(id: string) {
    return this.delete<{success: boolean; message: string}>(`/api/patients/${id}`);
  }

  // Doctor Methods
  async getDoctors() {
    return this.get<{success: boolean; data: {doctors: any[]; pagination: any}}>('/api/doctors');
  }

  async getDoctor(id: string) {
    return this.get<{success: boolean; data: any}>(`/api/doctors/${id}`);
  }

  // Billing Methods
  async getBillingRecords() {
    return this.get<{success: boolean; data: any[]}>('/api/billing');
  }

  async getBillings() {
    return this.get<{success: boolean; data: any[]}>('/api/billing');
  }

  async createBill(billData: any) {
    return this.post<{success: boolean; data: any}>('/api/billing', billData);
  }

  // Alias used by billing create page
  async createBillingRecord(billData: any) {
    return this.createBill(billData);
  }

  async updateBill(id: string, billData: any) {
    return this.put<{success: boolean; data: any}>(`/api/billing/${id}`, billData);
  }

  async deleteBilling(id: string) {
    return this.delete<{success: boolean; message: string}>(`/api/billing/${id}`);
  }

  // Appointment Methods
  async getAppointments() {
    return this.get<{success: boolean; data: any[]}>('/api/appointments');
  }

  async createAppointment(appointmentData: any) {
    return this.post<{success: boolean; data: any}>('/api/appointments', appointmentData);
  }

  async updateAppointment(id: string, appointmentData: any) {
    return this.put<{success: boolean; data: any}>(`/api/appointments/${id}`, appointmentData);
  }

  async cancelAppointment(id: string) {
    return this.delete<{success: boolean; message: string}>(`/api/appointments/${id}`);
  }

  // Prescription Methods
  async getPrescriptions() {
    return this.get<{success: boolean; data: any[]}>('/api/prescriptions');
  }

  async requestPrescriptionRefill(refillData: any) {
    return this.post<{success: boolean; data: any}>('/api/prescriptions/refill', refillData);
  }

  async getPrescriptionRefills() {
    return this.get<{success: boolean; data: any[]}>('/api/prescriptions/refills');
  }

  // Patient-specific Methods
  async getPatientBillingRecords(patientId: string) {
    return this.get<{success: boolean; data: {billingRecords: any[]}}>(`/api/billing/patient/${patientId}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;