import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../../Config/API';

const TriageDetail = () => {
  const { id } = useParams();
  const [triage, setTriage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/Hospital/nurse/Nurse/triage/${id}`);
        setTriage(res.data);
      } catch (err) {
        setError('Triage not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleComplete = async () => {
    if (!window.confirm('Mark this triage as completed?')) return;
    setCompleting(true);
    try {
      await API.post(`/Hospital/nurse/Nurse/triage/${id}/complete`);
      alert('Triage marked as completed');
      const res = await API.get(`/Hospital/nurse/Nurse/triage/${id}`);
      setTriage(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!triage) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Triage Details</h1>
      <div className="bg-white p-6 rounded-xl shadow border">
        <p><strong>ID:</strong> {triage.triageId}</p>
        <p><strong>Patient:</strong> {triage.patientName}</p>
        <p><strong>Visit Date:</strong> {new Date(triage.visitDate).toLocaleString()}</p>
        <p><strong>Temperature:</strong> {triage.temprature}</p>
        <p><strong>Blood Pressure:</strong> {triage.bloodPressure}</p>
        <p><strong>Heart Rate:</strong> {triage.heartRate}</p>
        <p><strong>Respiratory Rate:</strong> {triage.respiratyRate}</p>
        <p><strong>Weight:</strong> {triage.weight}</p>
        <p><strong>Notes:</strong> {triage.notes}</p>
        <button onClick={handleComplete} disabled={completing} className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
          {completing ? 'Completing...' : 'Mark as Completed'}
        </button>
      </div>
    </div>
  );
};

export default TriageDetail;