import { Link, useLocation } from "react-router-dom";

const MODULES = [
  { key: "anc", label: "ANC", path: "anc", icon: "bi-clipboard2-pulse" },
  { key: "risk", label: "Risk", path: "risk", icon: "bi-exclamation-triangle" },
  { key: "high-risk", label: "High Risk", path: "high-risk", icon: "bi-heart-pulse" },
  { key: "birth-preparedness", label: "Birth Prep", path: "birth-preparedness", icon: "bi-bag-heart" },
  { key: "laboratory", label: "Lab", path: "laboratory", icon: "bi-droplet" },
  { key: "ultrasound", label: "Ultrasound", path: "ultrasound", icon: "bi-soundwave" },
  { key: "medication", label: "Medication", path: "medication", icon: "bi-capsule" },
  { key: "labor", label: "Labor", path: "labor", icon: "bi-activity" },
  { key: "delivery", label: "Delivery", path: "delivery", icon: "bi-hospital" },
  { key: "pnc", label: "PNC", path: "pnc", icon: "bi-person-heart" },
];

/**
 * Horizontal module navigation that always preserves patientId, visitId, and pregnancyId.
 */
export default function MCHModuleNav({ patientId, visitId, pregnancyId }) {
  const location = useLocation();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const q = pregnancyId ? `?pregnancyId=${pregnancyId}` : "";

  const isActive = (path) => {
    const segment = location.pathname.split("/").pop() || "";
    if (path === "anc") return segment === "anc" || location.pathname.includes("/anc/");
    if (path === "delivery")
      return segment === "delivery" || location.pathname.includes("/delivery/");
    return segment === path;
  };

  return (
    <nav className="mb-4 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
        <Link
          to={base}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-1"
          title="MCH Dashboard"
        >
          <i className="bi bi-grid" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <span className="w-px h-5 bg-slate-200" />
        {MODULES.map((m) => {
          const active = isActive(m.path);
          return (
            <Link
              key={m.key}
              to={`${base}/${m.path}${q}`}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                active
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-rose-50 hover:text-rose-700"
              }`}
            >
              <i className={`bi ${m.icon}`} />
              <span>{m.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
