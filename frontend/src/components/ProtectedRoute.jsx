import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // If user is not logged in, redirect them to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user is logged in but tries to access a route they shouldn't,
    // redirect them to their specific dashboard based on their role
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'driver') return <Navigate to="/driver" replace />;
    if (role === 'rider') return <Navigate to="/rider" replace />;
    
    // Fallback if role is unrecognized
    return <Navigate to="/" replace />;
  }

  // If authenticated and has the right role, render the component
  return children;
};

export default ProtectedRoute;
