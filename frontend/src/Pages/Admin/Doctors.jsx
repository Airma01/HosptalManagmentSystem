// src/Pages/Admin/Doctors.jsx
import React, { useState, useEffect } from 'react';
import API from '../../Config/API';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        UserID: '',
        ClinicalDepartmentID: '',
        LicenseNumber: ''
    });
    const [searchId, setSearchId] = useState('');
    const [doctorInfo, setDoctorInfo] = useState(null);

    useEffect(() => {
        fetchDoctors();
        fetchUsers();
        fetchDepartments();
    }, []);

    // Filter doctors whenever searchTerm changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredDoctors(doctors);
        } else {
            const term = searchTerm.toLowerCase().trim();
            const filtered = doctors.filter(doc =>
                doc.firstName?.toLowerCase().includes(term) ||
                doc.fatherName?.toLowerCase().includes(term) ||
                doc.username?.toLowerCase().includes(term) ||
                doc.email?.toLowerCase().includes(term) ||
                doc.phone?.toLowerCase().includes(term) ||
                doc.role?.toLowerCase().includes(term)
            );
            setFilteredDoctors(filtered);
        }
    }, [searchTerm, doctors]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await API.get('/Hospital/Admin/get_all_doctors');
            setDoctors(response.data);
            setFilteredDoctors(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await API.get('/Hospital/Admin/get_all_user');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await API.get('/Hospital/Admin/get_all_clinical_departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/add_doctor', formData);
            setShowModal(false);
            setFormData({ UserID: '', ClinicalDepartmentID: '', LicenseNumber: '' });
            fetchDoctors();
            alert('Doctor added successfully!');
        } catch (error) {
            alert(error.response?.data || 'Failed to add doctor');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchId) {
            alert('Please select a doctor');
            return;
        }
        setLoading(true);
        try {
            const response = await API.get(`/Hospital/Admin/get_doc/${searchId}`);
            setDoctorInfo(response.data);
            setError(null);
        } catch (error) {
            setError('Doctor not found');
            setDoctorInfo(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Doctors</h2>
                    <p className="text-gray-600 text-sm">Manage hospital doctors and their departments</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                >
                    <i className="bi bi-plus-circle"></i> Add Doctor
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <i className="bi bi-exclamation-triangle-fill mr-2"></i> {error}
                </div>
            )}

            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i className="bi bi-search text-blue-500"></i> Search Doctors
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Search by name, username, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">Detailed Search</option>
                            {doctors.map(doc => (
                                <option key={doc.userID} value={doc.userID}>
                                    {doc.firstName} {doc.fatherName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <i className="bi bi-search"></i> Get Details
                    </button>
                </div>

                {doctorInfo && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div><p className="text-sm text-gray-500">Doctor ID</p><p className="font-semibold">{doctorInfo.doctorID}</p></div>
                            <div><p className="text-sm text-gray-500">License</p><p className="font-semibold">{doctorInfo.licenseNumber || 'N/A'}</p></div>
                            <div><p className="text-sm text-gray-500">Name</p><p className="font-semibold">{doctorInfo.user?.firstName} {doctorInfo.user?.fatherName}</p></div>
                            <div><p className="text-sm text-gray-500">Department</p><p className="font-semibold">{doctorInfo.departmentName || 'N/A'}</p></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Doctors Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                            ) : filteredDoctors.length > 0 ? (
                                filteredDoctors.map((doctor) => (
                                    <tr key={doctor.userID} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm">{doctor.userID}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{doctor.firstName} {doctor.fatherName}</td>
                                        <td className="px-6 py-4 text-sm">{doctor.username}</td>
                                        <td className="px-6 py-4 text-sm">{doctor.email}</td>
                                        <td className="px-6 py-4 text-sm">{doctor.phone}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {doctor.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No doctors found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Doctor Modal (unchanged) */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <i className="bi bi-person-badge-plus text-blue-500"></i> Add New Doctor
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="bi bi-x-lg text-xl"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select User <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.UserID}
                                    onChange={(e) => setFormData({ ...formData, UserID: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a user</option>
                                    {users.map(user => (
                                        <option key={user.userID} value={user.userID}>
                                            {user.firstName} {user.fatherName} ({user.roles.join(', ')})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.ClinicalDepartmentID}
                                    onChange={(e) => setFormData({ ...formData, ClinicalDepartmentID: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a department</option>
                                    {departments.map(dept => (
                                        <option key={dept.clinicalDepartmentID} value={dept.clinicalDepartmentID}>
                                            {dept.departmentName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter license number"
                                    value={formData.LicenseNumber}
                                    onChange={(e) => setFormData({ ...formData, LicenseNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-2 pt-4 border-t">
                                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? <><i className="bi bi-hourglass-split animate-spin"></i> Adding...</> : <><i className="bi bi-plus-circle"></i> Add Doctor</>}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
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

export default Doctors;