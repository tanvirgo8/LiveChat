import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '@/types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://frontend-task-chatapp.onrender.com/api';
export const TOKEN_STORAGE_KEY = 'livechat_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token dynamically from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to extract user-friendly error messages from API errors
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse | { message?: string }>;
    
    // Check known error format { error: { message, code } }
    if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
      const data = axiosError.response.data;
      if ('error' in data && data.error?.message) {
        return data.error.message;
      }
      if ('message' in data && typeof data.message === 'string') {
        return data.message;
      }
    }
    
    if (axiosError.response?.status === 401) {
      return 'Session expired or unauthorized. Please log in again.';
    }
    
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('Network Error')) {
      return 'Network error or server timeout. The server may be starting up (Render free tier). Please try again.';
    }

    return axiosError.message || 'An unexpected API error occurred.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
}
