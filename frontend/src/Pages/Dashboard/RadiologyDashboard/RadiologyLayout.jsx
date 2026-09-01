import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import API from '../../../Config/API';
import RadiologyHeader from './Components/RadiologyHeader';
import RadiologySidebar from './Components/RadiologySidebar';
import './radiology.css';

const RADIOGRAPHER_NAV = [
  { to: '/radiology/radiographer', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/radiology/radiographer/queue', label: 'Radiology Queue', icon: 'bi-list-check' },
  { to: '/radiology/radiographer/completed', label: 'Completed', icon: 'bi-check-circle' },
  { to: '/radiology/departments', label: 'Departments', icon: 'bi-building' },
  { to: '/radiology/test-types', label: 'Test Types', icon: 'bi-card-list' },
];

const RADIOLOGIST_NAV = [
  { to: '/radiology/radiologist', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/radiology/radiologist/queue', label: 'Review Queue', icon: 'bi-list-check' },
  { to: '/radiology/radiologist/completed', label: 'Completed Reports', icon: 'bi-file-earmark-medical' },
  { to: '/radiology/departments', label: 'Departments', icon: 'bi-building' },
  { to: '/radiology/test-types', label: 'Test Types', icon: 'bi-card-list' },
];

const DOCTOR_NAV = [
  { to: '/radiology/requests', label: 'Requests', icon: 'bi-clipboard2-pulse' },
  { to: '/radiology/requests/create', label: 'New Request', icon: 'bi-plus-circle' },
  { to: '/radiology/departments', label: 'Departments', icon: 'bi-building' },
  { to: '/radiology/test-types', label: 'Test Types', icon: 'bi-card-list' },
];

export default function RadiologyLayout({ mode = 'radiographer' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navItems = useMemo(() => {
    if (mode === 'radiologist') return RADIOLOGIST_NAV;
    if (mode === 'doctor') return DOCTOR_NAV;
    return RADIOGRAPHER_NAV;
  }, [mode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (mode === 'radiographer') {
          const res = await API.get('/radiographer/RadiographerAuth/auth_me');
          if (!cancelled) setUser(res.data);
        } else if (mode === 'doctor') {
          const stored = localStorage.getItem('user');
          if (stored) setUser(JSON.parse(stored));
        } else {
          // radiologist: try radiographer auth_me first, then stored user
          try {
            const res = await API.get('/radiographer/RadiographerAuth/auth_me');
            if (!cancelled) setUser(res.data);
          } catch {
            const stored = localStorage.getItem('user');
            if (stored && !cancelled) setUser(JSON.parse(stored));
          }
        }
      } catch {
        if (!cancelled) setUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const handleLogout = async () => {
    try {
      if (mode === 'radiographer') {
        await API.post('/radiographer/RadiographerAuth/logout');
      }
    } catch {
      /* ignore */
    }
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/Bishoftu/login', { replace: true });
  };

  const title =
    mode === 'radiologist'
      ? 'Radiologist Portal'
      : mode === 'doctor'
        ? 'Radiology Requests'
        : 'Radiographer Portal';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <RadiologySidebar items={navItems} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <RadiologyHeader
          title={title}
          subtitle={location.pathname}
          user={user}
          onLogout={handleLogout}
          onMenu={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet context={{ user, mode }} />
        </main>
      </div>
    </div>
  );
}
