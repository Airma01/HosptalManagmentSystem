import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../../Config/API";
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";
export default function FamilyPlanning() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const api = `/api/doctor/patient/${patientId}/maternal-child`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ pregnancyID: "", method: "", methodType: "", startDate: "", discontinuationDate: "", reasonForDiscontinuation: "", counselingProvided: "", sideEffects: "", notes: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const load = useCallback(async () => { setLoading(true); setError(""); try { const res = await API.get(`${api}/family-planning`); setRows(Array.isArray(res.data) ? res.data : []); } catch (err) { setError(err.response?.data?.message || "Unable to load family planning."); } finally { setLoading(false); } }, [api]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/family-planning`, {
        pregnancyID: form.pregnancyID === "" ? null : Number(form.pregnancyID),
        method: form.method || null, methodType: form.methodType || null,
        startDate: form.startDate || null, discontinuationDate: form.discontinuationDate || null,
        reasonForDiscontinuation: form.reasonForDiscontinuation || null,
        counselingProvided: form.counselingProvided || null, sideEffects: form.sideEffects || null, notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) { setFormError(err.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate(base)} className="text-sm text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> Dashboard</button>
        <button type="button" onClick={() => setShow(true)} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium">Add</button>
      </div>
      <h2 className="font-semibold">Family Planning</h2>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No family planning records.</div>}
      {!loading && rows.map((r) => (
        <div key={r.familyPlanningID} className="bg-white border rounded-xl p-4 text-sm">
          <p className="font-medium">{r.method || "—"} {r.methodType ? `· ${r.methodType}` : ""}</p>
          <p className="text-xs text-slate-400">{r.visitDate ? new Date(r.visitDate).toLocaleString() : ""}</p>
          <p className="mt-1 text-slate-600">{r.counselingProvided || r.notes || "—"}</p>
        </div>
      ))}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3">
            <h3 className="font-semibold">Family planning</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input className={inputCls} placeholder="Method" value={form.method} onChange={(e) => set("method", e.target.value)} />
            <input className={inputCls} placeholder="Method type" value={form.methodType} onChange={(e) => set("methodType", e.target.value)} />
            <input type="date" className={inputCls} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            <input className={inputCls} placeholder="Counseling provided" value={form.counselingProvided} onChange={(e) => set("counselingProvided", e.target.value)} />
            <input className={inputCls} placeholder="Side effects" value={form.sideEffects} onChange={(e) => set("sideEffects", e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Save"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
