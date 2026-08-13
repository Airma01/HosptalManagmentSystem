import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const BranchPharmacyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 🔄 Fetch all branch pharmacies and find the one with matching ID
        const allRes = await API.get('/Hospital/Admin/get_all_branch_pharmacies');
        const found = allRes.data.find(p => p.branchPharmacyID === parseInt(id));
        if (found) {
          setPharmacy(found);
        } else {
          setPharmacy(null);
        }
      } catch (error) {
        console.error('Error fetching branch pharmacy:', error);
        setPharmacy(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!pharmacy) return <div className="text-red-500">Pharmacy not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{pharmacy.branchName}</h2>
        <button
          onClick={() => navigate('/admin/dashboard/branch-pharmacy')}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>
      <p className="text-gray-600 mb-4">Location: {pharmacy.location || 'N/A'}</p>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <p>Branch pharmacy details and pharmacist management coming soon.</p>
        <p>You can add/remove pharmacists here using the same endpoints.</p>
      </div>
    </div>
  );
};

export default BranchPharmacyDetail;