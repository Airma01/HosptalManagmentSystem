// src/Pages/Admin/Departments.jsx
import React, { useState, useEffect } from 'react';
import API from '../../Config/API';
import { Link } from 'react-router-dom';
const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ DepartmentName: '', Description: '' });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await API.get('/Hospital/Admin/get_all_clinical_departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/Hospital/Admin/add_clinical_department', formData);
            setShowModal(false);
            setFormData({ DepartmentName: '', Description: '' });
            fetchDepartments();
            alert('Department added successfully!');
        } catch (error) {
            console.error('Error adding department:', error);
            alert(error.response?.data || 'Failed to add department');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Departments</h2>
                <button 
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <i className="bi bi-plus-circle"></i>
                    Add Department
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <div key={dept.clinicalDepartmentID} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800">{dept.departmentName}</h3>
                                <p className="text-gray-600 text-sm mt-1">{dept.description || 'No description'}</p>
                                <p className="text-gray-400 text-xs mt-2">ID: {dept.clinicalDepartmentID}</p>
                                <Link to={`/admin/dashboard/departments/${dept.clinicalDepartmentID}`} className="text-blue-600 hover:text-blue-800 bg-blue-100 px-2 py-1 rounded mt-2 flex items-center gap-1">
                                    <i className="bi bi-three-dots"></i>Actions
                                </Link>
                            </div>
                            <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                    <i className="bi bi-pencil"></i>
                                </button>
                                <button className="text-red-600 hover:text-red-800">
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add Department</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Department Name" 
                                value={formData.DepartmentName}
                                onChange={(e) => setFormData({...formData, DepartmentName: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <textarea 
                                placeholder="Description" 
                                value={formData.Description}
                                onChange={(e) => setFormData({...formData, Description: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    Add Department
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
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

export default Departments; // Make sure this line exists