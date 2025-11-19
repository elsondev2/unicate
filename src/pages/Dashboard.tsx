import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userRole) {
    return <Navigate to="/auth" replace />;
  }

  return userRole === 'TEACHER' ? <TeacherDashboard /> : <StudentDashboard />;
}
