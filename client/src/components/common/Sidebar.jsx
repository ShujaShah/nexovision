import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Users, FileText, Image, LogOut, Settings } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Patients', path: '/patients', icon: <Users size={20} /> },
    { name: 'Scans', path: '/scans', icon: <Image size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
  ];

  if (user?.role === 'clinic_admin' || user?.role === 'admin') {
    navItems.push({ name: 'Clinic Settings', path: '/settings', icon: <Settings size={20} /> });
  }

  return (
    <div className="w-64 h-screen bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-[var(--accent-primary)] font-bold text-xl tracking-tight">
          <img src="/favicon.png" alt="Nexovision Logo" className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1" />
          Nexovision <span className="text-purple-400 font-mono text-sm ml-1">AI</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/10 text-[var(--accent-primary)] font-medium shadow-[inset_4px_0_0_0_var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-[var(--bg-elevated)]">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{user?.name || 'User'}</span>
            <span className="text-xs text-[var(--text-secondary)] capitalize">{user?.role || 'Doctor'}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
