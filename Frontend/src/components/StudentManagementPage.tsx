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
  Send,
  Loader2
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
  drivers?: any[];
  students?: Student[];
  onAddStudent?: (student: Student) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  onBack: () => void;
  onLogout: () => void;
}

export function StudentManagementPage({
  drivers: propDrivers,
  students: propStudents,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBack,
  onLogout,
}: StudentManagementPageProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [loadingBuses, setLoadingBuses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentActionId, setStudentActionId] = useState<string | null>(null);
  const [sendingInvitations, setSendingInvitations] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError('An unexpected error occurred. Please refresh the page.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

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
      
      // Validate and normalize the fetched students
      const validatedStudents = fetchedStudents.map(student => {
        // Ensure the student has a valid ID field (PRN)
        const studentId = student._id || student.prn || student.id;
        if (student && studentId) {
          return { 
            ...student, 
            id: studentId,
            prn: studentId
          } as Student;
        }
        return student;
      }).filter((student): student is Student => 
        Boolean(student && (student.id || student._id || student.prn))
      ); // Filter out invalid students
      
      setStudents(validatedStudents);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch students.";
      toast.error(errorMessage);
      console.error('Error fetching students:', error);
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
    // Enhanced validation to handle PRN as ID
    if (!student) {
      toast.error('No student data provided.');
      return;
    }
    
    // PRN is now the primary ID
    const studentId = student.id || student._id || student.prn;
    
    if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
      console.error('Student object:', student);
      console.error('Student ID:', studentId);
      toast.error('Invalid student data. Cannot delete student.');
      return;
    }
    
    console.log('Student object to delete:', student);
    console.log('Student ID (PRN) to delete:', studentId);
    
    // Create a normalized student object with the correct ID
    const normalizedStudent = {
      ...student,
      id: studentId,
      prn: studentId
    };
    
    setStudentToDelete(normalizedStudent);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (studentData: Omit<Student, 'id' | 'credentialsGenerated' | 'createdAt'>) => {
    if (!selectedBusId) {
        toast.error('No bus selected');
        return;
    }

    // Check if we are in edit mode and if the student ID (PRN) is valid
    if (editingStudent && !editingStudent.id && !editingStudent._id && !editingStudent.prn) {
        toast.error('Cannot update student: PRN is missing.');
        setIsFormModalOpen(false);
        setEditingStudent(null);
        return;
    }

    const actionId = editingStudent ? (editingStudent.id || editingStudent._id || editingStudent.prn || '') : 'new-student';
    setStudentActionId(actionId || 'new-student');

    try {
        if (editingStudent) {
            // Ensure editingStudent has a valid PRN before passing it
            const studentId = editingStudent.id || editingStudent._id || editingStudent.prn;
            if (!studentId) {
                toast.error('Cannot update student: PRN is missing.');
                return;
            }
            
            const updated = await api.updateStudent(studentId, { ...studentData, busId: selectedBusId });
            setStudents(prev => prev.map(s => {
              const sId = s.id || s._id || s.prn;
              const updatedId = updated.id || updated._id || updated.prn;
              return sId === updatedId ? updated : s;
            }));
            toast.success("Student updated successfully!");
        } else {
            console.log('Adding new student with data:', { ...studentData, busId: selectedBusId });
            const newStudent = await api.addStudent({ ...studentData, busId: selectedBusId });
            console.log('Received new student from API:', newStudent);
            
            // Ensure the new student has a valid PRN before adding to the list
            if (newStudent && (newStudent.id || newStudent._id || newStudent.prn)) {
                console.log('Student validation passed, adding to list:', newStudent);
                setStudents(prev => [...prev, newStudent]);
                toast.success("Student added successfully!");
            } else {
                console.error('Student validation failed. New student object:', newStudent);
                console.error('Student id:', newStudent?.id);
                console.error('Student _id:', newStudent?._id);
                console.error('Student prn:', newStudent?.prn);
                toast.error('Failed to add student: Invalid student data received.');
                return;
            }
        }
        setIsFormModalOpen(false);
        setEditingStudent(null);
    } catch (error: unknown) {
        const action = editingStudent ? 'update' : 'add';
        const errorMessage = error instanceof Error ? error.message : `Failed to ${action} student.`;
        toast.error(errorMessage);
        console.error(`${action} student error:`, error);
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

    // PRN is now the primary ID
    const studentId = studentToDelete.id || studentToDelete._id || studentToDelete.prn;
    
    if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
      console.error('Student to delete:', studentToDelete);
      console.error('Student ID (PRN):', studentId);
      toast.error('Invalid student PRN. Cannot delete student.');
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      return;
    }

    // Store the student ID in a local variable to prevent race conditions
    const studentIdToDelete = studentId;
    const studentNameToDelete = studentToDelete.name;
    
    setStudentActionId(studentIdToDelete);
    
    try {
      console.log('Attempting to delete student with PRN:', studentIdToDelete);
      console.log('Student object being deleted:', studentToDelete);
      console.log('Student ID type:', typeof studentIdToDelete);
      console.log('Student ID length:', studentIdToDelete ? studentIdToDelete.length : 'undefined');
      await api.deleteStudent(studentIdToDelete);
      
      // Update the students list
      setStudents(prev => prev.filter(s => {
        const sId = s.id || s._id || s.prn;
        return sId !== studentIdToDelete;
      }));
      
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

  
  const handleSendAllInvitations = async () => {
    if (!selectedBusId) {
      toast.error('No bus selected');
      return;
    }
    
    if (studentsWithoutInvitations.length === 0) {
      toast.error('No students without invitations found for this bus');
      return;
    }
    
    setSendingInvitations(true);
    try {
      await api.sendInvitations(selectedBusId);
      
      // Refresh the students list to get updated credentialsGenerated status from backend
      await fetchStudentsForBus(selectedBusId);
      
      toast.success('Invitations sent successfully!', {
        description: `Email invitations sent to ${studentsWithoutInvitations.length} students for the BusTracker app`
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitations.';
      toast.error(errorMessage);
    } finally {
      setSendingInvitations(false);
    }
  };

  const filteredStudents = useMemo(() => {
    try {
      const trimmedSearch = searchTerm.trim().toLowerCase();
      if (!trimmedSearch) return students;
      
      return students.filter(student => 
        student && student.name && (student.id || student._id || student.prn) && 
        (student.name.toLowerCase().includes(trimmedSearch) ||
         (student.id || student._id || student.prn)?.toLowerCase().includes(trimmedSearch))
      );
    } catch (error) {
      console.error('Error filtering students:', error);
      return [];
    }
  }, [students, searchTerm]);

  const selectedBus = useMemo(() => {
    try {
      return buses.find(b => b.id === selectedBusId);
    } catch (error) {
      console.error('Error finding selected bus:', error);
      return null;
    }
  }, [buses, selectedBusId]);

  const isSearchMode = searchTerm.length > 0;
  const studentsWithoutInvitations = useMemo(() => {
    try {
      return selectedBus ? students.filter(s => s && s.busId === selectedBus.id && !s.credentialsGenerated) : [];
    } catch (error) {
      console.error('Error filtering students without invitations:', error);
      return [];
    }
  }, [selectedBus, students]);

  // Show error message if there's an error
  if (error) {
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
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">
                      Something went wrong
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {error}
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      Refresh Page
                    </Button>
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
                  studentCount={students.filter(s => s && s.busId === bus.id).length} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1" style={{ minHeight: '120vh' }}>
          {isSearchMode ? (
            <div className="flex flex-col">
              <div className="p-6">
                <Card className="shadow-card border">
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
                        key={student.id || student._id || student.prn}
                        student={student}
                        onEdit={() => handleEditStudentClick(student)}
                        onDelete={() => handleDeleteStudentClick(student)}
                        isActionLoading={studentActionId === (student.id || student._id || student.prn)}
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
                        key={student.id || student._id || student.prn}
                        student={student}
                        onEdit={() => handleEditStudentClick(student)}
                        onDelete={() => handleDeleteStudentClick(student)}
                        isActionLoading={studentActionId === (student.id || student._id || student.prn)}
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
        isLoading={studentActionId === (editingStudent?.id || editingStudent?._id || editingStudent?.prn || 'new-student')}
        busId={selectedBusId || ''}
        busNumber={selectedBus?.busNumber || ''}
      />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
        loading={studentActionId === (studentToDelete?.id || studentToDelete?._id || studentToDelete?.prn)}
      />

      {selectedBus && students.length > 0 && studentsWithoutInvitations.length > 0 && !isSearchMode && (
        <div className="fixed bottom-20 right-8 z-50">
          <Button
            onClick={handleSendAllInvitations}
            disabled={sendingInvitations}
            variant={sendingInvitations ? "secondary" : "default"}
          >
            {sendingInvitations ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Invitations ({studentsWithoutInvitations.length})
              </>
            )}
          </Button>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default StudentManagementPage;