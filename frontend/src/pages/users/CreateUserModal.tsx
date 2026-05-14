import { useState } from 'react';
import api from '../../services/api';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const ROLES = [
  { value: 'director', label: 'Directeur' },
  { value: 'deputy_director', label: 'Directeur Adjoint' },
  { value: 'censor', label: 'Censeur' },
  { value: 'accountant', label: 'Comptable' },
  { value: 'teacher', label: 'Enseignant' },
  { value: 'student', label: 'Élève' },
  { value: 'parent', label: 'Parent' },
  { value: 'under_admin', label: 'Personnel administratif' },
];

const EDUCATION_LEVELS = [
  'BEPC', 'BAC', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'
];

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    role_name: 'student',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: 'Béninoise',
    education_level: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.first_name || !form.last_name) {
      setError('Le prénom et le nom sont obligatoires');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/users', form);
      setCredentials(res.data.credentials);
      setStep('success');
      onCreated();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">
            {step === 'form' ? '➕ Créer un utilisateur' : '✅ Utilisateur créé'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {step === 'form' ? (
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rôle *</label>
              <select
                name="role_name"
                value={form.role_name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Genre / Date de naissance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sexe</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="">— Sélectionner —</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date de naissance</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Lieu de naissance / Nationalité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Lieu de naissance</label>
                <input
                  type="text"
                  name="place_of_birth"
                  value={form.place_of_birth}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nationalité</label>
                <input
                  type="text"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Email / Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Niveau d'étude */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Niveau d'étude</label>
              <select
                name="education_level"
                value={form.education_level}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option value="">— Sélectionner —</option>
                {EDUCATION_LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                {loading ? 'Création...' : 'Créer l\'utilisateur'}
              </button>
            </div>
          </div>
        ) : (
          /* Écran de succès avec identifiants */
          <div className="p-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6 text-center">
              <p className="text-green-400 font-bold text-lg mb-4">
                Utilisateur créé avec succès !
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Transmettez ces identifiants à l'utilisateur. Le mot de passe devra être changé à la première connexion.
              </p>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Identifiant</span>
                  <span className="text-white font-bold font-mono text-lg">
                    {credentials?.username}
                  </span>
                </div>
                <div className="border-t border-gray-700" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Mot de passe temporaire</span>
                  <span className="text-orange-400 font-bold font-mono">
                    {credentials?.password}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
