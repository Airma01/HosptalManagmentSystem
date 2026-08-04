import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const CreatePatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 0,          // 0=Male, 1=Female, 2=Other
    phone: '',           // renamed from contactNumber
    address: '',
    emergencyContact: '', // added
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setErrors({});

    try {
      await API.post('/Hospital/Patient/add_patient', formData);
      setMessage('Patient created successfully!');
      setTimeout(() => navigate('/receptionist/patients'), 1500);
    } catch (error) {
      console.error('Error creating patient:', error);
      if (error.response?.status === 400 && error.response?.data?.errors) {
        setErrors(error.response.data.errors); // show validation messages
      } else {
        setMessage('Failed to create patient. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Create New Patient</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.FirstName && <p className="text-red-500 text-sm">{errors.FirstName}</p>}

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.LastName && <p className="text-red-500 text-sm">{errors.LastName}</p>}

        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.DateOfBirth && <p className="text-red-500 text-sm">{errors.DateOfBirth}</p>}

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value={0}>Male</option>
          <option value={1}>Female</option>
          <option value={2}>Other</option>
        </select>
        {errors.Gender && <p className="text-red-500 text-sm">{errors.Gender}</p>}

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.Phone && <p className="text-red-500 text-sm">{errors.Phone}</p>}

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.Address && <p className="text-red-500 text-sm">{errors.Address}</p>}

        <input
          type="text"
          name="emergencyContact"
          placeholder="Emergency Contact"
          value={formData.emergencyContact}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.EmergencyContact && <p className="text-red-500 text-sm">{errors.EmergencyContact}</p>}

        {message && (
          <div className={`p-2 rounded ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn btn-primary py-2 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          {submitting ? 'Creating...' : 'Create Patient'}
        </button>
      </form>
    </div>
  );
};

export default CreatePatient;