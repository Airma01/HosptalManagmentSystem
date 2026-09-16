/** Labeled clinical field — never show raw values without labels. */
export function Field({ label, value, unit, className = "" }) {
  const display =
    value === null || value === undefined || value === ""
      ? "—"
      : unit
        ? `${value} ${unit}`
        : String(value);

  return (
    <div className={className}>
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium text-slate-900 mt-0.5 break-words">{display}</div>
    </div>
  );
}

export function BoolField({ label, value }) {
  const yes = value === true || value === "true" || value === 1;
  return (
    <div>
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="mt-0.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            yes ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          <i className={`bi ${yes ? "bi-check-circle" : "bi-dash-circle"}`} />
          {yes ? "Yes" : "No"}
        </span>
      </div>
    </div>
  );
}

export function fmtDate(d, withTime = false) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (withTime) return dt.toLocaleString();
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

export function StatusBadge({ status, map }) {
  const s = status == null ? "—" : String(status);
  const style = map?.[s] || "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {s}
    </span>
  );
}
