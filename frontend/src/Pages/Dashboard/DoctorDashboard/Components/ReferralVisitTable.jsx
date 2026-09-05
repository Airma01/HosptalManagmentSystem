/**
 * Visit list from ReferralVisitDto:
 *   visitID, patientID, visitDate, visitType, status, created_at
 */
function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

export default function ReferralVisitTable({ visits, selectedVisitId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
        <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 mt-3">Loading visits…</p>
      </div>
    );
  }

  if (!visits?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
        <i className="bi bi-calendar-x text-2xl text-slate-300" />
        <p className="mt-2 text-slate-600 font-medium">No previous visits found for this patient.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <i className="bi bi-calendar2-check text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-700">Existing Patient Visits</h3>
        <span className="ml-auto text-xs text-slate-400">{visits.length} visit(s)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-2.5">Visit ID</th>
              <th className="px-4 py-2.5">Visit Date</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visits.map((v) => {
              const selected = selectedVisitId === v.visitID;
              return (
                <tr
                  key={v.visitID}
                  className={`transition ${selected ? "bg-indigo-50/70" : "hover:bg-slate-50/80"}`}
                >
                  <td className="px-4 py-2.5 tabular-nums font-medium text-slate-800">
                    {v.visitID}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                    {formatDate(v.visitDate)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{v.visitType || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600">{v.status || "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onSelect?.(v)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selected
                          ? "bg-indigo-600 text-white"
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      <i className={`bi ${selected ? "bi-check2-circle" : "bi-cursor"}`} />
                      {selected ? "Selected" : "Select Visit"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
