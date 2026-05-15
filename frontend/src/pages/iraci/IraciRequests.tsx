import { useState, useEffect } from 'react';
import api from '../../services/api';

interface IraciRequest {
  id: string;
  action_code: string;
  action_label: string;
  current_step: string;
  status: string;
  created_at: string;
  deadline: string;
  initiator_username: string;
  target_username: string;
}

const STEP_LABELS: Record<string, string> = {
  initiation: 'Initiation',
  reception: 'Réception',
  approbation: 'Approbation',
  controle: 'Contrôle',
  integration: 'Intégration',
  completed: 'Complété',
  rejected: 'Rejeté',
};

const STEP_COLORS: Record<string, string> = {
  initiation: 'bg-blue-500/20 text-blue-400',
  reception: 'bg-yellow-500/20 text-yellow-400',
  approbation: 'bg-orange-500/20 text-orange-400',
  controle: 'bg-purple-500/20 text-purple-400',
  integration: 'bg-teal-500/20 text-teal-400',
  completed: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
};

const STEPS = ['initiation', 'reception', 'approbation', 'controle', 'integration'];

export default function IraciRequests() {
  const [requests, setRequests] = useState<IraciRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<IraciRequest | null>(null);
  const [comment, setComment] = useState('');
  const [advancing, setAdvancing] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/iraci/pending');
      setRequests(res.data.requests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAdvance = async (action: string) => {
    if (!selected) return;
    setAdvancing(true);
    try {
      await api.put(`/iraci/${selected.id}/advance`, { action, comment });
      setSelected(null);
      setComment('');
      fetchRequests();
    } finally {
      setAdvancing(false);
    }
  };

  const getNextAction = (step: string) => {
    const map: Record<string, { action: string; label: string; color: string }> = {
      initiation: { action: 'received', label: 'Marquer comme reçu', color: 'bg-yellow-600 hover:bg-yellow-700' },
      reception: { action: 'approved', label: 'Approuver', color: 'bg-green-600 hover:bg-green-700' },
      approbation: { action: 'controlled', label: 'Contrôler', color: 'bg-purple-600 hover:bg-purple-700' },
      controle: { action: 'integrated', label: 'Intégrer', color: 'bg-teal-600 hover:bg-teal-700' },
    };
    return map[step] || null;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Chargement...</div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Requêtes IRACI</h1>
        <p className="text-gray-400 mt-1">{requests.length} requête(s) en attente</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Action</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Initiateur</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Cible</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Étape</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Deadline</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-white font-medium text-sm">{r.action_label}</p>
                  <p className="text-gray-500 text-xs font-mono">{r.action_code}</p>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm font-mono">{r.initiator_username}</td>
                <td className="px-6 py-4 text-gray-300 text-sm font-mono">{r.target_username || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STEP_COLORS[r.current_step] || ''}`}>
                    {STEP_LABELS[r.current_step] || r.current_step}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(r.deadline).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelected(r)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Traiter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <div className="text-center text-gray-400 py-12">Aucune requête en attente</div>
        )}
      </div>

      {/* Modal de traitement */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-white font-bold">Traiter la requête</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Progression IRACI */}
              <div className="flex items-center justify-between mb-4">
                {STEPS.map((step, i) => {
                  const stepIndex = STEPS.indexOf(selected.current_step);
                  const isDone = i < stepIndex;
                  const isCurrent = i === stepIndex;
                  return (
                    <div key={step} className="flex items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${isDone ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-500 text-white' :
                          'bg-gray-700 text-gray-400'}
                      `}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`h-0.5 w-8 ${isDone ? 'bg-green-500' : 'bg-gray-700'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Action</span>
                  <span className="text-white font-medium">{selected.action_label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Étape actuelle</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${STEP_COLORS[selected.current_step]}`}>
                    {STEP_LABELS[selected.current_step]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Initiateur</span>
                  <span className="text-white font-mono">{selected.initiator_username}</span>
                </div>
                {selected.target_username && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cible</span>
                    <span className="text-white font-mono">{selected.target_username}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Commentaire (optionnel)
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAdvance('rejected')}
                  disabled={advancing}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-semibold rounded-lg px-4 py-3 transition-colors"
                >
                  ✕ Rejeter
                </button>
                {getNextAction(selected.current_step) && (
                  <button
                    onClick={() => handleAdvance(getNextAction(selected.current_step)!.action)}
                    disabled={advancing}
                    className={`flex-1 ${getNextAction(selected.current_step)!.color} text-white font-semibold rounded-lg px-4 py-3 transition-colors`}
                  >
                    {advancing ? '...' : getNextAction(selected.current_step)!.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
