import { Link } from "react-router-dom";

/**
 * Clinical module navigation after a visit is selected.
 * Uses existing routes:
 *   /doctor/consultation/patient/{patientId}/{visitId}
 *   /doctor/maternal/patient/{patientId}/{visitId}
 *   /doctor/adult/patient/{patientId}/{visitId}
 */
export default function ReferralActionCards({ patientId, visitId }) {
  const ready = patientId != null && visitId != null;

  const cards = [
    {
      key: "consultation",
      title: "Consultation",
      description: "Open the general consultation workflow for this patient visit.",
      icon: "bi-file-medical",
      tone: "bg-indigo-100 text-indigo-600",
      btn: "bg-indigo-600 hover:bg-indigo-700",
      path: ready ? `/doctor/consultation/patient/${patientId}/${visitId}` : null,
      label: "Open Consultation",
    },
    {
      key: "maternal",
      title: "Maternal & Child Health",
      description: "ANC, risk, labor, delivery, PNC, family planning, and child health.",
      icon: "bi-heart-pulse",
      tone: "bg-rose-100 text-rose-600",
      btn: "bg-rose-600 hover:bg-rose-700",
      path: ready ? `/doctor/maternal/patient/${patientId}/${visitId}` : null,
      label: "Open Maternal Care",
    },
    {
      key: "adult",
      title: "Adult Medical Care",
      description: "Longitudinal adult care: chronic disease and related modules.",
      icon: "bi-person-vcard",
      tone: "bg-emerald-100 text-emerald-600",
      btn: "bg-emerald-600 hover:bg-emerald-700",
      path: ready ? `/doctor/adult/patient/${patientId}/${visitId}` : null,
      label: "Open Adult Medical Care",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <i className="bi bi-activity text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-700">Clinical Modules</h3>
      </div>

      {!ready && (
        <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
          Select a visit above to open Consultation, Maternal &amp; Child Health, or Adult Medical Care.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.key}
            className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col ${
              !ready ? "opacity-60" : ""
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${c.tone}`}>
              <i className={`bi ${c.icon} text-xl`} />
            </div>
            <h4 className="font-semibold text-slate-800">{c.title}</h4>
            <p className="text-sm text-slate-500 mt-1 flex-1">{c.description}</p>
            {ready ? (
              <Link
                to={c.path}
                className={`mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition ${c.btn}`}
              >
                {c.label}
                <i className="bi bi-arrow-right" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-200 text-slate-500 text-sm font-medium cursor-not-allowed"
              >
                {c.label}
              </button>
            )}
          </div>
        ))}
      </div>

      {ready && (
        <p className="text-xs text-slate-400">
          Patient ID <span className="font-medium text-slate-600">{patientId}</span>
          {" · "}
          Visit ID <span className="font-medium text-slate-600">{visitId}</span>
        </p>
      )}
    </div>
  );
}
