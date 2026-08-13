import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const AddInventory = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const managerID = user?.managerID;

  const [pharmacyId, setPharmacyId] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    medicineID: '',
    quantityAvailable: '',
    expiryDate: '',
    batchNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!managerID) return;
      try {
        const pharmRes = await API.get(`/Hospital/Admin/get_central_pharmacy_by_manager/${managerID}`);
        setPharmacyId(pharmRes.data?.centralPharmacyID);

        const medRes = await API.get('/Hospital/Admin/get_all_medicines');
        setMedicines(medRes.data || []);
      } catch (err) {
        console.error(err);
        alert('Failed to load data.');
      }
    };
    fetchData();
  }, [managerID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await API.post('/Hospital/Admin/add_to_central_inventory', {
        CentralPharmacyID: pharmacyId,
        MedicineID: parseInt(formData.medicineID),
        QuantityAvailable: parseInt(formData.quantityAvailable),
        ExpiryDate: formData.expiryDate,
        BatchNumber: formData.batchNumber,
      });
      setMessage('Medicine added successfully!');
      setTimeout(() => navigate('/csm/inventory'), 1500);
    } catch (err) {
      console.error(err);
      setMessage('Failed to add medicine.');
    } finally {
      setLoading(false);
    }
  };

  if (!pharmacyId) return <div>Loading pharmacy...</div>;

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-4">Add Medicine to Inventory</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          name="medicineID"
          value={formData.medicineID}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        >
          <option value="">Select Medicine</option>
          {medicines.map((med) => (
            <option key={med.medicineID} value={med.medicineID}>
              {med.medicineName}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="quantityAvailable"
          placeholder="Quantity"
          value={formData.quantityAvailable}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="date"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="text"
          name="batchNumber"
          placeholder="Batch Number (optional)"
          value={formData.batchNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
        {message && (
          <div className={`p-2 rounded ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-2 text-white rounded-lg"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          {loading ? 'Adding...' : 'Add Medicine'}
        </button>
      </form>
    </div>
  );
};

export default AddInventory;