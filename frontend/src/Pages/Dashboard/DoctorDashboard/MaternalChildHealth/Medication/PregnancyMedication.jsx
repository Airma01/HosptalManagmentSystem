import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";
export default function PregnancyMedication() {
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
  const [form, setForm] = useState({ medicineID: "", startDate: new Date().toISOString().slice(0, 10), endDate: "", dosage: "", frequency: "", route: "", indication: "", notes: "" });
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

  useEffect(() => { API.get(`${api}/pregnancies`).then((res) => { const list = Array.isArray(res.data) ? res.data : []; setPregnancies(list); if (!pregnancyId && list.length) setPregnancyId(String(list[0].pregnancyID)); }).catch(() => {}); }, [api, pregnancyId]);
  const load = useCallback(async () => { if (!pregnancyId) { setRows([]); setLoading(false); return; } setLoading(true); setError(""); try { const res = await API.get(`${api}/pregnancies/${pregnancyId}/medications`); setRows(Array.isArray(res.data) ? res.data : []); } catch (err) { setError(err.response?.data?.message || "Unable to load medications."); } finally { setLoading(false); } }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.medicineID || !form.dosage) { setFormError("Medicine ID and dosage required"); return; }
    setSaving(true); setFormError("");
    try {
      await API.post(`${api}/medications`, {
        pregnancyID: Number(pregnancyId), medicineID: Number(form.medicineID),
        startDate: form.startDate, endDate: form.endDate || null,
        dosage: form.dosage, frequency: form.frequency || "", route: form.route || "",
        indication: form.indication || null, notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) { setFormError(err.response?.data?.message || "Failed to save. Ensure MedicineID exists."); }
    finally { setSaving(false); }
  };
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate(base)} className="text-sm text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> Dashboard</button>
        <div className="flex gap-2">
          <select className={inputCls + " w-auto"} value={pregnancyId} onChange={(e) => setPregnancyId(e.target.value)}><option value="">Pregnancy...</option>{pregnancies.map((p) => <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID}</option>)}</select>
          {canWrite && (
          <button type="button" onClick={() => setShow(true)} disabled={!pregnancyId} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50">Add med</button>
        )}
        </div>
      </div>
      <h2 className="font-semibold">Pregnancy Medication</h2>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No medications.</div>}
      {!loading && rows.map((r) => (
        <div key={r.pregnancyMedicationID} className="bg-white border rounded-xl p-4 text-sm">
          <p className="font-medium">{r.medicineName || `Medicine #${r.medicineID}`} · {r.dosage} {r.frequency}</p>
          <p className="text-xs text-slate-400">{r.startDate ? new Date(r.startDate).toLocaleDateString() : ""} · {r.status}</p>
          <p className="mt-1 text-slate-600">{r.indication || r.notes || "—"}</p>
        </div>
      ))}
      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3">
            <h3 className="font-semibold">Pregnancy medication</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input required type="number" className={inputCls} placeholder="Medicine ID *" value={form.medicineID} onChange={(e) => set("medicineID", e.target.value)} />
            <p className="text-[10px] text-slate-400">Must match existing Medicine record.</p>
            <input type="date" className={inputCls} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            <input required className={inputCls} placeholder="Dosage *" value={form.dosage} onChange={(e) => set("dosage", e.target.value)} />
            <input className={inputCls} placeholder="Frequency" value={form.frequency} onChange={(e) => set("frequency", e.target.value)} />
            <input className={inputCls} placeholder="Route" value={form.route} onChange={(e) => set("route", e.target.value)} />
            <input className={inputCls} placeholder="Indication" value={form.indication} onChange={(e) => set("indication", e.target.value)} />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Save"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
