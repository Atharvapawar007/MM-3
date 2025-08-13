import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertTriangle, Loader2, Mail, User, Hash, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Student } from '../../types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: Omit<Student, 'id' | 'credentialsGenerated' | 'createdAt'>) => Promise<void>;
  student: Student | null;
  isLoading: boolean;
  busNumber?: string;
  busId: string;
}

export function StudentFormModal({ isOpen, onClose, onSubmit, student, isLoading, busNumber = 'B001', busId }: StudentFormModalProps) {
  const [formState, setFormState] = useState({
    fields: {
      name: student?.name || '',
      prn: student?.prn || '',
      gender: student?.gender || '',
      email: student?.email || '',
    },
    touched: {
      name: false,
      prn: false,
      gender: false,
      email: false,
    },
    errors: {
      name: '',
      prn: '',
      gender: '',
      email: '',
    }
  });

  useEffect(() => {
    setFormState({
      fields: {
        name: student?.name || '',
        prn: student?.prn || '',
        gender: student?.gender || '',
        email: student?.email || '',
      },
      touched: {
        name: false,
        prn: false,
        gender: false,
        email: false,
      },
      errors: {
        name: '',
        prn: '',
        gender: '',
        email: '',
      }
    });
  }, [student, isOpen]);

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setFormState(prev => ({
      ...prev,
      fields: { ...prev.fields, [name]: value },
      touched: { ...prev.touched, [name]: true },
      errors: { ...prev.errors, [name]: error }
    }));
  };

  const handleGenderChange = (value: string) => {
    const error = validateField('gender', value);
    
    setFormState(prev => ({
      ...prev,
      fields: { ...prev.fields, gender: value },
      touched: { ...prev.touched, gender: true },
      errors: { ...prev.errors, gender: error }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormState(prev => ({
      ...prev,
      touched: {
        name: true,
        prn: true,
        gender: true,
        email: true,
      }
    }));

    const errors = {
      name: validateField('name', formState.fields.name),
      prn: validateField('prn', formState.fields.prn),
      gender: validateField('gender', formState.fields.gender),
      email: validateField('email', formState.fields.email),
    };

    setFormState(prev => ({
      ...prev,
      errors
    }));

    if (Object.values(errors).some(error => error)) {
      toast.error('Please correct all errors before submitting.');
      return;
    }

    try {
      const userData = {
        ...formState.fields,
        busId,
        // NOTE: This line is a potential dependency issue. 
        // Consider passing userId as a prop from the parent.
        userId: localStorage.getItem('userId') as string
      };
      await onSubmit(userData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {student ? 'Edit Student Details' : `Add Student to Bus ${busNumber}`}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {student ? `Update student information for ${student.name}` : `Enter student details. Credentials will be generated when sending invitations.`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Input Warning Notice */}
          <div className="bg-destructive/10 border-l-4 border-destructive p-3 mb-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  This input system only supports copy-paste
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  Due to technical limitations, please copy and paste text instead of typing character by character.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Student Name <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="name" 
                  name="name" 
                  type="text"
                  placeholder="Enter full name" 
                  value={formState.fields.name} 
                  onChange={handleInputChange}
                  className={`border-2 border-border focus:border-primary focus:ring-primary transition-colors ${
                    formState.touched.name && formState.errors.name ? 'border-destructive' : ''
                  }`}
                />
                {formState.touched.name && formState.errors.name && (
                  <p className="mt-1 text-sm text-destructive">{formState.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prn" className="text-foreground">
                  PRN (Personal Registration Number) <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="prn" 
                  name="prn" 
                  type="text"
                  placeholder="e.g., 2023001234"
                  value={formState.fields.prn} 
                  onChange={handleInputChange}
                  className={`border-2 border-border focus:border-primary focus:ring-primary transition-colors ${
                    formState.touched.prn && formState.errors.prn ? 'border-destructive' : ''
                  }`}
                />
                {formState.touched.prn && formState.errors.prn && (
                  <p className="mt-1 text-sm text-destructive">{formState.errors.prn}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={formState.fields.gender}
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger className={`border-2 border-border focus:border-primary focus:ring-primary transition-colors ${
                    formState.touched.gender && formState.errors.gender ? 'border-destructive' : ''
                  }`}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formState.touched.gender && formState.errors.gender && (
                  <p className="mt-1 text-sm text-destructive">{formState.errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email ID <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="student@college.edu"
                    value={formState.fields.email} 
                    onChange={handleInputChange}
                    className={`border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors ${
                      formState.touched.email && formState.errors.email ? 'border-destructive' : ''
                    }`}
                  />
                </div>
                {formState.touched.email && formState.errors.email && (
                  <p className="mt-1 text-sm text-destructive">{formState.errors.email}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="border-2 border-border hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {student ? 'Update Student' : 'Add Student'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}