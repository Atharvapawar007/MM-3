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
  onSubmit: (studentData: Omit<Student, 'id' | 'credentialsGenerated' | 'createdAt' | 'busId'>) => Promise<void>;
  student: Student | null;
  isLoading: boolean;
  busNumber?: string;
}

export function StudentFormModal({ isOpen, onClose, onSubmit, student, isLoading, busNumber = 'B001' }: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    prn: '',
    gender: '',
    email: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        prn: student.prn,
        gender: student.gender,
        email: student.email,
      });
    } else {
      setFormData({ name: '', prn: '', gender: '', email: '' });
    }
  }, [student, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.prn || !formData.gender || !formData.email) {
      toast.error('Please fill in all required fields.');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Student to Bus {busNumber}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter student details. Credentials will be generated when sending invitations.
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
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    placeholder="Enter full name" 
                    className="border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prn" className="text-foreground">
                  PRN (Personal Registration Number) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="prn" 
                    name="prn" 
                    value={formData.prn} 
                    onChange={handleInputChange}
                    placeholder="e.g., 2023001234"
                    className="border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
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
                <Label htmlFor="email" className="text-foreground">
                  Email ID <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    placeholder="student@college.edu"
                    className="border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors"
                    required 
                  />
                </div>
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
                  Add Student
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
