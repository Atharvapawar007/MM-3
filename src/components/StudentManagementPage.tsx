import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
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
  Send,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Banner } from './Banner';
import { Footer } from './Footer';

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

  const resetForm = () => {
    setStudentName('');
    setStudentPRN('');
    setStudentGender('');
    setStudentEmail('');
    setEditingStudent(null);
  };

  const handleAddStudent = () => {
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
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentPRN(student.prn);
    setStudentGender(student.gender);
    setStudentEmail(student.email);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStudent = () => {
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
  };

  const handleDeleteStudent = (student: Student) => {
    onDeleteStudent(student.id);
    toast.success(`${student.name} has been removed from the bus`);
  };

  const getStudentsForBus = (busId: string) => {
    return students.filter(student => student.busId === busId);
  };

  const handleSendInvitations = () => {
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
  };

  const selectedDriver = drivers.find(d => d.id === selectedBusId);
  const busStudents = getStudentsForBus(selectedBusId);
  const studentsWithoutCredentials = busStudents.filter(s => !s.credentialsGenerated);

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
                className="flex items-center gap-2 border-blue-500 text-blue-500 transform transition-transform duration-300 ease-in-out 
               hover:scale-105 hover:bg-blue-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Allocation
              </Button>
              
              <Button
                onClick={onLogout}
                variant="outline"
                className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            <Card className="shadow-card border-0 text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  {/* Improved circular alert icon container */}
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Bus className="w-6 h-6 text-muted-foreground" />
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
    <div className="flex h-screen flex-col bg-background">
      <Banner />
      
      {/* Main header with navigation */}
      <div className="flex-shrink-0 p-6 border-b bg-card shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-100 transform transition-transform duration-300 ease-in-out 
               hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Allocation
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
                <Users className="w-6 h-6 text-primary-foreground text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-foreground">
                  Student Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Managing students for {selectedDriver ? `Bus ${selectedDriver.busNumber}` : 'selected bus'}
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50 transform transition-transform duration-300 ease-in-out 
               hover:scale-105"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content area with flex layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Panel - Buses & Drivers */}
        <div className="w-1/4 h-full border-r bg-card">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-card border-b p-4 z-10 shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary">
                <Bus className="w-5 h-5 text-primary-foreground text-white" />
              </div>
              <div>
                <h2 className="font-medium text-foreground">
                  Buses & Drivers
                </h2>
                <p className="text-sm text-muted-foreground">
                  {drivers.length} buses allocated
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Bus List */}
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-3 pb-20">
              {drivers.map((driver) => {
                const studentCount = getStudentsForBus(driver.id).length;
                const isSelected = selectedBusId === driver.id;
                
                return (
                  <Card 
                    key={driver.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-elevated border ${
                      isSelected 
                        ? 'ring-2 ring-primary bg-accent/10 border-primary shadow-elevated' 
                        : 'border-border hover:border-secondary/50 shadow-card'
                    }`}
                    onClick={() => setSelectedBusId(driver.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {driver.busPhoto ? (
                          <img 
                            src={driver.busPhoto} 
                            alt={`Bus ${driver.busNumber}`}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-primary"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-primary bg-primary/10">
                            <Bus className="w-6 h-6 text-primary" />
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
                          <User className="w-4 h-4 text-primary" />
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
                          <Phone className="w-4 h-4 text-primary" />
                          <p className="text-sm text-foreground">
                            {driver.contact}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <p className="text-sm text-foreground">
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

        {/* Right Content Area - Students */}
        <div className="flex-1 h-full">
          {selectedDriver ? (
            <div className="flex flex-col h-full">
              {/* Selected Bus Info - Fixed */}
              <div className="flex-shrink-0 p-6">
                <Card className="shadow-lg border border-black">
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {selectedDriver.busPhoto && (
                          <img 
                            src={selectedDriver.busPhoto} 
                            alt={`Bus ${selectedDriver.busNumber}`}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-primary"
                          />
                        )}
                        <div>
                          <CardTitle className="text-foreground">
                            Bus {selectedDriver.busNumber} - {selectedDriver.busPlate}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Driver: {selectedDriver.name} | Contact: {selectedDriver.contact}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground transition-colors border border-black transform transition-transform duration-300 ease-in-out 
               hover:scale-105"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Student Passenger
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Students List with Sticky Header */}
              {/* <div className="flex-1 overflow-hidden"> */}
                {/* Sticky Header */}
                {/* <div className=" top-0 bg-card border-b p-6 z-10 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary">
                      <Users className="w-5 h-5 text-primary-foreground text-white" />
                    </div>
                    <div>
                      <h2 className="font-medium text-foreground">
                        Student Passengers ({busStudents.length})
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Students assigned to this bus
                      </p>
                    </div>
                  </div>
                </div> */}
                
                {/* Scrollable Student Content */}
                <div className="h-full overflow-y-auto">
                  {busStudents.length === 0 ? (
                    <div className="flex justify-center h-full p-6">
                      <div className="text-center py-10">
                        {/* Improved circular alert icon container */}
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium mb-2 text-foreground">
                          No students allotted to this bus
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Click "Add Student Passenger" to assign students to this bus.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 pb-20">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {busStudents.map((student) => (
                          <Card key={student.id} className="border border-black shadow-lg transform transition-transform duration-300 ease-in-out 
               hover:scale-105">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <Avatar className="w-10 h-10 border-2 border-primary">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-white">
                                    {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                                <p className="text-foreground"><span className="font-medium">Gender:</span> {student.gender}</p>
                                <p className="text-foreground"><span className="font-medium">Email:</span> {student.email}</p>
                                {student.credentialsGenerated && (
                                  <p className="text-success font-medium">✓ Invitation Sent</p>
                                )}
                              </div>

                              <div className="flex gap-2 mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditStudent(student)}
                                  className="flex-1 border-secondary text-secondary hover:bg-blue-50"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteStudent(student)}
                                  className="border-red-500 text-red-500 hover:bg-red-50"
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
              {/* </div> */}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {/* Improved circular alert icon container */}
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Bus className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2 text-foreground">
                  Select a Bus
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a bus from the side panel to manage its students.
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
              Enter student details. Credentials will be generated when sending invitations.
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
                  <p className="text-xs text-red-500 mt-1">
                    Due to technical limitations, please copy and paste text instead of typing character by character.
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
                className="border-2 border-border focus:border-primary focus:ring-primary transition-colors"
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
                className="border-2 border-border focus:border-primary focus:ring-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentGender" className="text-foreground">
                Gender *
              </Label>
              <Select value={studentGender} onValueChange={setStudentGender}>
                <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-primary transition-colors">
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
                  className="border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors"
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStudent}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2 text-white" />
                <span className="text-white">Add Student</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
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
                    Due to technical limitations, please copy and paste text instead of typing character by character.
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
                className="border-2 border-border focus:border-primary focus:ring-primary transition-colors"
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
                className="border-2 border-border focus:border-primary focus:ring-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStudentGender" className="text-foreground">
                Gender *
              </Label>
              <Select value={studentGender} onValueChange={setStudentGender}>
                <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-primary transition-colors">
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
                  className="border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors"
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStudent}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Update Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Invitations Button - Fixed position above footer */}
      {selectedDriver && studentsWithoutCredentials.length > 0 && (
        <div className="fixed bottom-20 right-8 z-50">
          <Button
            onClick={handleSendInvitations}
            className="flex items-center gap-2 shadow-elevated bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            Send Invitations ({studentsWithoutCredentials.length})
          </Button>
        </div>
      )}
      
      <Footer/>
    </div>
  );
}