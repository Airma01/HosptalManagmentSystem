/**
 * Referral summary card from ReferralDetailDto / ReferralResponseDto fields.
 */
function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

function StatusBadge({ status }) {
  const s = (status ?? "").toString().toLowerCase();
  let cls = "bg-slate-100 text-slate-700";
  if (s === "pending" || s === "draft") cls = "bg-amber-100 text-amber-800";
  else if (s === "accepted" || s === "intransit") cls = "bg-emerald-100 text-emerald-800";
  else if (s === "completed") cls = "bg-indigo-100 text-indigo-800";
  else if (s === "rejected" || s === "cancelled") cls = "bg-rose-100 text-rose-800";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

export default function ReferralDetailCard({ referral }) {
  if (!referral) return null;

  const fields = [
    { label: "Referral ID", value: referral.referralID },
    { label: "Visit ID", value: referral.patientVisitID },
    { label: "Status", value: <StatusBadge status={referral.status} /> },
    { label: "Urgency", value: referral.urgency || "—" },
    { label: "Type", value: referral.referralType || "—" },
    { label: "Referral Date", value: formatDate(referral.referralDate) },
    { label: "Expected Arrival", value: formatDate(referral.expectedArrivalDate) },
    { label: "Referring Doctor", value: referral.referringDoctorName || "—" },
    { label: "Source Department", value: referral.referringDepartmentName || "—" },
    { label: "Receiving Doctor", value: referral.receivingDoctorName || "—" },
    { label: "Destination Department", value: referral.receivingDepartmentName || "—" },
    { label: "Destination Facility", value: referral.destinationFacility || "—" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <i className="bi bi-arrow-left-right text-indigo-500" />
          Referral Information
        </h3>
        <StatusBadge status={referral.status} />
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
        {fields.map((f) => (
          <div key={f.label}>
            <dt className="text-xs text-slate-400">{f.label}</dt>
            <dd className="text-sm font-medium text-slate-800 mt-0.5">{f.value}</dd>
          </div>
        ))}
      </dl>

      {(referral.referralReason || referral.clinicalSummary || referral.diagnosis || referral.notes) && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          {referral.referralReason && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Reason</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{referral.referralReason}</p>
            </div>
          )}
          {referral.clinicalSummary && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Clinical Summary</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{referral.clinicalSummary}</p>
            </div>
          )}
          {referral.diagnosis && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Diagnosis</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{referral.diagnosis}</p>
            </div>
          )}
          {referral.notes && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Notes</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{referral.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
