
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
