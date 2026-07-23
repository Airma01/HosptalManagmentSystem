// src/Pages/Admin/Pharmacy.jsx
import React, { useState, useEffect } from 'react';
import API from '../../Config/API';

const Pharmacy = () => {
    const [loading, setLoading] = useState(false);
    const [branchPharmacies, setBranchPharmacies] = useState([]);
    const [users, setUsers] = useState([]);
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [showPharmacistModal, setShowPharmacistModal] = useState(false);
    const [branchForm, setBranchForm] = useState({ BranchName: '', Location: '' });
    const [pharmacistForm, setPharmacistForm] = useState({ UserID: '', BranchPharmacyID: '' });
    const [centralForm, setCentralForm] = useState({ Name: '', Location: '' });
    const [aidForm, setAidForm] = useState({ Name: '', Location: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [branchesRes, usersRes] = await Promise.all([
                API.get('/Hospital/Admin/get_all_branch_pharmacies'),
                API.get('/Hospital/Admin/get_all_user')
            ]);
            setBranchPharmacies(branchesRes.data || []);
            setUsers(usersRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleBranchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/add_new_branch_pharamacy', branchForm);
            setBranchForm({ BranchName: '', Location: '' });
            setShowBranchModal(false);
            fetchData();
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
            setPharmacistForm({ UserID: '', BranchPharmacyID: '' });
            setShowPharmacistModal(false);
            alert('Pharmacist added successfully!');
        } catch (error) {
            console.error('Error adding pharmacist:', error);
            alert(error.response?.data || 'Failed to add pharmacist');
        } finally {
            setLoading(false);
        }
    };

    const handleCentralSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/create_main_central_pharmacy', centralForm);
            setCentralForm({ Name: '', Location: '' });
            alert('Central pharmacy created successfully!');
            fetchData();
        } catch (error) {
            console.error('Error creating central pharmacy:', error);
            alert(error.response?.data || 'Failed to create central pharmacy');
        } finally {
            setLoading(false);
        }
    };

    const handleAidSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/create_main_aid_pharmacy', aidForm);
            setAidForm({ Name: '', Location: '' });
            alert('Aid pharmacy created successfully!');
            fetchData();
        } catch (error) {
            console.error('Error creating aid pharmacy:', error);
            alert(error.response?.data || 'Failed to create aid pharmacy');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-6">Pharmacy Management</h2>

            <div className="flex flex-wrap gap-4 mb-6">
                <button 
                    onClick={() => setShowBranchModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <i className="bi bi-building-add"></i>
                    Add Branch Pharmacy
                </button>
                <button 
                    onClick={() => setShowPharmacistModal(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                    <i className="bi bi-person-badge-plus"></i>
                    Add Pharmacist
                </button>
            </div>

            {/* Branch Pharmacies List */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Branch Pharmacies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branchPharmacies.map((branch) => (
                        <div key={branch.branchPharmacyID} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <h4 className="font-semibold">{branch.branchName}</h4>
                            <p className="text-gray-600 text-sm">{branch.location || 'No location specified'}</p>
                            <p className="text-gray-400 text-xs mt-2">ID: {branch.branchPharmacyID}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Pharmacies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <i className="bi bi-building text-blue-500"></i>
                        Create Central Pharmacy
                    </h3>
                    <form onSubmit={handleCentralSubmit} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Name" 
                            value={centralForm.Name}
                            onChange={(e) => setCentralForm({...centralForm, Name: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Location" 
                            value={centralForm.Location}
                            onChange={(e) => setCentralForm({...centralForm, Location: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Central Pharmacy'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <i className="bi bi-building text-green-500"></i>
                        Create Aid Pharmacy
                    </h3>
                    <form onSubmit={handleAidSubmit} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Name" 
                            value={aidForm.Name}
                            onChange={(e) => setAidForm({...aidForm, Name: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Location" 
                            value={aidForm.Location}
                            onChange={(e) => setAidForm({...aidForm, Location: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Aid Pharmacy'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Modals */}
            {showBranchModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add Branch Pharmacy</h3>
                            <button onClick={() => setShowBranchModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleBranchSubmit} className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Branch Name" 
                                value={branchForm.BranchName}
                                onChange={(e) => setBranchForm({...branchForm, BranchName: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input 
                                type="text" 
                                placeholder="Location" 
                                value={branchForm.Location}
                                onChange={(e) => setBranchForm({...branchForm, Location: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    Add Branch
                                </button>
                                <button type="button" onClick={() => setShowBranchModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPharmacistModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add Pharmacist</h3>
                            <button onClick={() => setShowPharmacistModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handlePharmacistSubmit} className="space-y-4">
                            <select
                                value={pharmacistForm.UserID}
                                onChange={(e) => setPharmacistForm({...pharmacistForm, UserID: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user.userID} value={user.userID}>
                                        {user.firstName} {user.fatherName} ({user.username})
                                    </option>
                                ))}
                            </select>
                            <select
                                value={pharmacistForm.BranchPharmacyID}
                                onChange={(e) => setPharmacistForm({...pharmacistForm, BranchPharmacyID: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Branch Pharmacy</option>
                                {branchPharmacies.map(branch => (
                                    <option key={branch.branchPharmacyID} value={branch.branchPharmacyID}>
                                        {branch.branchName} - {branch.location}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    Add Pharmacist
                                </button>
                                <button type="button" onClick={() => setShowPharmacistModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
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

export default Pharmacy; // Make sure this line exists