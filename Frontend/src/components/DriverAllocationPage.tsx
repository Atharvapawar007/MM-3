import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bus, User, Phone, LogOut, CheckCircle, Upload, Users, Camera, Loader2, RefreshCcw } from 'lucide-react';
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

export function DriverAllocationPage({ onLogout, onViewDrivers, onViewStudents, drivers, onAddDriver }: DriverAllocationPageProps) {
  const [busPlate, setBusPlate] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [busPhoto, setBusPhoto] = useState<string>('');
  const [driverName, setDriverName] = useState('');
  const [driverNumber, setDriverNumber] = useState('');
  const [driverGender, setDriverGender] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [driverPhoto, setDriverPhoto] = useState<string>('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!busPlate || !busNumber || !driverName || !driverNumber || !driverGender || !driverContact) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Retrieve userId from localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error('User ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    const newDriver = {
      name: driverName,
      number: driverNumber,
      gender: driverGender,
      contact: driverContact,
      photo: driverPhoto,
      busPlate: busPlate,
      busNumber: busNumber,
      busPhoto: busPhoto,
      userId: userId // Add the userId to the object
    };

    try {
      const response = await fetch('http://localhost:3000/api/drivers/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Send the JWT token
        },
        body: JSON.stringify(newDriver),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Driver successfully allocated to bus!');
        onAddDriver(data.driver); // Assuming API returns the created driver
        
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
      } else {
        toast.error(data.message || 'Failed to add driver. Please try again.');
      }
    } catch (error) {
      console.error('Add driver request failed:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Banner */}
      <Banner />

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary">
                <Bus className="w-6 h-6 text-primary-foreground text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-foreground">
                  Driver Bus Allocation
                </h1>
                <p className="text-sm text-muted-foreground">
                  Assign drivers to buses in your fleet
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={onViewDrivers}
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground transform transition-transform duration-300 
                hover:scale-110"
              >
                <Users className="w-4 h-4" />
                View Drivers ({drivers.length})
              </Button>

              <Button
                onClick={onViewStudents}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground transform transition-transform duration-300 
                hover:scale-110"
              >
                <User className="w-4 h-4 text-white" />
                <span className="text-white">Manage Students</span>
              </Button>

              <Button
                onClick={onLogout}
                variant="outline"
                className="flex items-center gap-2 border-2 border-red-500 text-red-500 hover:text-white hover:bg-red-500 transform transition-transform duration-300 
                hover:scale-110"
              >
                <LogOut className="w-4 h-4 hover:text-white" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bus Information Card */}
            <Card className="shadow-lg bg-gray-100 border border-black">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary">
                    <Bus className="w-5 h-5 text-primary-foreground text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-card-foreground">
                      Bus Information
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Enter the bus details for allocation
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Bus Photo Upload */}
                <div className="space-y-2">
                  <Label className="text-foreground">Bus Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border-2 border-primary flex items-center justify-center overflow-hidden">
                      {busPhoto ? (
                        <img
                          src={busPhoto}
                          alt="Bus photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground bg-blue-100">
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
                        className="flex items-center gap-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Bus Photo</span>
                      </Button>
                      <p className="text-xs mt-1 text-muted-foreground">
                        Max file size: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="busPlate" className="text-foreground">
                    Bus Plate Number *
                  </Label>
                  <Input
                    id="busPlate"
                    type="text"
                    placeholder="e.g., ABC-1234"
                    value={busPlate}
                    onChange={(e) => setBusPlate(e.target.value)}
                    required
                    className="border-2 border-border focus:border-primary focus:ring-primary transition-colors bg-input-background selection:text-white hover:border-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="busNumber" className="text-foreground">
                    Bus Number *
                  </Label>
                  <Input
                    id="busNumber"
                    type="text"
                    placeholder="e.g., B001"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    required
                    className="border-2 border-border focus:border-primary focus:ring-primary transition-colors bg-input-background selection:text-white hover:border-black"
                  />
                </div>

                <div className="bg-secondary/10 border-l-4 border-secondary p-4 rounded-r-lg bg-blue-100">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-secondary" />
                    <span className="font-medium text-secondary-foreground">
                      Bus Identification
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ensure the bus plate and number are accurate for proper
                    tracking.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information Card */}
            <Card className="shadow-lg bg-gray-100 border border-black">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <User className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-card-foreground">
                      Driver Information
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Enter the driver details to be assigned
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Driver Photo Upload */}
                <div className="space-y-2">
                  <Label className="text-foreground">Driver Photo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-accent bg-amber-100">
                      {driverPhoto ? (
                        <AvatarImage src={driverPhoto} alt="Driver photo" />
                      ) : (
                        <AvatarFallback className="bg-muted text-muted-foreground">
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
                        className="flex items-center gap-2 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </Button>
                      <p className="text-xs mt-1 text-muted-foreground">
                        Max file size: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverName" className="text-foreground">
                    Driver Name *
                  </Label>
                  <Input
                    id="driverName"
                    type="text"
                    placeholder="Enter full name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                    className="border-2 border-border focus:border-primary focus:ring-primary transition-colors bg-input-background selection:text-white hover:border-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverNumber" className="text-foreground">
                    Driver Number *
                  </Label>
                  <Input
                    id="driverNumber"
                    type="text"
                    placeholder="e.g., D001"
                    value={driverNumber}
                    onChange={(e) => setDriverNumber(e.target.value)}
                    required
                    className="border-2 border-border focus:border-primary focus:ring-primary transition-colors bg-input-background selection:text-white hover:border-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverGender" className="text-foreground">
                    Driver Gender *
                  </Label>
                  <Select value={driverGender} onValueChange={setDriverGender}>
                    <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-primary transition-colors bg-input-background hover:border-black">
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
                  <Label htmlFor="driverContact" className="text-foreground">
                    Driver Contact Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="driverContact"
                      type="tel"
                      placeholder="Enter phone number"
                      value={driverContact}
                      onChange={(e) => setDriverContact(e.target.value)}
                      required
                      className="border-2 border-border focus:border-primary focus:ring-primary pl-10 transition-colors bg-input-background selection:text-white hover:border-black"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Allocation Form */}
          <Card className="mt-8 shadow-lg bg-gray-100 border border-black">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-success">
                  <CheckCircle className="w-5 h-5 text-success-foreground" />
                </div>
                <CardTitle className="text-card-foreground">
                  Complete Allocation
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Review the information and submit to allocate the driver to the
                bus
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                  <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg bg-blue-100">
                    <h4 className="font-medium mb-2 text-primary">
                      Bus Details
                    </h4>
                    <p className="text-sm text-foreground">
                      Plate: {busPlate || "Not specified"} | Number:{" "}
                      {busNumber || "Not specified"}
                    </p>
                  </div>

                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg bg-amber-100">
                    <h4 className="font-medium mb-2 text-accent">
                      Driver Details
                    </h4>
                    <p className="text-sm text-foreground">
                      {driverName || "Not specified"} |{" "}
                      {driverNumber || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground transform transition-transform duration-300 
                    hover:scale-110"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2 text-white " />
                    )}
                    <span className="text-white">Allocate Driver to Bus</span>
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
