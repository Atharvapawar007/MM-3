import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Loader2, Trash2, Phone, User, Bus } from 'lucide-react';
import type { Driver } from '../../types';

interface DriverCardProps {
  driver: Driver;
  index: number;
  onSelect: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  isDeleting?: boolean;
}

export function DriverCard({ driver, index, onSelect, onDelete, isDeleting = false }: DriverCardProps) {
  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

    return (
    <Card 
      key={driver.id}
      onClick={() => onSelect(driver)}
      className="shadow-card border-0 hover:shadow-elevated transition-all duration-200 bg-card cursor-pointer"
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-primary">
            {driver.photoUrl ? (
              <AvatarImage src={driver.photoUrl} alt={driver.name} />
            ) : (
              <AvatarFallback className="bg-primary text-white">
                {getInitials(driver.name)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-medium text-foreground">
              {driver.name || 'N/A'}
            </h3>
            <p className="text-sm text-muted-foreground">
              ID: {driver.driverId || 'N/A'}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(driver); }}
            className="p-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-secondary" />
            <span className="text-sm text-foreground">
              {driver.phone || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-secondary" />
            <span className="text-sm capitalize text-foreground">
              {driver.gender || 'N/A'}
            </span>
          </div>
        </div>

        {driver.bus && driver.bus.plateNumber ? (
          <div className="mt-4 bg-primary/10 border-l-4 border-primary p-3 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bus className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-primary">
                Assigned Bus
              </span>
            </div>
            <p className="text-sm text-foreground">
              <span className="font-medium">Plate:</span> {driver.bus.plateNumber}
            </p>
            {driver.bus.busNumber && 
              <p className="text-sm text-foreground">
                <span className="font-medium">Number:</span> {driver.bus.busNumber}
              </p>
            }
          </div>
        ) : (
          <div className="mt-4 text-center text-muted-foreground py-4 border-t">No bus assigned</div>
        )}

        <div className="mt-4 flex justify-center">
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
            Active Driver #{index + 1}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
