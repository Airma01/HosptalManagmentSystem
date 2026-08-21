import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../../Config/API';

const VisitDetail = () => {
  const { id } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/Hospital/nurse/Nurse/visit/${id}`);
        setVisit(res.data);
      } catch (err) {
        setError('Visit not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!visit) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Visit Details</h1>
      <div className="bg-white p-6 rounded-xl shadow border">
        <p><strong>Visit ID:</strong> {visit.visitId}</p>
        <p><strong>Patient:</strong> {visit.patientName}</p>
        <p><strong>Visit Date:</strong> {new Date(visit.visitDate).toLocaleString()}</p>
        <p><strong>Type:</strong> {visit.visitType}</p>
        <p><strong>Status:</strong> {visit.status}</p>
        <p><strong>Created:</strong> {new Date(visit.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default VisitDetail;