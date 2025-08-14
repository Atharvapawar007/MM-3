import { API_BASE_URL } from '../config';
import type { Driver, Student, Bus } from '../types';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
};

const api = {
  // Driver endpoints
  getDrivers: async (): Promise<Driver[]> => {
    const response = await fetch(`${API_BASE_URL}/drivers/list`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return handleResponse(response);
  },

  addDriver: async (driverData: Omit<Driver, 'id' | 'bus'>): Promise<Driver> => {
    const response = await fetch(`${API_BASE_URL}/drivers/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(driverData),
    });
    return handleResponse(response);
  },

  deleteDriver: async (driverId: string): Promise<void> => {
    console.log('Deleting driver with ID:', driverId);
    const response = await fetch(`${API_BASE_URL}/drivers/delete/${driverId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
    });
    const result = await handleResponse(response);
    console.log('Delete response:', result);
    return result;
  },

  getDriverById: async (driverId: string): Promise<Driver> => {
    const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return handleResponse(response);
  },

  // Bus endpoints
  getBuses: async (): Promise<Bus[]> => {
    const response = await fetch(`${API_BASE_URL}/buses/list`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return handleResponse(response);
  },

  // Student endpoints
  getStudentsForBus: async (busId: string): Promise<Student[]> => {
    const response = await fetch(`${API_BASE_URL}/students/list?busId=${busId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return handleResponse(response);
  },

  addStudent: async (studentData: Omit<Student, 'id' | 'credentialsGenerated' | 'createdAt'>): Promise<Student> => {
    const response = await fetch(`${API_BASE_URL}/students/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(studentData),
    });
    const data = await handleResponse(response);
    console.log('API response data:', data);
    // Extract the student from the response
    const student = data.student || data;
    console.log('Extracted student:', student);
    return student;
  },

  updateStudent: async (studentId: string, studentData: Partial<Student>): Promise<Student> => {
    const response = await fetch(`${API_BASE_URL}/students/update/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(studentData),
    });
    const data = await handleResponse(response);
    // Extract the student from the response
    return data.student || data;
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/students/delete/${studentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return handleResponse(response);
  },

  sendCredentials: async (studentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/students/send-credentials/${studentId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return handleResponse(response);
  },

  // ADD THE FOLLOWING METHOD:
  sendBulkCredentials: async (studentIds: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/students/send-bulk-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ studentIds }),
    });
    return handleResponse(response);
  },

  // Send invitations to students for the future app
  sendInvitations: async (busId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/students/send-invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ busId }),
    });
    return handleResponse(response);
  },
};

export default api;