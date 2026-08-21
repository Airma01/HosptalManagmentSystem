import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../../Config/API';

const LabTestDetail = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [testRes, resultRes] = await Promise.all([
          API.get(`/Hospital/nurse/Nurse/laboratory/test/${id}`),
          API.get(`/Hospital/nurse/Nurse/laboratory/test/${id}/result`).catch(() => null) // result may not exist
        ]);
        setTest(testRes.data);
        if (resultRes) setResult(resultRes.data);
      } catch (err) {
        setError('Lab test not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!test) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Laboratory Test Details</h1>
      <div className="bg-white p-6 rounded-xl shadow border">
        <p><strong>Test ID:</strong> {test.testId}</p>
        <p><strong>Patient:</strong> {test.patientName} (MRN: {test.patientMrn})</p>
        <p><strong>Test Type:</strong> {test.testTypeName}</p>
        <p><strong>Section:</strong> {test.sectionName}</p>
        <p><strong>Doctor:</strong> {test.doctorName}</p>
        <p><strong>Request Date:</strong> {new Date(test.requestDate).toLocaleString()}</p>
        <p><strong>Status:</strong> {test.status}</p>
        <h3 className="font-semibold mt-4">Result</h3>
        {result ? (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p><strong>Result:</strong> {result.resultDescription}</p>
            <p><strong>Technician:</strong> {result.technicianName}</p>
            <p><strong>Reported:</strong> {new Date(result.resultDate).toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-gray-500">No result available yet.</p>
        )}
      </div>
    </div>
  );
};

export default LabTestDetail;