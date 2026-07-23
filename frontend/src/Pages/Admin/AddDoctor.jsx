import React, { useEffect, useState } from 'react';
import API from '../../Config/API';

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    fatherName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('Hospital/Admin/add_user', formData);
      setSuccess(true);
      setFormData({
        firstName: '', fatherName: '', username: '', password: '',
        email: '', phone: '', licenseNumber: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add Doctor</h1>
          <p className="text-gray-600 mt-2">Create a new doctor account</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {success && <div className="bg-green-100 text-green-700 p-4 rounded mb-4">Doctor added successfully!</div>}
          {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="px-4 py-2 border rounded-lg" required />
              <input type="text" name="fatherName" placeholder="Father Name" value={formData.fatherName} onChange={handleChange} className="px-4 py-2 border rounded-lg" required />
              <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="px-4 py-2 border rounded-lg" required />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="px-4 py-2 border rounded-lg" required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="px-4 py-2 border rounded-lg" required />
              <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="px-4 py-2 border rounded-lg" required />
              <input type="text" name="licenseNumber" placeholder="License Number" value={formData.licenseNumber} onChange={handleChange} className="px-4 py-2 border rounded-lg" />
            </div>
            <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Doctor'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;