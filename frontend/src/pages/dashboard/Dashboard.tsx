import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
        actif
      </span>
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-gray-400 text-sm mt-1">{label}</p>
  </div>
);

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, staff: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, classesRes, staffRes] = await Promise.all([
          api.get('/persons/students'),
          api.get('/persons/teachers'),
          api.get('/structure/classes'),
          api.get('/persons/staff'),
        ]);
        setStats({
          students: studentsRes.data.students.length,
          teachers: teachersRes.data.teachers.length,
          classes: classesRes.data.classes.length,
          staff: staffRes.data.staff.length,
        });
      } catch {}
    };
    if (user?.role === 'admin') fetchStats();
  }, [user]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Bonjour, {user?.first_name} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Bienvenue sur votre tableau de bord — <span className="capitalize">{user?.role}</span>
        </p>
      </div>

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon="🎒" label="Élèves" value={stats.students} color="bg-blue-500/20 text-blue-400" />
          <StatCard icon="👨‍🏫" label="Enseignants" value={stats.teachers} color="bg-green-500/20 text-green-400" />
          <StatCard icon="🏫" label="Classes" value={stats.classes} color="bg-purple-500/20 text-purple-400" />
          <StatCard icon="👷" label="Personnel" value={stats.staff} color="bg-orange-500/20 text-orange-400" />
        </div>
      )}
    </div>
  );
}
