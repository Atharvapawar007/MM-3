import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertTriangle, CheckCircle, Lock, Loader2, Mail, Hash, Phone, Bus } from 'lucide-react';
import type { Driver } from '../../types';

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Driver>) => Promise<void>;
  driver: Driver | null;
  isLoading: boolean;
}

export default function DriverFormModal({ isOpen, onClose, onSubmit, driver, isLoading }: DriverFormModalProps) {
  const [formState, setFormState] = useState({
    fields: {
      name: driver?.name || '',
      driverId: driver?.driverId || '',
      gender: driver?.gender || '',
      email: driver?.email || '',
      phone: driver?.phone || '',
    },
    touched: {
      name: false,
      driverId: false,
      gender: false,
      email: false,
      phone: false,
    },
    errors: {
      name: '',
      driverId: '',
      gender: '',
      email: '',
      phone: '',
    }
  });

  useEffect(() => {
    setFormState({
      fields: {
        name: driver?.name || '',
        driverId: driver?.driverId || '',
        gender: driver?.gender || '',
        email: driver?.email || '',
        phone: driver?.phone || '',
      },
      touched: {
        name: false,
        driverId: false,
        gender: false,
        email: false,
        phone: false,
      },
      errors: {
        name: '',
        driverId: '',
        gender: '',
        email: '',
        phone: '',
      }
    });
  }, [driver, isOpen]);

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    if (name === 'driverId' && value.length < 2) {
      return 'Driver ID must be at least 2 characters';
    }
    if (name === 'phone' && !/^[0-9+\-() ]{7,}$/.test(value)) {
      return 'Please enter a valid contact number';
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
      touched: { name: true, driverId: true, gender: true, email: true, phone: true }
    }));

    const errors = {
      name: validateField('name', formState.fields.name),
      driverId: validateField('driverId', formState.fields.driverId),
      gender: validateField('gender', formState.fields.gender),
      email: validateField('email', formState.fields.email),
      phone: validateField('phone', formState.fields.phone),
    };

    setFormState(prev => ({ ...prev, errors }));

    if (Object.values(errors).some(Boolean)) return;

    // Map UI fields to backend expected fields
    const payload: Partial<Driver> & { number?: string; contact?: string } = {
      name: formState.fields.name,
      driverId: formState.fields.driverId,
      gender: formState.fields.gender,
      email: formState.fields.email,
      phone: formState.fields.phone,
      // Backend expects number/contact; we'll provide both shapes for safety
      // The API service will JSON.stringify as-is
      // @ts-ignore - allow extra fields for backend mapping
      number: formState.fields.driverId,
      // @ts-ignore
      contact: formState.fields.phone,
    } as any;

    await onSubmit(payload as any);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {driver ? 'Edit Driver Details' : 'Add Driver'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {driver ? `Update driver information for ${driver.name}` : 'Enter driver details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-destructive/10 border-l-4 border-destructive p-3 mb-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">This input system only supports copy-paste</p>
                <p className="text-xs text-destructive/80 mt-1">Due to technical limitations, please copy and paste text instead of typing character by character.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Driver Name <span className="text-destructive">*</span></Label>
                <Input id="name" name="name" type="text" placeholder="Enter full name" value={formState.fields.name} onChange={handleInputChange}
                  className={`border-2 border-border focus:border-primary focus:ring-primary transition-colors ${formState.touched.name && formState.errors.name ? 'border-destructive' : ''}`} />
                {formState.touched.name && formState.errors.name && (
                  <p className="mt-1 text-sm text-destructive">{formState.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverId" className="text-foreground">Driver Number/ID <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="driverId" name="driverId" type="text" placeholder="e.g., DRV123"
                    value={formState.fields.driverId} onChange={handleInputChange}
                    className={`border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors ${formState.touched.driverId && formState.errors.driverId ? 'border-destructive' : ''}`} />
                </div>
                {formState.touched.driverId && formState.errors.driverId && (
                  <p className="mt-1 text-sm text-destructive">{formState.errors.driverId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground">Gender <span className="text-destructive">*</span></Label>
                <Select value={formState.fields.gender} onValueChange={handleGenderChange}>
                  <SelectTrigger className={`border-2 border-border focus:border-primary focus:ring-primary transition-colors ${formState.touched.gender && formState.errors.gender ? 'border-destructive' : ''}`}>
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
                <Label htmlFor="email" className="text-foreground">Email ID <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" name="email" type="email" placeholder="driver@company.com"
                    value={formState.fields.email} onChange={handleInputChange}
                    className={`border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors ${formState.touched.email && formState.errors.email ? 'border-destructive' : ''}`} />
                </div>
                {formState.touched.email && formState.errors.email && (
                  <p className="mt-1 text-sm text-destructive">{formState.errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Contact Number <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" name="phone" type="text" placeholder="e.g., +1 234 567 8900"
                    value={formState.fields.phone} onChange={handleInputChange}
                    className={`border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors ${formState.touched.phone && formState.errors.phone ? 'border-destructive' : ''}`} />
                </div>
                {formState.touched.phone && formState.errors.phone && (
                  <p className="mt-1 text-sm text-destructive">{formState.errors.phone}</p>
                )}
              </div>

              {/* Read-only Bus info */}
              {driver?.bus && (
                <div className="mt-4 bg-primary/10 border-l-4 border-primary p-3 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bus className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm text-primary">Assigned Bus</span>
                    <Lock className="w-4 h-4 text-primary ml-1" />
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Plate:</span> {driver.bus.plateNumber}
                  </p>
                  {driver.bus.busNumber && (
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Number:</span> {driver.bus.busNumber}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="border-2 border-border hover:bg-muted">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {driver ? 'Update Driver' : 'Add Driver'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
