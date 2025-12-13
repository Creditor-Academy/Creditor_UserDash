import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Organizations from './pages/Organizations';
import Users from './pages/Users';
import SupportTicket from './pages/SupportTicket';
import Billing from './pages/Billing';
import UserProfile from './pages/UserProfile';
import AdminLayout from './components/AdminLayout';
import './superadmin.css';

export default function SuperAdminApp() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for navigation events from sidebar
    const handleNavigate = event => {
      const page = event.detail.page;
      navigate(`/superadmin/${page}`);
    };

    window.addEventListener('navigatePage', handleNavigate);
    return () => window.removeEventListener('navigatePage', handleNavigate);
  }, [navigate]);

  return (
    <div className="superadmin-container">
      <ThemeProvider>
        <AdminLayout>
          <Routes>
            <Route path="/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/users" element={<Users />} />
            <Route path="/supportticket" element={<SupportTicket />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/" element={<SuperAdminDashboard />} />
          </Routes>
        </AdminLayout>
      </ThemeProvider>
    </div>
  );
}
