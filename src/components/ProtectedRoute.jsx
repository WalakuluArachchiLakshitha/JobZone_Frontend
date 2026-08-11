import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const normalizeRole = (value) => {
  if (typeof value !== 'string') return 'candidate';

  const role = value.trim().toLowerCase();
  if (!role) return 'candidate';

  if (['candidate', 'jobseeker', 'job seeker', 'seeker', 'job-seeker'].includes(role)) {
    return 'candidate';
  }

  if (['employer', 'company', 'recruiter', 'hiring-manager', 'hiring_manager', 'hire'].includes(role)) {
    return 'employer';
  }

  return role;
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const normalizedRole = normalizeRole(role || localStorage.getItem('jobzoneUserRole') || 'candidate');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#004ae4' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === normalizedRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
