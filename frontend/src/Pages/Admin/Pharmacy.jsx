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
  const [branchForm, setBranchForm] = useState({ branchName: '', location: '' });
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

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/Hospital/Admin/add_new_branch_pharamacy', branchForm);
      setBranchForm({ branchName: '', location: '' });
      setShowBranchModal(false);
      await fetchData();
      alert('Branch pharmacy added successfully!');
    } catch (error) {
      console.error('Error adding branch pharmacy:', error);
      alert(error.response?.data || 'Failed to add branch pharmacy');
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
            onClick={() => setShowBranchModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <i className="bi bi-building-add"></i> Add Branch
          </button>
          <button 
            onClick={() => setShowPharmacistModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <i className="bi bi-person-badge-plus"></i> Add Pharmacist
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}

      {/* Branch Pharmacies Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Branch Pharmacies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {branchPharmacies.map((branch) => (
            <div key={branch.branchPharmacyID} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition">
              <div className="font-semibold text-lg">{branch.branchName}</div>
              <div className="text-sm text-gray-600">{branch.location || 'No location'}</div>
              <div className="text-xs text-gray-400 mt-1">ID: {branch.branchPharmacyID}</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAction('branch', branch.branchPharmacyID)}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1.5 rounded transition"
                >
                  Actions
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
          {branchPharmacies.length === 0 && <p className="text-gray-500 col-span-full">No branch pharmacies found.</p>}
        </div>
      </div>

      {/* Central Pharmacies Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Central Pharmacies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {centralPharmacies.map((central) => (
            <div key={central.centralPharmacyID} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition">
              <div className="font-semibold text-lg">{central.name}</div>
              <div className="text-sm text-gray-600">{central.location || 'No location'}</div>
              <div className="text-xs text-gray-400 mt-1">ID: {central.centralPharmacyID}</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAction('central', central.centralPharmacyID)}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1.5 rounded transition"
                >
                  Actions
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
          {centralPharmacies.length === 0 && <p className="text-gray-500 col-span-full">No central pharmacies found.</p>}
        </div>
      </div>

      {/* Modals (same as before) */}
      {/* ... existing modals ... */}
    </div>
  );
};

export default Pharmacy;