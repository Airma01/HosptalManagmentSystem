
// src/Pages/Admin/Doctors.jsx
import React, { useEffect, useState } from 'react';
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

  // Add Doctor form – multi department
  const [formData, setFormData] = useState({
    UserID: '',
    DepartmentIds: [],
    LicenseNumber: '',
  });

  // Edit departments for an existing doctor
  const [editDoctor, setEditDoctor] = useState(null); // { doctorID, fullName, ... }
  const [editDeptIds, setEditDeptIds] = useState([]);
  const [savingDepts, setSavingDepts] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = doctors.filter(
        (doc) =>
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
      setDoctors(response.data || []);
      setFilteredDoctors(response.data || []);
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
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await API.get('/Hospital/Admin/get_all_clinical_departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const getDeptId = (d) =>
    d.clinicalDepartmentID ?? d.ClinicalDepartmentID ?? d.departmentID ?? d.DepartmentID;
  const getDeptName = (d) =>
    d.departmentName ?? d.DepartmentName ?? '';

  // ---------- Add Doctor (multi-dept) ----------
  const toggleFormDept = (deptId) => {
    setFormData((prev) => {
      const ids = prev.DepartmentIds.includes(deptId)
        ? prev.DepartmentIds.filter((id) => id !== deptId)
        : [...prev.DepartmentIds, deptId];
      return { ...prev, DepartmentIds: ids };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.UserID) {
      alert('Please select a user');
      return;
    }
    if (formData.DepartmentIds.length === 0) {
      alert('Please select at least one clinical department');
      return;
    }
    setLoading(true);
    try {
      await API.post('/Hospital/Admin/add_doctor', {
        UserID: parseInt(formData.UserID, 10),
        DepartmentIds: formData.DepartmentIds,
        ClinicalDepartmentID: formData.DepartmentIds[0], // legacy fallback
        LicenseNumber: formData.LicenseNumber || '',
      });
      setShowModal(false);
      setFormData({ UserID: '', DepartmentIds: [], LicenseNumber: '' });
      fetchDoctors();
      alert('Doctor added successfully with selected departments!');
    } catch (error) {
      const msg =
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || 'Failed to add doctor';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Edit departments for existing doctor ----------
  const openEditDepartments = async (doctor) => {
    // Prefer DoctorID from the updated get_all_doctors response
    const doctorId = Number(
      doctor.doctorID ?? doctor.DoctorID ?? doctor.doctorId ?? 0
    );

    if (!doctorId) {
      alert(
        'Doctor ID is missing for this row. Refresh after updating the backend get_all_doctors endpoint.'
      );
      return;
    }

    const name =
      doctor.fullName ||
      `${doctor.firstName || doctor.FirstName || ''} ${doctor.fatherName || doctor.FatherName || ''}`.trim() ||
      doctor.username ||
      doctor.Username ||
      `Doctor #${doctorId}`;

    // Prefill from list payload if departments already included
    const existingFromList = doctor.departments || doctor.Departments;
    if (Array.isArray(existingFromList) && existingFromList.length >= 0) {
      setEditDoctor({ doctorID: doctorId, fullName: name });
      setEditDeptIds(
        (existingFromList || [])
          .map((d) => d.departmentID ?? d.DepartmentID)
          .filter(Boolean)
      );
      setEditMessage(null);
      // Still refresh from API for accuracy
      try {
        const res = await API.get(`/Hospital/Admin/doctors/${doctorId}/departments`);
        const list = res.data?.departments || res.data || [];
        setEditDeptIds(
          list.map((d) => d.departmentID ?? d.DepartmentID).filter(Boolean)
        );
      } catch (_) {
        // keep prefilled ids
      }
      return;
    }

    await loadEditState(doctorId, name);
  };

  const loadEditState = async (doctorId, fullName) => {
    setEditMessage(null);
    setEditDoctor({ doctorID: doctorId, fullName });
    try {
      const res = await API.get(`/Hospital/Admin/doctors/${doctorId}/departments`);
      const list = res.data?.departments || res.data || [];
      const ids = list.map(
        (d) => d.departmentID ?? d.DepartmentID ?? d.clinicalDepartmentID
      );
      setEditDeptIds(ids.filter(Boolean));
    } catch (err) {
      console.error(err);
      setEditDeptIds([]);
      setEditMessage('Could not load current departments');
    }
  };

  const toggleEditDept = (deptId) => {
    setEditDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const saveDoctorDepartments = async () => {
    if (!editDoctor?.doctorID) return;
    setSavingDepts(true);
    setEditMessage(null);
    try {
      const res = await API.put(
        `/Hospital/Admin/doctors/${editDoctor.doctorID}/departments`,
        { departmentIds: editDeptIds }
      );
      const saved = res.data?.departments || [];
      setEditMessage(
        `Saved ${saved.length} department(s) successfully.`
      );
      // optionally refresh list
      fetchDoctors();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to save departments';
      setEditMessage(msg);
    } finally {
      setSavingDepts(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Doctors</h2>
          <p className="text-gray-600 text-sm">
            Manage hospital doctors and assign multiple clinical departments
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ UserID: '', DepartmentIds: [], LicenseNumber: '' });
            setShowModal(true);
          }}
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

      {/* Search */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="bi bi-search text-blue-500"></i> Search Doctors
        </h3>
        <div className="relative max-w-md">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search by name, username, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor.doctorID ?? doctor.userID ?? doctor.username}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">
                      {doctor.doctorID ?? doctor.DoctorID ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {doctor.firstName || doctor.FirstName} {doctor.fatherName || doctor.FatherName}
                    </td>
                    <td className="px-6 py-4 text-sm">{doctor.username}</td>
                    <td className="px-6 py-4 text-sm">{doctor.email}</td>
                    <td className="px-6 py-4 text-sm">{doctor.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {doctor.role || 'Doctor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => openEditDepartments(doctor)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                      >
                        <i className="bi bi-building me-1"></i>
                        Assign Departments
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No doctors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== Add Doctor Modal (multi-select departments) ========== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <i className="bi bi-person-badge-plus text-blue-500"></i> Add New Doctor
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.UserID}
                  onChange={(e) =>
                    setFormData({ ...formData, UserID: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.userID} value={user.userID}>
                      {user.firstName} {user.fatherName} (
                      {(user.roles || []).join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-select Clinical Departments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Departments <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    (select one or more)
                  </span>
                </label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                  {departments.length === 0 && (
                    <p className="text-sm text-gray-500">No departments found</p>
                  )}
                  {departments.map((dept) => {
                    const id = getDeptId(dept);
                    const name = getDeptName(dept);
                    const checked = formData.DepartmentIds.includes(id);
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white rounded px-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFormDept(id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-800">{name}</span>
                      </label>
                    );
                  })}
                </div>
                {formData.DepartmentIds.length > 0 && (
                  <p className="text-xs text-indigo-600 mt-1">
                    {formData.DepartmentIds.length} department(s) selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  placeholder="Enter license number"
                  value={formData.LicenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, LicenseNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="bi bi-hourglass-split animate-spin"></i> Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle"></i> Add Doctor
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== Edit Departments Modal ========== */}
      {editDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <i className="bi bi-building text-indigo-500"></i>
                  Assign Departments
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editDoctor.fullName || `Doctor ID ${editDoctor.doctorID}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditDoctor(null);
                  setEditDeptIds([]);
                  setEditMessage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto space-y-2 bg-gray-50 mb-4">
              {departments.map((dept) => {
                const id = getDeptId(dept);
                const name = getDeptName(dept);
                const checked = editDeptIds.includes(id);
                return (
                  <label
                    key={id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white rounded px-2 py-1.5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEditDept(id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-800">{name}</span>
                  </label>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 mb-3">
              {editDeptIds.length} department(s) selected. Saving replaces the full
              assignment list.
            </p>

            {editMessage && (
              <div
                className={`mb-3 p-3 rounded text-sm ${
                  editMessage.toLowerCase().includes('fail') ||
                  editMessage.toLowerCase().includes('could not')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                {editMessage}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={saveDoctorDepartments}
                disabled={savingDepts}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingDepts ? (
                  <>
                    <i className="bi bi-hourglass-split animate-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i> Save Departments
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditDoctor(null);
                  setEditDeptIds([]);
                  setEditMessage(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;