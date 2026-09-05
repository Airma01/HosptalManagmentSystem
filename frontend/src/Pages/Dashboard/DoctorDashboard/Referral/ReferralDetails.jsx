import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getReferralDetails } from "../Services/referralApi";
import { getAuthenticatedUser } from "../../../../utils/getAuthenticatedUser";
import ReferralDetailCard from "../Components/ReferralDetailCard";
import ReferralPatientInfo from "../Components/ReferralPatientInfo";
import ReferralActionCards from "../Components/ReferralActionCards";
import ReferralVisits from "./ReferralVisits";
import ReferralStatusModal from "./ReferralStatusModal";

/**
 * Referral detail page.
 * Route: /doctor/referrals/:referralId
 * Data: GET /api/referral-queue/{referralId} → ReferralDetailDto
 */
export default function ReferralDetails() {
  const { referralId } = useParams();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [modal, setModal] = useState({ open: false, action: null });
  const [user, setUser] = useState(null);

  const load = useCallback(async () => {
    if (!referralId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getReferralDetails(referralId);
      setReferral(res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError("Unauthorized. Please log in again.");
      else if (status === 403) setError("You are not authorized to view this referral.");
      else if (status === 404) setError("Referral not found.");
      else setError(err.response?.data?.message || "Unable to load referral details.");
      setReferral(null);
    } finally {
      setLoading(false);
    }
  }, [referralId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getAuthenticatedUser();
      if (!cancelled) setUser(u);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const status = (referral?.status ?? "").toString().toLowerCase();
  const deptId = user?.departmentID != null ? Number(user.departmentID) : null;
  const isReceiving =
    deptId != null && referral?.receivingDepartmentID != null
      ? Number(referral.receivingDepartmentID) === deptId
      : false;
  const isReferring =
    deptId != null && referral?.referringDepartmentID != null
      ? Number(referral.referringDepartmentID) === deptId
      : false;

  const canAccept = isReceiving && (status === "pending" || status === "draft");
  const canReject = isReceiving && (status === "pending" || status === "draft");
  const canCancel = isReferring && (status === "pending" || status === "draft");

  const patientId = referral?.patientID;
  const linkedVisitId = referral?.patientVisitID;
  const selectedVisitId = selectedVisit?.visitID ?? null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            to="/doctor/referrals"
            className="mt-1 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
          >
            <i className="bi bi-arrow-left" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Referral Details</h2>
            <p className="text-sm text-slate-500">
              {referralId ? `Referral #${referralId}` : "—"}
            </p>
          </div>
        </div>

        {referral && (canAccept || canReject || canCancel) && (
          <div className="flex flex-wrap gap-2">
            {canAccept && (
              <button
                type="button"
                onClick={() => setModal({ open: true, action: "accept" })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                <i className="bi bi-check-circle" />
                Accept
              </button>
            )}
            {canReject && (
              <button
                type="button"
                onClick={() => setModal({ open: true, action: "reject" })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                <i className="bi bi-x-circle" />
                Reject
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={() => setModal({ open: true, action: "cancel" })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition"
              >
                <i className="bi bi-slash-circle" />
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-3">Loading referral details…</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
          <i className="bi bi-exclamation-triangle mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && referral && (
        <>
          <ReferralDetailCard referral={referral} />
          <ReferralPatientInfo patient={referral.patient} />

          <ReferralVisits
            patientId={patientId}
            linkedVisitId={linkedVisitId}
            selectedVisitId={selectedVisitId}
            onSelectVisit={setSelectedVisit}
          />

          <ReferralActionCards patientId={patientId} visitId={selectedVisitId} />
        </>
      )}

      <ReferralStatusModal
        open={modal.open}
        action={modal.action}
        referralId={referral?.referralID ?? referralId}
        onClose={() => setModal({ open: false, action: null })}
        onSuccess={load}
      />
    </div>
  );
}
