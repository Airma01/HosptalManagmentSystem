import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate, StatusBadge } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function PregnancyLaboratoryOrder() {
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
  const [form, setForm] = useState({ laboratoryTestTypeID: "", ancVisitID: "", clinicalReason: "", notes: "" });
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
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/laboratory-orders`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load laboratory orders.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/laboratory-orders`, {
        pregnancyID: Number(pregnancyId),
        laboratoryTestTypeID: Number(form.laboratoryTestTypeID),
        ancVisitID: form.ancVisitID === "" ? null : Number(form.ancVisitID),
        clinicalReason: form.clinicalReason || null,
        notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create order.");
    } finally { setSaving(false); }
  };

  const statusMap = { Pending: "bg-amber-50 text-amber-700", Completed: "bg-emerald-50 text-emerald-700", Cancelled: "bg-slate-100 text-slate-600" };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader patientId={patientId} visitId={visitId} pregnancyId={pregnancyId || undefined}
        moduleTitle="Pregnancy Laboratory Orders" moduleIcon="bi-droplet" />

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
            <i className="bi bi-plus-lg me-1" /> Order Lab Test
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading laboratory orders...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No laboratory orders found for Pregnancy #{pregnancyId}.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Test</th>
                <th className="px-4 py-3 font-medium">Order Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Clinical Reason</th>
                <th className="px-4 py-3 font-medium">ANC Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.pregnancyLaboratoryOrderID} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">#{r.pregnancyLaboratoryOrderID}</td>
                  <td className="px-4 py-3 font-medium">{r.laboratoryTestTypeName || `Test #${r.laboratoryTestTypeID}`}</td>
                  <td className="px-4 py-3">{fmtDate(r.orderDate, true)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} map={statusMap} /></td>
                  <td className="px-4 py-3 max-w-[12rem] truncate">{r.clinicalReason || "—"}</td>
                  <td className="px-4 py-3">{r.ancVisitID != null ? `#${r.ancVisitID}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-slate-100 grid gap-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={`d-${r.pregnancyLaboratoryOrderID}`} className="border border-slate-100 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
                <Field label="Order ID" value={`#${r.pregnancyLaboratoryOrderID}`} />
                <Field label="Test Type ID" value={r.laboratoryTestTypeID} />
                <Field label="Test Name" value={r.laboratoryTestTypeName} />
                <Field label="Status" value={r.status} />
                <Field label="Order Date" value={fmtDate(r.orderDate, true)} />
                <Field label="ANC Visit ID" value={r.ancVisitID != null ? `#${r.ancVisitID}` : null} />
                <Field label="Clinical Reason" value={r.clinicalReason} className="col-span-2" />
                <Field label="Notes" value={r.notes} className="col-span-2" />
                <Field label="Ordered By User ID" value={r.orderedByUserID} />
              </div>
            ))}
          </div>
        </div>
      )}

      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold">New Laboratory Order</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div><label className="block text-xs font-medium mb-1">Laboratory Test Type ID *</label>
              <input required type="number" className={inputCls} value={form.laboratoryTestTypeID} onChange={(e) => set("laboratoryTestTypeID", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">ANC Visit ID (optional)</label>
              <input className={inputCls} value={form.ancVisitID} onChange={(e) => set("ancVisitID", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Clinical Reason</label>
              <input className={inputCls} value={form.clinicalReason} onChange={(e) => set("clinicalReason", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Notes</label>
              <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Order"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
