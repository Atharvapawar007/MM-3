import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { NewPasswordPage } from './components/NewPasswordPage';
import { DriverAllocationPage } from './components/DriverAllocationPage';
import { DriverListPage } from './components/DriverListPage';
import { StudentManagementPage } from './components/StudentManagementPage';
import { Toaster } from './components/ui/sonner';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Driver {
  id: string;
  name: string;
  number: string;
  gender: string;
  contact: string;
  photo?: string;
  busPlate: string;
  busNumber: string;
  busPhoto?: string;
}

interface Student {
  id: string;
  name: string;
  prn: string;
  gender: string;
  email: string;
  busId: string;
  username?: string;
  password?: string;
  credentialsGenerated: boolean;
  createdAt: string;
}

type Page = 'login' | 'allocation' | 'driverList' | 'studentManagement' | 'forgotPassword' | 'newPassword';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch all drivers and students from the backend
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // If no token, no need to fetch protected data.
        setIsLoading(false);
        return;
      }

      // Fetch drivers
      const driversResponse = await fetch('http://localhost:3000/api/drivers/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const driversData = await driversResponse.json();
      if (driversResponse.ok) {
        setDrivers(driversData);
      } else {
        toast.error(driversData.message || 'Failed to fetch drivers.');
      }

      // Fetch students
      const studentsResponse = await fetch('http://localhost:3000/api/students/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const studentsData = await studentsResponse.json();
      if (studentsResponse.ok) {
        setStudents(studentsData);
      } else {
        toast.error(studentsData.message || 'Failed to fetch students.');
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Network error. Failed to fetch initial data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for password reset token in URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const pathname = window.location.pathname;
    
    console.log('App: Checking URL parameters:', { pathname, token: token ? 'PRESENT' : 'MISSING', search: window.location.search });
    
    if (token && (pathname === '/new-password' || pathname.includes('new-password'))) {
      console.log('App: Setting page to newPassword due to token in URL');
      setCurrentPage('newPassword');
    } else if (pathname === '/forgot-password') {
      console.log('App: Setting page to forgotPassword');
      setCurrentPage('forgotPassword');
    } else if (token) {
      // If there's a token but we're not on the new-password page, redirect to it
      console.log('App: Token found but not on new-password page, redirecting');
      setCurrentPage('newPassword');
    }
  }, []);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    console.log('App: Checking existing authentication:', { hasToken: !!token, hasUserId: !!userId });
    
    if (token && userId && currentPage === 'login') {
      console.log('App: User already authenticated, redirecting to allocation page');
      setCurrentPage('allocation');
    }
  }, [currentPage]);

  // Fetch data on initial load and when the user logs in
  useEffect(() => {
    if (currentPage !== 'login' && currentPage !== 'forgotPassword' && currentPage !== 'newPassword') {
      fetchAllData();
    }
  }, [currentPage]);

  // ===================== AUTHENTICATION FLOW =====================
  const handleLogin = () => {
    setCurrentPage('allocation');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentPage('login');
    setDrivers([]);
    setStudents([]);
  };

  const handleForgotPassword = () => {
    setCurrentPage('forgotPassword');
  };

  const handleBackToLoginFromForgot = () => {
    setCurrentPage('login');
  };

  const handleBackToLoginFromNewPassword = () => {
    setCurrentPage('login');
  };

  // ===================== NAVIGATION FLOW =====================
  const handleViewDrivers = () => {
    setCurrentPage('driverList');
  };

  const handleViewStudents = () => {
    setCurrentPage('studentManagement');
  };

  const handleBackToAllocation = () => {
    setCurrentPage('allocation');
  };

  // ===================== DATA MANAGEMENT =====================
  const handleAddDriver = (driver: Driver) => {
    setDrivers(prev => [...prev, driver]);
  };

  const handleDeleteDriver = (driverId: string) => {
    setDrivers(prev => prev.filter(driver => driver.id !== driverId));
    setStudents(prev => prev.filter(student => student.busId !== driverId));
  };

  const handleAddStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(student => 
      student.id === updatedStudent.id ? updatedStudent : student
    ));
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
  };

  // ===================== RENDER LOGIC =====================
  const renderCurrentPage = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
      );
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onForgotPassword={handleForgotPassword} />;
      case 'forgotPassword':
        return <ForgotPasswordPage onBackToLogin={handleBackToLoginFromForgot} />;
      case 'newPassword':
        return <NewPasswordPage onBackToLogin={handleBackToLoginFromNewPassword} />;
      case 'allocation':
        return (
          <DriverAllocationPage 
            onLogout={handleLogout}
            onViewDrivers={handleViewDrivers}
            onViewStudents={handleViewStudents}
            drivers={drivers}
            onAddDriver={handleAddDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        );
      case 'driverList':
        return (
          <DriverListPage 
            drivers={drivers}
            onBack={handleBackToAllocation}
            onLogout={handleLogout}
            onDeleteDriver={handleDeleteDriver}
          />
        );
      case 'studentManagement':
        return (
          <StudentManagementPage
            drivers={drivers}
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onBack={handleBackToAllocation}
            onLogout={handleLogout}
          />
        );
      default:
        return <LoginPage onLogin={handleLogin} onForgotPassword={handleForgotPassword} />;
    }
  };

  return (
    <>
      {renderCurrentPage()}
      <Toaster position="top-right" />
    </>
  );
}
