// src/Pages/Admin/Medicine.jsx
import React, { useState } from 'react';
import API from '../../Config/API';

const Medicine = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        MedicineName: '',
        GenericName: '',
        UnitPrice: '',
        UnitOfMeasure: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/register_new_medicine', formData);
            setFormData({ MedicineName: '', GenericName: '', UnitPrice: '', UnitOfMeasure: '' });
            alert('Medicine registered successfully!');
        } catch (error) {
            console.error('Error registering medicine:', error);
            alert(error.response?.data || 'Failed to register medicine');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-6">Medicine Management</h2>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i className="bi bi-prescription-plus text-blue-500"></i>
                    Register New Medicine
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="Medicine Name" 
                            value={formData.MedicineName}
                            onChange={(e) => setFormData({...formData, MedicineName: e.target.value})}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Generic Name" 
                            value={formData.GenericName}
                            onChange={(e) => setFormData({...formData, GenericName: e.target.value})}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="number" 
                            placeholder="Unit Price" 
                            value={formData.UnitPrice}
                            onChange={(e) => setFormData({...formData, UnitPrice: e.target.value})}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Unit of Measure" 
                            value={formData.UnitOfMeasure}
                            onChange={(e) => setFormData({...formData, UnitOfMeasure: e.target.value})}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Register Medicine'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Medicine; // Make sure this line exists