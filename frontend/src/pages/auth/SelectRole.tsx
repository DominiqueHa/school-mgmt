import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const roleConfig: Record<string, {
  label: string;
  icon: string;
  description: string;
  color: string;
  border: string;
  shape: string;
}> = {
  super_admin: {
    label: 'Super Admin',
    icon: '⚙️',
    description: 'Gestion technique du système',
    color: 'from-red-600/20 to-red-900/20',
    border: 'border-red-500/40 hover:border-red-400',
    shape: 'rounded-2xl',
  },
  director: {
    label: 'Directeur',
    icon: '🏛️',
    description: 'Administration générale de l\'école',
    color: 'from-purple-600/20 to-purple-900/20',
    border: 'border-purple-500/40 hover:border-purple-400',
    shape: 'rounded-3xl',
  },
  deputy_director: {
    label: 'Directeur Adjoint',
    icon: '📋',
    description: 'Assistance à la direction',
    color: 'from-blue-600/20 to-blue-900/20',
    border: 'border-blue-500/40 hover:border-blue-400',
    shape: 'rounded-2xl',
  },
  censor: {
    label: 'Censeur',
    icon: '🔍',
    description: 'Surveillance et discipline',
    color: 'from-yellow-600/20 to-yellow-900/20',
    border: 'border-yellow-500/40 hover:border-yellow-400',
    shape: 'rounded-[2rem]',
  },
  accountant: {
    label: 'Comptable',
    icon: '💰',
    description: 'Gestion financière',
    color: 'from-green-600/20 to-green-900/20',
    border: 'border-green-500/40 hover:border-green-400',
    shape: 'rounded-2xl',
  },
  teacher: {
    label: 'Enseignant',
    icon: '👨‍🏫',
    description: 'Cours et suivi des élèves',
    color: 'from-teal-600/20 to-teal-900/20',
    border: 'border-teal-500/40 hover:border-teal-400',
    shape: 'rounded-[2.5rem]',
  },
  parent: {
    label: 'Parent',
    icon: '👨‍👧',
    description: 'Suivi de mon enfant',
    color: 'from-orange-600/20 to-orange-900/20',
    border: 'border-orange-500/40 hover:border-orange-400',
    shape: 'rounded-3xl',
  },
  under_admin: {
    label: 'Personnel',
    icon: '👷',
    description: 'Personnel administratif',
    color: 'from-gray-600/20 to-gray-900/20',
    border: 'border-gray-500/40 hover:border-gray-400',
    shape: 'rounded-2xl',
  },
  admin: {
    label: 'Administrateur',
    icon: '🛡️',
    description: 'Gestion de l\'établissement',
    color: 'from-indigo-600/20 to-indigo-900/20',
    border: 'border-indigo-500/40 hover:border-indigo-400',
    shape: 'rounded-3xl',
  },
};

export default function SelectRole() {
  const { user, setActiveRole } = useAuthStore();
  const navigate = useNavigate();
  const roles = user?.roles || [];

  const handleSelectRole = async (role: string) => {
    try {
      const res = await api.post('/auth/select-role', { role });
      // Mettre à jour le token avec le rôle actif
      localStorage.setItem('token', res.data.token);
      setActiveRole(role);
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
          <span className="text-2xl">🎓</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bonjour, {user?.first_name} 👋
        </h1>
        <p className="text-gray-400 text-lg">
          Avec quel rôle souhaitez-vous continuer ?
        </p>
      </div>

      {/* Cards */}
      <div className={`grid gap-6 w-full max-w-5xl ${
        roles.length === 1 ? 'grid-cols-1 max-w-sm' :
        roles.length === 2 ? 'grid-cols-2 max-w-2xl' :
        roles.length === 3 ? 'grid-cols-3' :
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      }`}>
        {roles.map((role) => {
          const config = roleConfig[role] || {
            label: role,
            icon: '👤',
            description: 'Accès utilisateur',
            color: 'from-gray-600/20 to-gray-900/20',
            border: 'border-gray-500/40 hover:border-gray-400',
            shape: 'rounded-2xl',
          };

          return (
            <button
              key={role}
              onClick={() => handleSelectRole(role)}
              className={`
                group relative flex flex-col items-center justify-center
                bg-gradient-to-br ${config.color}
                border-2 ${config.border} ${config.shape}
                p-8 min-h-[220px] w-full
                transition-all duration-300
                hover:scale-105 hover:shadow-2xl
                focus:outline-none
              `}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-inherit blur-xl bg-white/5" />

              {/* Icon */}
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {config.icon}
              </div>

              {/* Label */}
              <h2 className="text-white font-bold text-xl mb-2 text-center">
                {config.label}
              </h2>

              {/* Description */}
              <p className="text-gray-400 text-sm text-center leading-relaxed">
                {config.description}
              </p>

              {/* Arrow */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-sm font-medium">Continuer →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-gray-600 text-sm mt-12">
        Identifiant : <span className="text-gray-400 font-mono">{user?.username}</span>
      </p>
    </div>
  );
}
