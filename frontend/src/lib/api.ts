import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
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
};

export default api;