import React, { useState } from 'react';
import API from '../../../../Config/API';
import { Link } from 'react-router-dom';

const PatientList = () => {
  const [searchParams, setSearchParams] = useState({
    MRN: '',
    FirstName: '',
    LastName: '',
    Phone: '',
    FaydaFIN: '',
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      // Send params as-is to preserve API contract.
      // Frontend normalization: lowercase the text fields for case-insensitive UX
      // while still sending original values if the backend expects exact casing.
      const params = {
        MRN: searchParams.MRN,
        FirstName: searchParams.FirstName,
        LastName: searchParams.LastName,
        Phone: searchParams.Phone,
        FaydaFIN: searchParams.FaydaFIN,
      };
      const res = await API.get('/Hospital/nurse/Nurse/search-patients', { params });
      let results = res.data || [];

      // Client-side case-insensitive refinement so "ermi" / "Ermi" / "ERMI" match equally
      const qFirst = (searchParams.FirstName || '').toLowerCase().trim();
      const qLast = (searchParams.LastName || '').toLowerCase().trim();
      const qMrn = (searchParams.MRN || '').toLowerCase().trim();

      if (qFirst || qLast || qMrn) {
        results = results.filter((p) => {
          const first = (p.firstName || '').toLowerCase();
          const last = (p.lastName || '').toLowerCase();
          const mrn = (p.mrn || '').toLowerCase();
          const matchFirst = !qFirst || first.includes(qFirst);
          const matchLast = !qLast || last.includes(qLast);
          const matchMrn = !qMrn || mrn.includes(qMrn);
          return matchFirst && matchLast && matchMrn;
        });
      }

      setPatients(results);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Patients</h1>
          <p className="text-slate-500 text-sm mt-0.5">Search and manage patient records</p>
        </div>
        <Link
          to="/nurse/patients/register"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors self-start"
        >
          <i className="bi bi-person-plus" />
          Register Patient
        </Link>
      </div>

      {/* Search Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <form onSubmit={handleSearch} className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">MRN</label>
              <input
                name="MRN"
                placeholder="MRN-000123"
                value={searchParams.MRN}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
              <input
                name="FirstName"
                placeholder="First name"
                value={searchParams.FirstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
              <input
                name="LastName"
                placeholder="Last name"
                value={searchParams.LastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
              <input
                name="Phone"
                placeholder="Phone"
                value={searchParams.Phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fayda FIN</label>
              <input
                name="FaydaFIN"
                placeholder="Fayda FIN"
                value={searchParams.FaydaFIN}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <i className="bi bi-search" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
          <i className="bi bi-exclamation-circle text-red-500 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!searched && !loading && (
          <div className="px-6 py-16 text-center">
            <i className="bi bi-people text-4xl text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">Search for patients by name, MRN, phone or Fayda FIN</p>
          </div>
        )}

        {searched && !loading && patients.length === 0 && (
          <div className="px-6 py-16 text-center">
            <i className="bi bi-inbox text-4xl text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No patients found matching your criteria</p>
          </div>
        )}

        {patients.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">MRN</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p.patientId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{p.mrn}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">
                        {p.firstName} {p.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{p.gender}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{p.phone}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/nurse/patients/${p.patientId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                            title="View details"
                          >
                            <i className="bi bi-eye" /> View
                          </Link>
                          <Link
                            to={`/nurse/visits/create-triage?patientId=${p.patientId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
                            title="Create visit & triage"
                          >
                            <i className="bi bi-clipboard2-pulse" /> Visit+Triage
                          </Link>
                          <Link
                            to={`/nurse/prescriptions/create?patientId=${p.patientId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-md transition-colors"
                            title="New prescription"
                          >
                            <i className="bi bi-capsule" /> Rx
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {patients.map((p) => (
                <div key={p.patientId} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">MRN: {p.mrn}</p>
                      <p className="text-xs text-slate-500">
                        {p.gender}
                        {p.phone ? ` · ${p.phone}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/nurse/patients/${p.patientId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md"
                    >
                      <i className="bi bi-eye" /> View
                    </Link>
                    <Link
                      to={`/nurse/visits/create-triage?patientId=${p.patientId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-md"
                    >
                      <i className="bi bi-clipboard2-pulse" /> Visit+Triage
                    </Link>
                    <Link
                      to={`/nurse/prescriptions/create?patientId=${p.patientId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 rounded-md"
                    >
                      <i className="bi bi-capsule" /> Rx
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

export default PatientList;