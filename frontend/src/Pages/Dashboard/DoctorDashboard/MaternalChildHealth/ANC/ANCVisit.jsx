import { Navigate, useParams } from "react-router-dom";
/** Alias: create form lives on ANCQueue modal. Redirect to queue. */
export default function ANCVisit() {
  const { patientId, visitId } = useParams();
  return <Navigate to={`/doctor/maternal/patient/${patientId}/${visitId}/anc`} replace />;
}
