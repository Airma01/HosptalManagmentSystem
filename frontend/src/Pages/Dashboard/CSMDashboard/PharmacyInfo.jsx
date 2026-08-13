import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const PharmacyInfo = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const managerID = user?.managerID;

  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!managerID) {
      setError('No manager ID found. Please login again.');
      setLoading(false);
      return;
    }
    const fetchPharmacy = async () => {
      try {
        const res = await API.get(`/Hospital/Admin/get_central_pharmacy_by_manager/${managerID}`);
        setPharmacy(res.data);
      } catch (err) {
        console.error(err);
        setError('No pharmacy assigned to you.');
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacy();
  }, [managerID]);

  if (loading) return <div>Loading...</div>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!pharmacy) return <p>No pharmacy assigned.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Your Central Pharmacy</h3>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p><span className="font-medium">Name:</span> {pharmacy.name}</p>
        <p><span className="font-medium">Location:</span> {pharmacy.location || 'N/A'}</p>
        <p><span className="font-medium">ID:</span> {pharmacy.centralPharmacyID}</p>
      </div>
    </div>
  );
};

export default PharmacyInfo;