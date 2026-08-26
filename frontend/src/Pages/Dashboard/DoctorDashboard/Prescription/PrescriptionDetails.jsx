/** Displays latest prescription from GET visit details (read-only — no doctor create API). */
export default function PrescriptionDetails({ prescription }) {
  if (!prescription) {
    return (
      <div className="bg-white border rounded-xl p-5 shadow-sm text-sm text-slate-500">
        No prescription on file for this patient.
      </div>
    );
  }

  const items = prescription.items || [];

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      <div className="px-5 py-4 border-b">
        <h3 className="font-semibold text-slate-800">Latest Prescription</h3>
        <p className="text-xs text-slate-400 mt-1">
          Prescription #{prescription.prescriptionID}
          {prescription.prescriptionDate
            ? ` · ${new Date(prescription.prescriptionDate).toLocaleString()}`
            : ""}
          {prescription.doctorID != null ? ` · Doctor ID ${prescription.doctorID}` : ""}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">No medicine items.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Medicine</th>
                <th className="text-left px-4 py-2 font-medium">Generic</th>
                <th className="text-left px-4 py-2 font-medium">Dosage</th>
                <th className="text-left px-4 py-2 font-medium">Frequency</th>
                <th className="text-left px-4 py-2 font-medium">Duration</th>
                <th className="text-left px-4 py-2 font-medium">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => (
                <tr key={it.prescriptionDetailID}>
                  <td className="px-4 py-2">{it.medicineName || "—"}</td>
                  <td className="px-4 py-2 text-slate-500">{it.genericName || "—"}</td>
                  <td className="px-4 py-2">{it.dosage || "—"}</td>
                  <td className="px-4 py-2">{it.frequency ?? "—"}</td>
                  <td className="px-4 py-2">{it.duration ?? "—"}</td>
                  <td className="px-4 py-2">{it.quantity ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
