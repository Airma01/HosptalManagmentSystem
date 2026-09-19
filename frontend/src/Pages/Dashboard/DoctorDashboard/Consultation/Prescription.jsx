import { useEffect, useState } from "react";
import API from "../../../../Config/API";
import PrescriptionDetails from "../Prescription/PrescriptionDetails";

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const emptyMedicineRow = () => ({ medicineID: "", dosage: "", frequency: "", duration: "", quantity: "" });

export default function Prescription({ primaryConsultationId, latestPrescription, onReload }) {
  const [branchPharmacies, setBranchPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [rxItems, setRxItems] = useState([emptyMedicineRow()]);
  const [rxBranchId, setRxBranchId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [b, m] = await Promise.all([
          API.get("/api/doctor/lookups/branch-pharmacies"),
          API.get("/api/doctor/lookups/medicines"),
        ]);
        setBranchPharmacies(b.data || []);
        setMedicines(m.data || []);
      } catch { /* lookups optional */ }
    })();
  }, []);

  const flash = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const submitPrescription = async (e) => {
    e.preventDefault();
    if (!primaryConsultationId) { alert("Start a consultation first."); return; }
    if (!rxBranchId) { alert("Please select a branch pharmacy."); return; }
    const items = rxItems
      .filter((r) => r.medicineID)
      .map((r) => ({
        medicineID: Number(r.medicineID),
        dosage: r.dosage || "",
        frequency: Number(r.frequency) || 0,
        duration: Number(r.duration) || 0,
        quantity: Number(r.quantity) || 0,
      }));
    if (items.length === 0) { alert("Add at least one medicine."); return; }
    setSaving(true);
    try {
      await API.post(`/api/doctor/consultation/${primaryConsultationId}/prescription`, {
        branchPharmacyID: Number(rxBranchId),
        items,
      });
      setRxItems([emptyMedicineRow()]);
      setRxBranchId("");
      flash("Prescription created.");
      if (onReload) await onReload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create prescription.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{message}</span>}
      {latestPrescription && (
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Latest Prescription</h3>
          <PrescriptionDetails prescription={latestPrescription} />
        </div>
      )}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-slate-800">New Prescription</h3>
          <p className="text-xs text-slate-400 mt-1">Consultation #{primaryConsultationId || "—"}</p>
        </div>
        <form onSubmit={submitPrescription} className="p-5 space-y-4">
          {!primaryConsultationId && (
            <p className="text-amber-600 text-sm">Create a consultation first.</p>
          )}
          <Field label="Branch pharmacy">
            <select className={inputCls} value={rxBranchId} onChange={(e) => setRxBranchId(e.target.value)} required disabled={!primaryConsultationId}>
              <option value="">Select branch</option>
              {branchPharmacies.map((b) => (
                <option key={b.branchPharmacyID} value={b.branchPharmacyID}>
                  {b.branchName} {b.location ? `(${b.location})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Medicines</span>
              <button type="button" onClick={() => setRxItems([...rxItems, emptyMedicineRow()])} className="text-xs text-indigo-600" disabled={!primaryConsultationId}>+ Add medicine</button>
            </div>
            {rxItems.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 border border-slate-100 rounded-lg">
                <Field label="Medicine">
                  <select className={inputCls} value={row.medicineID} onChange={(e) => { const next = [...rxItems]; next[idx] = { ...next[idx], medicineID: e.target.value }; setRxItems(next); }} required>
                    <option value="">Select</option>
                    {medicines.map((m) => (
                      <option key={m.medicineID} value={m.medicineID}>{m.medicineName}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Dosage">
                  <input className={inputCls} value={row.dosage} onChange={(e) => { const next = [...rxItems]; next[idx] = { ...next[idx], dosage: e.target.value }; setRxItems(next); }} />
                </Field>
                <Field label="Frequency">
                  <input type="number" className={inputCls} value={row.frequency} onChange={(e) => { const next = [...rxItems]; next[idx] = { ...next[idx], frequency: e.target.value }; setRxItems(next); }} />
                </Field>
                <Field label="Duration">
                  <input type="number" className={inputCls} value={row.duration} onChange={(e) => { const next = [...rxItems]; next[idx] = { ...next[idx], duration: e.target.value }; setRxItems(next); }} />
                </Field>
                <div className="flex items-end gap-2">
                  <Field label="Qty">
                    <input type="number" className={inputCls} value={row.quantity} onChange={(e) => { const next = [...rxItems]; next[idx] = { ...next[idx], quantity: e.target.value }; setRxItems(next); }} />
                  </Field>
                  <button type="button" onClick={() => setRxItems(rxItems.filter((_, i) => i !== idx))} className="text-xs text-red-600 px-2 py-2" disabled={rxItems.length === 1}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving || !primaryConsultationId} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50">
              {saving ? "Saving..." : "Create prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
