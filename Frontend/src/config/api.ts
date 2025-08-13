import type { Driver, Student, Bus } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
};

// Generic utility for API requests
const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const mergedHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
    ...options.headers,
  };
  const mergedOptions = {
    ...options,
    headers: mergedHeaders,
  };
  const response = await fetch(url, mergedOptions);
  return handleResponse(response);
};

// Main API service object
const api = {
  // Student Endpoints
  getStudentsForBus: async (busId: string): Promise<Student[]> => {
    const students = await apiRequest<(Student & { _id: string })[]>(
      `${API_BASE_URL}/students/list?busId=${busId}`
    );
    console.log("Raw students data from API:", students);
    // Map _id to id for each student
    return students.map(s => ({ ...s, id: s._id }));
  },

  addStudent: async (studentData: Omit<Student, 'id' | 'credentialsGenerated' | 'createdAt'>): Promise<Student> => {
    const newStudent = await apiRequest<Student & { _id: string }>(
      `${API_BASE_URL}/students/add`,
      {
        method: 'POST',
        body: JSON.stringify(studentData),
      }
    );
    // Map _id to id for the new student
    return { ...newStudent, id: newStudent._id };
  },

  updateStudent: async (studentId: string, studentData: Partial<Student>): Promise<Student> => {
    const updatedStudent = await apiRequest<Student & { _id: string }>(
      `${API_BASE_URL}/students/update/${studentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(studentData),
      }
    );
    // Map _id to id for the updated student
    return { ...updatedStudent, id: updatedStudent._id };
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    return apiRequest<void>(`${API_BASE_URL}/students/delete/${studentId}`, {
      method: 'DELETE',
    });
  },

  sendCredentials: async (studentId: string): Promise<void> => {
    return apiRequest<void>(`${API_BASE_URL}/students/send-credentials/${studentId}`, {
      method: 'POST',
    });
  },

  sendBulkCredentials: async (studentIds: string[]): Promise<void> => {
    return apiRequest<void>(`${API_BASE_URL}/students/send-bulk-credentials`, {
      method: 'POST',
      body: JSON.stringify({ studentIds }),
    });
  },

  // Driver and Bus Endpoints
  getDrivers: async (): Promise<Driver[]> => {
    const drivers = await apiRequest<(Driver & { _id: string })[]>(`${API_BASE_URL}/drivers/list`);
    // Map _id to id for each driver/bus
    return drivers.map(d => ({ ...d, id: d._id }));
  },

  // ... (You can add other driver/bus endpoints here, applying the same mapping)
};

export default api;