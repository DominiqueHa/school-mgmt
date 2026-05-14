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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      localStorage.setItem('mustChangePassword', JSON.stringify(false));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du changement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Première connexion</h1>
          <p className="text-gray-400 mt-1">
            Bienvenue <span className="text-white font-medium">{user?.first_name}</span> — veuillez changer votre mot de passe
          </p>
        </div>

        <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-8">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-6">
            <p className="text-orange-400 text-sm">
              🔒 Pour votre sécurité, vous devez définir un nouveau mot de passe avant de continuer.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
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
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Définir mon mot de passe'}
            </button>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
