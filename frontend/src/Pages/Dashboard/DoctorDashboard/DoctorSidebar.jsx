import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

/**
 * Horizontal top navigation for the Doctor portal.
 * Replaces the previous vertical left sidebar.
 * Routes are preserved exactly as before.
 */

function isPathActive(pathname, to, end = false) {
  if (end) return pathname === to || pathname === `${to}/`;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function DropdownItem({ to, icon, title, description, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-start gap-3 px-3 py-2.5 rounded-lg transition group ${
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      <span
        className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
          "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
        }`}
      >
        <i className={`bi ${icon}`} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-tight">{title}</span>
        {description && (
          <span className="block text-xs text-slate-400 mt-0.5 leading-snug">
            {description}
          </span>
        )}
      </span>
    </NavLink>
  );
}

function DesktopDropdown({ id, label, open, onToggle, active, children }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          active || open
            ? "text-indigo-700 bg-indigo-50"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
      >
        {label}
        <i
          className={`bi bi-chevron-down text-[10px] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
        {(active || open) && (
          <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-indigo-600 transition-all duration-200" />
        )}
      </button>

      <div
        className={`absolute left-0 top-full mt-2 w-72 origin-top transition-all duration-200 ease-out ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
            : "opacity-0 -translate-y-1 pointer-events-none scale-[0.98]"
        }`}
      >
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-2">
          <p className="px-3 pt-1.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <div className="space-y-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function TopLink({ to, end, children, onNavigate }) {
  const location = useLocation();
  const active = isPathActive(location.pathname, to, end);

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "text-indigo-700 bg-indigo-50"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      {children}
      {active && (
        <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-indigo-600 transition-all duration-200" />
      )}
    </NavLink>
  );
}

export default function DoctorSidebar() {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null); // "referrals" | "clinical" | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const navRef = useRef(null);

  const path = location.pathname;

  const referralsActive =
    path.startsWith("/doctor/referrals");
  const clinicalActive =
    path.startsWith("/doctor/consultation") ||
    path.startsWith("/doctor/adult") ||
    path.startsWith("/doctor/maternal");

  // Close dropdowns on route change
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSection(null);
  }, [location.pathname]);

  // Click outside + Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSection(null);
  };

  const toggleMenu = (id) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="h-14 md:h-16 flex items-center gap-3 px-3 md:px-5">
        {/* Brand */}
        <NavLink
          to="/doctor"
          end
          onClick={closeAll}
          className="flex items-center gap-2.5 shrink-0 mr-1 md:mr-3"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <i className="bi bi-heart-pulse-fill text-lg" />
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="font-semibold text-slate-800 text-sm">Doctor Portal</p>
            <p className="text-[11px] text-slate-400">HospitalSys EHR</p>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0">
          <TopLink to="/doctor" end onNavigate={closeAll}>
            <i className="bi bi-house text-base" />
            Dashboard
          </TopLink>

          <DesktopDropdown
            id="referrals"
            label="Referrals"
            open={openMenu === "referrals"}
            onToggle={() => toggleMenu("referrals")}
            active={referralsActive}
          >
            <DropdownItem
              to="/doctor/referrals"
              icon="bi-arrow-left-right"
              title="Referral Queue"
              description="View incoming referrals"
              onNavigate={closeAll}
            />
            <DropdownItem
              to="/doctor/referrals/create"
              icon="bi-plus-circle"
              title="Create Referral"
              description="Refer patient"
              onNavigate={closeAll}
            />
          </DesktopDropdown>

          <DesktopDropdown
            id="clinical"
            label="Clinical Care"
            open={openMenu === "clinical"}
            onToggle={() => toggleMenu("clinical")}
            active={clinicalActive}
          >
            <DropdownItem
              to="/doctor/consultation/triage"
              icon="bi-clipboard2-pulse"
              title="Consultation Queue"
              description="General consultation"
              onNavigate={closeAll}
            />
            <DropdownItem
              to="/doctor/adult/triage"
              icon="bi-heart-pulse"
              title="Adult Care Queue"
              description="Adult medical care"
              onNavigate={closeAll}
            />
            <DropdownItem
              to="/doctor/maternal/triage"
              icon="bi-gender-female"
              title="Maternal & Child Queue"
              description="Maternal & child health"
              onNavigate={closeAll}
            />
          </DesktopDropdown>

          <TopLink to="/doctor/appointments" onNavigate={closeAll}>
            <i className="bi bi-calendar-check text-base" />
            Appointments
          </TopLink>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="ml-auto lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"} text-xl`} />
        </button>
      </div>

      {/* Mobile panel */}
      <div
        className={`lg:hidden overflow-hidden border-t border-slate-100 transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-3 py-3 space-y-1 bg-white max-h-[70vh] overflow-y-auto">
          <NavLink
            to="/doctor"
            end
            onClick={closeAll}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`
            }
          >
            <i className="bi bi-house" />
            Dashboard
          </NavLink>

          {/* Referrals accordion */}
          <div>
            <button
              type="button"
              onClick={() =>
                setMobileSection((s) => (s === "referrals" ? null : "referrals"))
              }
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                referralsActive
                  ? "text-indigo-700 bg-indigo-50/60"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <i className="bi bi-arrow-left-right" />
                Referrals
              </span>
              <i
                className={`bi bi-chevron-down text-xs transition-transform duration-200 ${
                  mobileSection === "referrals" ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                mobileSection === "referrals" ? "max-h-40 mt-1" : "max-h-0"
              }`}
            >
              <div className="pl-4 space-y-0.5">
                <NavLink
                  to="/doctor/referrals"
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <i className="bi bi-arrow-left-right text-xs" />
                  Referral Queue
                </NavLink>
                <NavLink
                  to="/doctor/referrals/create"
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <i className="bi bi-plus-circle text-xs" />
                  Create Referral
                </NavLink>
              </div>
            </div>
          </div>

          {/* Clinical Care accordion */}
          <div>
            <button
              type="button"
              onClick={() =>
                setMobileSection((s) => (s === "clinical" ? null : "clinical"))
              }
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                clinicalActive
                  ? "text-indigo-700 bg-indigo-50/60"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <i className="bi bi-clipboard2-pulse" />
                Clinical Care
              </span>
              <i
                className={`bi bi-chevron-down text-xs transition-transform duration-200 ${
                  mobileSection === "clinical" ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                mobileSection === "clinical" ? "max-h-56 mt-1" : "max-h-0"
              }`}
            >
              <div className="pl-4 space-y-0.5">
                <NavLink
                  to="/doctor/consultation/triage"
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <i className="bi bi-clipboard2-pulse text-xs" />
                  Consultation Queue
                </NavLink>
                <NavLink
                  to="/doctor/adult/triage"
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <i className="bi bi-heart-pulse text-xs" />
                  Adult Care Queue
                </NavLink>
                <NavLink
                  to="/doctor/maternal/triage"
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <i className="bi bi-gender-female text-xs" />
                  Maternal & Child Queue
                </NavLink>
              </div>
            </div>
          </div>

          <NavLink
            to="/doctor/appointments"
            onClick={closeAll}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`
            }
          >
            <i className="bi bi-calendar-check" />
            Appointments
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
