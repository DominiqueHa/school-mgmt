import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/persons/staff')
      .then(res => setStaff(res.data.staff))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Chargement...</div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Personnel administratif</h1>
        <p className="text-gray-400 mt-1">{staff.length} membre(s) du personnel</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Personne</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">N° Employé</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Poste</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Date d'embauche</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-600/20 rounded-full flex items-center justify-center text-sm font-bold text-orange-400">
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{s.first_name} {s.last_name}</p>
                      <p className="text-gray-400 text-xs">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">{s.employee_number}</td>
                <td className="px-6 py-4 text-gray-300 text-sm">{s.position || '—'}</td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {s.hire_date ? new Date(s.hire_date).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {s.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <div className="text-center text-gray-400 py-12">Aucun personnel enregistré</div>
        )}
      </div>
    </div>
  );
}
