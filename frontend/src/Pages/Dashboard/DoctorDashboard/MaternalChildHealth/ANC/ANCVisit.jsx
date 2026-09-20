import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";

/** Alias: create form lives on ANCQueue modal. Redirect to queue (or /doctor if not allowed). */
export default function ANCVisit() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const [mchAccessAllowed, setMchAccessAllowed] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (cancelled) return;
      if (!ok) {
        navigate("/doctor", { replace: true });
        setMchAccessAllowed(false);
      } else {
        setMchAccessAllowed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (mchAccessAllowed !== true) {
    return (
      <div className="p-6 text-slate-500 text-sm flex items-center gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        Checking access…
      </div>
    );
  }

  return <Navigate to={`/doctor/maternal/patient/${patientId}/${visitId}/anc`} replace />;
}
