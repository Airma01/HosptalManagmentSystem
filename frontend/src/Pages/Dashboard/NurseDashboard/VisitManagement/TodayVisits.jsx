import React, { useEffect, useState } from 'react';
import API from '../../../../Config/API';
import { Link } from 'react-router-dom';

const statusBadge = (status) => {
  const map = {
    Scheduled: 'bg-blue-50 text-blue-700 ring-blue-100',
    'In Progress': 'bg-amber-50 text-amber-700 ring-amber-100',
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  };
  const cls = map[status] || 'bg-slate-50 text-slate-600 ring-slate-100';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${cls}`}>
      {status}
    </span>
  );
};

const TodayVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/Hospital/nurse/Nurse/today-visits');
        setVisits(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load visits');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading visits...</p>
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

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Today&apos;s Visits</h1>
          <p className="text-slate-500 text-sm mt-0.5">Active and scheduled visits for today</p>
        </div>
        <Link
          to="/nurse/visits/create-triage"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors self-start"
        >
          <i className="bi bi-plus-lg" />
          New Visit + Triage
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {visits.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <i className="bi bi-calendar-x text-4xl text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No visits scheduled for today</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Visit Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((v) => (
                    <tr key={v.visitId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{v.patientName}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {new Date(v.visitDate).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">{statusBadge(v.status)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/nurse/visits/${v.visitId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                        >
                          <i className="bi bi-eye" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100">
              {visits.map((v) => (
                <div key={v.visitId} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{v.patientName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(v.visitDate).toLocaleString()}
                      </p>
                      <div className="mt-2">{statusBadge(v.status)}</div>
                    </div>
                    <Link
                      to={`/nurse/visits/${v.visitId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-md"
                    >
                      <i className="bi bi-eye" /> View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TodayVisits;