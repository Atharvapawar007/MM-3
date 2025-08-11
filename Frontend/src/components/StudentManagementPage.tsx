import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { Student, Bus } from "../types";
import {
  ArrowLeft,
  LogOut,
  Users,
  UserPlus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Banner } from "./Banner";
import { Footer } from "./Footer";
import api from "../services/api";
import { PageLoader } from "./common/PageLoader";
import { BusCard } from "./StudentManagement/BusCard";
import { StudentCard } from "./StudentManagement/StudentCard";
import { StudentFormModal } from "./StudentManagement/StudentFormModal";
import { ConfirmationModal } from "./common/ConfirmationModal";

interface StudentManagementPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function StudentManagementPage({
  onBack,
  onLogout,
}: StudentManagementPageProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingBuses, setLoadingBuses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentActionId, setStudentActionId] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const fetchBuses = useCallback(async () => {
    setLoadingBuses(true);
    try {
      const fetchedBuses = await api.getBuses();
      setBuses(fetchedBuses);
      if (fetchedBuses.length > 0) {
        // Only set selectedBusId if it's not already set to a valid bus ID
        if (!selectedBusId || !fetchedBuses.some(bus => bus.id === selectedBusId)) {
          setSelectedBusId(fetchedBuses[0].id);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch buses.";
      toast.error(errorMessage);
    } finally {
      setLoadingBuses(false);
    }
  }, [selectedBusId]);

  const fetchStudentsForBus = useCallback(async (busId: string) => {
    setLoadingStudents(true);
    try {
      const fetchedStudents = await api.getStudentsForBus(busId);
      setStudents(fetchedStudents);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch students.";
      toast.error(errorMessage);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  useEffect(() => {
    if (selectedBusId) {
      fetchStudentsForBus(selectedBusId);
    } else {
      setStudents([]);
    }
  }, [selectedBusId, fetchStudentsForBus]);

  const handleBusSelection = (busId: string) => {
    setSelectedBusId(busId);
  };

  const handleAddStudentClick = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudentClick = (student: Student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleDeleteStudentClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (studentData: Omit<Student, 'id' | 'credentialsGenerated' | 'createdAt' | 'busId'>) => {
    if (!selectedBusId) return;
    const actionId = editingStudent ? editingStudent.id : 'new-student';
    setStudentActionId(actionId);

    try {
      if (editingStudent) {
        const updated = await api.updateStudent(editingStudent.id, studentData);
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        toast.success("Student updated successfully!");
      } else {
        const newStudent = await api.addStudent({ ...studentData, busId: selectedBusId });
        setStudents(prev => [...prev, newStudent]);
        toast.success("Student added successfully!");
      }
      setIsFormModalOpen(false);
      setEditingStudent(null);
    } catch (error: unknown) {
      const action = editingStudent ? 'update' : 'add';
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} student.`;
      toast.error(errorMessage);
    } finally {
      setStudentActionId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    
    setStudentActionId(studentToDelete.id);
    try {
      await api.deleteStudent(studentToDelete.id);
      toast.success('Student deleted successfully!');
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete student.';
      toast.error(errorMessage);
    } finally {
      setStudentActionId(null);
    }
  };

  const handleSendCredentials = async (studentId: string) => {
    setStudentActionId(studentId);
    try {
      await api.sendCredentials(studentId);
      toast.success('Credentials sent successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send credentials.';
      toast.error(errorMessage);
    } finally {
      setStudentActionId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    if (!trimmedSearch) return students;
    
    return students.filter(student => 
      student.name.toLowerCase().includes(trimmedSearch) ||
      student.prn.toLowerCase().includes(trimmedSearch)
    );
  }, [students, searchTerm]);

  const selectedBus = useMemo(() => buses.find(b => b.id === selectedBusId), [buses, selectedBusId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F9]">
      <Banner />
      
      {/* Header Section */}
      <header className="bg-white">
        <div className="w-full px-6 py-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="sm" className="text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Allocation
            </Button>
          </div>
          <Button onClick={onLogout} variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <div className="w-full px-6 py-4 flex items-center gap-3">
          <div className="bg-[#1a237e] rounded-lg p-2">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Student Management</h1>
            <p className="text-sm text-muted-foreground">Managing students for {selectedBus ? `Bus ${selectedBus.busNumber}` : 'all buses'}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full p-6">
        <div className="flex gap-6">
          {/* Left Panel - Buses */}
          <div className="w-[360px] shrink-0">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-base font-medium">
                <Users className="w-5 h-5 text-[#1a237e]" />
                Buses & Drivers
                <span className="text-sm font-normal text-muted-foreground">
                  {buses.length} buses allocated
                </span>
              </h2>
            </div>
            {loadingBuses ? <PageLoader /> : (
              <div className="space-y-2">
                {buses.map(bus => (
                  <BusCard 
                    key={bus.id} 
                    bus={bus} 
                    isSelected={selectedBusId === bus.id} 
                    onSelect={handleBusSelection} 
                    studentCount={students.filter(s => s.busId === bus.id).length} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Students */}
          <div className="flex-1 bg-white rounded-lg border">
            {selectedBusId && (
              <div>
                <div className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium">
                        Bus {selectedBus?.busNumber} - {selectedBus?.plateNumber}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Driver: {selectedBus?.driverName} | Contact: {selectedBus?.driverContact} | {students.length} students
                      </p>
                    </div>
                    <Button 
                      onClick={handleAddStudentClick} 
                      className="bg-[#ff9800] hover:bg-[#f57c00] text-white"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Student Passenger
                    </Button>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {loadingStudents ? (
                    <PageLoader />
                  ) : (
                    <>
                      <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search students by name or PRN..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value.trim())}
                          className="pl-10 w-full"
                        />
                      </div>
                      {filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium text-muted-foreground">No students allotted to this bus</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Click "Add Student Passenger" to assign students to this bus.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredStudents.map(student => (
                            <StudentCard
                              key={student.id}
                              student={student}
                              onEdit={() => handleEditStudentClick(student)}
                              onDelete={() => handleDeleteStudentClick(student)}
                              onSendCredentials={handleSendCredentials}
                              isActionLoading={studentActionId === student.id}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Send Invitations Button */}
        {students.length > 0 && (
          <Button
            onClick={() => handleSendCredentials('all')}
            className="fixed bottom-6 right-6 bg-[#ff9800] hover:bg-[#f57c00] text-white shadow-lg"
          >
            Send Invitations ({students.length})
          </Button>
        )}
      </div>
      
      <Footer />

      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleFormSubmit}
        student={editingStudent}
        isLoading={studentActionId === (editingStudent?.id || 'new-student')}
      />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
        loading={studentActionId === studentToDelete?.id}
      />
    </div>
  );
}

export default StudentManagementPage;
