import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Bus,
  User,
  ArrowLeft,
  LogOut,
  Mail,
  Edit,
  Trash2,
  UserPlus,
  Users,
  AlertCircle,
  CheckCircle,
  Phone,
  Send,
  AlertTriangle,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Banner } from "./Banner";
import { Footer } from "./Footer";

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

interface StudentManagementPageProps {
  drivers: Driver[];
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onBack: () => void;
  onLogout: () => void;
}

export function StudentManagementPage({
  drivers,
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBack,
  onLogout,
}: StudentManagementPageProps) {
  const [selectedBusId, setSelectedBusId] = useState(drivers[0]?.id || "");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [isSendingCredentials, setIsSendingCredentials] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  // Form states
  const [studentName, setStudentName] = useState("");
  const [studentPRN, setStudentPRN] = useState("");
  const [studentGender, setStudentGender] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [selectedBusId]); // Re-fetch students when the selected bus changes

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/students/list?busId=${selectedBusId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAllStudents(data);
      } else {
        toast.error(data.message || 'Failed to fetch students.');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!studentName.trim()) {
      toast.error("Student name is required");
      return false;
    }
    if (!studentPRN.trim()) {
      toast.error("PRN is required");
      return false;
    }
    if (!studentGender) {
      toast.error("Gender is required");
      return false;
    }
    if (!studentEmail.trim()) {
      toast.error("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setStudentName("");
    setStudentPRN("");
    setStudentGender("");
    setStudentEmail("");
    setEditingStudent(null);
  };

  const handleAddStudent = async () => {
    if (!validateForm()) return;
    setIsAddingStudent(true);

    const newStudentData = {
      name: studentName,
      prn: studentPRN,
      gender: studentGender,
      email: studentEmail,
      busId: selectedBusId,
    };

    try {
      const response = await fetch('http://localhost:3000/api/students/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newStudentData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Student ${studentName} added successfully!`);
        // We can pass `data.student` to the parent component
        onAddStudent(data.student); 
        setAllStudents(prev => [...prev, data.student]);
        resetForm();
        setIsAddDialogOpen(false);
      } else {
        toast.error(data.message || 'Failed to add student.');
      }
    } catch (error) {
      console.error('Add student request failed:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentPRN(student.prn);
    setStudentGender(student.gender);
    setStudentEmail(student.email);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!validateForm() || !editingStudent) return;
    setIsUpdatingStudent(true);

    const updatedStudentData = {
      name: studentName,
      prn: studentPRN,
      gender: studentGender,
      email: studentEmail,
    };

    try {
      const response = await fetch(`http://localhost:3000/api/students/update/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedStudentData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Student details updated successfully!');
        onUpdateStudent(data.student);
        setAllStudents(prev => prev.map(s => s.id === data.student.id ? data.student : s));
        resetForm();
        setIsEditDialogOpen(false);
      } else {
        toast.error(data.message || 'Failed to update student details.');
      }
    } catch (error) {
      console.error('Update student request failed:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete student ${student.name}?`)) {
      setIsDeletingStudent(true);
      try {
        const response = await fetch(`http://localhost:3000/api/students/delete/${student.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message || `${student.name} has been removed from the bus.`);
          onDeleteStudent(student.id);
          setAllStudents(prev => prev.filter(s => s.id !== student.id));
        } else {
          toast.error(data.message || 'Failed to delete student.');
        }
      } catch (error) {
        console.error('Delete student request failed:', error);
        toast.error('Network error. Please check your connection.');
      } finally {
        setIsDeletingStudent(false);
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearchMode(term.length > 0);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearchMode(false);
  };

  const filteredStudents = allStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.prn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendInvitations = async () => {
    setIsSendingCredentials(true);

    const busStudents = allStudents.filter(s => s.busId === selectedBusId);
    const studentsWithoutCredentials = busStudents.filter(s => !s.credentialsGenerated);

    if (studentsWithoutCredentials.length === 0) {
        toast.error("No students without credentials found for this bus");
        setIsSendingCredentials(false);
        return;
    }

    try {
        await Promise.all(studentsWithoutCredentials.map(async (student) => {
            const response = await fetch(`http://localhost:3000/api/students/send-credentials/${student.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();

            if (response.ok) {
                toast.success(`Invitation sent to ${student.name}`);
                // Update the student state after successful email send
                setAllStudents(prev => prev.map(s => s.id === student.id ? { ...s, credentialsGenerated: true } : s));
            } else {
                toast.error(data.message || `Failed to send invitation to ${student.name}`);
            }
        }));

        toast.success(`Successfully sent invitations to all ${studentsWithoutCredentials.length} students.`);
    } catch (error) {
        console.error('Error sending invitations:', error);
        toast.error('Network error. Please check your connection.');
    } finally {
        setIsSendingCredentials(false);
    }
  };


  const getStudentsForBus = (busId: string) => {
    return allStudents.filter((student) => student.busId === busId);
  };

  const getDriverForStudent = (busId: string) => {
    return drivers.find((driver) => driver.id === busId);
  };

  const selectedDriver = drivers.find((d) => d.id === selectedBusId);
  const busStudents = getStudentsForBus(selectedBusId);
  const studentsWithoutCredentials = busStudents.filter(
    (s) => !s.credentialsGenerated
  );

  if (drivers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Banner />
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Allocation
              </Button>

              <Button
                onClick={onLogout}
                variant="outline"
                className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            <Card className="text-center bg-white py-12 shadow-lg hover:border-black hover:shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-100">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <Bus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">
                      No Buses Available
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Please allocate drivers to buses first before managing
                      students.
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
    <div className="min-h-screen bg-background">
      <Banner />

      {/* Main header with navigation and search */}
      <div className="p-6 border-b bg-card shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Allocation
            </Button>

            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-800">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-foreground">
                  Student Management
                </h1>
                <p className="text-sm mt-2 text-muted-foreground">
                  {isSearchMode
                    ? `Search results for "${searchTerm}"`
                    : selectedDriver
                    ? `Managing students for Bus ${selectedDriver.busNumber}`
                    : "Select a bus to manage students"}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-md ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search students by name or PRN..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10 border-2 border-gray-300 focus:border-blue-800 focus:ring-blue-800 transition-colors hover:border-black selection:text-white"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main content area with flex layout */}
      <div className="flex">
        {/* Left Side Panel - Buses & Drivers */}
        <div className="w-1/4 border-r bg-card" style={{ minHeight: "120vh" }}>
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b p-4 z-10 shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-800">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-foreground">Buses & Drivers</h2>
                <p className="text-sm text-muted-foreground">
                  {drivers.length} buses allocated
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Bus List */}
          <div className="overflow-y-auto">
            <div className="p-4 space-y-3">
              {drivers.map((driver) => {
                const studentCount = getStudentsForBus(driver.id).length;
                const isSelected = selectedBusId === driver.id && !isSearchMode;

                return (
                  <Card
                    key={driver.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-black border hover:scale-105 ${
                      isSelected
                        ? "ring-2 ring-blue-800 bg-blue-400/10 border-blue-800 hover:shadow-lg hover:shadow-blue-500"
                        : "border-black shadow-card"
                    }`}
                    onClick={() => {
                      setSelectedBusId(driver.id);
                      clearSearch();
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {driver.busPhoto ? (
                          <img
                            src={driver.busPhoto}
                            alt={`Bus ${driver.busNumber}`}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-blue-800"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-blue-800 bg-blue-800/10">
                            <Bus className="w-6 h-6 text-blue-800" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">
                            Bus {driver.busNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {driver.busPlate}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-800" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {driver.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Driver #{driver.number}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-800" />
                          <p className="text-sm text-foreground">
                            {driver.contact}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-800" />
                          <p className="text-sm text-foreground">
                            {studentCount} student
                            {studentCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content Area - Students */}
        <div className="flex-1" style={{ minHeight: "120vh" }}>
          {isSearchMode ? (
            /* Search Results View */
            <div className="flex flex-col">
              <div className="p-6">
                <Card className="shadow-lg border-black bg-gray-50">
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-amber-500">
                          <Search className="w-6 h-6 text-amber-500-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-foreground">
                            Search Results
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Found {filteredStudents.length} student
                            {filteredStudents.length !== 1 ? "s" : ""} matching
                            "{searchTerm}"
                          </CardDescription>
                        </div>
                      </div>

                      <Button
                        onClick={clearSearch}
                        variant="outline"
                        className="flex items-center gap-2 border-gray-300 hover:border-black"
                      >
                        <X className="w-4 h-4" />
                        Clear Search
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              <div className="flex-1">
                {filteredStudents.length === 0 ? (
                  <div className="flex justify-center h-96 p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full border border-black bg-gray-300 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-muted-foreground " />
                      </div>
                      <h3 className="font-medium mb-2 text-foreground">
                        No students found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Try searching with a different name or PRN.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6" style={{ paddingBottom: "500px" }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredStudents.map((student) => {
                        const studentDriver = getDriverForStudent(
                          student.busId
                        );
                        return (
                          <Card
                            key={student.id}
                            className="border shadow-card hover:shadow-lg hover:border-black hover:scale-105 transition-all duration-200"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <Avatar className="w-10 h-10 border-2 border-blue-800">
                                  <AvatarFallback className="bg-blue-800 text-white">
                                    {student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-medium text-foreground">
                                    {student.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    PRN: {student.prn}
                                  </p>
                                </div>
                                {student.credentialsGenerated && (
                                  <div className="text-success">
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1 text-xs mb-3">
                                <p className="text-foreground">
                                  <span className="font-medium">Gender:</span>{" "}
                                  {student.gender}
                                </p>
                                <p className="text-foreground">
                                  <span className="font-medium">Email:</span>{" "}
                                  {student.email}
                                </p>
                                {studentDriver && (
                                  <p className="text-foreground">
                                    <span className="font-medium">Bus:</span>{" "}
                                    {studentDriver.busNumber} (
                                    {studentDriver.busPlate})
                                  </p>
                                )}
                                {student.credentialsGenerated && (
                                  <p className="text-success font-medium">
                                    ✓ Invitation Sent
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditStudent(student)}
                                  className="flex-1 border-secondary text-secondary hover:bg-secondary hover:text-white"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteStudent(student)}
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : selectedDriver ? (
            /* Selected Bus View */
            <div className="flex flex-col">
              {/* Selected Bus Info - Fixed */}
              <div className="p-6">
                <Card className="shadow-lg border-black bg-gray-100">
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {selectedDriver.busPhoto && (
                          <img
                            src={selectedDriver.busPhoto}
                            alt={`Bus ${selectedDriver.busNumber}`}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-blue-800"
                          />
                        )}
                        <div>
                          <CardTitle className="text-foreground">
                            Bus {selectedDriver.busNumber} -{" "}
                            {selectedDriver.busPlate}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Driver: {selectedDriver.name} | Contact:{" "}
                            {selectedDriver.contact} | {busStudents.length}{" "}
                            student{busStudents.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                      </div>

                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="flex border items-center gap-2 bg-amber-500 hover:bg-amber-500/90 text-black transition-all duration-100 hover:scale-105 hover:border-black"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Student Passenger
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Students List Content */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : busStudents.length === 0 ? (
                  <div className="flex justify-center h-96 p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2 text-foreground">
                        No students allotted to this bus
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Click "Add Student Passenger" to assign students to this
                        bus.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6" style={{ paddingBottom: "500px" }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {busStudents.map((student) => (
                        <Card
                          key={student.id}
                          className="border border-gray-400 hover:border-black hover:shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-100"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="w-10 h-10 border-2 border-blue-800">
                                <AvatarFallback className="bg-blue-800 text-white">
                                  {student.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground">
                                  {student.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  PRN: {student.prn}
                                </p>
                              </div>
                              {student.credentialsGenerated && (
                                <div className="text-success">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 text-xs">
                              <p className="text-foreground">
                                <span className="font-medium">Gender:</span>{" "}
                                {student.gender}
                              </p>
                              <p className="text-foreground">
                                <span className="font-medium">Email:</span>{" "}
                                {student.email}
                              </p>
                              {selectedDriver && (
                                <p className="text-foreground">
                                  <span className="font-medium">Bus:</span>{" "}
                                  {selectedDriver.busNumber} (
                                  {selectedDriver.busPlate})
                                </p>
                              )}
                              {student.credentialsGenerated && (
                                <p className="text-success font-medium">
                                  ✓ Invitation Sent
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditStudent(student)}
                                className="flex-1 border-secondary text-secondary hover:bg-secondary hover:text-white"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteStudent(student)}
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                disabled={isDeletingStudent}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* No Bus Selected View */
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Bus className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2 text-foreground">
                  Select a Bus
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a bus from the side panel to manage its students, or
                  use the search bar to find specific students.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add Student to Bus {selectedDriver?.busNumber}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter student details. Credentials will be generated when sending
              invitations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Input Warning Notice */}
            <div className="bg-red-500/10 border-l-4 border-red-500 p-3 mb-4 rounded-r-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-500">
                    This input system only supports copy-paste
                  </p>
                  <p className="text-xs text-red-500/80 mt-1">
                    Due to technical limitations, please copy and paste text
                    instead of typing character by character.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentName" className="text-foreground">
                Student Name *
              </Label>
              <Input
                id="studentName"
                type="text"
                placeholder="Enter full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="border-2 border-border focus:border-blue-800 focus:ring-blue-800 transition-colors selection:text-white"
                disabled={isAddingStudent}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentPRN" className="text-foreground">
                PRN (Personal Registration Number) *
              </Label>
              <Input
                id="studentPRN"
                type="text"
                placeholder="e.g., 2023001234"
                value={studentPRN}
                onChange={(e) => setStudentPRN(e.target.value)}
                className="border-2 border-border focus:border-blue-800 focus:ring-blue-800 transition-colors selection:text-white"
                disabled={isAddingStudent}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentGender" className="text-foreground">
                Gender *
              </Label>
              <Select value={studentGender} onValueChange={setStudentGender} disabled={isAddingStudent}>
                <SelectTrigger className="border-2 border-border focus:border-blue-800 focus:ring-blue-800 transition-colors">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentEmail" className="text-foreground">
                Email ID *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="studentEmail"
                  type="email"
                  placeholder="student@college.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="border-2 border-border focus:border-blue-800 focus:ring-blue-800 pl-10 transition-colors selection:text-white"
                  disabled={isAddingStudent}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}
                className="border-2 border-border hover:bg-muted"
                disabled={isAddingStudent}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStudent}
                className="bg-blue-800 hover:bg-blue-800/90 text-white transition-colors"
                disabled={isAddingStudent}
              >
                {isAddingStudent ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Add Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit Student Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update student information for {editingStudent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Input Warning Notice */}
            <div className="bg-red-500/10 border-l-4 border-red-500 p-3 mb-4 rounded-r-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-500">
                    This input system only supports copy-paste
                  </p>
                  <p className="text-xs text-red-500/80 mt-1">
                    Due to technical limitations, please copy and paste text
                    instead of typing character by character.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStudentName" className="text-foreground">
                Student Name *
              </Label>
              <Input
                id="editStudentName"
                type="text"
                placeholder="Enter full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="border-2 border-border focus:border-blue-800 focus:ring-blue-800 transition-colors selection:text-white hover:border-black"
                disabled={isUpdatingStudent}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStudentPRN" className="text-foreground">
                PRN (Personal Registration Number) *
              </Label>
              <Input
                id="editStudentPRN"
                type="text"
                placeholder="e.g., 2023001234"
                value={studentPRN}
                onChange={(e) => setStudentPRN(e.target.value)}
                className="border-2 border-border focus:border-blue-800 focus:ring-blue-800 transition-colors selection:text-white hover:border-black"
                disabled={isUpdatingStudent}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStudentGender" className="text-foreground">
                Gender *
              </Label>
              <Select value={studentGender} onValueChange={setStudentGender} disabled={isUpdatingStudent}>
                <SelectTrigger className="border-2 border-border focus:border-blue-800 focus:ring-blue-800 transition-colors hover:border-black">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStudentEmail" className="text-foreground">
                Email ID *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="editStudentEmail"
                  type="email"
                  placeholder="student@college.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="border-2 border-border focus:border-blue-800 focus:ring-blue-800 pl-10 transition-colors selection:text-white hover:border-black"
                  disabled={isUpdatingStudent}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                }}
                className="border-2 border-border hover:bg-muted"
                disabled={isUpdatingStudent}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStudent}
                className="bg-blue-800 hover:bg-blue-800/90 text-white transition-colors"
                disabled={isUpdatingStudent}
              >
                {isUpdatingStudent ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Update Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Invitations Button - Fixed position above footer */}
      {selectedDriver &&
        studentsWithoutCredentials.length > 0 &&
        !isSearchMode && (
          <div className="fixed bottom-20 right-8 z-50">
            <Button
              onClick={handleSendInvitations}
              className="flex items-center gap-2 shadow-elevated bg-amber-500 hover:bg-amber-500/90 hover:border hover:border-black transition-all duration-200 hover:scale-105"
              disabled={isSendingCredentials}
            >
              {isSendingCredentials ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Invitations ({studentsWithoutCredentials.length})
            </Button>
          </div>
        )}

      <Footer />
    </div>
  );
}
