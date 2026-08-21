import React, { useEffect, useState } from 'react';
import API from '../Config/API';
import { Link } from 'react-router-dom';

const NurseDashboard = () => {
  const [nurse, setNurse] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get nurse info
        const nurseRes = await API.get('/Hospital/nurse/NurseAuth/auth_me');
        setNurse(nurseRes.data);
        // Get dashboard stats
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

  if (loading) return <div className="p-4 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-600 text-center">{error}</div>;
  if (!stats || !nurse) return null;

  const fullName = nurse.fullName || 'Nurse';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {fullName}!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h4 className="text-sm text-gray-500">Today's Patients</h4>
          <p className="text-2xl font-bold text-blue-600">{stats.todayPatientCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h4 className="text-sm text-gray-500">Today's Visits</h4>
          <p className="text-2xl font-bold text-green-600">{stats.todayVisitCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h4 className="text-sm text-gray-500">Pending Triage</h4>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingTriageCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h4 className="text-sm text-gray-500">Completed Triage</h4>
          <p className="text-2xl font-bold text-purple-600">{stats.completedTriageCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h4 className="text-sm text-gray-500">Today's Prescriptions</h4>
          <p className="text-2xl font-bold text-red-600">{stats.todayPrescriptionCount}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/nurse/patients" className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg text-center transition">Patients</Link>
        <Link to="/nurse/visits/today" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg text-center transition">Today's Visits</Link>
        <Link to="/nurse/triage/pending" className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg text-center transition">Pending Triage</Link>
        <Link to="/nurse/prescriptions/create" className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg text-center transition">New Prescription</Link>
      </div>
    </div>
  );
};

export default NurseDashboard;