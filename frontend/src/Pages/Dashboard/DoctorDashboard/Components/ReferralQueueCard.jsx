/**
 * Summary metric card for the referral queue dashboard.
 * Props: title, value, icon (Bootstrap Icons class), tone (color key)
 */
const TONE = {
  indigo: "bg-indigo-100 text-indigo-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function ReferralQueueCard({ title, value, icon, tone = "indigo" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          TONE[tone] || TONE.indigo
        }`}
      >
        <i className={`bi ${icon} text-xl`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
          {title}
        </p>
        <p className="text-2xl font-semibold text-slate-800 tabular-nums">{value}</p>
      </div>
    </div>
  );
}
