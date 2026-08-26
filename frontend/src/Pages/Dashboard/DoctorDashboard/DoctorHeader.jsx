import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthenticatedUser } from "../../../utils/getAuthenticatedUser";

function pageTitle(pathname) {
  if (pathname.includes("/consultation/patient/")) return "Consultation Patient";
  if (pathname.includes("/adult/patient/")) return "Adult Medical Care Patient";
  if (pathname.includes("/consultation/triage")) return "Consultation Queue";
  if (pathname.includes("/adult/triage")) return "Adult Care Queue";
  if (pathname === "/doctor" || pathname === "/doctor/") return "Dashboard";
  return "Doctor";
}

export default function DoctorHeader({ onMenuClick }) {
  const [doctor, setDoctor] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getAuthenticatedUser().then((u) => setDoctor(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/Bishoftu/login", { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 md:px-6 sticky top-0 z-20">
      <button
        type="button"
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        onClick={onMenuClick}
      >
        <i className="bi bi-list text-xl" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="text-base md:text-lg font-semibold text-slate-800 truncate">
          {pageTitle(location.pathname)}
        </h1>
        {doctor?.departmentName && (
          <p className="text-xs text-slate-400 truncate">{doctor.departmentName}</p>
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
          className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50"
          title="Logout"
        >
          <i className="bi bi-box-arrow-right" />
        </button>
      </div>
    </header>
  );
}
