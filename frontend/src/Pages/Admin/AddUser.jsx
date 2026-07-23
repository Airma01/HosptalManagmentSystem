// src/Pages/Admin/AddUser.jsx
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
        RoleID: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch roles on component mount
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

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.FirstName.trim()) {
            newErrors.FirstName = 'First name is required';
        }
        if (!formData.FatherName.trim()) {
            newErrors.FatherName = 'Father name is required';
        }
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
        if (!formData.RoleID) {
            newErrors.RoleID = 'Please select a role';
        }
        if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
            newErrors.Email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        
        try {
            // Prepare data for API (remove ConfirmPassword)
            const submitData = {
                FirstName: formData.FirstName,
                FatherName: formData.FatherName,
                Username: formData.Username,
                Password: formData.Password,
                Email: formData.Email || '',
                Phone: formData.Phone,
                RoleID: parseInt(formData.RoleID)
            };

            const response = await API.post('/Hospital/Admin/add_user', submitData);
            setSuccessMessage(response.data || 'User added successfully!');
            
            // Reset form after success
            setFormData({
                FirstName: '',
                FatherName: '',
                Username: '',
                Password: '',
                ConfirmPassword: '',
                Email: '',
                Phone: '',
                RoleID: ''
            });
            
            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/admin/dashboard/users');
            }, 2000);
            
        } catch (error) {
            console.error('Error adding user:', error);
            setErrors({
                submit: error.response?.data || 'Failed to add user. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate('/admin/dashboard/users');
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New User</h2>
                <p className="text-gray-600 text-sm mt-1">Create a new user account with role assignment</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                        <div className="flex items-center">
                            <i className="bi bi-check-circle-fill text-green-500 mr-2"></i>
                            <span>{successMessage}</span>
                        </div>
                    </div>
                )}

                {/* Error Messages */}
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
                                {errors.FirstName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.FirstName}</p>
                                )}
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
                                {errors.FatherName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.FatherName}</p>
                                )}
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
                                {errors.Username && (
                                    <p className="mt-1 text-sm text-red-500">{errors.Username}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="RoleID"
                                    value={formData.RoleID}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                                        errors.RoleID ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => (
                                        <option key={role.roleID} value={role.roleID}>
                                            {role.roleName}
                                        </option>
                                    ))}
                                </select>
                                {errors.RoleID && (
                                    <p className="mt-1 text-sm text-red-500">{errors.RoleID}</p>
                                )}
                                {roles.length === 0 && !errors.fetch && (
                                    <p className="mt-1 text-sm text-yellow-500">
                                        <i className="bi bi-info-circle mr-1"></i>
                                        No roles available. Please add roles first.
                                    </p>
                                )}
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
                                {errors.Password && (
                                    <p className="mt-1 text-sm text-red-500">{errors.Password}</p>
                                )}
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
                                {errors.ConfirmPassword && (
                                    <p className="mt-1 text-sm text-red-500">{errors.ConfirmPassword}</p>
                                )}
                            </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
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
                                {errors.Email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.Email}</p>
                                )}
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
                                {errors.Phone && (
                                    <p className="mt-1 text-sm text-red-500">{errors.Phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
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