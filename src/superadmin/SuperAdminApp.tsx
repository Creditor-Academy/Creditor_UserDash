import { ThemeProvider } from './context/ThemeContext';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminLayout from './components/AdminLayout';
import './superadmin.css';

export default function SuperAdminApp() {
  return (
    <div className="superadmin-container">
      <ThemeProvider>
        <AdminLayout>
          <SuperAdminDashboard />
        </AdminLayout>
      </ThemeProvider>
    </div>
  );
}
