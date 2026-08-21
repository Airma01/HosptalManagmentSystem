import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../Config/API';

const RegisterPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    phone: '',
    address: '',
    emergencyContact: '',
    faydaFIN: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Convert gender string to integer enum (0 = Male, 1 = Female)
    const payload = {
      ...formData,
      gender: formData.gender === 'Male' ? 0 : 1
    };

    try {
      await API.post('/Hospital/nurse/Nurse/register-patient', payload);
      alert('Patient registered successfully');
      navigate('/nurse/patients');
   } catch (err) {
  const data = err.response?.data;
  if (data?.errors) {
    const messages = Object.values(data.errors).flat().join(' ');
    setError(messages);
  } else if (data?.message) {
    setError(data.message);
  } else {
    setError('Server error. Please try again later.');
  }
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register New Patient</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">First Name *</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Last Name *</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Phone *</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Emergency Contact</label>
            <input
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Fayda FIN</label>
            <input
              name="faydaFIN"
              value={formData.faydaFIN}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPatient;