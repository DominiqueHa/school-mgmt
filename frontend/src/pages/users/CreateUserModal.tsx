import { useState, useEffect } from 'react';
import api from '../../services/api';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface Role {
  id: string;
  name: string;
}

interface FunctionItem {
  id: string;
  name: string;
  label: string;
  role_name: string;
  is_mixable: boolean;
  is_exclusive: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  teacher: 'Enseignant',
  student: 'Élève',
  parent: 'Parent',
  under_admin: 'Personnel',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'border-red-500 bg-red-500/20 text-red-400',
  admin: 'border-purple-500 bg-purple-500/20 text-purple-400',
  teacher: 'border-teal-500 bg-teal-500/20 text-teal-400',
  student: 'border-green-500 bg-green-500/20 text-green-400',
  parent: 'border-orange-500 bg-orange-500/20 text-orange-400',
  under_admin: 'border-gray-500 bg-gray-500/20 text-gray-400',
};

const ROLE_ICONS: Record<string, string> = {
  super_admin: '⚙️',
  admin: '🛡️',
  teacher: '👨‍🏫',
  student: '🎒',
  parent: '👨‍👧',
  under_admin: '👷',
};

const EDUCATION_LEVELS = ['BEPC', 'BAC', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'];

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<'form' | 'roles' | 'success'>('form');
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [roles, setRoles] = useState<Role[]>([]);
  const [allFunctions, setAllFunctions] = useState<FunctionItem[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [newFunctionLabel, setNewFunctionLabel] = useState('');
  const [newFunctionRole, setNewFunctionRole] = useState('');
  const [showNewFunction, setShowNewFunction] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: 'Béninoise',
    education_level: '',
  });

  useEffect(() => {
    api.get('/rbac/roles').then(res => setRoles(res.data.roles));
    api.get('/functions').then(res => setAllFunctions(res.data.functions));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleRole = (roleId: string, roleName: string) => {
    // student est exclusif
    if (roleName === 'student') {
      setSelectedRoles(['']);
      const studentRole = roles.find(r => r.name === 'student');
      if (studentRole) setSelectedRoles([studentRole.id]);
      return;
    }
    // Si student était sélectionné, on le retire
    const studentRole = roles.find(r => r.name === 'student');
    let newRoles = selectedRoles.filter(id => id !== studentRole?.id);

    if (newRoles.includes(roleId)) {
      newRoles = newRoles.filter(id => id !== roleId);
      // Retirer les fonctions de ce rôle
      const roleFunctions = allFunctions
        .filter(f => {
          const role = roles.find(r => r.id === roleId);
          return f.role_name === role?.name;
        })
        .map(f => f.id);
      setSelectedFunctions(prev => prev.filter(id => !roleFunctions.includes(id)));
    } else {
      newRoles = [...newRoles, roleId];
    }
    setSelectedRoles(newRoles);
  };

  const toggleFunction = (funcId: string, isExclusive: boolean, roleName: string) => {
    if (selectedFunctions.includes(funcId)) {
      setSelectedFunctions(prev => prev.filter(id => id !== funcId));
    } else {
      if (isExclusive) {
        // Retirer les autres fonctions exclusives du même rôle
        const exclusivesOfRole = allFunctions
          .filter(f => f.role_name === roleName && f.is_exclusive)
          .map(f => f.id);
        setSelectedFunctions(prev => [
          ...prev.filter(id => !exclusivesOfRole.includes(id)),
          funcId,
        ]);
      } else {
        setSelectedFunctions(prev => [...prev, funcId]);
      }
    }
  };

  const handleCreateFunction = async () => {
    if (!newFunctionLabel || !newFunctionRole) return;
    const roleObj = roles.find(r => r.id === newFunctionRole);
    if (!roleObj) return;

    const res = await api.post('/functions', {
      name: newFunctionLabel.toLowerCase().replace(/\s+/g, '_'),
      label: newFunctionLabel,
      role_id: newFunctionRole,
      is_mixable: true,
      is_exclusive: false,
    });

    setAllFunctions(prev => [...prev, { ...res.data.function, role_name: roleObj.name }]);
    setNewFunctionLabel('');
    setNewFunctionRole('');
    setShowNewFunction(false);
  };

  const handleSubmitForm = async () => {
    setError('');
    if (!form.first_name || !form.last_name) {
      setError('Le prénom et le nom sont obligatoires');
      return;
    }
    if (selectedRoles.length === 0) {
      setError('Sélectionnez au moins un rôle');
      return;
    }

    setLoading(true);
    try {
      // Créer l'utilisateur avec le premier rôle sélectionné
      const primaryRole = roles.find(r => r.id === selectedRoles[0]);
      const res = await api.post('/users', {
        ...form,
        role_name: primaryRole?.name,
      });

      const userId = res.data.user.id;
      setCreatedUserId(userId);
      setCredentials(res.data.credentials);

      // Assigner les rôles supplémentaires
      for (const roleId of selectedRoles.slice(1)) {
        const role = roles.find(r => r.id === roleId);
        if (role) {
          await api.post('/users/assign-role', {
            user_id: userId,
            role_name: role.name,
          });
        }
      }

      // Assigner les fonctions
      for (const funcId of selectedFunctions) {
        await api.post('/functions/assign', {
          user_id: userId,
          function_id: funcId,
        });
      }

      onCreated();
      setStep('success');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const visibleRoles = roles.filter(r =>
    !['super_admin'].includes(r.name) || true
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold text-lg">
              {step === 'form' ? '➕ Créer un utilisateur' : step === 'roles' ? '🎭 Rôles & Fonctions' : '✅ Utilisateur créé'}
            </h2>
            {step !== 'success' && (
              <div className="flex gap-2">
                <div className={`w-2 h-2 rounded-full ${step === 'form' ? 'bg-blue-500' : 'bg-gray-600'}`} />
                <div className={`w-2 h-2 rounded-full ${step === 'roles' ? 'bg-blue-500' : 'bg-gray-600'}`} />
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Étape 1 — Formulaire */}
        {step === 'form' && (
          <div className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input type="email" name="email" value={form.email}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                <input type="tel" name="phone" value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Niveau d'étude</label>
              <select name="education_level" value={form.education_level} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500">
                <option value="">— Sélectionner —</option>
                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg px-4 py-3 transition-colors">
                Annuler
              </button>
              <button onClick={() => {
                if (!form.first_name || !form.last_name) {
                  setError('Le prénom et le nom sont obligatoires');
                  return;
                }
                setError('');
                setStep('roles');
              }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 transition-colors">
                Suivant → Rôles & Fonctions
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 — Rôles & Fonctions */}
        {step === 'roles' && (
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Sélection des rôles */}
            <div>
              <h3 className="text-white font-semibold mb-3">
                Sélection du / des rôle(s)
                <span className="text-gray-400 text-sm font-normal ml-2">
                  (Student est exclusif)
                </span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {visibleRoles.map(role => {
                  const isSelected = selectedRoles.includes(role.id);
                  const colorClass = ROLE_COLORS[role.name] || 'border-gray-500 bg-gray-500/20 text-gray-400';
                  return (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id, role.name)}
                      className={`
                        relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                        ${isSelected ? colorClass : 'border-gray-700 bg-gray-800/50 text-gray-500'}
                      `}
                    >
                      <span className="text-2xl">{ROLE_ICONS[role.name] || '👤'}</span>
                      <span className="text-sm font-medium">
                        {ROLE_LABELS[role.name] || role.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fonctions par rôle sélectionné */}
            {selectedRoles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Fonctions</h3>
                {selectedRoles.map(roleId => {
                  const role = roles.find(r => r.id === roleId);
                  if (!role) return null;
                  const funcs = allFunctions.filter(f => f.role_name === role.name);

                  return (
                    <div key={roleId} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-medium flex items-center gap-2">
                          <span>{ROLE_ICONS[role.name]}</span>
                          <span>Fonctions : {ROLE_LABELS[role.name]}</span>
                        </p>
                        <button
                          onClick={() => {
                            setNewFunctionRole(roleId);
                            setShowNewFunction(true);
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          + Nouvelle fonction
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {funcs.map(func => {
                          const isSelected = selectedFunctions.includes(func.id);
                          return (
                            <button
                              key={func.id}
                              onClick={() => toggleFunction(func.id, func.is_exclusive, func.role_name)}
                              className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                                ${isSelected
                                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                                }
                              `}
                            >
                              {func.label}
                              {func.is_exclusive && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1 rounded">excl.</span>
                              )}
                              {isSelected && <span className="text-blue-400">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Créer une nouvelle fonction */}
            {showNewFunction && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
                <p className="text-white font-medium">Nouvelle fonction</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nom de la fonction"
                    value={newFunctionLabel}
                    onChange={e => setNewFunctionLabel(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <select
                    value={newFunctionRole}
                    onChange={e => setNewFunctionRole(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">— Rôle —</option>
                    {selectedRoles.map(rId => {
                      const r = roles.find(ro => ro.id === rId);
                      return r ? <option key={r.id} value={r.id}>{ROLE_LABELS[r.name]}</option> : null;
                    })}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowNewFunction(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-4 py-2 text-sm transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleCreateFunction}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm transition-colors">
                    Créer
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('form')}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg px-4 py-3 transition-colors">
                ← Retour
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={loading || selectedRoles.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                {loading ? 'Création...' : '✅ Créer l\'utilisateur'}
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 — Succès */}
        {step === 'success' && (
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
            <button onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 transition-colors">
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
