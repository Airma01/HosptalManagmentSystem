import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../../Config/API';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await API.get(`/Hospital/nurse/Nurse/patient/${id}`);
        setPatient(res.data);
        setFormData(res.data);
      } catch (err) {
        setError('Patient not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/Hospital/nurse/Nurse/patient/${id}`, formData);
      setPatient(formData);
      setEditMode(false);
      alert('Patient updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!patient) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Patient Details</h1>
      {!editMode ? (
        <div className="bg-white p-6 rounded-xl shadow border">
          <p><strong>MRN:</strong> {patient.mrn}</p>
          <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
          <p><strong>Address:</strong> {patient.address}</p>
          <p><strong>Emergency Contact:</strong> {patient.emergencyContact}</p>
          <p><strong>Fayda FIN:</strong> {patient.faydaFIN}</p>
          <button onClick={() => setEditMode(true)} className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600">Edit</button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="bg-white p-6 rounded-xl shadow border">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block font-medium">First Name</label><input name="firstName" value={formData.firstName} onChange={handleChange} className="border p-2 w-full rounded" /></div>
            <div><label className="block font-medium">Last Name</label><input name="lastName" value={formData.lastName} onChange={handleChange} className="border p-2 w-full rounded" /></div>
            <div><label className="block font-medium">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="border p-2 w-full rounded">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div><label className="block font-medium">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth?.split('T')[0]} onChange={handleChange} className="border p-2 w-full rounded" /></div>
            <div><label className="block font-medium">Phone</label><input name="phone" value={formData.phone} onChange={handleChange} className="border p-2 w-full rounded" /></div>
            <div><label className="block font-medium">Address</label><input name="address" value={formData.address} onChange={handleChange} className="border p-2 w-full rounded" /></div>
            <div><label className="block font-medium">Emergency Contact</label><input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="border p-2 w-full rounded" /></div>
            <div><label className="block font-medium">Fayda FIN</label><input name="faydaFIN" value={formData.faydaFIN} onChange={handleChange} className="border p-2 w-full rounded" /></div>
          </div>
          <div className="mt-4">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Update</button>
            <button type="button" onClick={() => setEditMode(false)} className="bg-gray-500 text-white px-4 py-2 rounded ml-2 hover:bg-gray-600">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PatientDetail;