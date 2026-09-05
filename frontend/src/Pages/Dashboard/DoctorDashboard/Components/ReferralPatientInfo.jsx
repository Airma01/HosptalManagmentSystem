/**
 * Patient card from ReferralPatientDto / nested patient on ReferralDetailDto.
 * Fields: patientID, mrn, firstName, lastName, patientName, gender,
 *         dateOfBirth, age, phone, address, emergencyContact
 */
export default function ReferralPatientInfo({ patient }) {
  if (!patient) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <i className="bi bi-person text-indigo-500" />
          Patient Information
        </h3>
        <p className="text-sm text-slate-400">No patient information available.</p>
      </div>
    );
  }

  const name =
    patient.patientName ||
    [patient.firstName, patient.lastName].filter(Boolean).join(" ") ||
    "—";

  const rows = [
    { icon: "bi-person", label: "Name", value: name },
    { icon: "bi-hash", label: "Patient ID", value: patient.patientID },
    { icon: "bi-card-text", label: "MRN", value: patient.mrn },
    { icon: "bi-gender-ambiguous", label: "Gender", value: patient.gender },
    { icon: "bi-calendar3", label: "Age", value: patient.age != null ? `${patient.age} yrs` : null },
    { icon: "bi-telephone", label: "Phone", value: patient.phone },
    { icon: "bi-geo-alt", label: "Address", value: patient.address },
    { icon: "bi-person-lines-fill", label: "Emergency", value: patient.emergencyContact },
  ].filter((r) => r.value != null && r.value !== "");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <i className="bi bi-person text-indigo-500" />
        Patient Information
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-2 min-w-0">
            <i className={`bi ${r.icon} text-slate-400 mt-0.5 shrink-0`} />
            <div className="min-w-0">
              <dt className="text-xs text-slate-400">{r.label}</dt>
              <dd className="text-sm font-medium text-slate-800 truncate">{r.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
