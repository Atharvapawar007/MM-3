import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
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
  GripVertical,
  Send,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Banner } from './Banner';
import { Footer } from './Footer';
import { Resizable } from 're-resizable';

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
  onLogout 
}: StudentManagementPageProps) {
  const [selectedBusId, setSelectedBusId] = useState(drivers[0]?.id || '');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [sidePanelWidth, setSidePanelWidth] = useState(350);
  
  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentPRN, setStudentPRN] = useState('');
  const [studentGender, setStudentGender] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  // Helper functions
  const generateRandomCredentials = () => {
    const username = 'user' + Math.random().toString(36).substr(2, 8);
    const password = Math.random().toString(36).substr(2, 10);
    return { username, password };
  };

  const validateForm = () => {
    if (!studentName.trim()) {
      toast.error('Student name is required');
      return false;
    }
    if (!studentPRN.trim()) {
      toast.error('PRN is required');
      return false;
    }
    if (!studentGender) {
      toast.error('Gender is required');
      return false;
    }
    if (!studentEmail.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Check for duplicate PRN
    const existingStudent = students.find(s => s.prn === studentPRN && s.id !== editingStudent?.id);
    if (existingStudent) {
      toast.error('PRN already exists');
      return false;
    }

    // Check for duplicate email
    const existingEmail = students.find(s => s.email === studentEmail && s.id !== editingStudent?.id);
    if (existingEmail) {
      toast.error('Email already exists');
      return false;
    }

    return true;
  };

  const resetForm = useCallback(() => {
    setStudentName('');
    setStudentPRN('');
    setStudentGender('');
    setStudentEmail('');
    setEditingStudent(null);
  }, []);

  const handleAddStudent = useCallback(() => {
    if (!validateForm()) return;

    const targetBusId = selectedBusId;
    const selectedBus = drivers.find(d => d.id === targetBusId);
    if (!selectedBus) {
      toast.error('No bus selected');
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name: studentName,
      prn: studentPRN,
      gender: studentGender,
      email: studentEmail,
      busId: targetBusId,
      credentialsGenerated: false,
      createdAt: new Date().toISOString()
    };

    onAddStudent(newStudent);
    toast.success(`Student ${studentName} added successfully!`);

    resetForm();
    setIsAddDialogOpen(false);
  }, [studentName, studentPRN, studentGender, studentEmail, selectedBusId, drivers, onAddStudent, resetForm]);

  const handleEditStudent = useCallback((student: Student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentPRN(student.prn);
    setStudentGender(student.gender);
    setStudentEmail(student.email);
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateStudent = useCallback(() => {
    if (!validateForm() || !editingStudent) return;

    const updatedStudent: Student = {
      ...editingStudent,
      name: studentName,
      prn: studentPRN,
      gender: studentGender,
      email: studentEmail
    };

    onUpdateStudent(updatedStudent);
    toast.success('Student details updated successfully!');
    
    resetForm();
    setIsEditDialogOpen(false);
  }, [editingStudent, studentName, studentPRN, studentGender, studentEmail, onUpdateStudent, resetForm]);

  const handleDeleteStudent = useCallback((student: Student) => {
    onDeleteStudent(student.id);
    toast.success(`${student.name} has been removed from the bus`);
  }, [onDeleteStudent]);

  const getStudentsForBus = (busId: string) => {
    return students.filter(student => student.busId === busId);
  };

  const handleSendInvitations = useCallback(() => {
    const busStudents = getStudentsForBus(selectedBusId);
    const studentsWithoutCredentials = busStudents.filter(s => !s.credentialsGenerated);
    
    if (studentsWithoutCredentials.length === 0) {
      toast.error('No students without credentials found for this bus');
      return;
    }

    // Generate credentials for all students without them
    studentsWithoutCredentials.forEach(student => {
      const credentials = generateRandomCredentials();
      const updatedStudent: Student = {
        ...student,
        username: credentials.username,
        password: credentials.password,
        credentialsGenerated: true
      };
      onUpdateStudent(updatedStudent);
    });

    toast.success('Sending all the invitations', {
      description: `Email invitations sent to ${studentsWithoutCredentials.length} students with login credentials`
    });
  }, [selectedBusId, students, onUpdateStudent]);

  const selectedDriver = drivers.find(d => d.id === selectedBusId);
  const busStudents = getStudentsForBus(selectedBusId);
  const studentsWithoutCredentials = busStudents.filter(s => !s.credentialsGenerated);

  // Memoized StudentForm component to prevent re-renders
  const StudentForm = useCallback(({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      {/* Input Warning Notice */}
      <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">
              This input system only supports copy-paste
            </p>
            <p className="text-xs text-red-600 mt-1">
              Due to technical limitations, please copy and paste text instead of typing character by character.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={isEdit ? "editStudentName" : "studentName"} style={{ color: '#333333' }}>
          Student Name *
        </Label>
        <Input
          id={isEdit ? "editStudentName" : "studentName"}
          type="text"
          placeholder="Enter full name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="border-2 focus:ring-2 transition-all"
          style={{ 
            borderColor: '#E53935',
            backgroundColor: '#FFFFFF'
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={isEdit ? "editStudentPRN" : "studentPRN"} style={{ color: '#333333' }}>
          PRN (Personal Registration Number) *
        </Label>
        <Input
          id={isEdit ? "editStudentPRN" : "studentPRN"}
          type="text"
          placeholder="e.g., 2023001234"
          value={studentPRN}
          onChange={(e) => setStudentPRN(e.target.value)}
          className="border-2 focus:ring-2 transition-all"
          style={{ 
            borderColor: '#E53935',
            backgroundColor: '#FFFFFF'
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={isEdit ? "editStudentGender" : "studentGender"} style={{ color: '#333333' }}>
          Gender *
        </Label>
        <Select value={studentGender} onValueChange={setStudentGender}>
          <SelectTrigger 
            className="border-2 focus:ring-2 transition-all"
            style={{ 
              borderColor: '#E53935',
              backgroundColor: '#FFFFFF'
            }}
          >
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
        <Label htmlFor={isEdit ? "editStudentEmail" : "studentEmail"} style={{ color: '#333333' }}>
          Email ID *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#333333', opacity: 0.5 }} />
          <Input
            id={isEdit ? "editStudentEmail" : "studentEmail"}
            type="email"
            placeholder="student@college.edu"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            className="border-2 focus:ring-2 transition-all pl-10"
            style={{ 
              borderColor: '#E53935',
              backgroundColor: '#FFFFFF'
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            resetForm();
            isEdit ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false);
          }}
          className="border-2"
          style={{ 
            borderColor: '#333333',
            color: '#333333',
            backgroundColor: '#FFFFFF'
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={isEdit ? handleUpdateStudent : handleAddStudent}
          className="transition-all duration-200 hover:opacity-90"
          style={{ 
            backgroundColor: '#1565C0',
            color: '#FFFFFF'
          }}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {isEdit ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </div>
  ), [studentName, studentPRN, studentGender, studentEmail, handleAddStudent, handleUpdateStudent, resetForm]);

  if (drivers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
        <Banner />
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2 border-2 hover:opacity-80"
                style={{ 
                  borderColor: '#1565C0',
                  color: '#1565C0',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Allocation
              </Button>
              
              <Button
                onClick={onLogout}
                variant="outline"
                className="flex items-center gap-2 border-2 hover:opacity-80"
                style={{ 
                  borderColor: '#E53935',
                  color: '#E53935',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            <Card className="shadow-lg border-0 text-center py-12" style={{ backgroundColor: '#FFFFFF' }}>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full" style={{ backgroundColor: '#F5F5F5' }}>
                    <Bus className="w-8 h-8" style={{ color: '#333333', opacity: 0.5 }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2" style={{ color: '#333333' }}>
                      No Buses Available
                    </h3>
                    <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
      <Banner />
      
      <div className="flex-1 flex h-0 overflow-hidden">
        {/* Draggable Side Panel with proper full height and scrolling */}
        <Resizable
          size={{ width: sidePanelWidth, height: '100%' }}
          onResizeStop={(_e: any, _direction: any, _ref: any, d: any) => {
            setSidePanelWidth(sidePanelWidth + d.width);
          }}
          minWidth={280}
          maxWidth={500}
          enable={{ right: true }}
          handleStyles={{
            right: {
              width: '6px',
              right: '-3px',
              background: '#E53935',
              cursor: 'col-resize',
              borderRadius: '0 4px 4px 0'
            }
          }}
          className="border-r-2 h-full"
          style={{ borderColor: '#E53935', backgroundColor: '#FFFFFF' }}
        >
          <div className="h-full flex flex-col">
            {/* Side Panel Header - Fixed/Static */}
            <div className="p-4 border-b-2 flex-shrink-0" style={{ borderColor: '#E53935' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#E53935' }}>
                  <Bus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                </div>
                <div>
                  <h2 className="font-medium" style={{ color: '#333333' }}>
                    Available Buses
                  </h2>
                  <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
                    {drivers.length} buses allocated
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#333333', opacity: 0.6 }}>
                <GripVertical className="w-3 h-3" />
                <span>Drag to resize panel</span>
              </div>
            </div>

            {/* Bus List - Scrollable with scroll bar on inside right edge */}
            <div className="flex-1 relative">
              <div className="h-full overflow-y-auto">
                <div className="p-4 space-y-3 pr-6">
                  {drivers.map((driver) => {
                    const studentCount = getStudentsForBus(driver.id).length;
                    const isSelected = selectedBusId === driver.id;
                    
                    return (
                      <Card 
                        key={driver.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={{ 
                          borderColor: isSelected ? '#E53935' : '#E53935',
                          backgroundColor: isSelected ? '#FFEB3B' : '#FFFFFF'
                        }}
                        onClick={() => setSelectedBusId(driver.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {driver.busPhoto ? (
                              <img 
                                src={driver.busPhoto} 
                                alt={`Bus ${driver.busNumber}`}
                                className="w-12 h-12 object-cover rounded border-2"
                                style={{ borderColor: '#1565C0' }}
                              />
                            ) : (
                              <div 
                                className="w-12 h-12 rounded flex items-center justify-center border-2"
                                style={{ 
                                  backgroundColor: '#F5F5F5',
                                  borderColor: '#1565C0'
                                }}
                              >
                                <Bus className="w-6 h-6" style={{ color: '#1565C0' }} />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium" style={{ color: '#333333' }}>
                                Bus {driver.busNumber}
                              </h3>
                              <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
                                {driver.busPlate}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" style={{ color: '#1565C0' }} />
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#333333' }}>
                                  {driver.name}
                                </p>
                                <p className="text-xs" style={{ color: '#333333', opacity: 0.7 }}>
                                  Driver #{driver.number}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" style={{ color: '#1565C0' }} />
                              <p className="text-sm" style={{ color: '#333333' }}>
                                {driver.contact}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" style={{ color: '#1565C0' }} />
                              <p className="text-sm" style={{ color: '#333333' }}>
                                {studentCount} student{studentCount !== 1 ? 's' : ''}
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
          </div>
        </Resizable>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header - Fixed/Static */}
          <div className="p-6 border-b flex-shrink-0" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="flex items-center gap-2 border-2 hover:opacity-80"
                  style={{ 
                    borderColor: '#1565C0',
                    color: '#1565C0',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Allocation
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: '#1565C0' }}>
                    <Users className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#333333' }}>
                      Student Management
                    </h1>
                    <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
                      Managing students for {selectedDriver ? `Bus ${selectedDriver.busNumber}` : 'selected bus'}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={onLogout}
                variant="outline"
                className="flex items-center gap-2 border-2 hover:opacity-80"
                style={{ 
                  borderColor: '#E53935',
                  color: '#E53935',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-hidden">
            {selectedDriver ? (
              <div className="h-full flex flex-col">
                {/* Selected Bus Info Card - Fixed/Static */}
                <div className="p-6 flex-shrink-0">
                  <Card className="shadow-lg border-0" style={{ backgroundColor: '#FFFFFF' }}>
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {selectedDriver.busPhoto && (
                            <img 
                              src={selectedDriver.busPhoto} 
                              alt={`Bus ${selectedDriver.busNumber}`}
                              className="w-16 h-16 object-cover rounded border-2"
                              style={{ borderColor: '#1565C0' }}
                            />
                          )}
                          <div>
                            <CardTitle style={{ color: '#333333' }}>
                              Bus {selectedDriver.busNumber} - {selectedDriver.busPlate}
                            </CardTitle>
                            <CardDescription style={{ color: '#333333', opacity: 0.7 }}>
                              Driver: {selectedDriver.name} | Contact: {selectedDriver.contact}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              className="flex items-center gap-2 transition-all duration-200 hover:opacity-90"
                              style={{ 
                                backgroundColor: '#FFEB3B',
                                color: '#333333'
                              }}
                            >
                              <UserPlus className="w-4 h-4" />
                              Add Student Passenger
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
                            <DialogHeader className="pb-4">
                              <DialogTitle style={{ color: '#333333' }}>
                                Add Student to Bus {selectedDriver.busNumber}
                              </DialogTitle>
                              <DialogDescription style={{ color: '#333333', opacity: 0.7 }}>
                                Enter student details. Credentials will be generated when sending invitations.
                              </DialogDescription>
                            </DialogHeader>
                            <StudentForm />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                  </Card>
                </div>

                {/* Students List Container - Flexible */}
                <div className="flex-1 px-6 pb-6 overflow-hidden">
                  <Card className="shadow-lg border-0 h-full flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
                    {/* Student List Header - Fixed/Static */}
                    <CardHeader className="flex-shrink-0 p-6 border-b" style={{ borderColor: '#E53935' }}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#1565C0' }}>
                          <Users className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                        </div>
                        <div>
                          <CardTitle style={{ color: '#333333' }}>
                            Student Passengers ({busStudents.length})
                          </CardTitle>
                          <CardDescription style={{ color: '#333333', opacity: 0.7 }}>
                            Students assigned to this bus
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {/* Student List Content - Scrollable with scroll bar on inside right edge */}
                    <CardContent className="flex-1 overflow-hidden p-0">
                      {busStudents.length === 0 ? (
                        <div className="flex items-center justify-center h-full p-6">
                          <div className="text-center w-full">
                            <div className="inline-flex items-center justify-center p-4 rounded-full mb-4" style={{ backgroundColor: '#F5F5F5' }}>
                              <AlertCircle className="w-8 h-8 mx-auto" style={{ color: '#333333', opacity: 0.5 }} />
                            </div>
                            <h3 className="font-medium mb-2" style={{ color: '#333333' }}>
                              No students allotted to this bus
                            </h3>
                            <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
                              Click "Add Student Passenger" to assign students to this bus.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full relative">
                          <div className="h-full overflow-y-auto">
                            <div className="p-6 pr-10">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {busStudents.map((student) => (
                                  <Card key={student.id} className="border hover:shadow-md transition-shadow" style={{ borderColor: '#E53935' }}>
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="w-10 h-10 border-2" style={{ borderColor: '#1565C0' }}>
                                          <AvatarFallback style={{ backgroundColor: '#1565C0', color: '#FFFFFF' }}>
                                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <h4 className="font-medium" style={{ color: '#333333' }}>
                                            {student.name}
                                          </h4>
                                          <p className="text-xs" style={{ color: '#333333', opacity: 0.7 }}>
                                            PRN: {student.prn}
                                          </p>
                                        </div>
                                        {student.credentialsGenerated && (
                                          <div className="text-green-600 text-xs">
                                            <CheckCircle className="w-4 h-4" />
                                          </div>
                                        )}
                                      </div>

                                      <div className="space-y-1 text-xs" style={{ color: '#333333' }}>
                                        <p><span className="font-medium">Gender:</span> {student.gender}</p>
                                        <p><span className="font-medium">Email:</span> {student.email}</p>
                                        {student.credentialsGenerated && (
                                          <p className="text-green-600 font-medium">✓ Invitation Sent</p>
                                        )}
                                      </div>

                                      <div className="flex gap-2 mt-3">
                                        <Dialog open={isEditDialogOpen && editingStudent?.id === student.id} onOpenChange={(open) => {
                                          if (!open) {
                                            setIsEditDialogOpen(false);
                                            setEditingStudent(null);
                                          }
                                        }}>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleEditStudent(student)}
                                              className="flex-1 border"
                                              style={{ 
                                                borderColor: '#1565C0',
                                                color: '#1565C0',
                                                backgroundColor: '#FFFFFF'
                                              }}
                                            >
                                              <Edit className="w-3 h-3 mr-1" />
                                              Edit
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
                                            <DialogHeader className="pb-4">
                                              <DialogTitle style={{ color: '#333333' }}>
                                                Edit Student Details
                                              </DialogTitle>
                                              <DialogDescription style={{ color: '#333333', opacity: 0.7 }}>
                                                Update student information for {editingStudent?.name}
                                              </DialogDescription>
                                            </DialogHeader>
                                            <StudentForm isEdit={true} />
                                          </DialogContent>
                                        </Dialog>

                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDeleteStudent(student)}
                                          className="border"
                                          style={{ 
                                            borderColor: '#E53935',
                                            color: '#E53935',
                                            backgroundColor: '#FFFFFF'
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="p-4 rounded-full mb-4" style={{ backgroundColor: '#F5F5F5' }}>
                    <Bus className="w-8 h-8 mx-auto" style={{ color: '#333333', opacity: 0.5 }} />
                  </div>
                  <h3 className="font-medium mb-2" style={{ color: '#333333' }}>
                    Select a Bus
                  </h3>
                  <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
                    Choose a bus from the side panel to manage its students.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Invitations Button - Fixed position above footer */}
      {selectedDriver && studentsWithoutCredentials.length > 0 && (
        <div className="fixed bottom-20 right-8 z-50">
          <Button
            onClick={handleSendInvitations}
            className="flex items-center gap-2 shadow-lg transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: '#FFEB3B',
              color: '#333333'
            }}
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