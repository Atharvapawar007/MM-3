import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bus, User, Phone, ArrowLeft, LogOut, Trash2 } from 'lucide-react';
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

interface DriverListPageProps {
  drivers: Driver[];
  onBack: () => void;
  onLogout: () => void;
  onDeleteDriver: (driverId: string) => void;
}

export function DriverListPage({ drivers, onBack, onLogout, onDeleteDriver }: DriverListPageProps) {
  const handleDeleteDriver = (driver: Driver) => {
    if (window.confirm(`Are you sure you want to delete driver ${driver.name}? This will also remove all students assigned to bus ${driver.busNumber}.`)) {
      onDeleteDriver(driver.id);
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
                  <User className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#333333' }}>
                    Allocated Drivers
                  </h1>
                  <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
                    View all driver-bus allocations
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

          {/* Driver Count */}
          <div className="mb-6">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#FFEB3B', color: '#333333' }}
            >
              <User className="w-4 h-4" />
              <span className="font-medium">
                {drivers.length} Driver{drivers.length !== 1 ? 's' : ''} Allocated
              </span>
            </div>
          </div>

          {/* Driver List */}
          {drivers.length === 0 ? (
            <Card className="shadow-lg border-0 text-center py-12" style={{ backgroundColor: '#FFFFFF' }}>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full" style={{ backgroundColor: '#F5F5F5' }}>
                    <User className="w-8 h-8" style={{ color: '#333333', opacity: 0.5 }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2" style={{ color: '#333333' }}>
                      No Drivers Allocated
                    </h3>
                    <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
                      Start by allocating drivers to buses from the allocation page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver, index) => (
                <Card key={driver.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow" style={{ backgroundColor: '#FFFFFF' }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16 border-2" style={{ borderColor: '#1565C0' }}>
                        {driver.photo ? (
                          <AvatarImage src={driver.photo} alt={driver.name} />
                        ) : (
                          <AvatarFallback style={{ backgroundColor: '#1565C0', color: '#FFFFFF' }}>
                            {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-medium" style={{ color: '#333333' }}>
                          {driver.name}
                        </h3>
                        <p className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
                          ID: {driver.number}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDriver(driver)}
                        className="p-2 border hover:bg-red-50"
                        style={{ 
                          borderColor: '#E53935',
                          color: '#E53935',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Driver Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4" style={{ color: '#E53935' }} />
                        <span className="text-sm" style={{ color: '#333333' }}>
                          {driver.contact}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4" style={{ color: '#E53935' }} />
                        <span className="text-sm capitalize" style={{ color: '#333333' }}>
                          {driver.gender}
                        </span>
                      </div>
                    </div>

                    {/* Bus Assignment */}
                    <div 
                      className="mt-4 p-3 rounded-lg border-l-4"
                      style={{ 
                        backgroundColor: '#F5F5F5',
                        borderLeftColor: '#1565C0'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Bus className="w-4 h-4" style={{ color: '#1565C0' }} />
                        <span className="font-medium text-sm" style={{ color: '#1565C0' }}>
                          Assigned Bus
                        </span>
                      </div>
                      
                      {/* Bus Photo */}
                      {driver.busPhoto && (
                        <div className="mb-2">
                          <img 
                            src={driver.busPhoto} 
                            alt={`Bus ${driver.busNumber}`}
                            className="w-full h-20 object-cover rounded border"
                            style={{ borderColor: '#1565C0' }}
                          />
                        </div>
                      )}
                      
                      <p className="text-sm" style={{ color: '#333333' }}>
                        <span className="font-medium">Plate:</span> {driver.busPlate}
                      </p>
                      <p className="text-sm" style={{ color: '#333333' }}>
                        <span className="font-medium">Number:</span> {driver.busNumber}
                      </p>
                    </div>

                    {/* Driver Badge */}
                    <div className="mt-4 flex justify-center">
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: '#FFEB3B',
                          color: '#333333'
                        }}
                      >
                        Active Driver #{index + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}