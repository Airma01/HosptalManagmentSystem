/**
 * Table of incoming referrals (ReferralQueueDto fields).
 * Actual API properties (camelCase from ASP.NET):
 *   referralID, patientID, patientName, mrn, patientVisitID,
 *   referringDepartmentName, referringDoctorName, referralReason,
 *   urgency, status, referralDate, referralType
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

function UrgencyBadge({ urgency }) {
  if (!urgency) return <span className="text-slate-400 text-sm">—</span>;
  const u = urgency.toString().toLowerCase();
  let cls = "bg-slate-100 text-slate-700";
  if (u.includes("emerg") || u.includes("critical")) cls = "bg-rose-100 text-rose-800";
  else if (u.includes("urgent")) cls = "bg-orange-100 text-orange-800";
  else if (u.includes("routine") || u.includes("normal")) cls = "bg-sky-100 text-sky-800";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {urgency}
    </span>
  );
}

export default function ReferralTable({ rows, onView }) {
  if (!rows?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
        <i className="bi bi-inbox text-3xl text-slate-300" />
        <p className="mt-3 text-slate-600 font-medium">No incoming referrals</p>
        <p className="text-sm text-slate-400 mt-1">
          Referrals addressed to your department will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Patient ID</th>
              <th className="px-4 py-3">From Department</th>
              <th className="px-4 py-3">Referred By</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Urgency</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.referralID} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{r.patientName || "—"}</div>
                  {r.mrn && <div className="text-xs text-slate-400">MRN: {r.mrn}</div>}
                </td>
                <td className="px-4 py-3 text-slate-600 tabular-nums">{r.patientID}</td>
                <td className="px-4 py-3 text-slate-600">
                  {r.referringDepartmentName || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.referringDoctorName || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate" title={r.referralReason || ""}>
                  {r.referralReason || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {formatDate(r.referralDate)}
                </td>
                <td className="px-4 py-3">
                  <UrgencyBadge urgency={r.urgency} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onView?.(r.referralID)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <i className="bi bi-eye" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
