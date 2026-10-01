import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../../Config/API";
import {
  getAuthenticatedUser,
  clearAuthenticatedUserCache,
} from "../../../utils/getAuthenticatedUser";

function pageTitle(pathname) {
  if (pathname.includes("/consultation/patient/")) return "Consultation Patient";
  if (pathname.includes("/adult/patient/")) return "Adult Medical Care Patient";
  if (pathname.includes("/maternal/patient/")) return "Maternal & Child Patient";
  if (pathname.includes("/consultation/triage")) return "Consultation Queue";
  if (pathname.includes("/adult/triage")) return "Adult Care Queue";
  if (pathname.includes("/maternal/child-health/triage")) return "Child Health Queue";
  if (pathname.includes("/maternal/triage")) return "Maternal Health Queue";
  if (pathname.includes("/referrals/create")) return "Create Referral";
  if (pathname.includes("/referrals")) return "Referral Queue";
  if (pathname.includes("/appointments")) return "Appointments";
  if (pathname === "/doctor" || pathname === "/doctor/") return "Dashboard";
  return "Doctor";
}

/**
 * Secondary header under the horizontal navbar.
 * Shows page title, department selector, doctor identity, and logout.
 */
export default function DoctorHeader() {
  const [doctor, setDoctor] = useState(null);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const loadUser = async (force = false) => {
    const u = await getAuthenticatedUser(force);
    setDoctor(u);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = () => {
    clearAuthenticatedUserCache();
    localStorage.removeItem("role");
    navigate("/Bishoftu/login", { replace: true });
  };

  const handleDepartmentChange = async (e) => {
    const newDeptId = parseInt(e.target.value, 10);
    if (!newDeptId || !doctor) return;

    // Already active
    const currentId = Number(doctor.departmentID ?? doctor.activeDepartment?.departmentID);
    if (currentId === newDeptId) return;

    setSwitching(true);
    setError(null);
    try {
      await API.post("/Hospital/doctor/DoctorAuth/switch_department", {
        departmentID: newDeptId,
      });

      // Invalidate cache and re-fetch auth_me (which now has the new active department)
      clearAuthenticatedUserCache();
      await loadUser(true);

      // Force a soft refresh of the current page so queues/dashboard re-evaluate permissions
      // Using navigate(0) or a key change; simplest is to reload the current path
      navigate(0);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.status === 403
          ? "You are not assigned to this department"
          : "Failed to switch department";
      setError(msg);
      console.error("switch_department failed", err);
    } finally {
      setSwitching(false);
    }
  };

  const departments = doctor?.departments || [];
  const activeDeptId = Number(
    doctor?.departmentID ?? doctor?.activeDepartment?.departmentID ?? 0
  );

  return (
    <div className="h-12 md:h-14 bg-white border-b border-slate-100 flex items-center gap-3 px-4 md:px-6 sticky top-14 md:top-16 z-30">
      <div className="min-w-0 flex-1">
        <h1 className="text-sm md:text-base font-semibold text-slate-800 truncate">
          {pageTitle(location.pathname)}
        </h1>
        {departments.length > 0 ? (
          <div className="flex items-center gap-2 mt-0.5">
            <label className="text-xs text-slate-400 whitespace-nowrap">
              Active Dept:
            </label>
            <select
              value={activeDeptId || ""}
              onChange={handleDepartmentChange}
              disabled={switching || departments.length <= 1}
              className="text-xs border border-slate-200 rounded px-2 py-0.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 max-w-[180px] truncate"
            >
              {departments.map((d) => (
                <option key={d.departmentID} value={d.departmentID}>
                  {d.departmentName}
                </option>
              ))}
            </select>
            {switching && (
              <span className="text-xs text-indigo-500">Switching…</span>
            )}
          </div>
        ) : (
          doctor?.departmentName && (
            <p className="text-xs text-slate-400 truncate">
              {doctor.departmentName}
            </p>
          )
        )}
        {error && (
          <p className="text-xs text-red-500 mt-0.5 truncate">{error}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-slate-700">
            {doctor?.fullName || "Doctor"}
          </p>
          <p className="text-xs text-slate-400">
            ID: {doctor?.doctorID ?? doctor?.doctorId ?? "—"}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <i className="bi bi-person-vcard" />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
          title="Logout"
        >
          <i className="bi bi-box-arrow-right" />
        </button>
      </div>
    </div>
  );
}
