import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { User, Edit, Trash2, KeyRound, Loader2 } from 'lucide-react';
import type { Student } from '../../types';

interface StudentCardProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  onSendCredentials: (studentId: string) => void;
  isActionLoading: boolean;
}

export function StudentCard({ 
  student, 
  onEdit, 
  onDelete, 
  onSendCredentials, 
  isActionLoading 
}: StudentCardProps) {
  return (
    <Card className="transition-all duration-200 bg-card shadow-sm hover:shadow-md">
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="w-12 h-12 border-2 border-primary/20">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
              <User className="w-6 h-6" />
            </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{student.name}</h4>
          <p className="text-sm text-muted-foreground">PRN: {student.prn}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onEdit} className="w-8 h-8">
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={onDelete} 
            disabled={isActionLoading}
            className="w-8 h-8"
          >
            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onSendCredentials(student.id)} 
            disabled={isActionLoading}
            className="w-8 h-8"
          >
            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
