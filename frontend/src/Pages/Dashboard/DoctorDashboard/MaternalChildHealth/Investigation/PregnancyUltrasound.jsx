import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function PregnancyUltrasound() {
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
  const empty = { gestationalAgeWeeks: "", fetalNumber: "", fetalPresentation: "", placentaLocation: "", amnioticFluid: "", fetalHeartRate: "", estimatedFetalWeight: "", findings: "", impression: "", notes: "", ancVisitID: "" };
  const [form, setForm] = useState(empty);
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
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/ultrasounds`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ultrasounds.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      await API.post(`${api}/ultrasounds`, {
        pregnancyID: Number(pregnancyId),
        ancVisitID: form.ancVisitID === "" ? null : Number(form.ancVisitID),
        gestationalAgeWeeks: form.gestationalAgeWeeks === "" ? null : Number(form.gestationalAgeWeeks),
        fetalNumber: form.fetalNumber || null,
        fetalPresentation: form.fetalPresentation || null,
        placentaLocation: form.placentaLocation || null,
        amnioticFluid: form.amnioticFluid || null,
        fetalHeartRate: form.fetalHeartRate || null,
        estimatedFetalWeight: form.estimatedFetalWeight || null,
        findings: form.findings || null,
        impression: form.impression || null,
        notes: form.notes || null,
      });
      setShow(false); setForm(empty); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
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
          {canWrite && (
          <button type="button" onClick={() => setShow(true)} disabled={!pregnancyId} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50">Add US</button>
        )}
        </div>
      </div>
      <h2 className="font-semibold">Pregnancy Ultrasound</h2>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No ultrasound records.</div>}
      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.pregnancyUltrasoundID} className="bg-white border rounded-xl p-4 text-sm">
              <p className="text-xs text-slate-400">{r.examinationDate ? new Date(r.examinationDate).toLocaleString() : ""} · GA {r.gestationalAgeWeeks ?? "—"} wks</p>
              <p className="mt-1 font-medium">{r.findings || r.impression || "—"}</p>
              <p className="text-xs text-slate-500 mt-1">Presentation: {r.fetalPresentation || "—"} · FHR: {r.fetalHeartRate || "—"} · EFW: {r.estimatedFetalWeight || "—"}</p>
            </div>
          ))}
        </div>
      )}
      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-lg p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold">Ultrasound record</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-2">
              <input type="number" className={inputCls} placeholder="GA weeks" value={form.gestationalAgeWeeks} onChange={(e) => set("gestationalAgeWeeks", e.target.value)} />
              <input className={inputCls} placeholder="Fetal number" value={form.fetalNumber} onChange={(e) => set("fetalNumber", e.target.value)} />
              <input className={inputCls} placeholder="Presentation" value={form.fetalPresentation} onChange={(e) => set("fetalPresentation", e.target.value)} />
              <input className={inputCls} placeholder="Placenta" value={form.placentaLocation} onChange={(e) => set("placentaLocation", e.target.value)} />
              <input className={inputCls} placeholder="Amniotic fluid" value={form.amnioticFluid} onChange={(e) => set("amnioticFluid", e.target.value)} />
              <input className={inputCls} placeholder="FHR" value={form.fetalHeartRate} onChange={(e) => set("fetalHeartRate", e.target.value)} />
              <input className={inputCls} placeholder="EFW" value={form.estimatedFetalWeight} onChange={(e) => set("estimatedFetalWeight", e.target.value)} />
            </div>
            <textarea className={inputCls} rows={2} placeholder="Findings" value={form.findings} onChange={(e) => set("findings", e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Impression" value={form.impression} onChange={(e) => set("impression", e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
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
