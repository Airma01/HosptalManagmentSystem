// src/Pages/Admin/Admins.jsx
import React, { useState } from 'react';
import API from '../../Config/API';

const Admins = () => {
    const [loading, setLoading] = useState(false);
    const [adminForm, setAdminForm] = useState({ username: '', Password: '', AdminRole: '' });
    const [roleForm, setRoleForm] = useState({ RoleName: '' });

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/CreateAd', adminForm);
            setAdminForm({ username: '', Password: '', AdminRole: '' });
            alert('Admin created successfully!');
        } catch (error) {
            console.error('Error creating admin:', error);
            alert(error.response?.data || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/add_role', roleForm);
            setRoleForm({ RoleName: '' });
            alert('Role added successfully!');
        } catch (error) {
            console.error('Error adding role:', error);
            alert(error.response?.data || 'Failed to add role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-6">Admin Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <i className="bi bi-shield-lock-plus text-blue-500"></i>
                        Create Admin
                    </h3>
                    <form onSubmit={handleAdminSubmit} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Username" 
                            value={adminForm.username}
                            onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={adminForm.Password}
                            onChange={(e) => setAdminForm({...adminForm, Password: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Admin Role" 
                            value={adminForm.AdminRole}
                            onChange={(e) => setAdminForm({...adminForm, AdminRole: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Admin'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <i className="bi bi-tag-plus text-blue-500"></i>
                        Add Role
                    </h3>
                    <form onSubmit={handleRoleSubmit} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Role Name" 
                            value={roleForm.RoleName}
                            onChange={(e) => setRoleForm({...roleForm, RoleName: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Role'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Admins; // Make sure this line exists