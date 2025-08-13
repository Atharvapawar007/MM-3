export interface Bus {
  id: string;
  _id?: string;
  busNumber: string;
  plateNumber: string;
  driverId?: string;
  busPhoto?: string;
  driverName: string;
  driverContact: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id: string;
  _id?: string;
  name: string;
  driverId: string;
  gender: string;
  phone: string;
  photoUrl?: string;
  busId?: string;
  bus?: Bus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  _id?: string;
  name: string;
  prn: string;
  gender: string;
  email: string;
  busId: string;
  username?: string;
  password?: string;
  credentialsGenerated: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}
