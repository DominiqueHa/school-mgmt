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

const ROLE_ICONS: Record<string, string> = {
  super_admin: '⚙️',
  admin: '🛡️',
  teacher: '👨‍🏫',
  student: '🎒',
  parent: '👨‍👧',
  under_admin: '👷',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'border-red-500 bg-red-500/20 text-red-400',
  admin: 'border-purple-500 bg-purple-500/20 text-purple-400',
  teacher: 'border-teal-500 bg-teal-500/20 text-teal-400',
  student: 'border-green-500 bg-green-500/20 text-green-400',
  parent: 'border-orange-500 bg-orange-500/20 text-orange-400',
  under_admin: 'border-gray-500 bg-gray-500/20 text-gray-400',
};

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<'roles' | 'success'>('roles');
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [roles, setRoles] = useState<Role[]>([]);
  const [allFunctions, setAllFunctions] = useState<FunctionItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [newFunctionLabel, setNewFunctionLabel] = useState('');
  const [showNewFunction, setShowNewFunction] = useState(false);

  useEffect(() => {
    api.get('/rbac/roles').then(res => setRoles(res.data.roles));
    api.get('/functions').then(res => setAllFunctions(res.data.functions));
  }, []);

  const handleSelectRole = (roleId: string, roleName: string) => {
    setSelectedRole(roleId);
    setSelectedFunctions([]);
    // Si student, pas de multi-fonctions complexes
    if (roleName === 'student') {
      setSelectedFunctions([]);
    }
  };

  const toggleFunction = (funcId: string, isExclusive: boolean, roleName: string) => {
    if (selectedFunctions.includes(funcId)) {
      setSelectedFunctions(prev => prev.filter(id => id !== funcId));
    } else {
      if (isExclusive) {
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
    if (!newFunctionLabel || !selectedRole) return;
    const roleObj = roles.find(r => r.id === selectedRole);
    if (!roleObj) return;

    const res = await api.post('/functions', {
      name: newFunctionLabel.toLowerCase().replace(/\s+/g, '_'),
      label: newFunctionLabel,
      role_id: selectedRole,
      is_mixable: true,
      is_exclusive: false,
    });

    setAllFunctions(prev => [...prev, { ...res.data.function, role_name: roleObj.name }]);
    setNewFunctionLabel('');
    setShowNewFunction(false);
  };

  const handleSubmit = async () => {
    setError('');
    if (!selectedRole) {
      setError('Sélectionnez un rôle');
      return;
    }

    const roleObj = roles.find(r => r.id === selectedRole);
    if (!roleObj) return;

    setLoading(true);
    try {
      const res = await api.post('/users', {
        role_name: roleObj.name,
        function_ids: selectedFunctions,
      });

      setCredentials(res.data.credentials);
      onCreated();
      setStep('success');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleObj = roles.find(r => r.id === selectedRole);
  const roleFunctions = selectedRoleObj
    ? allFunctions.filter(f => f.role_name === selectedRoleObj.name)
    : [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-white font-bold text-lg">
            {step === 'roles' ? '➕ Nouvel utilisateur' : '✅ Ticket généré'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {step === 'roles' && (
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Sélection du rôle */}
            <div>
              <h3 className="text-white font-semibold mb-3">Sélectionner un rôle</h3>
              <div className="grid grid-cols-3 gap-3">
                {roles.filter(r => r.name !== 'super_admin').map(role => {
                  const isSelected = selectedRole === role.id;
                  const colorClass = ROLE_COLORS[role.name] || 'border-gray-500 bg-gray-500/20 text-gray-400';
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role.id, role.name)}
                      className={`
                        relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                        ${isSelected ? colorClass : 'border-gray-700 bg-gray-800/50 text-gray-500 hover:border-gray-600'}
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

            {/* Fonctions du rôle sélectionné */}
            {selectedRole && roleFunctions.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-medium">
                    Fonctions — {ROLE_LABELS[selectedRoleObj?.name || '']}
                  </p>
                  <button
                    onClick={() => setShowNewFunction(!showNewFunction)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    + Nouvelle fonction
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {roleFunctions.map(func => {
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
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {showNewFunction && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom de la nouvelle fonction"
                      value={newFunctionLabel}
                      onChange={e => setNewFunctionLabel(e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button onClick={handleCreateFunction}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Créer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Résumé */}
            {selectedRole && (
              <div className="bg-gray-800 rounded-xl p-4 text-sm">
                <p className="text-gray-400 mb-1">Récapitulatif :</p>
                <p className="text-white">
                  Rôle : <span className="font-bold">{ROLE_LABELS[selectedRoleObj?.name || '']}</span>
                </p>
                {selectedFunctions.length > 0 && (
                  <p className="text-white mt-1">
                    Fonctions : <span className="font-bold">
                      {selectedFunctions.map(fId =>
                        allFunctions.find(f => f.id === fId)?.label
                      ).join(', ')}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg px-4 py-3 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedRole}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                {loading ? 'Création...' : '🎫 Générer le ticket'}
              </button>
            </div>
          </div>
        )}

        {/* Succès — Ticket */}
        {step === 'success' && (
          <div className="p-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6">
              <p className="text-green-400 font-bold text-lg mb-2 text-center">
                🎫 Ticket généré avec succès
              </p>
              <p className="text-gray-400 text-sm text-center mb-6">
                Remettez ces identifiants à l'utilisateur. Il devra changer son mot de passe et compléter son profil à la première connexion.
              </p>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Identifiant</span>
                  <span className="text-white font-bold font-mono text-xl">
                    {credentials?.username}
                  </span>
                </div>
                <div className="border-t border-gray-700" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Mot de passe temporaire</span>
                  <span className="text-orange-400 font-bold font-mono text-lg">
                    {credentials?.password}
                  </span>
                </div>
              </div>

              <p className="text-gray-500 text-xs text-center mt-4">
                Une requête IRACI a été créée automatiquement pour traçabilité.
              </p>
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
