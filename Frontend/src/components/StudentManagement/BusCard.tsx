import { Bus, Users, Phone, User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import type { Bus as BusType } from '../../types';

interface BusCardProps {
  bus: BusType;
  isSelected: boolean;
  onSelect: (busId: string) => void;
  studentCount: number;
}

export function BusCard({ bus, isSelected, onSelect, studentCount }: BusCardProps) {
  const selectionClasses = isSelected
    ? 'ring-2 ring-primary bg-accent/10 border-primary shadow-elevated'
    : 'border-border hover:border-secondary/50 shadow-card';

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${selectionClasses}`}
      onClick={() => onSelect(bus.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {bus.busPhoto ? (
            <img 
              src={bus.busPhoto} 
              alt={`Bus ${bus.busNumber}`}
              className="w-12 h-12 object-cover rounded-lg border-2 border-primary"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-primary bg-primary/10">
              <Bus className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-medium text-foreground">
              Bus {bus.busNumber}
            </h3>
            <p className="text-sm text-muted-foreground">
              {bus.plateNumber}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {bus.driverName}
              </p>
              <p className="text-xs text-muted-foreground">
                Driver #{bus.driverId}
              </p>
            </div>
          </div>

          {bus.driverContact && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <p className="text-sm text-foreground">
                {bus.driverContact}
              </p>
            </div>
          )}

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
}