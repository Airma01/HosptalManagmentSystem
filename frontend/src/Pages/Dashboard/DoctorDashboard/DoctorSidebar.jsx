import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
    isActive
      ? "bg-indigo-600 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function DoctorSidebar({ open, onClose }) {
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-200">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
          <i className="bi bi-heart-pulse-fill text-lg" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm leading-tight">Doctor Portal</p>
          <p className="text-xs text-slate-400">HospitalSys EHR</p>
        </div>
        <button
          type="button"
          className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <nav className="p-3 space-y-1">
        <NavLink to="/doctor" end className={linkClass} onClick={onClose}>
          <i className="bi bi-house" />
          Dashboard
        </NavLink>

        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Consultation
        </p>
        <NavLink to="/doctor/consultation/triage" className={linkClass} onClick={onClose}>
          <i className="bi bi-clipboard2-pulse" />
          Consultation Queue
        </NavLink>

        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Adult Medical Care
        </p>
        <NavLink to="/doctor/adult/triage" className={linkClass} onClick={onClose}>
          <i className="bi bi-heart-pulse" />
          Adult Care Queue
        </NavLink>

        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Maternal & Child
        </p>
        <NavLink to="/doctor/maternal/triage" className={linkClass} onClick={onClose}>
          <i className="bi bi-gender-female" />
          Maternal & Child Queue
        </NavLink>
      </nav>
    </aside>
  );
}
