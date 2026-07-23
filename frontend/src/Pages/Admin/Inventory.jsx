// src/Pages/Admin/Inventory.jsx
import React, { useState, useEffect } from 'react';
import API from '../../Config/API';

const Inventory = () => {
    const [loading, setLoading] = useState(false);
    const [centralPharmacies, setCentralPharmacies] = useState([]);
    const [aidPharmacies, setAidPharmacies] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [centralForm, setCentralForm] = useState({
        CentralPharmacyID: '',
        MedicineID: '',
        QuantityAvailable: '',
        ExpiryDate: '',
        BatchNumber: ''
    });
    const [aidForm, setAidForm] = useState({
        AidPharmacyID: '',
        MedicineID: '',
        QuantityAvailable: '',
        ExpiryDate: '',
        BatchNumber: ''
    });

    useEffect(() => {
        fetchPharmacies();
        fetchMedicines();
    }, []);

    const fetchPharmacies = async () => {
        try {
            const [centralRes, aidRes] = await Promise.all([
                API.get('/Hospital/Admin/get_all_central_pharmacies'),
                API.get('/Hospital/Admin/get_all_aid_pharmacies')
            ]);
            setCentralPharmacies(centralRes.data || []);
            setAidPharmacies(aidRes.data || []);
        } catch (error) {
            console.error('Error fetching pharmacies:', error);
        }
    };

    const fetchMedicines = async () => {
        try {
            const response = await API.get('/Hospital/Admin/get_all_medicines');
            setMedicines(response.data || []);
        } catch (error) {
            console.error('Error fetching medicines:', error);
        }
    };

    const handleCentralSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/add_to_central_inventory', centralForm);
            setCentralForm({ CentralPharmacyID: '', MedicineID: '', QuantityAvailable: '', ExpiryDate: '', BatchNumber: '' });
            alert('Added to central inventory successfully!');
        } catch (error) {
            console.error('Error adding to central inventory:', error);
            alert(error.response?.data || 'Failed to add to central inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleAidSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/add_to_aid_inventory', aidForm);
            setAidForm({ AidPharmacyID: '', MedicineID: '', QuantityAvailable: '', ExpiryDate: '', BatchNumber: '' });
            alert('Added to aid inventory successfully!');
        } catch (error) {
            console.error('Error adding to aid inventory:', error);
            alert(error.response?.data || 'Failed to add to aid inventory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-6">Inventory Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Central Inventory */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <i className="bi bi-box-seam-plus text-blue-500"></i>
                        Add to Central Inventory
                    </h3>
                    <form onSubmit={handleCentralSubmit} className="space-y-4">
                        <select
                            value={centralForm.CentralPharmacyID}
                            onChange={(e) => setCentralForm({...centralForm, CentralPharmacyID: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Central Pharmacy</option>
                            {centralPharmacies.map((pharmacy) => (
                                <option key={pharmacy.centralPharmacyID} value={pharmacy.centralPharmacyID}>
                                    {pharmacy.name} - {pharmacy.location}
                                </option>
                            ))}
                        </select>
                        <select
                            value={centralForm.MedicineID}
                            onChange={(e) => setCentralForm({...centralForm, MedicineID: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Medicine</option>
                            {medicines.map((medicine) => (
                                <option key={medicine.medicineID} value={medicine.medicineID}>
                                    {medicine.medicineName} - {medicine.genericName}
                                </option>
                            ))}
                        </select>
                        <input 
                            type="number" 
                            placeholder="Quantity Available" 
                            value={centralForm.QuantityAvailable}
                            onChange={(e) => setCentralForm({...centralForm, QuantityAvailable: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="date" 
                            placeholder="Expiry Date" 
                            value={centralForm.ExpiryDate}
                            onChange={(e) => setCentralForm({...centralForm, ExpiryDate: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Batch Number" 
                            value={centralForm.BatchNumber}
                            onChange={(e) => setCentralForm({...centralForm, BatchNumber: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add to Central Inventory'}
                        </button>
                    </form>
                </div>

                {/* Aid Inventory */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <i className="bi bi-box-seam-plus text-green-500"></i>
                        Add to Aid Inventory
                    </h3>
                    <form onSubmit={handleAidSubmit} className="space-y-4">
                        <select
                            value={aidForm.AidPharmacyID}
                            onChange={(e) => setAidForm({...aidForm, AidPharmacyID: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Aid Pharmacy</option>
                            {aidPharmacies.map((pharmacy) => (
                                <option key={pharmacy.aidPharmacyID} value={pharmacy.aidPharmacyID}>
                                    {pharmacy.name} - {pharmacy.location}
                                </option>
                            ))}
                        </select>
                        <select
                            value={aidForm.MedicineID}
                            onChange={(e) => setAidForm({...aidForm, MedicineID: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Medicine</option>
                            {medicines.map((medicine) => (
                                <option key={medicine.medicineID} value={medicine.medicineID}>
                                    {medicine.medicineName} - {medicine.genericName}
                                </option>
                            ))}
                        </select>
                        <input 
                            type="number" 
                            placeholder="Quantity Available" 
                            value={aidForm.QuantityAvailable}
                            onChange={(e) => setAidForm({...aidForm, QuantityAvailable: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="date" 
                            placeholder="Expiry Date" 
                            value={aidForm.ExpiryDate}
                            onChange={(e) => setAidForm({...aidForm, ExpiryDate: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Batch Number" 
                            value={aidForm.BatchNumber}
                            onChange={(e) => setAidForm({...aidForm, BatchNumber: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add to Aid Inventory'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Inventory; // Make sure this line exists