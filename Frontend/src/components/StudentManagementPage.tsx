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
  X,
  AlertCircle,
  Bus as BusIcon, // Renaming Bus to BusIcon to avoid conflict with Bus type
  Send
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

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
    setSearchTerm('');
  };

  const handleAddStudentClick = () => {
    if (!selectedBusId) {
      toast.error('Please select a bus first.');
      return;
    }
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudentClick = (student: Student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleDeleteStudentClick = (student: Student) => {
    // Validate student object before proceeding
    if (!student || !student.id) {
      toast.error('Invalid student data. Cannot delete student.');
      return;
    }
    console.log('Student object to delete:', student);
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (studentData: Omit<Student, 'id' | 'credentialsGenerated' | 'createdAt'>) => {
    if (!selectedBusId) {
        toast.error('No bus selected');
        return;
    }

    // Check if we are in edit mode and if the student ID is valid
    if (editingStudent && !editingStudent.id) {
        toast.error('Cannot update student: ID is missing.');
        setIsFormModalOpen(false);
        setEditingStudent(null);
        return;
    }

    const actionId = editingStudent ? editingStudent.id : 'new-student';
    setStudentActionId(actionId);

    try {
        if (editingStudent) {
            // Ensure editingStudent.id is not undefined before passing it
            const updated = await api.updateStudent(editingStudent.id!, { ...studentData, busId: selectedBusId });
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
    // Enhanced validation with more specific error messages
    if (!studentToDelete) {
      toast.error('No student selected for deletion.');
      setIsDeleteModalOpen(false);
      return;
    }

    if (!studentToDelete.id || typeof studentToDelete.id !== 'string' || studentToDelete.id.trim() === '') {
      toast.error('Invalid student ID. Cannot delete student.');
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      return;
    }

    // Store the student ID in a local variable to prevent race conditions
    const studentIdToDelete = studentToDelete.id;
    const studentNameToDelete = studentToDelete.name;
    
    setStudentActionId(studentIdToDelete);
    
    try {
      await api.deleteStudent(studentIdToDelete);
      
      // Update the students list
      setStudents(prev => prev.filter(s => s.id !== studentIdToDelete));
      
      toast.success(`Student "${studentNameToDelete}" deleted successfully!`);
      
      // Clean up state
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      
    } catch (error: unknown) {
      console.error('Delete student error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete student.';
      toast.error(`Failed to delete student "${studentNameToDelete}": ${errorMessage}`);
    } finally {
      setStudentActionId(null);
    }
  };

  const handleSendCredentials = async (studentId: string) => {
    setStudentActionId(studentId);
    try {
      await api.sendCredentials(studentId);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, credentialsGenerated: true } : s));
      toast.success('Credentials sent successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send credentials.';
      toast.error(errorMessage);
    } finally {
      setStudentActionId(null);
    }
  };
  
  const handleSendAllInvitations = async () => {
    const studentsWithoutCredentials = students.filter(s => s.busId === selectedBusId && !s.credentialsGenerated);
    if (studentsWithoutCredentials.length === 0) {
      toast.error('No students without credentials found for this bus');
      return;
    }
    try {
      await api.sendBulkCredentials(studentsWithoutCredentials.map(s => s.id));
      setStudents(prev => prev.map(s => s.credentialsGenerated || (studentsWithoutCredentials.some(swc => swc.id === s.id)) ? { ...s, credentialsGenerated: true } : s));
      toast.success('Sending all the invitations', {
        description: `Email invitations sent to ${studentsWithoutCredentials.length} students with login credentials`
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitations.';
      toast.error(errorMessage);
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

  const isSearchMode = searchTerm.length > 0;
  const studentsWithoutCredentials = selectedBus ? students.filter(s => s.busId === selectedBus.id && !s.credentialsGenerated) : [];

  if (loadingBuses) {
    return <PageLoader />;
  }

  if (buses.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Banner />
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Allocation
              </Button>
              <Button onClick={onLogout} variant="outline" className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
            <Card className="shadow-card border-0 text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">
                      No Buses Available
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Please allocate drivers to buses first before managing students.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Banner />
      <div className="p-6 border-b bg-card shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Allocation
            </Button>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-foreground">Student Management</h1>
                <p className="text-sm text-muted-foreground">
                  {isSearchMode ? `Search results for "${searchTerm}"` : selectedBus ? `Managing students for Bus ${selectedBus.busNumber}` : 'Select a bus to manage students'}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search students by name or PRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 border-2 border-border focus:border-primary focus:ring-primary transition-colors"
          />
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-1">
        <div className="w-1/4 border-r bg-card" style={{ minHeight: '120vh' }}>
          <div className="sticky top-0 bg-card border-b p-4 z-10 shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-medium text-foreground">Buses & Drivers</h2>
                <p className="text-sm text-muted-foreground">{buses.length} buses allocated</p>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto">
            <div className="p-4 space-y-3" style={{ paddingBottom: '500px' }}>
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
          </div>
        </div>
        <div className="flex-1" style={{ minHeight: '120vh' }}>
          {isSearchMode ? (
            <div className="flex flex-col">
              <div className="p-6">
                <Card className="shadow-card border-0">
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-accent">
                          <Search className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-foreground">Search Results</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} matching "{searchTerm}"
                          </CardDescription>
                        </div>
                      </div>
                      <Button onClick={() => setSearchTerm('')} variant="outline" className="flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Clear Search
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </div>
              <div className="flex-1">
                {loadingStudents ? (
                  <PageLoader />
                ) : filteredStudents.length === 0 ? (
                  <div className="flex items-center justify-center h-96 p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2 text-foreground">No students found</h3>
                      <p className="text-sm text-muted-foreground">Try searching with a different name or PRN.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ paddingBottom: '500px' }}>
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
              </div>
            </div>
          ) : selectedBus ? (
            <div className="flex flex-col">
              <div className="p-6">
                <Card className="shadow-card border-2">
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="text-foreground">Bus {selectedBus.busNumber} - {selectedBus.plateNumber}</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Driver: {selectedBus.driverName} | Contact: {selectedBus.driverContact} | {students.length} student{students.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                      <Button onClick={handleAddStudentClick}>
                        <UserPlus className="w-4 h-4" />
                        Add Student Passenger
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </div>
              <div className="flex-1">
                {loadingStudents ? (
                  <PageLoader />
                ) : students.length === 0 ? (
                  <div className="flex items-center justify-center h-96 p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2 text-foreground">No students allotted to this bus</h3>
                      <p className="text-sm text-muted-foreground">Click "Add Student Passenger" to assign students to this bus.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ paddingBottom: '500px' }}>
                    {students.map(student => (
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
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BusIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2 text-foreground">Select a Bus</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a bus from the side panel to manage its students, or use the search bar to find specific students.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleFormSubmit}
        student={editingStudent}
        isLoading={studentActionId === (editingStudent?.id || 'new-student')}
        busId={selectedBusId || ''}
        busNumber={selectedBus?.busNumber || ''}
      />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
        loading={studentActionId === studentToDelete?.id}
      />

      {selectedBus && students.length > 0 && studentsWithoutCredentials.length > 0 && !isSearchMode && (
        <div className="fixed bottom-20 right-8 z-50">
          <Button
            onClick={handleSendAllInvitations}
          >
            <Send className="w-4 h-4" />
            Send Invitations ({studentsWithoutCredentials.length})
          </Button>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default StudentManagementPage;