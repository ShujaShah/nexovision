import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/common/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterClinicPage from './pages/RegisterClinicPage';
import DashboardPage from './pages/DashboardPage';
import ClinicSettingsPage from './pages/ClinicSettingsPage';

import UploadScanPage from './pages/UploadScanPage';
import ScansPage from './pages/ScansPage';
import ScanDetailPage from './pages/ScanDetailPage';
import ReportsPage from './pages/ReportsPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-clinic" element={<RegisterClinicPage />} />
          
          {/* Protected Routes inside Layout */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:id" element={<PatientDetailPage />} />
            <Route path="scans" element={<ScansPage />} />
            <Route path="scans/upload" element={<UploadScanPage />} />
            <Route path="scans/:id" element={<ScanDetailPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route 
              path="settings" 
              element={
                <ProtectedRoute allowedRoles={['clinic_admin', 'admin']}>
                  <ClinicSettingsPage />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2332',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} 
      />
    </AuthProvider>
  );
}

export default App;
