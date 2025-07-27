import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { DriverAllocationPage } from './components/DriverAllocationPage';
import { DriverListPage } from './components/DriverListPage';
import { StudentManagementPage } from './components/StudentManagementPage';
import { Toaster } from './components/ui/sonner';

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

type Page = 'login' | 'allocation' | 'driverList' | 'studentManagement';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const handleLogin = () => {
    setCurrentPage('allocation');
  };

  const handleLogout = () => {
    setCurrentPage('login');
  };

  const handleViewDrivers = () => {
    setCurrentPage('driverList');
  };

  const handleViewStudents = () => {
    setCurrentPage('studentManagement');
  };

  const handleBackToAllocation = () => {
    setCurrentPage('allocation');
  };

  const handleAddDriver = (driver: Driver) => {
    setDrivers(prev => [...prev, driver]);
  };

  const handleDeleteDriver = (driverId: string) => {
    // Delete the driver
    setDrivers(prev => prev.filter(driver => driver.id !== driverId));
    // Delete all students associated with this driver's bus
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
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
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <>
      {renderCurrentPage()}
      <Toaster position="top-right" />
    </>
  );
}