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

  // Add auth token to headers if available
  private getHeaders(options?: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (options?.token) {
      headers.Authorization = `Bearer ${options.token}`;
    } else if (typeof window !== 'undefined') {
      // Try to get token from localStorage in browser environment
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
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
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);