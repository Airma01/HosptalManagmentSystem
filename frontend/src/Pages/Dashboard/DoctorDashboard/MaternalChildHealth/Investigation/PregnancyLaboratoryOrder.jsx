import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function PregnancyLaboratoryOrder() {
  const { patientId, visitId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const api = `/api/doctor/patient/${patientId}/maternal-child`;
  const [pregnancies, setPregnancies] = useState([]);
  const [pregnancyId, setPregnancyId] = useState(sp.get("pregnancyId") || "");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ laboratoryTestTypeID: "", clinicalReason: "", notes: "", ancVisitID: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
    e.preventDefault();
    if (!form.laboratoryTestTypeID) { setFormError("Laboratory test type ID is required."); return; }
    setSaving(true); setFormError("");
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
      setFormError(err.response?.data?.message || "Failed to create order. Ensure LaboratoryTestTypeID exists.");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate(base)} className="text-sm text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> Dashboard</button>
        <div className="flex gap-2">
          <select className={inputCls + " w-auto"} value={pregnancyId} onChange={(e) => setPregnancyId(e.target.value)}>
            <option value="">Pregnancy...</option>
            {pregnancies.map((p) => <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID}</option>)}
          </select>
          <button type="button" onClick={() => setShow(true)} disabled={!pregnancyId} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50">Order lab</button>
        </div>
      </div>
      <h2 className="font-semibold">Pregnancy Laboratory Orders</h2>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No laboratory orders.</div>}
      {!loading && rows.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500"><tr>
              <th className="px-4 py-2">Date</th><th className="px-4 py-2">Test</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Reason</th>
            </tr></thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.pregnancyLaboratoryOrderID}>
                  <td className="px-4 py-2">{r.orderDate ? new Date(r.orderDate).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2">{r.laboratoryTestTypeName || `#${r.laboratoryTestTypeID}`}</td>
                  <td className="px-4 py-2">{r.status}</td>
                  <td className="px-4 py-2">{r.clinicalReason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3">
            <h3 className="font-semibold">New laboratory order</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div>
              <label className="text-xs font-medium">Laboratory test type ID *</label>
              <input required type="number" className={inputCls} value={form.laboratoryTestTypeID} onChange={(e) => set("laboratoryTestTypeID", e.target.value)} />
              <p className="text-[10px] text-slate-400 mt-1">Must match an existing LaboratoryTestType record.</p>
            </div>
            <input className={inputCls} placeholder="Clinical reason" value={form.clinicalReason} onChange={(e) => set("clinicalReason", e.target.value)} />
            <input className={inputCls} placeholder="Optional ANC visit ID" value={form.ancVisitID} onChange={(e) => set("ancVisitID", e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
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
