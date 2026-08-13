import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const UpdateConsultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatmentPlan: '',
    chiefComplaint: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const res = await API.get(`/Hospital/Doctor/${id}`);
        const data = res.data;
        setFormData({
          diagnosis: data.diagnosis || '',
          treatmentPlan: data.treatmentPlan || '',
          chiefComplaint: data.chiefComplaint || '',
        });
      } catch (err) {
        console.error(err);
        setMessage('Failed to load consultation.');
      } finally {
        setLoading(false);
      }
    };
    fetchConsultation();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await API.put(`/Hospital/Doctor/${id}`, formData);
      setMessage('Consultation updated successfully!');
      setTimeout(() => navigate('/doctor/consultations'), 1500);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Update Consultation #{id}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          name="diagnosis"
          placeholder="Diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          rows="2"
          required
        />
        <textarea
          name="treatmentPlan"
          placeholder="Treatment Plan"
          value={formData.treatmentPlan}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          rows="2"
        />
        <textarea
          name="chiefComplaint"
          placeholder="Chief Complaint"
          value={formData.chiefComplaint}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          rows="2"
        />
        {message && (
          <div className={`p-2 rounded ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn btn-primary py-2 text-white rounded-lg"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          {submitting ? 'Updating...' : 'Update Consultation'}
        </button>
      </form>
    </div>
  );
};

export default UpdateConsultation;