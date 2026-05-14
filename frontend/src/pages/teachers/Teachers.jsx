import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/persons/teachers')
      .then(res => setTeachers(res.data.teachers))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Chargement...</div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Enseignants</h1>
          <p className="text-gray-400 mt-1">{teachers.length} enseignant(s) enregistré(s)</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Enseignant</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">N° Employé</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Spécialité</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Date d'embauche</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-600/20 rounded-full flex items-center justify-center text-sm font-bold text-green-400">
                      {t.first_name[0]}{t.last_name[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{t.first_name} {t.last_name}</p>
                      <p className="text-gray-400 text-xs">{t.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">{t.employee_number}</td>
                <td className="px-6 py-4 text-gray-300 text-sm">{t.speciality || '—'}</td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {t.hire_date ? new Date(t.hire_date).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    t.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {t.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && (
          <div className="text-center text-gray-400 py-12">Aucun enseignant enregistré</div>
        )}
      </div>
    </div>
  );
}
