import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../Config/API';

const AddUser = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        FirstName: '',
        FatherName: '',
        Username: '',
        Password: '',
        ConfirmPassword: '',
        Email: '',
        Phone: '',
        RoleIDs: [] // ← now an array
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await API.get('/Hospital/Admin/get_all_roles');
            setRoles(response.data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setErrors({ fetch: 'Failed to load roles. Please refresh the page.' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRoleToggle = (roleId) => {
        setFormData(prev => {
            const current = prev.RoleIDs;
            const newSelection = current.includes(roleId)
                ? current.filter(id => id !== roleId)
                : [...current, roleId];
            return { ...prev, RoleIDs: newSelection };
        });
        if (errors.RoleIDs) setErrors(prev => ({ ...prev, RoleIDs: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.FirstName.trim()) newErrors.FirstName = 'First name is required';
        if (!formData.FatherName.trim()) newErrors.FatherName = 'Father name is required';
        if (!formData.Username.trim()) {
            newErrors.Username = 'Username is required';
        } else if (formData.Username.length < 3) {
            newErrors.Username = 'Username must be at least 3 characters';
        }
        if (!formData.Password) {
            newErrors.Password = 'Password is required';
        } else if (formData.Password.length < 6) {
            newErrors.Password = 'Password must be at least 6 characters';
        }
        if (formData.Password !== formData.ConfirmPassword) {
            newErrors.ConfirmPassword = 'Passwords do not match';
        }
        if (!formData.Phone.trim()) {
            newErrors.Phone = 'Phone number is required';
        } else if (!/^[0-9]{10,15}$/.test(formData.Phone)) {
            newErrors.Phone = 'Please enter a valid phone number';
        }
        if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
            newErrors.Email = 'Please enter a valid email address';
        }
        if (!formData.RoleIDs || formData.RoleIDs.length === 0) {
            newErrors.RoleIDs = 'Please select at least one role';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setSuccessMessage('');

        try {
            const submitData = {
                FirstName: formData.FirstName,
                FatherName: formData.FatherName,
                Username: formData.Username,
                Password: formData.Password,
                Email: formData.Email || '',
                Phone: formData.Phone,
                RoleIDs: formData.RoleIDs // array of integers
            };

            const response = await API.post('/Hospital/Admin/add_user', submitData);
            setSuccessMessage(response.data || 'User added successfully!');

            setFormData({
                FirstName: '',
                FatherName: '',
                Username: '',
                Password: '',
                ConfirmPassword: '',
                Email: '',
                Phone: '',
                RoleIDs: []
            });

            setTimeout(() => navigate('/admin/dashboard/users'), 2000);
        } catch (error) {
            console.error('Error adding user:', error);
            setErrors({ submit: error.response?.data || 'Failed to add user. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate('/admin/dashboard/users');

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New User</h2>
                <p className="text-gray-600 text-sm mt-1">Create a new user account and assign multiple roles</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Success / Error messages */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                        <div className="flex items-center">
                            <i className="bi bi-check-circle-fill text-green-500 mr-2"></i>
                            <span>{successMessage}</span>
                        </div>
                    </div>
                )}
                {errors.submit && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                        <div className="flex items-center">
                            <i className="bi bi-exclamation-triangle-fill text-red-500 mr-2"></i>
                            <span>{errors.submit}</span>
                        </div>
                    </div>
                )}
                {errors.fetch && (
                    <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded">
                        <div className="flex items-center">
                            <i className="bi bi-exclamation-triangle-fill text-yellow-500 mr-2"></i>
                            <span>{errors.fetch}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            <i className="bi bi-person-fill text-blue-500 mr-2"></i>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="FirstName"
                                    value={formData.FirstName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.FirstName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter first name"
                                />
                                {errors.FirstName && <p className="mt-1 text-sm text-red-500">{errors.FirstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Father Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="FatherName"
                                    value={formData.FatherName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.FatherName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter father name"
                                />
                                {errors.FatherName && <p className="mt-1 text-sm text-red-500">{errors.FatherName}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            <i className="bi bi-shield-lock-fill text-blue-500 mr-2"></i>
                            Account Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="Username"
                                    value={formData.Username}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.Username ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter username"
                                />
                                {errors.Username && <p className="mt-1 text-sm text-red-500">{errors.Username}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="Password"
                                    value={formData.Password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.Password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter password (min 6 chars)"
                                />
                                {errors.Password && <p className="mt-1 text-sm text-red-500">{errors.Password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="ConfirmPassword"
                                    value={formData.ConfirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.ConfirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Confirm password"
                                />
                                {errors.ConfirmPassword && <p className="mt-1 text-sm text-red-500">{errors.ConfirmPassword}</p>}
                            </div>
                        </div>

                        {/* Role checkboxes */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assign Roles <span className="text-red-500">*</span>
                            </label>
                            <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-lg ${
                                errors.RoleIDs ? 'border-red-500' : 'border-gray-300'
                            }`}>
                                {roles.length > 0 ? (
                                    roles.map((role) => (
                                        <label key={role.roleID} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.RoleIDs.includes(role.roleID)}
                                                onChange={() => handleRoleToggle(role.roleID)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 text-sm">{role.roleName}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-sm text-yellow-600 col-span-full">
                                        <i className="bi bi-info-circle mr-1"></i>
                                        No roles available. Please add roles first.
                                    </p>
                                )}
                            </div>
                            {errors.RoleIDs && <p className="mt-1 text-sm text-red-500">{errors.RoleIDs}</p>}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="pb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            <i className="bi bi-envelope-fill text-blue-500 mr-2"></i>
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.Email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter email address"
                                />
                                {errors.Email && <p className="mt-1 text-sm text-red-500">{errors.Email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="Phone"
                                    value={formData.Phone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.Phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter phone number"
                                />
                                {errors.Phone && <p className="mt-1 text-sm text-red-500">{errors.Phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <i className="bi bi-hourglass-split animate-spin"></i>
                                    Adding User...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-plus-circle"></i>
                                    Add User
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUser;