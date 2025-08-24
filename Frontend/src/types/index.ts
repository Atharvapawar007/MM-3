export interface Bus {
  id: string;
  _id?: string;
  busNumber: string;
  plateNumber: string;
  driverId?: string;
  driverName: string;
  driverContact: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id: string;
  _id?: string;
  name: string;
  driverId?: string;
  number?: string;
  gender: string;
  phone?: string;
  contact?: string;
  email?: string;
  busId?: string;
  busPlate?: string;
  busNumber?: string;
  bus?: Bus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string; // This is now the PRN
  _id?: string; // MongoDB fallback (same as PRN)
  name: string;
  prn?: string; // Keep for backward compatibility, but it's the same as id
  gender: string;
  email: string;
  busId: string;
  username?: string;
  password?: string;
  credentialsGenerated?: boolean;
  invitationSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}
