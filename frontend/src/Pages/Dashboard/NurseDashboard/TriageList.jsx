import React, { useState } from 'react';
import API from '../../../Config/API';

const TriageList = () => {
  const [visitId, setVisitId] = useState('');
  const [triage, setTriage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!visitId) return;
    setLoading(true);
    setError(null);
    try {
      // Assumes backend has [HttpGet("by-visit/{visitId}")]
      const response = await API.get(`/Hospital/Triage/by-visit/${visitId}`);
      setTriage(response.data);
    } catch (err) {
      console.error('Error fetching triage:', err);
      setError('No triage record found for this visit.');
      setTriage(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading triage...</div>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Search Triage by Visit</h3>
      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <input
          type="number"
          placeholder="Enter Visit ID"
          value={visitId}
          onChange={(e) => setVisitId(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="btn btn-primary px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {triage && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-700">Triage Record</h4>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <p><span className="font-medium">Visit ID:</span> {triage.visitID}</p>
            <p><span className="font-medium">Nurse:</span> {triage.nurse?.firstName} {triage.nurse?.lastName}</p>
            <p><span className="font-medium">Temperature:</span> {triage.temprature}</p>
            <p><span className="font-medium">Blood Pressure:</span> {triage.bloodPressure}</p>
            <p><span className="font-medium">Heart Rate:</span> {triage.heartRate}</p>
            <p><span className="font-medium">Respiratory Rate:</span> {triage.respiratotyRate}</p>
            <p><span className="font-medium">Weight:</span> {triage.weight}</p>
            <p><span className="font-medium">Notes:</span> {triage.notes || '—'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriageList;