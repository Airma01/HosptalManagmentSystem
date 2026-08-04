import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../Config/API';

const DepartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStaff, setCurrentStaff] = useState([]);
  const [unassignedStaff, setUnassignedStaff] = useState([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ---- NEW: Role toggle ----
  const [role, setRole] = useState('Doctor'); // "Doctor" or "Nurse"

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Guard
  useEffect(() => {
    if (!id) {
      setError('Department ID is missing from the URL.');
      setLoading(false);
    }
  }, [id]);

  // Fetch department (fallback)
  const fetchDepartment = async () => {
    if (!id) return;
    try {
      const response = await API.get(`/Hospital/Admin/department/${id}`);
      setDepartment(response.data);
    } catch (err) {
      console.warn('Department details not found, using fallback.', err);
    }
  };

  // ---- Fetch functions that depend on role ----
  const fetchCurrentStaff = async () => {
    if (!id) return;
    try {
      let endpoint;
      if (role === 'Doctor') {
        endpoint = `/Hospital/Admin/get_doctor_for_department/${id}`;
      } else {
        // FUTURE: change to nurse endpoint when available
        endpoint = `/Hospital/Admin/get_nurse_for_department/${id}`;
        // For now, return empty array or mock data
        setCurrentStaff([]);
        return;
      }
      const response = await API.get(endpoint);
      setCurrentStaff(response.data);
    } catch (err) {
      console.error(`Error fetching ${role}s:`, err);
      setError(`Failed to load ${role}s in this department.`);
    }
  };

  const fetchUnassignedStaff = async () => {
    try {
      let endpoint;
      if (role === 'Doctor') {
        endpoint = '/Hospital/Admin/get_unassigned_doctors';
      } else {
        // FUTURE: change to nurse endpoint when available
        endpoint = '/Hospital/Admin/get_unassigned_nurses';
        // For now, return empty array or mock data
        setUnassignedStaff([]);
        return;
      }
      const response = await API.get(endpoint);
      setUnassignedStaff(response.data);
    } catch (err) {
      console.error(`Error fetching unassigned ${role}s:`, err);
      setError(`Failed to load available ${role}s.`);
    }
  };

  // Load all data when role or id changes
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoading(true);
      setError('');
      await fetchDepartment();
      await Promise.all([fetchCurrentStaff(), fetchUnassignedStaff()]);
      setLoading(false);
    };
    loadData();
  }, [id, role]); // 👈 re-run when role changes

  // ---- Selection for adding ----
  const handleSelectStaff = (userId) => {
    setSelectedStaffIds((prev) =>
      prev.includes(userId)
        ? prev.filter((uid) => uid !== userId)
        : [...prev, userId]
    );
  };

  // ---- Add staff ----
  const handleAddStaff = async () => {
    if (selectedStaffIds.length === 0) {
      setMessage(`Please select at least one ${role.toLowerCase()}.`);
      return;
    }
    setAdding(true);
    setMessage('');
    setError('');
    try {
      let endpoint;
      if (role === 'Doctor') {
        endpoint = `/Hospital/Admin/add_select_user_doctor_role/${id}`;
      } else {
        // FUTURE: nurse add endpoint
        endpoint = `/Hospital/Admin/add_select_user_nurse_role/${id}`;
        // Simulate success for now
        setMessage(`Nurse assignment is not yet implemented.`);
        setSelectedStaffIds([]);
        setAdding(false);
        return;
      }
      await API.post(endpoint, { userIDs: selectedStaffIds });
      setMessage(`${role}s added successfully!`);
      await fetchCurrentStaff();
      await fetchUnassignedStaff();
      setSelectedStaffIds([]);
    } catch (err) {
      console.error(`Error adding ${role}s:`, err);
      setError(`Failed to add ${role}s. Please try again.`);
    } finally {
      setAdding(false);
    }
  };

  // ---- Delete ----
  const openDeleteModal = (staff) => {
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;
    setDeleting(true);
    try {
      let endpoint;
      if (role === 'Doctor') {
        endpoint = `/Hospital/Admin/remove_doctor_from_department/${staffToDelete.doctorID}`;
      } else {
        // FUTURE: nurse remove endpoint
        endpoint = `/Hospital/Admin/remove_nurse_from_department/${staffToDelete.nurseID}`;
        // Simulate success
        setMessage(`Nurse removal not implemented yet.`);
        setDeleting(false);
        setShowDeleteModal(false);
        setStaffToDelete(null);
        return;
      }
      await API.delete(endpoint);
      setMessage(`${role} removed successfully.`);
      await fetchCurrentStaff();
      await fetchUnassignedStaff();
    } catch (err) {
      console.error(`Error removing ${role}:`, err);
      setError(`Failed to remove ${role}. Please try again.`);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setStaffToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStaffToDelete(null);
  };

  if (loading) return <div className="p-6">Loading department data...</div>;
  if (error && !department) return <div className="p-6 text-red-500">{error}</div>;

  const displayName = department?.departmentName || `Department #${id}`;
  const displayDesc = department?.description || 'No description available';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Department Info with Back Button */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{displayName}</h2>
          <p className="text-gray-600 mt-1">{displayDesc}</p>
          <p className="text-gray-400 text-sm">ID: {id}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/admin')}
          className="btn btn-secondary px-4 py-2 rounded-lg"
        >
          ← Back to Admin
        </button>
      </div>

      {/* ---- ROLE SWITCH TOGGLE ---- */}
      <div className="mb-6 flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Role:</span>
        <div className="relative inline-block w-32 bg-gray-200 rounded-full p-1 cursor-pointer" onClick={() => setRole(role === 'Doctor' ? 'Nurse' : 'Doctor')}>
          <div
            className={`absolute top-1 left-1 w-14 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              role === 'Nurse' ? 'translate-x-16' : 'translate-x-0'
            }`}
          />
          <div className="flex justify-between text-xs font-semibold px-2 py-0.5">
            <span className={`${role === 'Doctor' ? 'text-indigo-600' : 'text-gray-500'}`}>Doctor</span>
            <span className={`${role === 'Nurse' ? 'text-indigo-600' : 'text-gray-500'}`}>Nurse</span>
          </div>
        </div>
      </div>

      {/* Current Staff Table */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">
          Current {role}s in this Department
        </h3>
        {currentStaff.length === 0 ? (
          <p className="text-gray-500">No {role.toLowerCase()}s assigned yet.</p>
        ) : (
          <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openDeleteModal(staff)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.25rem 0.75rem' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unassigned Staff - Add Section */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Add Unassigned {role}s</h3>
        {unassignedStaff.length === 0 ? (
          <p className="text-gray-500">No unassigned {role.toLowerCase()}s available.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {unassignedStaff.map((staff) => (
                <label
                  key={staff.userID || staff.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStaffIds.includes(staff.userID || staff.id)}
                    onChange={() => handleSelectStaff(staff.userID || staff.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {staff.firstName} {staff.fatherName || staff.lastName} (Username: {staff.username})
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleAddStaff}
              disabled={adding || selectedStaffIds.length === 0}
              className={`btn btn-primary px-6 py-2 text-white rounded-lg shadow-md transition ${
                adding || selectedStaffIds.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-indigo-700'
              }`}
              style={{ backgroundColor: '#4f46e5', border: 'none' }}
            >
              {adding ? 'Adding...' : `Add Selected ${role}s`}
            </button>
          </>
        )}
        {message && (
          <div className="mt-4 text-green-600 bg-green-50 p-2 rounded border border-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && staffToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={cancelDelete}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-red-600">⚠️ Confirm Removal</h3>
                <p className="text-gray-700 mt-2">
                  Are you sure you want to remove <strong>{staffToDelete.fullName}</strong> from this department?
                </p>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="btn btn-secondary px-4 py-2 rounded-lg"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn btn-danger px-4 py-2 rounded-lg"
                  disabled={deleting}
                >
                  {deleting ? 'Removing...' : 'Yes, Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;