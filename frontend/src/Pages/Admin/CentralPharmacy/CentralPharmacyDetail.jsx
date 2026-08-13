import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const CentralPharmacyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    medicineID: '',
    quantityAvailable: '',
    expiryDate: '',
    batchNumber: '',
  });

  // Manager modal states
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [unassignedManagers, setUnassignedManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Fetch central pharmacy details
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get pharmacy details (from list)
      const allRes = await API.get('/Hospital/Admin/get_all_central_pharmacies');
      const found = allRes.data.find(p => p.centralPharmacyID === parseInt(id));
      if (found) {
        setPharmacy(found);
      } else {
        setPharmacy(null);
        setLoading(false);
        return;
      }

      // 2. Get inventory
      const inventoryRes = await API.get(`/Hospital/Admin/Get_Stock/${id}`);
      setInventory(inventoryRes.data || []);

      // 3. Get medicines for dropdown
      const medicinesRes = await API.get('/Hospital/Admin/get_all_medicines');
      setMedicines(medicinesRes.data || []);

      // 4. Get current managers
      const managersRes = await API.get(`/Hospital/Admin/get_central_pharmacy_managers/${id}`);
      setManagers(managersRes.data || []);
    } catch (error) {
      console.error('Error fetching central pharmacy details:', error);
      setPharmacy(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unassigned managers
  const fetchUnassignedManagers = async () => {
    try {
      const res = await API.get('/Hospital/Admin/get_unadded_cs_manager');
      setUnassignedManagers(res.data || []);
    } catch (error) {
      console.error('Error fetching unassigned managers:', error);
      alert('Failed to load unassigned managers.');
    }
  };

  // Assign manager to this central pharmacy
  const handleAssignManager = async () => {
  if (!selectedManager) return;
  setAssigning(true);
  try {
    await API.post('/Hospital/Admin/add_manager_to_central', {
  CentralPharmacyID: parseInt(id),
  ManagerID: parseInt(selectedManager),  // ← now this is the correct PK
  IsCurrent: true
});
    alert('Manager assigned successfully!');
    setShowManagerModal(false);
    setSelectedManager('');
    // Refresh managers list
    const managersRes = await API.get(`/Hospital/Admin/get_central_pharmacy_managers/${id}`);
    setManagers(managersRes.data || []);
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.message || error.response?.data || 'Failed to assign manager.';
    alert(msg);
  } finally {
    setAssigning(false);
  }
};
  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/Hospital/Admin/add_to_central_inventory', {
        CentralPharmacyID: parseInt(id),
        MedicineID: parseInt(formData.medicineID),
        QuantityAvailable: parseInt(formData.quantityAvailable),
        ExpiryDate: formData.expiryDate,
        BatchNumber: formData.batchNumber
      });
      setShowModal(false);
      setFormData({ medicineID: '', quantityAvailable: '', expiryDate: '', batchNumber: '' });
      await fetchData();
      alert('Inventory added!');
    } catch (error) {
      console.error(error);
      alert('Failed to add inventory.');
    }
  };

  const handleDeleteInventory = async (inventoryId) => {
    if (!window.confirm('Delete this inventory item?')) return;
    try {
      await API.delete(`/Hospital/Admin/delete_inventory/${inventoryId}`);
      await fetchData();
      alert('Deleted.');
    } catch (error) {
      console.error(error);
      alert('Failed to delete.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!pharmacy) return <div className="text-red-500">Pharmacy not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{pharmacy.name}</h2>
        <button
          onClick={() => navigate('/admin/dashboard/central-pharmacy')}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>
      <p className="text-gray-600 mb-4">Location: {pharmacy.location || 'N/A'}</p>

      {/* Managers Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Managers</h3>
          <button
            onClick={() => {
              fetchUnassignedManagers();
              setShowManagerModal(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            + Assign Manager
          </button>
        </div>
        {managers.length === 0 ? (
          <p className="text-gray-500">No managers assigned.</p>
        ) : (
          <ul className="list-disc pl-5">
            {managers.map((m) => (
              <li key={m.centralStoreManagerID} className="text-gray-700">
                {m.fullName} {m.isCurrent && <span className="text-green-600 text-sm">(Current)</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Inventory Section */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Inventory</h3>
        <button
          onClick={() => setShowModal(true)}
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
                <th>Expiry</th>
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

      {/* Add Inventory Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Medicine</h3>
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {showManagerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Assign Manager to Central Pharmacy</h3>
           <select
  value={selectedManager}
  onChange={(e) => setSelectedManager(e.target.value)}
  className="w-full px-4 py-2 border rounded-lg"
>
  <option value="">Select a Manager</option>
  {unassignedManagers.map((m) => (
    <option key={m.managerID} value={m.managerID}>
      {m.fullName} ({m.username})
    </option>
  ))}
</select>
            <div className="flex gap-2">
              <button
                onClick={handleAssignManager}
                disabled={!selectedManager || assigning}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
              <button
                onClick={() => setShowManagerModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralPharmacyDetail;