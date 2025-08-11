// API configuration and endpoints

const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  DRIVERS: {
    LIST: `${API_BASE_URL}/drivers/list`,
    ADD: `${API_BASE_URL}/drivers/add`,
    DELETE: (id: string) => `${API_BASE_URL}/drivers/delete/${id}`,
  },
  STUDENTS: {
    LIST: `${API_BASE_URL}/students/list`,
    ADD: `${API_BASE_URL}/students/add`,
    UPDATE: (id: string) => `${API_BASE_URL}/students/update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/students/delete/${id}`,
    SEND_CREDENTIALS: (id: string) => `${API_BASE_URL}/students/send-credentials/${id}`,
  },
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: (token: string) => `${API_BASE_URL}/auth/reset-password/${token}`,
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const merged: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };
  const res = await fetch(url, merged);
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
};
