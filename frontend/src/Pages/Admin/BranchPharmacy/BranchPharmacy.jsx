import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const BranchPharmacy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ branchName: '', location: '' });
  const [showPharmacistModal, setShowPharmacistModal] = useState(false);
  const [pharmacistForm, setPharmacistForm] = useState({ userID: '', branchPharmacyID: '' });

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ BranchName: '', Location: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, usersRes] = await Promise.all([
        API.get('/Hospital/Admin/get_all_branch_pharmacies'),
        API.get('/Hospital/Admin/get_all_user'),
      ]);
      setPharmacies(branchesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching branch pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      await API.post('/Hospital/Admin/add_new_branch_pharamacy', {
        BranchName: formData.branchName,
        Location: formData.location
      });
      setFormData({ branchName: '', location: '' });
      setShowModal(false);
      await fetchData();
      alert('Branch pharmacy added!');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data || 'Failed to add branch.';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const openEditModal = (ph) => {
    setEditingId(ph.branchPharmacyID);
    setEditForm({
      BranchName: ph.branchName || '',
      Location: ph.location || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setEditForm({ BranchName: '', Location: '' });
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      await API.put(`/Hospital/Admin/update_branch_pharmacy/${editingId}`, editForm);
      closeEditModal();
      await fetchData();
      alert('Branch pharmacy updated successfully!');
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        'Failed to update branch pharmacy.';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleAddPharmacist = async (e) => {
    e.preventDefault();
    try {
      await API.post('/Hospital/Admin/add_pharmacist', {
        UserID: parseInt(pharmacistForm.userID),
        BranchPharmacyID: parseInt(pharmacistForm.branchPharmacyID)
      });
      setPharmacistForm({ userID: '', branchPharmacyID: '' });
      setShowPharmacistModal(false);
      await fetchData();
      alert('Pharmacist added successfully!');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data || 'Failed to add pharmacist.';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this branch pharmacy?')) return;
    try {
      await API.delete(`/Hospital/Admin/delete_branch_pharmacy/${id}`);
      await fetchData();
      alert('Deleted.');
    } catch (error) {
      console.error(error);
      alert('Failed to delete.');
    }
  };

  const handleView = (id) => {
    navigate(`/admin/dashboard/branch-pharmacy/${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Branch Pharmacies</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + Add Branch
          </button>
          <button
            onClick={() => setShowPharmacistModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            + Add Pharmacist
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {pharmacies.map((ph) => (
          <div key={ph.branchPharmacyID} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="font-semibold text-lg">{ph.branchName}</div>
            <div className="text-sm text-gray-600">{ph.location || 'No location'}</div>
            <div className="text-xs text-gray-400 mt-1">ID: {ph.branchPharmacyID}</div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <button
                onClick={() => handleView(ph.branchPharmacyID)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1.5 rounded"
              >
                Manage
              </button>
              <button
                onClick={() => openEditModal(ph)}
                className="px-3 bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1.5 rounded"
                title="Edit"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                onClick={() => handleDelete(ph.branchPharmacyID)}
                className="px-3 bg-red-500 hover:bg-red-600 text-white text-sm py-1.5 rounded"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        ))}
        {pharmacies.length === 0 && <p className="col-span-full">No branch pharmacies found.</p>}
      </div>

      {/* Add Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Branch Pharmacy</h3>
            <form onSubmit={handleAddBranch} className="space-y-3">
              <input
                type="text"
                placeholder="Branch Name"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
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

      {/* Edit Branch Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Branch Pharmacy</h3>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateBranch} className="space-y-3">
              <input
                type="text"
                placeholder="Branch Name"
                value={editForm.BranchName}
                onChange={(e) => setEditForm({ ...editForm, BranchName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={editForm.Location}
                onChange={(e) => setEditForm({ ...editForm, Location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Branch'}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Pharmacist Modal */}
      {showPharmacistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Pharmacist to Branch</h3>
            <form onSubmit={handleAddPharmacist} className="space-y-3">
              <select
                value={pharmacistForm.userID}
                onChange={(e) => setPharmacistForm({ ...pharmacistForm, userID: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.userID} value={user.userID}>
                    {user.firstName} {user.fatherName} ({user.username})
                  </option>
                ))}
              </select>
              <select
                value={pharmacistForm.branchPharmacyID}
                onChange={(e) => setPharmacistForm({ ...pharmacistForm, branchPharmacyID: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select Branch</option>
                {pharmacies.map((ph) => (
                  <option key={ph.branchPharmacyID} value={ph.branchPharmacyID}>
                    {ph.branchName}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
                  Add Pharmacist
                </button>
                <button
                  type="button"
                  onClick={() => setShowPharmacistModal(false)}
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

export default BranchPharmacy;
