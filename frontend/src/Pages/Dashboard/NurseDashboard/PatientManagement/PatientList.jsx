import React, { useState } from 'react';
import API from '../../../../Config/API';
import { Link } from 'react-router-dom';

const PatientList = () => {
  const [searchParams, setSearchParams] = useState({ MRN: '', FirstName: '', LastName: '', Phone: '', FaydaFIN: '' });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/Hospital/nurse/Nurse/search-patients', { params: searchParams });
      setPatients(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Patient Search</h1>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input name="MRN" placeholder="MRN" value={searchParams.MRN} onChange={handleChange} className="border p-2 rounded" />
        <input name="FirstName" placeholder="First Name" value={searchParams.FirstName} onChange={handleChange} className="border p-2 rounded" />
        <input name="LastName" placeholder="Last Name" value={searchParams.LastName} onChange={handleChange} className="border p-2 rounded" />
        <input name="Phone" placeholder="Phone" value={searchParams.Phone} onChange={handleChange} className="border p-2 rounded" />
        <input name="FaydaFIN" placeholder="Fayda FIN" value={searchParams.FaydaFIN} onChange={handleChange} className="border p-2 rounded" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 col-span-1">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">MRN</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Gender</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.patientId}>
                <td className="px-4 py-2 border">{p.mrn}</td>
                <td className="px-4 py-2 border">{p.firstName} {p.lastName}</td>
                <td className="px-4 py-2 border">{p.gender}</td>
                <td className="px-4 py-2 border">{p.phone}</td>
                <td className="px-4 py-2 border space-x-2">
                  <Link
                    to={`/nurse/patients/${p.patientId}`}
                    className="inline-block text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                  <Link
                    to={`/nurse/visits/create?patientId=${p.patientId}`}
                    className="inline-block bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Visit
                  </Link>
                  <Link
                    to={`/nurse/visits/create-triage?patientId=${p.patientId}`}
                    className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Triage+Visit
                  </Link>
                  {/* NEW: Prescription button */}
                  <Link
                    to={`/nurse/prescriptions/create?patientId=${p.patientId}`}
                    className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Prescription
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;