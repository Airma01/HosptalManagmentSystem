import { useMemo, useState } from "react";

/**
 * Tab navigation for doctor triage queues by Triage Department
 * (existing Triage.TriageDepartmentID → TriageDepartment.DepartmentName).
 * Default tab: Emergency.
 */

function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

function normalizeDeptName(name) {
  return String(name || "").trim().toLowerCase();
}

function isEmergency(name) {
  const n = normalizeDeptName(name);
  return n === "emergency" || n.includes("emergency");
}

function isCentral(name) {
  const n = normalizeDeptName(name);
  return n === "central" || n.includes("central");
}

/** Split by TriageDepartmentName from API (not clinical department). */
export function splitByTriageDepartment(rows) {
  const emergency = [];
  const central = [];
  const other = [];
  for (const r of rows || []) {
    const name = r.triageDepartmentName ?? r.TriageDepartmentName ?? "";
    if (isEmergency(name)) emergency.push(r);
    else if (isCentral(name)) central.push(r);
    else other.push(r);
  }
  return { emergency, central, other };
}

const TABS = [
  {
    key: "emergency",
    label: "Emergency",
    icon: "bi-exclamation-triangle-fill",
    empty: "No emergency patients waiting.",
    activeCls:
      "bg-red-50 text-red-800 border-red-300 ring-1 ring-red-200 shadow-sm",
    idleCls: "bg-white text-slate-600 border-slate-200 hover:bg-red-50/50",
  },
  {
    key: "central",
    label: "Central",
    icon: "bi-hospital",
    empty: "No central patients waiting.",
    activeCls:
      "bg-slate-100 text-slate-800 border-slate-300 ring-1 ring-slate-200 shadow-sm",
    idleCls: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
  },
];

/**
 * @param {object} props
 * @param {Array} props.rows - already search/status-filtered queue rows
 * @param {(row) => React.ReactNode} props.renderActions
 * @param {"consultation"|"simple"} [props.variant]
 */
export default function TriageDepartmentQueueSections({
  rows,
  renderActions,
  variant = "simple",
}) {
  const [activeTab, setActiveTab] = useState("emergency");

  const { emergency, central, other } = useMemo(
    () => splitByTriageDepartment(rows),
    [rows]
  );

  const counts = {
    emergency: emergency.length,
    central: central.length,
  };

  const activeRows =
    activeTab === "emergency"
      ? emergency
      : activeTab === "central"
        ? central
        : other;

  const activeMeta = TABS.find((t) => t.key === activeTab) || TABS[0];
  const showVitals = variant === "consultation";
  const colSpan = showVitals ? 8 : 6;

  return (
    <div className="space-y-3">
      {/* Horizontal department tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const selected = activeTab === tab.key;
          const count = counts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition ${
                selected ? tab.activeCls : tab.idleCls
              }`}
            >
              <i className={`bi ${tab.icon}`} />
              <span>{tab.label}</span>
              <span
                className={`inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  selected
                    ? tab.key === "emergency"
                      ? "bg-red-100 text-red-800"
                      : "bg-slate-200 text-slate-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected department table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div
          className={`px-4 py-2.5 border-b text-sm font-semibold flex items-center gap-2 ${
            activeTab === "emergency"
              ? "bg-red-50/80 text-red-800 border-red-100"
              : "bg-slate-50 text-slate-800 border-slate-100"
          }`}
        >
          <i className={`bi ${activeMeta.icon}`} />
          {activeMeta.label} patients
          <span className="text-xs font-normal opacity-70">
            ({activeRows.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white text-slate-600 text-left border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">
                  Patient
                </th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">
                  MRN
                </th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">
                  Visit
                </th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">
                  Triage time
                </th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">
                  Status
                </th>
                {showVitals && (
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">
                    Vitals
                  </th>
                )}
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">
                  Clinical dept
                </th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    <i className="bi bi-inbox text-2xl block mb-2 text-slate-300" />
                    {activeMeta.empty}
                  </td>
                </tr>
              ) : (
                activeRows.map((r) => (
                  <tr
                    key={`${r.triageId}-${r.visitID}`}
                    className="hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-800 text-sm">
                        {r.patientName || "—"}
                      </p>
                      <p className="text-xs text-slate-400">
                        ID: {r.patientID} · Triage #{r.triageId}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">
                      {r.mrn || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">
                      #{r.visitID}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(r.visitDate)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            (() => {
                              const s = (r.visitStatus || "").trim();
                              if (/^scheduled$/i.test(s)) return "bg-blue-100 text-blue-800";
                              if (/^progress$/i.test(s) || /^triaged$/i.test(s)) return "bg-amber-100 text-amber-800";
                              if (/^onconsultation$/i.test(s)) return "bg-indigo-100 text-indigo-800";
                              if (/^anc$/i.test(s)) return "bg-pink-100 text-pink-800";
                              if (/^pnc$/i.test(s)) return "bg-purple-100 text-purple-800";
                              if (/^childhealth$/i.test(s)) return "bg-cyan-100 text-cyan-800";
                              if (/^complete/i.test(s)) return "bg-emerald-100 text-emerald-800";
                              return "bg-slate-100 text-slate-600";
                            })()
                          }`}
                        >
                          {r.visitStatus || "—"}
                        </span>
                      </span>
                    </td>
                    {showVitals && (
                      <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                        <div>T: {r.temprature ?? "—"}</div>
                        <div>BP: {r.bloodPressure ?? "—"}</div>
                        <div>HR: {r.heartRate ?? "—"}</div>
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-sm text-slate-600">
                      {r.departmentName || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {renderActions?.(r)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}