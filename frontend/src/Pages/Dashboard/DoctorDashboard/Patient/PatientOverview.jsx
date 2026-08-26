/** Presentational patient + visit summary card (used when parent already loaded data). */
export default function PatientOverview({ patient, visit, triage }) {
  if (!patient) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            ID: {patient.patientID}
            {patient.mrn ? ` · MRN ${patient.mrn}` : ""}
            {patient.gender ? ` · ${patient.gender}` : ""}
            {patient.phone ? ` · ${patient.phone}` : ""}
          </p>
        </div>
        {visit && (
          <div className="text-sm text-slate-600 md:text-right">
            <p>Visit #{visit.visitID}</p>
            <p className="text-xs text-slate-400">
              {visit.visitDate ? new Date(visit.visitDate).toLocaleString() : ""}
            </p>
            <p>
              {visit.visitType || "—"} · {visit.status || "—"}
            </p>
          </div>
        )}
      </div>
      {triage && (
        <div className="mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-600">
          <div>Temp: {triage.temprature}</div>
          <div>BP: {triage.bloodPressure}</div>
          <div>HR: {triage.heartRate}</div>
          <div>RR: {triage.respiratotyRate}</div>
          <div>Wt: {triage.weight}</div>
        </div>
      )}
    </div>
  );
}
