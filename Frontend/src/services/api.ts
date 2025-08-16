import { API_BASE_URL } from '../config';
import type { Driver, Student, Bus } from '../types';

const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('API: getToken called, token:', token ? 'PRESENT' : 'MISSING');
  return token;
};

const handleResponse = async (response: Response) => {
  console.log('API: Response status:', response.status);
  console.log('API: Response headers:', Object.fromEntries(response.headers.entries()));
  
  const data = await response.json();
  console.log('API: Response data:', data);
  
  if (!response.ok) {
    console.error('API: Error response:', data);
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

  updateDriver: async (driverId: string, driverData: Partial<Driver>): Promise<Driver> => {
    const response = await fetch(`${API_BASE_URL}/drivers/update/${driverId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(driverData),
    });
    const data = await handleResponse(response);
    return data.driver || data;
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
    const token = getToken();
    console.log('API: addStudent called with token:', token ? 'PRESENT' : 'MISSING');
    console.log('API: addStudent data:', studentData);
    
    const response = await fetch(`${API_BASE_URL}/students/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(studentData),
    });
    
    console.log('API: addStudent response status:', response.status);
    const data = await handleResponse(response);
    console.log('API: addStudent response data:', data);
    
    // Extract the student from the response
    const student = data.student || data;
    console.log('API: Extracted student:', student);
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