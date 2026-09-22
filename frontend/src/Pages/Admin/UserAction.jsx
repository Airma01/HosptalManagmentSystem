import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../Config/API";

const UserAction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/Hospital/Admin/get_user/${id}`);
      setUser(res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) setError("User not found.");
      else if (status === 401 || status === 403)
        setError("You are not authorized to perform this action.");
      else setError(err.response?.data?.message || "Failed to load user.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const validatePassword = () => {
    const errs = {};
    if (!newPassword.trim()) errs.newPassword = "New password is required.";
    else if (newPassword.length < 6)
      errs.newPassword = "Password must be at least 6 characters.";
    if (!confirmPassword.trim())
      errs.confirmPassword = "Confirm password is required.";
    else if (newPassword !== confirmPassword)
      errs.confirmPassword = "Passwords must match.";
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validatePassword()) return;
    setSaving(true);
    try {
      const res = await API.put(`/Hospital/Admin/change_user_password/${id}`, {
        newPassword: newPassword,
      });
      setMessage(res.data?.message || "Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      setShowPasswordForm(false);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) setError("User not found.");
      else if (status === 401 || status === 403)
        setError("You are not authorized to perform this action.");
      else
        setPasswordErrors({
          form: err.response?.data?.message || "Failed to change password.",
        });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-500 gap-2">
        <i className="bi bi-arrow-repeat animate-spin text-2xl" />
        <span>Loading user information...</span>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          to="/admin/dashboard/users"
          className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <i className="bi bi-arrow-left" /> Back to Users
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          to="/admin/dashboard/users"
          className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <i className="bi bi-arrow-left" /> Back to Users
        </Link>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <i className="bi bi-check-circle me-2" />
          {message}
        </div>
      )}
      {error && user && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      )}

      {/* User Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-person-badge text-blue-600" />
            User Details
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Username</div>
              <div className="font-medium text-gray-900 mt-0.5">{user.username || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">User ID</div>
              <div className="font-medium text-gray-900 mt-0.5">{user.userID ?? user.userId ?? id}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">First Name</div>
              <div className="font-medium text-gray-900 mt-0.5">{user.firstName || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Father Name</div>
              <div className="font-medium text-gray-900 mt-0.5">{user.fatherName || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
              <div className="font-medium text-gray-900 mt-0.5">{user.email || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Phone</div>
              <div className="font-medium text-gray-900 mt-0.5">{user.phone || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Gender</div>
              <div className="font-medium text-gray-900 mt-0.5">
                {user.gender != null ? String(user.gender) : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
              <div className="mt-0.5">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive !== false
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Roles</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No roles</span>
                )}
              </div>
            </div>
            {user.created_at && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Created</div>
                <div className="font-medium text-gray-900 mt-0.5">
                  {new Date(user.created_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i className="bi bi-shield-lock text-amber-600" />
            Account Actions
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {!showPasswordForm ? (
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordErrors({});
                setMessage("");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
            >
              <i className="bi bi-key" />
              Change Password
            </button>
          ) : (
            <form onSubmit={submitPassword} className="space-y-4 max-w-md">
              <p className="text-sm text-gray-600">
                Set a new password for <strong>{user.username}</strong>. The user will use this
                password to log in. You do not need the current password.
              </p>
              {passwordErrors.form && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {passwordErrors.form}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordErrors({});
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Change Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAction;
