import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bus, User, Phone, LogOut, CheckCircle, Upload, Users, Camera, Trash2 } from 'lucide-react';
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

interface DriverAllocationPageProps {
  onLogout: () => void;
  onViewDrivers: () => void;
  onViewStudents: () => void;
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
  onDeleteDriver: (driverId: string) => void;
}

export function DriverAllocationPage({ onLogout, onViewDrivers, onViewStudents, drivers, onAddDriver, onDeleteDriver }: DriverAllocationPageProps) {
  const [busPlate, setBusPlate] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [busPhoto, setBusPhoto] = useState<string>('');
  const [driverName, setDriverName] = useState('');
  const [driverNumber, setDriverNumber] = useState('');
  const [driverGender, setDriverGender] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [driverPhoto, setDriverPhoto] = useState<string>('');
  const driverFileInputRef = useRef<HTMLInputElement>(null);
  const busFileInputRef = useRef<HTMLInputElement>(null);

  const handleDriverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setDriverPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBusPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setBusPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!busPlate || !busNumber || !driverName || !driverNumber || !driverGender || !driverContact) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check for duplicate driver number
    const existingDriver = drivers.find(d => d.number === driverNumber);
    if (existingDriver) {
      toast.error('Driver number already exists');
      return;
    }

    // Check for duplicate bus assignment
    const existingBus = drivers.find(d => d.busNumber === busNumber || d.busPlate === busPlate);
    if (existingBus) {
      toast.error('This bus is already assigned to another driver');
      return;
    }

    // Create new driver
    const newDriver: Driver = {
      id: Date.now().toString(),
      name: driverName,
      number: driverNumber,
      gender: driverGender,
      contact: driverContact,
      photo: driverPhoto,
      busPlate: busPlate,
      busNumber: busNumber,
      busPhoto: busPhoto
    };
    
    onAddDriver(newDriver);
    toast.success('Driver successfully allocated to bus!');
    
    // Reset form
    setBusPlate('');
    setBusNumber('');
    setBusPhoto('');
    setDriverName('');
    setDriverNumber('');
    setDriverGender('');
    setDriverContact('');
    setDriverPhoto('');
    if (driverFileInputRef.current) {
      driverFileInputRef.current.value = '';
    }
    if (busFileInputRef.current) {
      busFileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Banner */}
      <Banner />
      
      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: '#1565C0' }}>
                <Bus className="w-6 h-6" style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#333333' }}>
                  Driver Bus Allocation
                </h1>
                <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
                  Assign drivers to buses in your fleet
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={onViewDrivers}
                className="flex items-center gap-2 transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: '#FFEB3B',
                  color: '#333333'
                }}
              >
                <Users className="w-4 h-4" />
                View Drivers ({drivers.length})
              </Button>

              <Button
                onClick={onViewStudents}
                className="flex items-center gap-2 transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: '#1565C0',
                  color: '#FFFFFF'
                }}
              >
                <User className="w-4 h-4" />
                Manage Students
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
          </div>

          {/* Form Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bus Information Card */}
            <Card className="shadow-lg border-0" style={{ backgroundColor: '#FFFFFF' }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#1565C0' }}>
                    <Bus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <CardTitle style={{ color: '#333333' }}>Bus Information</CardTitle>
                    <CardDescription style={{ color: '#333333', opacity: 0.7 }}>
                      Enter the bus details for allocation
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Bus Photo Upload */}
                <div className="space-y-2">
                  <Label style={{ color: '#333333' }}>
                    Bus Photo
                  </Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-lg border-2 flex items-center justify-center overflow-hidden"
                      style={{ borderColor: '#1565C0' }}
                    >
                      {busPhoto ? (
                        <img 
                          src={busPhoto} 
                          alt="Bus photo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: '#F5F5F5', color: '#333333' }}
                        >
                          <Bus className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <input
                        ref={busFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBusPhotoUpload}
                        className="hidden"
                        id="busPhoto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => busFileInputRef.current?.click()}
                        className="flex items-center gap-2 border-2 hover:opacity-80"
                        style={{ 
                          borderColor: '#1565C0',
                          color: '#1565C0',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Bus Photo
                      </Button>
                      <p className="text-xs mt-1" style={{ color: '#333333', opacity: 0.7 }}>
                        Max file size: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="busPlate" style={{ color: '#333333' }}>
                    Bus Plate Number *
                  </Label>
                  <Input
                    id="busPlate"
                    type="text"
                    placeholder="e.g., ABC-1234"
                    value={busPlate}
                    onChange={(e) => setBusPlate(e.target.value)}
                    className="border-2 focus:ring-2 transition-all"
                    style={{ 
                      borderColor: '#E53935',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="busNumber" style={{ color: '#333333' }}>
                    Bus Number *
                  </Label>
                  <Input
                    id="busNumber"
                    type="text"
                    placeholder="e.g., B001"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    className="border-2 focus:ring-2 transition-all"
                    style={{ 
                      borderColor: '#E53935',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                <div 
                  className="p-4 rounded-lg border-l-4"
                  style={{ 
                    backgroundColor: '#FFEB3B',
                    borderLeftColor: '#1565C0',
                    color: '#333333'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4" style={{ color: '#1565C0' }} />
                    <span className="font-medium">Bus Identification</span>
                  </div>
                  <p className="mt-1 text-xs opacity-80">
                    Ensure the bus plate and number are accurate for proper tracking.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information Card */}
            <Card className="shadow-lg border-0" style={{ backgroundColor: '#FFFFFF' }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#E53935' }}>
                    <User className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <CardTitle style={{ color: '#333333' }}>Driver Information</CardTitle>
                    <CardDescription style={{ color: '#333333', opacity: 0.7 }}>
                      Enter the driver details to be assigned
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Driver Photo Upload */}
                <div className="space-y-2">
                  <Label style={{ color: '#333333' }}>
                    Driver Photo
                  </Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2" style={{ borderColor: '#E53935' }}>
                      {driverPhoto ? (
                        <AvatarImage src={driverPhoto} alt="Driver photo" />
                      ) : (
                        <AvatarFallback style={{ backgroundColor: '#F5F5F5', color: '#333333' }}>
                          <Camera className="w-6 h-6" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1">
                      <input
                        ref={driverFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleDriverPhotoUpload}
                        className="hidden"
                        id="driverPhoto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => driverFileInputRef.current?.click()}
                        className="flex items-center gap-2 border-2 hover:opacity-80"
                        style={{ 
                          borderColor: '#E53935',
                          color: '#E53935',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </Button>
                      <p className="text-xs mt-1" style={{ color: '#333333', opacity: 0.7 }}>
                        Max file size: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverName" style={{ color: '#333333' }}>
                    Driver Name *
                  </Label>
                  <Input
                    id="driverName"
                    type="text"
                    placeholder="Enter full name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="border-2 focus:ring-2 transition-all"
                    style={{ 
                      borderColor: '#E53935',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverNumber" style={{ color: '#333333' }}>
                    Driver Number *
                  </Label>
                  <Input
                    id="driverNumber"
                    type="text"
                    placeholder="e.g., D001"
                    value={driverNumber}
                    onChange={(e) => setDriverNumber(e.target.value)}
                    className="border-2 focus:ring-2 transition-all"
                    style={{ 
                      borderColor: '#E53935',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverGender" style={{ color: '#333333' }}>
                    Driver Gender *
                  </Label>
                  <Select value={driverGender} onValueChange={setDriverGender}>
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
                  <Label htmlFor="driverContact" style={{ color: '#333333' }}>
                    Driver Contact Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#333333', opacity: 0.5 }} />
                    <Input
                      id="driverContact"
                      type="tel"
                      placeholder="Enter phone number"
                      value={driverContact}
                      onChange={(e) => setDriverContact(e.target.value)}
                      className="border-2 focus:ring-2 transition-all pl-10"
                      style={{ 
                        borderColor: '#E53935',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Allocation Form */}
          <Card className="mt-8 shadow-lg border-0" style={{ backgroundColor: '#FFFFFF' }}>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFEB3B' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#333333' }} />
                </div>
                <CardTitle style={{ color: '#333333' }}>Complete Allocation</CardTitle>
              </div>
              <CardDescription style={{ color: '#333333', opacity: 0.7 }}>
                Review the information and submit to allocate the driver to the bus
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: '#F5F5F5',
                      borderColor: '#1565C0'
                    }}
                  >
                    <h4 className="font-medium mb-2" style={{ color: '#1565C0' }}>Bus Details</h4>
                    <p className="text-sm" style={{ color: '#333333' }}>
                      Plate: {busPlate || 'Not specified'} | Number: {busNumber || 'Not specified'}
                    </p>
                  </div>
                  
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: '#F5F5F5',
                      borderColor: '#E53935'
                    }}
                  >
                    <h4 className="font-medium mb-2" style={{ color: '#E53935' }}>Driver Details</h4>
                    <p className="text-sm" style={{ color: '#333333' }}>
                      {driverName || 'Not specified'} | {driverNumber || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="px-8 py-3 transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: '#1565C0',
                      color: '#FFFFFF'
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Allocate Driver to Bus
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}