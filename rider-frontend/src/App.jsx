import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

import LandingPage from './pages/LandingPage';
import RiderDashboard from './pages/RiderDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Main Application Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected Role-Based Routes */}
        <Route 
          path="/rider/*" 
          element={
            <ProtectedRoute allowedRoles={['rider']}>
              <RiderDashboard />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default App;
