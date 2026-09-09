import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import API from '../../../Config/API';

const NurseLayout = () => {
  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchNurse = async () => {
      try {
        const res = await API.get('/Hospital/nurse/NurseAuth/auth_me');
        setNurse(res.data);
      } catch {
        setNurse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNurse();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/Bishoftu/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Loading nurse workspace...</p>
        </div>
      </div>
    );
  }

  const fullName = nurse?.fullName || 'Nurse';

  const navItems = [
    { to: '/nurse/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/nurse/patients', icon: 'bi-people', label: 'Patients' },
    { to: '/nurse/patients/register', icon: 'bi-person-plus', label: 'Register Patient' },
    { to: '/nurse/visits/today', icon: 'bi-calendar-check', label: "Today's Visits" },
    { to: '/nurse/visits/create-triage', icon: 'bi-clipboard2-pulse', label: 'Visit + Triage' },
    { to: '/nurse/triage/pending', icon: 'bi-hourglass-split', label: 'Pending Triage' },
    { to: '/nurse/prescriptions/create', icon: 'bi-capsule', label: 'New Prescription' },
    { to: '/nurse/laboratory/request', icon: 'bi-eyedropper', label: 'Request Lab Test' },
  ];

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
            <i className="bi bi-heart-pulse text-white text-lg" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Nurse Workspace</h1>
            <p className="text-xs text-slate-500 mt-0.5">Hospital EHR</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <i className="bi bi-person-badge text-teal-700 text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{fullName}</p>
            <p className="text-xs text-slate-500">Nurse</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Clinical
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/nurse/dashboard' || item.to === '/nurse/patients'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <i className={`bi ${item.icon} text-base w-5 text-center`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <i className="bi bi-box-arrow-right" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shadow-sm fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <i className="bi bi-heart-pulse text-white text-sm" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">Nurse Workspace</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'} text-xl`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default NurseLayout;