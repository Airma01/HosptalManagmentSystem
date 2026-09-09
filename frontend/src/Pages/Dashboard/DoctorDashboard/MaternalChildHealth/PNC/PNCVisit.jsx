import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";
export default function PNCVisit() {
  const { patientId, visitId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const api = `/api/doctor/patient/${patientId}/maternal-child`;
  const [pregnancies, setPregnancies] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ pregnancyID: sp.get("pregnancyId") || "", patientVisitID: visitId || "", deliveryID: "", daysAfterDelivery: "", maternalCondition: "", bleedingStatus: "", breastfeedingStatus: "", uterusCondition: "", mentalHealthAssessment: "", counselingProvided: "", familyPlanningCounseling: "", treatmentPlan: "", notes: "" });
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
    try {
      const [pnc, preg] = await Promise.all([API.get(`${api}/pnc`), API.get(`${api}/pregnancies`)]);
      setRows(Array.isArray(pnc.data) ? pnc.data : []);
      setPregnancies(Array.isArray(preg.data) ? preg.data : []);
    } catch (err) { setError(err.response?.data?.message || "Unable to load PNC visits."); }
    finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.pregnancyID) { setFormError("Pregnancy required"); return; }
    setSaving(true); setFormError("");
    try {
      await API.post(`${api}/pnc`, {
        pregnancyID: Number(form.pregnancyID),
        patientVisitID: Number(form.patientVisitID || visitId),
        deliveryID: form.deliveryID === "" ? null : Number(form.deliveryID),
        daysAfterDelivery: form.daysAfterDelivery === "" ? null : Number(form.daysAfterDelivery),
        maternalCondition: form.maternalCondition || null,
        bleedingStatus: form.bleedingStatus || null,
        breastfeedingStatus: form.breastfeedingStatus || null,
        uterusCondition: form.uterusCondition || null,
        mentalHealthAssessment: form.mentalHealthAssessment || null,
        counselingProvided: form.counselingProvided || null,
        familyPlanningCounseling: form.familyPlanningCounseling || null,
        treatmentPlan: form.treatmentPlan || null,
        notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) { setFormError(err.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate(base)} className="text-sm text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> Dashboard</button>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium">Add PNC</button>
        )}
      </div>
      <h2 className="font-semibold">PNC Visits</h2>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No PNC visits found.</div>}
      {!loading && rows.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Pregnancy</th><th className="px-4 py-2">Days post</th><th className="px-4 py-2">Maternal</th><th className="px-4 py-2">Bleeding</th><th className="px-4 py-2">BF</th></tr></thead>
            <tbody className="divide-y">{rows.map((r) => (
              <tr key={r.pncVisitID}><td className="px-4 py-2">{r.visitDate ? new Date(r.visitDate).toLocaleString() : "—"}</td><td className="px-4 py-2">#{r.pregnancyID}</td><td className="px-4 py-2">{r.daysAfterDelivery ?? "—"}</td><td className="px-4 py-2">{r.maternalCondition || "—"}</td><td className="px-4 py-2">{r.bleedingStatus || "—"}</td><td className="px-4 py-2">{r.breastfeedingStatus || "—"}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-lg p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold">PNC visit</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <select required className={inputCls} value={form.pregnancyID} onChange={(e) => set("pregnancyID", e.target.value)}><option value="">Pregnancy *</option>{pregnancies.map((p) => <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID}</option>)}</select>
            <input className={inputCls} placeholder="Patient visit ID" value={form.patientVisitID} onChange={(e) => set("patientVisitID", e.target.value)} />
            <input className={inputCls} placeholder="Optional delivery ID" value={form.deliveryID} onChange={(e) => set("deliveryID", e.target.value)} />
            <input type="number" className={inputCls} placeholder="Days after delivery" value={form.daysAfterDelivery} onChange={(e) => set("daysAfterDelivery", e.target.value)} />
            <input className={inputCls} placeholder="Maternal condition" value={form.maternalCondition} onChange={(e) => set("maternalCondition", e.target.value)} />
            <input className={inputCls} placeholder="Bleeding status" value={form.bleedingStatus} onChange={(e) => set("bleedingStatus", e.target.value)} />
            <input className={inputCls} placeholder="Breastfeeding status" value={form.breastfeedingStatus} onChange={(e) => set("breastfeedingStatus", e.target.value)} />
            <input className={inputCls} placeholder="Uterus condition" value={form.uterusCondition} onChange={(e) => set("uterusCondition", e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Treatment plan" value={form.treatmentPlan} onChange={(e) => set("treatmentPlan", e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Save"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
