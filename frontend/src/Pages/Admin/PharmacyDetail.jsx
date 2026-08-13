import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../Config/API';

const PharmacyDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    medicineID: '',
    quantityAvailable: '',
    expiryDate: '',
    batchNumber: '',
  });
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    fetchData();
  }, [type, id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (type === 'central') {
        // Fetch central pharmacy details and inventory
        const [pharmacyRes, inventoryRes, medicinesRes] = await Promise.all([
          API.get(`/Hospital/Admin/get_central_pharmacy/${id}`),
          API.get(`/Hospital/Admin/Get_Stock/${id}`),
          API.get('/Hospital/Admin/get_all_medicines'),
        ]);
        setPharmacy(pharmacyRes.data);
        setInventory(inventoryRes.data || []);
        setMedicines(medicinesRes.data || []);
      } else if (type === 'branch') {
        // Fetch branch pharmacy details (if endpoint exists)
        // For now, we'll just show a placeholder
        const pharmacyRes = await API.get(`/Hospital/Admin/get_branch_pharmacy/${id}`);
        setPharmacy(pharmacyRes.data);
        // Optionally fetch branch inventory if endpoint exists
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
      alert('Failed to load pharmacy details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/Hospital/Admin/add_to_central_inventory', {
        centralPharmacyID: parseInt(id),
        medicineID: parseInt(formData.medicineID),
        quantityAvailable: parseInt(formData.quantityAvailable),
        expiryDate: formData.expiryDate,
        batchNumber: formData.batchNumber,
      });
      setShowAddModal(false);
      setFormData({ medicineID: '', quantityAvailable: '', expiryDate: '', batchNumber: '' });
      await fetchData();
      alert('Inventory added successfully!');
    } catch (error) {
      console.error('Error adding inventory:', error);
      alert('Failed to add inventory.');
    }
  };

  const handleDeleteInventory = async (inventoryId) => {
    if (!window.confirm('Delete this inventory item?')) return;
    try {
      await API.delete(`/Hospital/Admin/delete_inventory/${inventoryId}`);
      await fetchData();
      alert('Inventory deleted.');
    } catch (error) {
      console.error('Error deleting inventory:', error);
      alert('Failed to delete inventory.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!pharmacy) return <div>Pharmacy not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{pharmacy.name || pharmacy.branchName}</h2>
        <button
          onClick={() => navigate('/admin/pharmacy')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Pharmacies
        </button>
      </div>
      <p className="text-gray-600 mb-4">Location: {pharmacy.location || 'N/A'}</p>

      {type === 'central' && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Inventory</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              + Add Medicine
            </button>
          </div>
          {inventory.length === 0 ? (
            <p>No inventory items.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Expiry Date</th>
                    <th>Batch</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.centralInventoryID}>
                      <td>{item.medicine?.medicineName || 'N/A'}</td>
                      <td>{item.quantityAvailable}</td>
                      <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}</td>
                      <td>{item.batchNumber || '—'}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteInventory(item.centralInventoryID)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {type === 'branch' && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p>Branch pharmacy details and inventory management coming soon.</p>
        </div>
      )}

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Medicine to Inventory</h3>
            <form onSubmit={handleAddInventory} className="space-y-3">
              <select
                value={formData.medicineID}
                onChange={(e) => setFormData({ ...formData, medicineID: e.target.value })}
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
                placeholder="Quantity"
                value={formData.quantityAvailable}
                onChange={(e) => setFormData({ ...formData, quantityAvailable: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="date"
                placeholder="Expiry Date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Batch Number"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDetail;