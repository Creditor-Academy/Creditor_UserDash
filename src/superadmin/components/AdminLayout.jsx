import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function AdminLayout({ children }) {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 overflow-y-auto pt-24 pl-20 p-4 sm:p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
