import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../Config/API';
import UserAction from './UserAction';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await API.get('/Hospital/Admin/get_all_user');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toUserDetails = (userId) => {
        
        <UserAction userId={userId} actionType="view" />
    }
    // Filter users based on search term (search across all roles)
    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const rolesString = (user.roles || []).join(' ').toLowerCase();
        return (
            user.firstName?.toLowerCase().includes(searchLower) ||
            user.fatherName?.toLowerCase().includes(searchLower) ||
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            rolesString.includes(searchLower)
        );
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold">User Management</h2>
                    <p className="text-gray-600 text-sm">Manage all users in the system</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => navigate('/admin/dashboard/users/add')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <i className="bi bi-plus-circle"></i>
                        Add User
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                <div className="relative">
                    <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Search users by name, username, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Roles</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        <i className="bi bi-hourglass-split animate-spin mr-2"></i>
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.userID} className="border-t hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm">{user.userID}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{user.firstName} {user.fatherName}</td>
                                        <td className="px-4 py-3 text-sm">{user.username}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {/* Render multiple roles as badges */}
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map((role, index) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                            {role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400">No roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{user.email || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{user.phone}</td>
                                        <td className="">
                                                        <Link to={`/admin/dashboard/users/${user.userID}`} className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                                <i className="bi bi-eye"></i> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        <i className="bi bi-inbox mr-2"></i>
                                        {searchTerm ? 'No users found matching your search' : 'No users found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;