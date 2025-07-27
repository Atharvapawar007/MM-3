import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bus, User, Phone, ArrowLeft, LogOut, Trash2 } from 'lucide-react';
import { Banner } from './Banner';
import { Footer } from './Footer';
import { toast } from 'sonner';

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
      toast.success(`Driver ${driver.name} and associated student data have been deleted.`);
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
              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2 border-2 border-secondary text-secondary hover:bg-blue-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Allocation
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary">
                  <User className="w-6 h-6 text-primary-foreground text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-foreground">
                    Allocated Drivers
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    View all driver-bus allocations
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex items-center gap-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-red-500-foreground"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Driver Count */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground">
              <User className="w-4 h-4" />
              <span className="font-medium">
                {drivers.length} Driver{drivers.length !== 1 ? 's' : ''} Allocated
              </span>
            </div>
          </div>

          {/* Driver List */}
          {drivers.length === 0 ? (
            <Card className="shadow-card border-0 text-center py-12 bg-card">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">
                      No Drivers Allocated
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Start by allocating drivers to buses from the allocation page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver, index) => (
                <Card key={driver.id} className="shadow-card border-0 hover:shadow-elevated transition-all duration-200 bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16 border-2 border-primary">
                        {driver.photo ? (
                          <AvatarImage src={driver.photo} alt={driver.name} />
                        ) : (
                          <AvatarFallback className="bg-primary text-white">
                            {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {driver.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {driver.number}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDriver(driver)}
                        className="p-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-red-500-foreground transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Driver Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-foreground">
                          {driver.contact}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-secondary" />
                        <span className="text-sm capitalize text-foreground">
                          {driver.gender}
                        </span>
                      </div>
                    </div>

                    {/* Bus Assignment */}
                    <div className="mt-4 bg-blue-500/10 border-l-4 border-primary p-3 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bus className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm text-primary">
                          Assigned Bus
                        </span>
                      </div>
                      
                      {/* Bus Photo */}
                      {driver.busPhoto && (
                        <div className="mb-2">
                          <img 
                            src={driver.busPhoto} 
                            alt={`Bus ${driver.busNumber}`}
                            className="w-full h-20 object-cover rounded border border-primary"
                          />
                        </div>
                      )}
                      
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Plate:</span> {driver.busPlate}
                      </p>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Number:</span> {driver.busNumber}
                      </p>
                    </div>

                    {/* Driver Badge */}
                    <div className="mt-4 flex justify-center">
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
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