import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Edit, Trash2, KeyRound, Loader2, CheckCircle } from 'lucide-react';
import type { Student } from '../../types';

interface StudentCardProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  onSendCredentials: (studentPrn: string) => void;
  isActionLoading: boolean;
}

export function StudentCard({
  student,
  onEdit,
  onDelete,
  onSendCredentials,
  isActionLoading
}: StudentCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="border shadow-card hover:shadow-elevated transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{student.name}</h4>
            <p className="text-xs text-muted-foreground">PRN: {student.prn}</p>
          </div>
          {student.credentialsGenerated && (
            <div className="text-success">
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="space-y-1 text-xs mb-3">
          <p className="text-foreground"><span className="font-medium">Gender:</span> {student.gender}</p>
          <p className="text-foreground"><span className="font-medium">Email:</span> {student.email}</p>
          {student.credentialsGenerated && (
            <p className="text-success font-medium">✓ Invitation Sent</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 border-gray-300 text-slate-700 hover:bg-gray-200"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isActionLoading}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSendCredentials(student.prn)}
            disabled={student.credentialsGenerated || isActionLoading}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
