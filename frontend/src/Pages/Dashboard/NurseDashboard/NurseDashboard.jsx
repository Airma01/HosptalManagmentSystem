import React, { useEffect, useState } from 'react';
import API from '../../../Config/API';
import { Link } from 'react-router-dom';

const NurseDashboard = () => {
  const [nurse, setNurse] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nurseRes = await API.get('/Hospital/nurse/NurseAuth/auth_me');
        setNurse(nurseRes.data);
        const statsRes = await API.get('/Hospital/nurse/Nurse/dashboard');
        setStats(statsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-100 p-6 text-center">
        <i className="bi bi-exclamation-triangle text-red-500 text-2xl mb-2" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (!stats || !nurse) return null;

  const fullName = nurse.fullName || 'Nurse';

  const cards = [
    {
      label: "Today's Patients",
      value: stats.todayPatientCount,
      icon: 'bi-people',
      color: 'bg-blue-50 text-blue-700',
      iconBg: 'bg-blue-100',
    },
    {
      label: "Today's Visits",
      value: stats.todayVisitCount,
      icon: 'bi-calendar-check',
      color: 'bg-emerald-50 text-emerald-700',
      iconBg: 'bg-emerald-100',
    },
    {
      label: 'Pending Triage',
      value: stats.pendingTriageCount,
      icon: 'bi-hourglass-split',
      color: 'bg-amber-50 text-amber-700',
      iconBg: 'bg-amber-100',
    },
    {
      label: 'Completed Triage',
      value: stats.completedTriageCount,
      icon: 'bi-check-circle',
      color: 'bg-violet-50 text-violet-700',
      iconBg: 'bg-violet-100',
    },
    {
      label: "Today's Prescriptions",
      value: stats.todayPrescriptionCount,
      icon: 'bi-capsule',
      color: 'bg-rose-50 text-rose-700',
      iconBg: 'bg-rose-100',
    },
  ];

  const quickActions = [
    { to: '/nurse/patients', icon: 'bi-people', label: 'Patients', desc: 'Search & view patients', color: 'hover:border-blue-300 hover:bg-blue-50' },
    { to: '/nurse/visits/create-triage', icon: 'bi-clipboard2-pulse', label: 'Visit + Triage', desc: 'Create visit with vitals', color: 'hover:border-teal-300 hover:bg-teal-50' },
    { to: '/nurse/visits/today', icon: 'bi-calendar-check', label: "Today's Visits", desc: 'View active visits', color: 'hover:border-emerald-300 hover:bg-emerald-50' },
    { to: '/nurse/triage/pending', icon: 'bi-hourglass-split', label: 'Pending Triage', desc: 'Complete triage queue', color: 'hover:border-amber-300 hover:bg-amber-50' },
    { to: '/nurse/prescriptions/create', icon: 'bi-capsule', label: 'Prescription', desc: 'New medication order', color: 'hover:border-violet-300 hover:bg-violet-50' },
    { to: '/nurse/laboratory/request', icon: 'bi-eyedropper', label: 'Lab Request', desc: 'Order laboratory tests', color: 'hover:border-rose-300 hover:bg-rose-50' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Good day, {fullName.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Nursing workspace overview — patients, visits, triage, prescriptions & laboratory
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${card.color}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold tracking-tight">{card.value ?? 0}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <i className={`bi ${card.icon} text-base`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`group flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-150 ${action.color}`}
            >
              <div className="w-11 h-11 rounded-xl bg-slate-50 group-hover:bg-white border border-slate-100 flex items-center justify-center shrink-0">
                <i className={`bi ${action.icon} text-lg text-slate-600 group-hover:text-teal-600`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{action.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
              </div>
              <i className="bi bi-chevron-right text-slate-300 group-hover:text-teal-500 ml-auto text-sm" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;