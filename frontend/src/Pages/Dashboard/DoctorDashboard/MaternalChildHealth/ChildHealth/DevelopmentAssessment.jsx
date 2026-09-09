import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";
export default function DevelopmentAssessment() {
  const { patientId, visitId } = useParams();
  const api = `/api/doctor/patient/${patientId}/child-health`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ patientVisitID: visitId || "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (!cancelled) setCanWrite(ok);
    })();
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const res = await API.get(`${api}/development-assessment`); setRows(Array.isArray(res.data) ? res.data : []); }
    catch (err) { setError(err.response?.data?.message || "Unable to load."); }
    finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/development-assessment`, { patientVisitID: form.patientVisitID ? Number(form.patientVisitID) : (visitId ? Number(visitId) : null), ageInMonths: form.ageInMonths ? Number(form.ageInMonths) : null, grossMotor: form.grossMotor || null, fineMotor: form.fineMotor || null, language: form.language || null, developmentStatus: form.developmentStatus || null, concernIdentified: form.concernIdentified || null });
      setShow(false); load();
    } catch (err) { setFormError(err.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end">{canWrite && (
          <button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs">Add</button>
        )}</div>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No records.</div>}
      {!loading && rows.map((r) => (
        <div key={r.developmentAssessmentID} className="bg-white border rounded-xl p-4 text-sm">
          <p className="font-medium">Dev #{r.developmentAssessmentID}</p>
          <p className="text-xs text-slate-400">{r.assessmentDate ? new Date(r.assessmentDate).toLocaleString() : ""} · {r.ageInMonths ?? "—"} mo</p>
          <p className="mt-1">{r.developmentStatus || "—"} · {r.concernIdentified || ""}</p>
        </div>
      ))}
      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold">New record</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input type="number" className={inputCls} placeholder="Age months" value={form.ageInMonths||""} onChange={(e)=>set("ageInMonths",e.target.value)} />
            <input className={inputCls} placeholder="Gross motor" value={form.grossMotor||""} onChange={(e)=>set("grossMotor",e.target.value)} />
            <input className={inputCls} placeholder="Fine motor" value={form.fineMotor||""} onChange={(e)=>set("fineMotor",e.target.value)} />
            <input className={inputCls} placeholder="Language" value={form.language||""} onChange={(e)=>set("language",e.target.value)} />
            <input className={inputCls} placeholder="Development status" value={form.developmentStatus||""} onChange={(e)=>set("developmentStatus",e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Concerns" value={form.concernIdentified||""} onChange={(e)=>set("concernIdentified",e.target.value)} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-3 py-2 bg-sky-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
