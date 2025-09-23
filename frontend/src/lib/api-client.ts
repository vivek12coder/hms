const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

class ApiError extends Error {
  constructor(public status: number, public message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.message || 'API Error');
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Network error');
    }
  },

  // Authentication
  async login(email: string, password: string) {
    return this.request<{success: boolean; data: {token: string; user: any}}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(userData: any) {
    return this.request<{success: boolean; data: any; message: string}>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Patients
  async getPatients(token?: string) {
    return this.request<{success: boolean; data: any[]; count: number}>('/patients', {}, token);
  },

  async getPatient(id: string, token?: string) {
    return this.request<{success: boolean; data: any}>(`/patients/${id}`, {}, token);
  },

  async createPatient(patientData: any, token: string) {
    return this.request<{success: boolean; data: any; message: string}>('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    }, token);
  },

  async updatePatient(id: string, patientData: any, token: string) {
    return this.request<{success: boolean; data: any; message: string}>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    }, token);
  },

  async deletePatient(id: string, token: string) {
    return this.request<{success: boolean; message: string}>(`/patients/${id}`, {
      method: 'DELETE',
    }, token);
  },

  // Doctors
  async getDoctors(token?: string) {
    return this.request<{success: boolean; data: any[]; count: number}>('/doctors', {}, token);
  },

  async getDoctor(id: string, token?: string) {
    return this.request<{success: boolean; data: any}>(`/doctors/${id}`, {}, token);
  },

  async getDoctorsBySpecialization(specialization?: string) {
    const query = specialization ? `?specialization=${encodeURIComponent(specialization)}` : '';
    return this.request<{success: boolean; data: any[]; count: number}>(`/doctors/specialization${query}`);
  },

  // Appointments
  async getAppointments() {
    return this.request<{success: boolean; data: any[]; count: number}>('/appointments');
  },

  async getAppointment(id: string) {
    return this.request<{success: boolean; data: any}>(`/appointments/${id}`);
  },

  async createAppointment(appointmentData: any) {
    return this.request<{success: boolean; data: any; message: string}>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  async updateAppointment(id: string, appointmentData: any) {
    return this.request<{success: boolean; data: any; message: string}>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  },

  async getPatientAppointments(patientId: string) {
    return this.request<{success: boolean; data: any[]; count: number}>(`/appointments/patient/${patientId}`);
  },

  async getDoctorAppointments(doctorId: string) {
    return this.request<{success: boolean; data: any[]; count: number}>(`/appointments/doctor/${doctorId}`);
  },

  // Billing
  async getBillings() {
    return this.request<{success: boolean; data: any[]; count: number}>('/billing');
  },

  async getBillingRecords() {
    return this.request<{success: boolean; data: any[]; count: number}>('/billing');
  },

  async getBillingRecord(id: string) {
    return this.request<{success: boolean; data: any}>(`/billing/${id}`);
  },

  async createBillingRecord(billingData: any) {
    return this.request<{success: boolean; data: any; message: string}>('/billing', {
      method: 'POST',
      body: JSON.stringify(billingData),
    });
  },

  async updateBillingRecord(id: string, billingData: any) {
    return this.request<{success: boolean; data: any; message: string}>(`/billing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(billingData),
    });
  },

  async deleteBilling(id: string) {
    return this.request<{success: boolean; message: string}>(`/billing/${id}`, {
      method: 'DELETE',
    });
  },

  async markBillingAsPaid(id: string) {
    return this.request<{success: boolean; data: any; message: string}>(`/billing/${id}/pay`, {
      method: 'POST',
    });
  },

  async getPatientBillingRecords(patientId: string) {
    return this.request<{success: boolean; data: {billingRecords: any[]; summary: any}}>(`/billing/patient/${patientId}`);
  },

  async deleteAppointment(id: string) {
    return this.request<{success: boolean; message: string}>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

export default apiClient;