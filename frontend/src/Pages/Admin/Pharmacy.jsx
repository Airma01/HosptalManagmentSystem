// src/Pages/Admin/Pharmacy.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../Config/API';

const Pharmacy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [branchPharmacies, setBranchPharmacies] = useState([]);
  const [centralPharmacies, setCentralPharmacies] = useState([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showPharmacistModal, setShowPharmacistModal] = useState(false);
  const [isEditBranch, setIsEditBranch] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editingCentralId, setEditingCentralId] = useState(null);
  const [showCentralEditModal, setShowCentralEditModal] = useState(false);
  const [branchForm, setBranchForm] = useState({ BranchName: '', Location: '' });
  const [centralForm, setCentralForm] = useState({ Name: '', Location: '' });
  const [pharmacistForm, setPharmacistForm] = useState({ userID: '', branchPharmacyID: '' });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, centralRes, usersRes] = await Promise.all([
        API.get('/Hospital/Admin/get_all_branch_pharmacies'),
        API.get('/Hospital/Admin/get_all_central_pharmacies'),
        API.get('/Hospital/Admin/get_all_user')
      ]);
      setBranchPharmacies(branchesRes.data || []);
      setCentralPharmacies(centralRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load pharmacy data.');
    } finally {
      setLoading(false);
    }
  };

  const openAddBranchModal = () => {
    setIsEditBranch(false);
    setEditingBranchId(null);
    setBranchForm({ BranchName: '', Location: '' });
    setShowBranchModal(true);
  };

  const openEditBranchModal = (branch) => {
    setIsEditBranch(true);
    setEditingBranchId(branch.branchPharmacyID);
    setBranchForm({
      BranchName: branch.branchName || '',
      Location: branch.location || ''
    });
    setShowBranchModal(true);
  };

  const closeBranchModal = () => {
    setShowBranchModal(false);
    setIsEditBranch(false);
    setEditingBranchId(null);
    setBranchForm({ BranchName: '', Location: '' });
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditBranch && editingBranchId) {
        await API.put(`/Hospital/Admin/update_branch_pharmacy/${editingBranchId}`, branchForm);
        alert('Branch pharmacy updated successfully!');
      } else {
        await API.post('/Hospital/Admin/add_new_branch_pharamacy', branchForm);
        alert('Branch pharmacy added successfully!');
      }
      closeBranchModal();
      await fetchData();
    } catch (error) {
      console.error('Error saving branch pharmacy:', error);
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        (isEditBranch ? 'Failed to update branch pharmacy.' : 'Failed to add branch pharmacy');
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const openEditCentralModal = (central) => {
    setEditingCentralId(central.centralPharmacyID);
    setCentralForm({
      Name: central.name || '',
      Location: central.location || ''
    });
    setShowCentralEditModal(true);
  };

  const closeCentralEditModal = () => {
    setShowCentralEditModal(false);
    setEditingCentralId(null);
    setCentralForm({ Name: '', Location: '' });
  };

  const handleCentralEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/Hospital/Admin/update_central_pharmacy/${editingCentralId}`, centralForm);
      alert('Central pharmacy updated successfully!');
      closeCentralEditModal();
      await fetchData();
    } catch (error) {
      console.error('Error updating central pharmacy:', error);
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        'Failed to update central pharmacy.';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handlePharmacistSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/Hospital/Admin/add_pharmacist', pharmacistForm);
      setPharmacistForm({ userID: '', branchPharmacyID: '' });
      setShowPharmacistModal(false);
      alert('Pharmacist added successfully!');
    } catch (error) {
      console.error('Error adding pharmacist:', error);
      alert(error.response?.data || 'Failed to add pharmacist');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch pharmacy?')) return;
    try {
      await API.delete(`/Hospital/Admin/delete_branch_pharmacy/${id}`);
      await fetchData();
      alert('Branch pharmacy deleted.');
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert('Failed to delete branch.');
    }
  };

  const handleDeleteCentral = async (id) => {
    if (!window.confirm('Are you sure you want to delete this central pharmacy?')) return;
    try {
      await API.delete(`/Hospital/Admin/delete_central_pharmacy/${id}`);
      await fetchData();
      alert('Central pharmacy deleted.');
    } catch (error) {
      console.error('Error deleting central:', error);
      alert('Failed to delete central.');
    }
  };

  const handleAction = (type, id) => {
    navigate(`/admin/dashboard/pharmacy/${type}/${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pharmacy Management</h2>
        <div className="flex gap-2">
          <button
            onClick={openAddBranchModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <i className="bi bi-building-add"></i> Add Branch
          </button>
          <button
            onClick={() => setShowPharmacistModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <i className="bi bi-person-badge"></i> Add Pharmacist
          </button>
        </div>
      </div>

      {loading && branchPharmacies.length === 0 && centralPharmacies.length === 0 && (
        <p className="text-gray-500 mb-4">Loading...</p>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Branch Pharmacies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {branchPharmacies.map((branch) => (
            <div
              key={branch.branchPharmacyID}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="font-semibold text-lg">{branch.branchName}</div>
              <div className="text-sm text-gray-600">{branch.location || 'No location'}</div>
              <div className="text-xs text-gray-400 mt-1">ID: {branch.branchPharmacyID}</div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleAction('branch', branch.branchPharmacyID)}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1.5 rounded transition"
                >
                  Actions
                </button>
                <button
                  onClick={() => openEditBranchModal(branch)}
                  className="px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1.5 rounded transition"
                  title="Edit"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  onClick={() => handleDeleteBranch(branch.branchPharmacyID)}
                  className="px-3 bg-red-500 hover:bg-red-600 text-white text-sm py-1.5 rounded transition"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
          {branchPharmacies.length === 0 && (
            <p className="text-gray-500 col-span-full">No branch pharmacies found.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Central Pharmacies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {centralPharmacies.map((central) => (
            <div
              key={central.centralPharmacyID}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="font-semibold text-lg">{central.name}</div>
              <div className="text-sm text-gray-600">{central.location || 'No location'}</div>
              <div className="text-xs text-gray-400 mt-1">ID: {central.centralPharmacyID}</div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleAction('central', central.centralPharmacyID)}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1.5 rounded transition"
                >
                  Actions
                </button>
                <button
                  onClick={() => openEditCentralModal(central)}
                  className="px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1.5 rounded transition"
                  title="Edit"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  onClick={() => handleDeleteCentral(central.centralPharmacyID)}
                  className="px-3 bg-red-500 hover:bg-red-600 text-white text-sm py-1.5 rounded transition"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
          {centralPharmacies.length === 0 && (
            <p className="text-gray-500 col-span-full">No central pharmacies found.</p>
          )}
        </div>
      </div>

      {showBranchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {isEditBranch ? 'Edit Branch Pharmacy' : 'Add Branch Pharmacy'}
              </h3>
              <button onClick={closeBranchModal} className="text-gray-500 hover:text-gray-700">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleBranchSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Branch Name"
                value={branchForm.BranchName}
                onChange={(e) => setBranchForm({ ...branchForm, BranchName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={branchForm.Location}
                onChange={(e) => setBranchForm({ ...branchForm, Location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : isEditBranch ? 'Update Branch' : 'Add Branch'}
                </button>
                <button
                  type="button"
                  onClick={closeBranchModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCentralEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Central Pharmacy</h3>
              <button onClick={closeCentralEditModal} className="text-gray-500 hover:text-gray-700">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCentralEditSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Pharmacy Name"
                value={centralForm.Name}
                onChange={(e) => setCentralForm({ ...centralForm, Name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={centralForm.Location}
                onChange={(e) => setCentralForm({ ...centralForm, Location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Pharmacy'}
                </button>
                <button
                  type="button"
                  onClick={closeCentralEditModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPharmacistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Pharmacist</h3>
              <button
                onClick={() => setShowPharmacistModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handlePharmacistSubmit} className="space-y-4">
              <select
                value={pharmacistForm.userID}
                onChange={(e) =>
                  setPharmacistForm({ ...pharmacistForm, userID: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u.userID || u.UserID} value={u.userID || u.UserID}>
                    {(u.firstName || u.FirstName || '')} {(u.fatherName || u.FatherName || '')} (
                    {u.username || u.Username})
                  </option>
                ))}
              </select>
              <select
                value={pharmacistForm.branchPharmacyID}
                onChange={(e) =>
                  setPharmacistForm({ ...pharmacistForm, branchPharmacyID: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Branch Pharmacy</option>
                {branchPharmacies.map((b) => (
                  <option key={b.branchPharmacyID} value={b.branchPharmacyID}>
                    {b.branchName}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Add Pharmacist'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPharmacistModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
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

export default Pharmacy;
