import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, classInfo, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div className="loader" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/join" replace />;
  }

  if (!classInfo) {
    return <Navigate to="/join" replace />;
  }

  return children;
}
