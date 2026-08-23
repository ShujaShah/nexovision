import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-white">Nexovision AI Portal</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[var(--bg-primary)]"></span>
        </button>
      </div>
    </div>
  );
};

const Layout = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <Outlet />; // If not logged in, just render the child (e.g. Login)

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
