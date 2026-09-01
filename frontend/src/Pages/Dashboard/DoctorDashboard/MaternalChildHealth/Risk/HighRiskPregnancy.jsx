import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function HighRiskPregnancy() {
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
  const [form, setForm] = useState({
    pregnancyID: "", riskLevel: "High", riskReason: "", managementPlan: "",
    specialistRequired: "", referralPlan: "", followUpFrequency: "", active: true, notes: "",
  });
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
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/high-risk`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load high-risk records.");
    } finally {
      setLoading(false);
    }
  }, [api, pregnancyId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.riskReason.trim()) { setFormError("Risk reason is required."); return; }
    setSaving(true);
    setFormError("");
    try {
      await API.post(`${api}/high-risk`, {
        pregnancyID: Number(pregnancyId),
        riskLevel: form.riskLevel || "High",
        riskReason: form.riskReason,
        managementPlan: form.managementPlan || null,
        specialistRequired: form.specialistRequired || null,
        referralPlan: form.referralPlan || null,
        followUpFrequency: form.followUpFrequency || null,
        active: form.active,
        notes: form.notes || null,
      });
      setShow(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
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
          <button type="button" onClick={() => setShow(true)} disabled={!pregnancyId} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50">Add</button>
        </div>
      </div>
      <h2 className="font-semibold">High Risk Pregnancy</h2>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No high-risk records.</div>}
      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.highRiskPregnancyID} className="bg-white border rounded-xl p-4 text-sm">
              <div className="flex justify-between gap-2">
                <p className="font-medium text-red-700">{r.riskLevel} · {r.riskReason}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.active ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{r.active ? "Active" : "Resolved"}</span>
              </div>
              <p className="text-slate-600 mt-1">{r.managementPlan || "—"}</p>
              <p className="text-xs text-slate-400 mt-2">{r.identificationDate ? new Date(r.identificationDate).toLocaleString() : ""}</p>
            </div>
          ))}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold">Identify high-risk pregnancy</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input className={inputCls} placeholder="Risk level" value={form.riskLevel} onChange={(e) => set("riskLevel", e.target.value)} />
            <input required className={inputCls} placeholder="Risk reason *" value={form.riskReason} onChange={(e) => set("riskReason", e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Management plan" value={form.managementPlan} onChange={(e) => set("managementPlan", e.target.value)} />
            <input className={inputCls} placeholder="Specialist required" value={form.specialistRequired} onChange={(e) => set("specialistRequired", e.target.value)} />
            <input className={inputCls} placeholder="Referral plan" value={form.referralPlan} onChange={(e) => set("referralPlan", e.target.value)} />
            <input className={inputCls} placeholder="Follow-up frequency" value={form.followUpFrequency} onChange={(e) => set("followUpFrequency", e.target.value)} />
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
