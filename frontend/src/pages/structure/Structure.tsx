import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Structure() {
  const [classes, setClasses] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/structure/classes'),
      api.get('/structure/school-years'),
    ]).then(([classesRes, yearsRes]) => {
      setClasses(classesRes.data.classes);
      setSchoolYears(yearsRes.data.school_years);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Chargement...</div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Structure scolaire</h1>
        <p className="text-gray-400 mt-1">Années scolaires et classes</p>
      </div>

      {/* Années scolaires */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Années scolaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schoolYears.map((sy) => (
            <div key={sy.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-bold text-lg">{sy.name}</p>
                {sy.is_active && (
                  <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                {new Date(sy.start_date).toLocaleDateString('fr-FR')} →{' '}
                {new Date(sy.end_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Classes */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Classes</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Classe</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Niveau</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Année scolaire</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Élèves</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Capacité</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{c.level}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{c.school_year || '—'}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{c.student_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2 max-w-24">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min((c.student_count / c.max_students) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs">{c.student_count}/{c.max_students}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {classes.length === 0 && (
            <div className="text-center text-gray-400 py-12">Aucune classe enregistrée</div>
          )}
        </div>
      </div>
    </div>
  );
}
