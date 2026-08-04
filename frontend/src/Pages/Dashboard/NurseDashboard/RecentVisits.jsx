import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const RecentVisits = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/Hospital/Triage/recent_visit');
      setVisits(response.data || []);
    } catch (err) {
      console.error('Error fetching recent visits:', err);
      setError('Failed to load visits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleAddTriage = (visitId) => {
    navigate(`/nurse/recent-visits/${visitId}`);
  };

  if (loading) return <div>Loading recent visits...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Recent Visits</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.map((visit) => (
                <tr key={visit.visitID}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{visit.visitID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {visit.fullName || 'Unknown Patient'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.patientID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleAddTriage(visit.visitID)}
                      className="btn btn-success px-3 py-1 text-white rounded-lg hover:bg-green-700 transition"
                      style={{ backgroundColor: '#16a34a', border: 'none' }}
                    >
                      Add Triage
                    </button>
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

export default RecentVisits;