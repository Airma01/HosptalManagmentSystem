// import ReceptionistDashboard from '../ReceptionistDashboard/ReceptionistDashboard';
import { Route } from 'react-router-dom';
import {PatientList,VisitList,CreateVisit,ReceptionistDashboard} from '../ReceptionistDashboard/PatientList';
// import PatientList from '../ReceptionistDashboard/PatientList';
// import VisitList from '../ReceptionistDashboard/VisitList';
// import CreateVisit from '../ReceptionistDashboard/Cre';
export const AppRoutes = () => {
  return (
// Inside Routes:
<Route path="/receptionist" element={<ReceptionistDashboard />}>
  {/* <Route index element={<Navigate to="patients" replace />} />
  <Route path="patients" element={<PatientList />} />
    <Route path="visits" element={<VisitList />} />
    <Route path="create-visit" element={<CreateVisit />} /> */}
  </Route>
  )
}

