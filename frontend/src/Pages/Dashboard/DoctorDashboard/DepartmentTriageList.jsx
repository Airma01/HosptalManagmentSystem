import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const DepartmentTriageList = () => {
  const navigate = useNavigate();
  const [triageList, setTriageList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const departmentID = userData.departmentID;

  useEffect(() => {
    if (!departmentID) {
      setError('No department assigned to this doctor.');
      return;
    }
    const fetchTriage = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/Hospital/Triage/get-recent-triage/${departmentID}`);
        setTriageList(res.data || []);
        if (res.data.length === 0) {
          setError('No triage records found for your department.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load triage records.');
      } finally {
        setLoading(false);
      }
    };
    fetchTriage();
  }, [departmentID]);

  const handleConsultation = (visitID, patientName, e) => {
  e.stopPropagation();
  navigate(`/doctor/create-consultation?visitId=${visitID}&patientName=${encodeURIComponent(patientName)}`);
};

  const handleDetail = (patientID, e) => {
    e.stopPropagation();
    navigate(`/doctor/patient/${patientID}`);
  };

  if (loading) return <div>Loading triage records...</div>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!departmentID) return <p>No department found for this doctor.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Recent Triage Records - Your Department</h3>
      {triageList.length === 0 ? (
        <p>No triage records found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {triageList.map((triage) => (
            <div
              key={triage.triageId}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition border border-gray-100"
            >
              <div className="font-semibold text-lg">{triage.fullName || 'Unknown Patient'}</div>
              <div className="text-sm text-gray-600">Patient ID: {triage.patientID}</div>
              <div className="text-sm text-gray-600">Visit ID: {triage.visitID}</div>
              <div className="text-sm text-gray-600">Triage ID: {triage.triageId}</div>
              <div className="text-sm text-gray-600">Temp: {triage.temprature} °C</div>
              <div className="text-sm text-gray-600">BP: {triage.bloodPressure}</div>
              <div className="text-sm text-gray-600">HR: {triage.heartRate}</div>

              <div className="mt-3 flex gap-2">
                <button
                onClick={(e) => handleConsultation(triage.visitID, triage.fullName, e)}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1.5 rounded transition"
              >
                Consultation
              </button>
                <button
                  onClick={(e) => handleDetail(triage.patientID, e)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm py-1.5 rounded transition"
                >
                  Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentTriageList;