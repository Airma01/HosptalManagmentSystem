import React, { useState, useEffect } from 'react';
import API from '../../../Config/API';

const VisitList = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/Hospital/Patient/get_all_visits');
      setVisits(response.data || []);
    } catch (err) {
      console.error('Error fetching visits:', err);
      setError('Failed to load visits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getPatientName = (visit) => {
    if (visit.patient) {
      return `${visit.patient.firstName || ''} ${visit.patient.lastName || ''}`.trim() || 'Unknown Patient';
    }
    return 'Unknown Patient';
  };

  if (loading) return <div className="p-4">Loading visits...</div>;

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchVisits}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Visit Records</h3>
        <button
          onClick={fetchVisits}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
        >
          ⟳ Refresh
        </button>
      </div>

      {visits.length === 0 ? (
        <p className="text-gray-500">No visits recorded.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.map((visit) => (
                <tr key={visit.visitID}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{visit.visitID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getPatientName(visit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(visit.visitDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.visitType || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      visit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      visit.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {visit.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VisitList;