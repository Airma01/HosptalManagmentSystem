import { Navigate } from 'react-router-dom';

/** Entry redirect based on stored role */
export default function RadiologyDashboard() {
  const role = (localStorage.getItem('role') || '').toLowerCase();
  if (role === 'radiographer') return <Navigate to="/radiology/radiographer" replace />;
  if (role === 'radiologist') return <Navigate to="/radiology/radiologist" replace />;
  if (role === 'doctor') return <Navigate to="/radiology/requests" replace />;
  return <Navigate to="/radiology/radiographer" replace />;
}
