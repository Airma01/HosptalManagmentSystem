import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../Config/API';

const TriageByVisit = () => {
  const { visitId } = useParams();
  const [searchId, setSearchId] = useState(visitId || '');
  const [triage, setTriage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTriage = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setTriage(null);
    try {
      const res = await API.get(`/Hospital/Triage/by-visit/${id}`);
      setTriage(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError('No triage record found for this visit.');
      } else {
        setError('Failed to load triage data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTriage(searchId);
  };

  // If visitId came from URL param, auto-load
  React.useEffect(() => {
    if (visitId) {
      setSearchId(visitId);
      fetchTriage(visitId);
    }
  }, [visitId]);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Triage Details by Visit</h3>
      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <input
          type="number"
          placeholder="Enter Visit ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {loading && <div>Loading...</div>}
      {error && <p className="text-red-500">{error}</p>}

      {triage && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Triage Record</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-medium">Triage ID:</span> {triage.triageId}</p>
            <p><span className="font-medium">Visit ID:</span> {triage.visitID}</p>
            <p><span className="font-medium">Nurse:</span> {triage.nurse?.firstName} {triage.nurse?.fatherName}</p>
            <p><span className="font-medium">Triage Dept:</span> {triage.triageDepartment?.departmentName}</p>
            <p><span className="font-medium">Clinical Dept:</span> {triage.clinicalDepartment?.departmentName}</p>
            <p><span className="font-medium">Temperature:</span> {triage.temprature} °C</p>
            <p><span className="font-medium">Blood Pressure:</span> {triage.bloodPressure}</p>
            <p><span className="font-medium">Heart Rate:</span> {triage.heartRate} bpm</p>
            <p><span className="font-medium">Respiratory Rate:</span> {triage.respiratotyRate}</p>
            <p><span className="font-medium">Weight:</span> {triage.weight} kg</p>
            <p className="col-span-2"><span className="font-medium">Notes:</span> {triage.notes || '—'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriageByVisit;