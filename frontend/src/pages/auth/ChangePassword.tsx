import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (newPass !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPass.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        current_password: current,
        new_password: newPass,
      });
      logout();
      navigate('/login');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Erreur lors du changement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Changement de mot de passe</h1>
          <p className="text-gray-400 mt-1">
            Bonjour <span className="text-white font-medium">{user?.first_name}</span>, vous devez changer votre mot de passe avant de continuer.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
            >
              {loading ? 'Changement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
