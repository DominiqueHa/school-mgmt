import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const EDUCATION_LEVELS = ['BEPC', 'BAC', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'];

export default function CompleteProfile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: 'Béninoise',
    address: '',
    phone: '',
    id_card_number: '',
    education_level: '',
  });

  useEffect(() => {
    api.get('/profile/me').then(res => {
      const p = res.data.profile;
      if (p) {
        setForm({
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          gender: p.gender || '',
          date_of_birth: p.date_of_birth ? p.date_of_birth.split('T')[0] : '',
          place_of_birth: p.place_of_birth || '',
          nationality: p.nationality || 'Béninoise',
          address: p.address || '',
          phone: p.phone || '',
          id_card_number: p.id_card_number || '',
          education_level: p.education_level || '',
        });
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.first_name || !form.last_name) {
      setError('Prénom et nom sont obligatoires');
      return;
    }
    setLoading(true);
    try {
      await api.put('/profile/me/complete', form);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-white text-2xl font-bold mb-2">Profil soumis !</h2>
          <p className="text-gray-400">En attente de validation par la hiérarchie...</p>
          <p className="text-gray-500 text-sm mt-2">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Compléter mon profil</h1>
          <p className="text-gray-400 mt-1">
            Bonjour <span className="text-white font-medium">{user?.username}</span> —
            Ces informations seront validées par la hiérarchie.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
              <input type="text" name="first_name" value={form.first_name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
              <input type="text" name="last_name" value={form.last_name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sexe</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500">
                <option value="">— Sélectionner —</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date de naissance</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Lieu de naissance</label>
              <input type="text" name="place_of_birth" value={form.place_of_birth}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nationalité</label>
              <input type="text" name="nationality" value={form.nationality}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
              <input type="tel" name="phone" value={form.phone}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">N° Pièce d'identité</label>
              <input type="text" name="id_card_number" value={form.id_card_number}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
            <input type="text" name="address" value={form.address}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Niveau d'étude</label>
            <select name="education_level" value={form.education_level} onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500">
              <option value="">— Sélectionner —</option>
              {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors">
            {loading ? 'Soumission...' : '📤 Soumettre mon profil'}
          </button>
        </div>
      </div>
    </div>
  );
}
