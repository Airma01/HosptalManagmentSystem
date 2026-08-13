import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const CentralPharmacy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [unassignedManagers, setUnassignedManagers] = useState([]);

  // Modals
  const [showAddPharmacyModal, setShowAddPharmacyModal] = useState(false);
  const [showRegisterManagerModal, setShowRegisterManagerModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Form states
  const [pharmacyForm, setPharmacyForm] = useState({ name: '', location: '' });
  const [managerForm, setManagerForm] = useState({ userID: '' });
  const [assignForm, setAssignForm] = useState({ managerID: '', centralPharmacyID: '' });

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pharmacyRes, managerRes] = await Promise.all([
        API.get('/Hospital/Admin/get_all_central_pharmacies'),
        API.get('/Hospital/Admin/get_unadded_cs_manager')
      ]);
      setPharmacies(pharmacyRes.data || []);
      setUnassignedManagers(managerRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---- Create Central Pharmacy ----
  const handleCreatePharmacy = async (e) => {
    e.preventDefault();
    try {
      await API.post('/Hospital/Admin/create_main_central_pharmacy', {
        Name: pharmacyForm.name,
        Location: pharmacyForm.location
      });
      setPharmacyForm({ name: '', location: '' });
      setShowAddPharmacyModal(false);
      await fetchData();
      alert('Central pharmacy created!');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data || 'Failed to create pharmacy.';
      alert(msg);
    }
  };

  // ---- Register Main Pharmacy Manager ----
  const handleRegisterManager = async (e) => {
    e.preventDefault();
    try {
      await API.post('/Hospital/Admin/add_pharmacy_manager', {
        UserID: parseInt(managerForm.userID)
      });
      setManagerForm({ userID: '' });
      setShowRegisterManagerModal(false);
      await fetchData();
      alert('Manager registered successfully!');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data || 'Failed to register manager.';
      alert(msg);
    }
  };

  // ---- Assign Manager to Central ----
  const handleAssignManager = async (e) => {
    e.preventDefault();
    try {
      await API.post('/Hospital/Admin/add_manager_to_central', {
        CentralPharmacyID: parseInt(assignForm.centralPharmacyID),
        ManagerID: parseInt(assignForm.managerID),
        IsCurrent: true
      });
      setAssignForm({ managerID: '', centralPharmacyID: '' });
      setShowAssignModal(false);
      await fetchData();
      alert('Manager assigned successfully!');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data || 'Failed to assign manager.';
      alert(msg);
    }
  };

  const handleView = (id) => {
    navigate(`/admin/dashboard/central-pharmacy/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this central pharmacy?')) return;
    try {
      await API.delete(`/Hospital/Admin/delete_central_pharmacy/${id}`);
      await fetchData();
      alert('Deleted.');
    } catch (error) {
      console.error(error);
      alert('Failed to delete.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Central Pharmacies</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAddPharmacyModal(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            + Add Pharmacy
          </button>
          <button
            onClick={() => setShowRegisterManagerModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + Register Manager
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Assign Manager
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}

      {/* Pharmacy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {pharmacies.map((ph) => (
          <div key={ph.centralPharmacyID} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="font-semibold text-lg">{ph.name}</div>
            <div className="text-sm text-gray-600">{ph.location || 'No location'}</div>
            <div className="text-xs text-gray-400 mt-1">ID: {ph.centralPharmacyID}</div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleView(ph.centralPharmacyID)}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1.5 rounded"
              >
                Manage
              </button>
              <button
                onClick={() => handleDelete(ph.centralPharmacyID)}
                className="px-3 bg-red-500 hover:bg-red-600 text-white text-sm py-1.5 rounded"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        ))}
        {pharmacies.length === 0 && <p className="col-span-full">No central pharmacies found.</p>}
      </div>

      {/* Unassigned Managers List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Unassigned CSM Managers</h3>
        {unassignedManagers.length === 0 ? (
          <p className="text-gray-500">No unassigned managers.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {unassignedManagers.map((m) => (
              <div key={m.userID} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex justify-between items-center">
                <span>{m.fullName} ({m.username})</span>
                <button
                  onClick={() => {
                    setAssignForm({ managerID: m.userID, centralPharmacyID: '' });
                    setShowAssignModal(true);
                  }}
                  className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Add Pharmacy Modal */}
      {showAddPharmacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Central Pharmacy</h3>
            <form onSubmit={handleCreatePharmacy} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={pharmacyForm.name}
                onChange={(e) => setPharmacyForm({ ...pharmacyForm, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={pharmacyForm.location}
                onChange={(e) => setPharmacyForm({ ...pharmacyForm, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPharmacyModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Manager Modal */}
      {showRegisterManagerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Register Main Pharmacy Manager</h3>
            <form onSubmit={handleRegisterManager} className="space-y-3">
              <input
                type="number"
                placeholder="User ID"
                value={managerForm.userID}
                onChange={(e) => setManagerForm({ ...managerForm, userID: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <p className="text-sm text-gray-500">User must have role "CSM"</p>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterManagerModal(false)}
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
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Assign Manager to Central Pharmacy</h3>
            <form onSubmit={handleAssignManager} className="space-y-3">
              <select
                value={assignForm.managerID}
                onChange={(e) => setAssignForm({ ...assignForm, managerID: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select Manager</option>
                {unassignedManagers.map((m) => (
                  <option key={m.userID} value={m.userID}>
                    {m.fullName} ({m.username})
                  </option>
                ))}
              </select>
              <select
                value={assignForm.centralPharmacyID}
                onChange={(e) => setAssignForm({ ...assignForm, centralPharmacyID: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select Central Pharmacy</option>
                {pharmacies.map((ph) => (
                  <option key={ph.centralPharmacyID} value={ph.centralPharmacyID}>
                    {ph.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
                  Assign
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
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

export default CentralPharmacy;