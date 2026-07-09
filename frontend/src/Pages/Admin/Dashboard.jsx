// src/Pages/Admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Config/API";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  // State for different roles
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [pharmacists, setPharmacists] = useState([]);
  const [pharmacyCashiers, setPharmacyCashiers] = useState([]);
  const [labTechnicians, setLabTechnicians] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    role: "",
    specialization: "",
    licenseNumber: "",
    department: "",
    shift: "",
    branch: "",
    qualification: ""
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get("/Hospital/Admin_auth/me");
        setUser(response.data);
        fetchAllData();
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      // Fetch all users
      const usersRes = await API.get("/Hospital/Admin/users");
      setUsers(usersRes.data);

      // Fetch doctors
      const doctorsRes = await API.get("/Hospital/Admin/doctors");
      setDoctors(doctorsRes.data);

      // Fetch nurses
      const nursesRes = await API.get("/Hospital/Admin/nurses");
      setNurses(nursesRes.data);

      // Fetch pharmacists
      const pharmacistsRes = await API.get("/Hospital/Admin/pharmacists");
      setPharmacists(pharmacistsRes.data);

      // Fetch pharmacy cashiers
      const cashiersRes = await API.get("/Hospital/Admin/pharmacy-cashiers");
      setPharmacyCashiers(cashiersRes.data);

      // Fetch lab technicians
      const labRes = await API.get("/Hospital/Admin/lab-technicians");
      setLabTechnicians(labRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/Hospital/Admin/${formData.role}s`;
      const response = await API.post(endpoint, formData);
      if (response.status === 201) {
        setShowAddModal(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          username: "",
          password: "",
          role: "",
          specialization: "",
          licenseNumber: "",
          department: "",
          shift: "",
          branch: "",
          qualification: ""
        });
        fetchAllData();
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert(error.response?.data?.message || "Failed to add user");
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/Hospital/Admin/${formData.role}s/${editingItem.id}`;
      const response = await API.put(endpoint, formData);
      if (response.status === 200) {
        setShowAddModal(false);
        setEditingItem(null);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          username: "",
          password: "",
          role: "",
          specialization: "",
          licenseNumber: "",
          department: "",
          shift: "",
          branch: "",
          qualification: ""
        });
        fetchAllData();
      }
    } catch (error) {
      console.error("Error editing user:", error);
      alert(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (role, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    try {
      const endpoint = `/Hospital/Admin/${role}s/${id}`;
      const response = await API.delete(endpoint);
      if (response.status === 200) {
        fetchAllData();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const openEditModal = (role, item) => {
    setEditingItem({ ...item, role });
    setFormData({
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      email: item.email || "",
      phone: item.phone || "",
      username: item.username || "",
      password: "",
      role: role,
      specialization: item.specialization || "",
      licenseNumber: item.licenseNumber || "",
      department: item.department || "",
      shift: item.shift || "",
      branch: item.branch || "",
      qualification: item.qualification || ""
    });
    setShowAddModal(true);
  };

  const getRoleIcon = (role) => {
    const icons = {
      doctor: "👨‍⚕️",
      nurse: "👩‍⚕️",
      pharmacist: "💊",
      "pharmacy-cashier": "💰",
      "lab-technician": "🔬",
      user: "👤"
    };
    return icons[role] || "👤";
  };

  const getRoleColor = (role) => {
    const colors = {
      doctor: "blue",
      nurse: "green",
      pharmacist: "purple",
      "pharmacy-cashier": "yellow",
      "lab-technician": "indigo",
      user: "gray"
    };
    return colors[role] || "gray";
  };

  const getStats = () => {
    return [
      { label: "Total Users", count: users.length, icon: "👤", color: "blue" },
      { label: "Doctors", count: doctors.length, icon: "👨‍⚕️", color: "blue" },
      { label: "Nurses", count: nurses.length, icon: "👩‍⚕️", color: "green" },
      { label: "Pharmacists", count: pharmacists.length, icon: "💊", color: "purple" },
      { label: "Pharmacy Cashiers", count: pharmacyCashiers.length, icon: "💰", color: "yellow" },
      { label: "Lab Technicians", count: labTechnicians.length, icon: "🔬", color: "indigo" }
    ];
  };

  const renderRoleTable = (role, data, columns) => {
    const color = getRoleColor(role);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                  No {role}s found
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item[col.toLowerCase().replace(/\s/g, '')] || item[col.toLowerCase()] || "—"}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(role, item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(role, item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {getStats().map((stat, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-${stat.color}-500`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-800 mt-2">{stat.count}</p>
                    </div>
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center text-2xl`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {["Doctor", "Nurse", "Pharmacist", "Pharmacy Cashier", "Lab Technician", "User"].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setActiveTab(role.toLowerCase().replace(/\s/g, '-'));
                      setShowAddModal(true);
                    }}
                    className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl text-gray-700 transition-colors"
                  >
                    <span className="mr-2">{getRoleIcon(role.toLowerCase().replace(/\s/g, '-'))}</span>
                    Add {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "users":
        return renderRoleTable("user", users, ["ID", "Username", "Email", "Phone", "Role"]);

      case "doctors":
        return renderRoleTable("doctor", doctors, ["ID", "Name", "Specialization", "License Number", "Department"]);

      case "nurses":
        return renderRoleTable("nurse", nurses, ["ID", "Name", "Department", "Shift", "Qualification"]);

      case "pharmacists":
        return renderRoleTable("pharmacist", pharmacists, ["ID", "Name", "Email", "Phone", "Branch"]);

      case "pharmacy-cashiers":
        return renderRoleTable("pharmacy-cashier", pharmacyCashiers, ["ID", "Name", "Email", "Phone", "Branch"]);

      case "lab-technicians":
        return renderRoleTable("lab-technician", labTechnicians, ["ID", "Name", "Email", "Phone", "Qualification"]);

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Hospital Admin</h1>
                <p className="text-xs text-gray-500">User Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{user.username}</p>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user.username}!
              </h2>
              <p className="mt-2 text-blue-100">
                Manage all hospital staff and users from one central dashboard
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Online
              </span>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    username: "",
                    password: "",
                    role: "",
                    specialization: "",
                    licenseNumber: "",
                    department: "",
                    shift: "",
                    branch: "",
                    qualification: ""
                  });
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                + Add New User
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            👤 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "doctors"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            👨‍⚕️ Doctors ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "doctors"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            👨‍⚕️ Role ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab("nurses")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "nurses"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            👩‍⚕️ Nurses ({nurses.length})
          </button>
          <button
            onClick={() => setActiveTab("pharmacists")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "pharmacists"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            💊 Pharmacists ({pharmacists.length})
          </button>
          <button
            onClick={() => setActiveTab("pharmacy-cashiers")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "pharmacy-cashiers"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            💰 Cashiers ({pharmacyCashiers.length})
          </button>
          <button
            onClick={() => setActiveTab("lab-technicians")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "lab-technicians"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            🔬 Lab Techs ({labTechnicians.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {loadingData ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? `Edit ${editingItem.role}` : "Add New User"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    username: "",
                    password: "",
                    role: "",
                    specialization: "",
                    licenseNumber: "",
                    department: "",
                    shift: "",
                    branch: "",
                    qualification: ""
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={editingItem ? handleEditUser : handleAddUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="pharmacy-cashier">Pharmacy Cashier</option>
                    <option value="lab-technician">Lab Technician</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>

                {!editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required={!editingItem}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={editingItem ? "Leave blank to keep current" : "Enter password"}
                    />
                  </div>
                )}

                {/* Doctor-specific fields */}
                {(formData.role === "doctor" || editingItem?.role === "doctor") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter specialization"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter license number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter department"
                      />
                    </div>
                  </>
                )}

                {/* Nurse-specific fields */}
                {(formData.role === "nurse" || editingItem?.role === "nurse") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                      <input
                        type="text"
                        value={formData.shift}
                        onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter shift"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                      <input
                        type="text"
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter qualification"
                      />
                    </div>
                  </>
                )}

                {/* Pharmacist & Pharmacy Cashier fields */}
                {(formData.role === "pharmacist" || formData.role === "pharmacy-cashier" || 
                  editingItem?.role === "pharmacist" || editingItem?.role === "pharmacy-cashier") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter branch"
                    />
                  </div>
                )}

                {/* Lab Technician fields */}
                {(formData.role === "lab-technician" || editingItem?.role === "lab-technician") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter qualification"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      username: "",
                      password: "",
                      role: "",
                      specialization: "",
                      licenseNumber: "",
                      department: "",
                      shift: "",
                      branch: "",
                      qualification: ""
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingItem ? "Update" : "Add"} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? You'll need to sign in again to access the dashboard.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await API.post("/Hospital/Admin_auth/logout");
                      setShowLogoutModal(false);
                      navigate("/login", { replace: true });
                    } catch (error) {
                      console.error("Logout failed:", error);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;