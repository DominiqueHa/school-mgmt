import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
}

const menuItems: Record<string, MenuItem[]> = {
  admin: [
    { path: '/dashboard', icon: '📊', label: 'Tableau de bord' },
    { path: '/users', icon: '👥', label: 'Utilisateurs' },
    { path: '/students', icon: '🎒', label: 'Élèves' },
    { path: '/teachers', icon: '👨‍🏫', label: 'Enseignants' },
    { path: '/structure', icon: '🏫', label: 'Structure' },
    { path: '/staff', icon: '👷', label: 'Personnel' },
  ],
  director: [
    { path: '/dashboard', icon: '📊', label: 'Tableau de bord' },
    { path: '/users', icon: '👥', label: 'Utilisateurs' },
    { path: '/students', icon: '🎒', label: 'Élèves' },
    { path: '/teachers', icon: '👨‍🏫', label: 'Enseignants' },
    { path: '/structure', icon: '🏫', label: 'Structure' },
    { path: '/staff', icon: '👷', label: 'Personnel' },
  ],
  deputy_director: [
    { path: '/dashboard', icon: '📊', label: 'Tableau de bord' },
    { path: '/students', icon: '🎒', label: 'Élèves' },
    { path: '/teachers', icon: '👨‍🏫', label: 'Enseignants' },
    { path: '/structure', icon: '🏫', label: 'Structure' },
  ],
  teacher: [
    { path: '/dashboard', icon: '📊', label: 'Tableau de bord' },
    { path: '/students', icon: '🎒', label: 'Élèves' },
  ],
  student: [
    { path: '/dashboard', icon: '📊', label: 'Mon espace' },
  ],
  parent: [
    { path: '/dashboard', icon: '📊', label: 'Mon espace' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const items = menuItems[user?.role ?? ''] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-lg">🎓</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">School Mgmt</p>
            <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-gray-400 text-xs truncate">{user?.username}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
