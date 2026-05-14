import { useState, useEffect } from 'react';
import api from '../../services/api';
import CreateUserModal from './CreateUserModal';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  director: 'Directeur',
  deputy_director: 'Directeur Adjoint',
  censor: 'Censeur',
  accountant: 'Comptable',
  teacher: 'Enseignant',
  student: 'Élève',
  parent: 'Parent',
  under_admin: 'Personnel',
  admin: 'Admin',
};

const roleColors: Record<string, string> = {
  director: 'bg-purple-500/20 text-purple-400',
  deputy_director: 'bg-blue-500/20 text-blue-400',
  censor: 'bg-yellow-500/20 text-yellow-400',
  accountant: 'bg-green-500/20 text-green-400',
  teacher: 'bg-teal-500/20 text-teal-400',
  student: 'bg-blue-500/20 text-blue-400',
  parent: 'bg-orange-500/20 text-orange-400',
  under_admin: 'bg-gray-500/20 text-gray-400',
  admin: 'bg-red-500/20 text-red-400',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  suspended: 'bg-red-500/20 text-red-400',
  pending: 'bg-orange-500/20 text-orange-400',
};

const statusLabels: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  suspended: 'Suspendu',
  pending: 'En attente',
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} ? Cette action est irréversible.`)) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!confirm(`Réinitialiser le mot de passe de ${name} ?`)) return;
    const res = await api.post(`/users/${id}/reset-password`);
    alert(`Mot de passe réinitialisé : ${res.data.temporary_password}`);
  };

  const filtered = users.filter(u => {
    const matchSearch = search === '' ||
      u.first_name.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === '' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Chargement...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-gray-400 mt-1">{users.length} utilisateur(s) au total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-3 transition-colors flex items-center gap-2"
        >
          <span>➕</span> Nouvel utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou identifiant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
        >
          <option value="">Tous les rôles</option>
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Utilisateur</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Identifiant</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Rôle</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Statut</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600/20 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{u.first_name} {u.last_name}</p>
                      <p className="text-gray-400 text-xs">{u.email || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-mono text-sm">{u.username}</span>
                  {u.must_change_password && (
                    <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                      pwd temp
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColors[u.role] || 'bg-gray-500/20 text-gray-400'}`}>
                    {roleLabels[u.role] || u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[u.status] || 'bg-gray-500/20 text-gray-400'}`}>
                    {statusLabels[u.status] || u.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResetPassword(u.id, `${u.first_name} ${u.last_name}`)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                      title="Réinitialiser le mot de passe"
                    >
                      🔑
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, `${u.first_name} ${u.last_name}`)}
                      className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12">Aucun utilisateur trouvé</div>
        )}
      </div>

      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onCreated={fetchUsers}
        />
      )}
    </div>
  );
}
