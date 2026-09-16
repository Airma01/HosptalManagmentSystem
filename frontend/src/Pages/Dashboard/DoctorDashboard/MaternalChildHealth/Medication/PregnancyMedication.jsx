import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate, StatusBadge } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function PregnancyMedication() {
  const { patientId, visitId } = useParams();
  const [sp] = useSearchParams();
  const api = `/api/doctor/patient/${patientId}/maternal-child`;
  const [pregnancies, setPregnancies] = useState([]);
  const [pregnancyId, setPregnancyId] = useState(sp.get("pregnancyId") || "");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    medicineID: "", startDate: new Date().toISOString().slice(0, 10), endDate: "",
    dosage: "", frequency: "", route: "", indication: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => { canWriteMaternalChildHealth().then(setCanWrite); }, []);

  useEffect(() => {
    API.get(`${api}/pregnancies`).then((res) => {
      const list = Array.isArray(res.data) ? res.data : [];
      setPregnancies(list);
      if (!pregnancyId && list.length) setPregnancyId(String(list[0].pregnancyID));
    }).catch(() => {});
  }, [api, pregnancyId]);

  const load = useCallback(async () => {
    if (!pregnancyId) { setRows([]); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/medications`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load medications.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/medications`, {
        pregnancyID: Number(pregnancyId),
        medicineID: Number(form.medicineID),
        startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        dosage: form.dosage || "",
        frequency: form.frequency || "",
        route: form.route || "",
        indication: form.indication || null,
        notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader patientId={patientId} visitId={visitId} pregnancyId={pregnancyId || undefined}
        moduleTitle="Pregnancy Medication" moduleIcon="bi-capsule" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Pregnancy</label>
          <select className={inputCls + " w-auto"} value={pregnancyId} onChange={(e) => setPregnancyId(e.target.value)}>
            <option value="">Select...</option>
            {pregnancies.map((p) => <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID}</option>)}
          </select>
        </div>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)} disabled={!pregnancyId}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50">
            <i className="bi bi-plus-lg me-1" /> Prescribe
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading medications...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No medications found for Pregnancy #{pregnancyId}.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Medication</th>
                <th className="px-4 py-3 font-medium">Dose</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Frequency</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.pregnancyMedicationID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium">{r.medicineName || r.genericName || `#${r.medicineID}`}</td>
                    <td className="px-4 py-3">{r.dosage || "—"}</td>
                    <td className="px-4 py-3">{r.route || "—"}</td>
                    <td className="px-4 py-3">{r.frequency || "—"}</td>
                    <td className="px-4 py-3">{fmtDate(r.startDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-rose-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.pregnancyMedicationID ? null : r.pregnancyMedicationID)}>
                        {expandedId === r.pregnancyMedicationID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.pregnancyMedicationID && (
                    <tr><td colSpan={7} className="bg-slate-50/50 px-4 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Field label="Medication ID" value={`#${r.pregnancyMedicationID}`} />
                        <Field label="Medicine ID" value={r.medicineID} />
                        <Field label="Medicine Name" value={r.medicineName} />
                        <Field label="Generic Name" value={r.genericName} />
                        <Field label="Dosage" value={r.dosage} />
                        <Field label="Route" value={r.route} />
                        <Field label="Frequency" value={r.frequency} />
                        <Field label="Start Date" value={fmtDate(r.startDate)} />
                        <Field label="End Date" value={fmtDate(r.endDate)} />
                        <Field label="Status" value={r.status} />
                        <Field label="Indication" value={r.indication} className="col-span-2" />
                        <Field label="Notes" value={r.notes} className="col-span-2" />
                        <Field label="Prescribed By User ID" value={r.prescribedByUserID} />
                      </div>
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold">Prescribe Medication</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div><label className="block text-xs font-medium mb-1">Medicine ID *</label>
              <input required type="number" className={inputCls} value={form.medicineID} onChange={(e) => set("medicineID", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Start Date</label>
                <input type="date" className={inputCls} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">End Date</label>
                <input type="date" className={inputCls} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Dosage</label>
              <input className={inputCls} value={form.dosage} onChange={(e) => set("dosage", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Route</label>
              <input className={inputCls} value={form.route} onChange={(e) => set("route", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Frequency</label>
              <input className={inputCls} value={form.frequency} onChange={(e) => set("frequency", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Indication</label>
              <input className={inputCls} value={form.indication} onChange={(e) => set("indication", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Notes</label>
              <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
