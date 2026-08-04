import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../Config/API';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await API.get('/Hospital/Patient/get_all_patients');
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading patients...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.length === 0 ? (
        <p className="text-gray-500 col-span-full">No patients found.</p>
      ) : (
        patients.map((patient) => (
          <div key={patient.patientID} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800">{patient.firstName} {patient.fatherName}</h3>
            <p className="text-gray-600 text-sm mt-1">Patient ID: {patient.patientID}</p>
            <p className="text-gray-600 text-sm mt-1">Phone: {patient.phoneNumber || 'N/A'}</p>
            <Link to={`/receptionist/patients/${patient.patientID}`} className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              View Details
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default PatientList;