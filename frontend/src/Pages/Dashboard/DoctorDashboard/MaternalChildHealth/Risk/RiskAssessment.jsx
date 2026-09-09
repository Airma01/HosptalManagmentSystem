import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function RiskAssessment() {
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
    pregnancyID: sp.get("pregnancyId") || "",
    ancVisitID: "",
    isHighRisk: false,
    riskCategory: "",
    riskFactor: "",
    riskDescription: "",
    actionTaken: "",
    referralRequired: "",
    notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadPreg = useCallback(async () => {
    const res = await API.get(`${api}/pregnancies`);
    const list = Array.isArray(res.data) ? res.data : [];
    setPregnancies(list);
    if (!pregnancyId && list.length) setPregnancyId(String(list[0].pregnancyID));
  }, [api, pregnancyId]);

  const loadRows = useCallback(async () => {
    if (!pregnancyId) { setRows([]); setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/risk-assessments`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load risk assessments.");
    } finally {
      setLoading(false);
    }
  }, [api, pregnancyId]);

  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (!cancelled) setCanWrite(ok);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { loadPreg().catch(() => {}); }, [loadPreg]);
  useEffect(() => { loadRows(); }, [loadRows]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await API.post(`${api}/risk-assessments`, {
        pregnancyID: Number(form.pregnancyID || pregnancyId),
        ancVisitID: form.ancVisitID === "" ? null : Number(form.ancVisitID),
        isHighRisk: !!form.isHighRisk,
        riskCategory: form.riskCategory || null,
        riskFactor: form.riskFactor || null,
        riskDescription: form.riskDescription || null,
        actionTaken: form.actionTaken || null,
        referralRequired: form.referralRequired || null,
        notes: form.notes || null,
      });
      setShow(false);
      loadRows();
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
        <div className="flex gap-2 items-center">
          <select className={inputCls + " w-auto"} value={pregnancyId} onChange={(e) => setPregnancyId(e.target.value)}>
            <option value="">Pregnancy...</option>
            {pregnancies.map((p) => <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID}</option>)}
          </select>
          {canWrite && (
            <button type="button" onClick={() => { setForm((f) => ({ ...f, pregnancyID: pregnancyId })); setShow(true); }} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium">Add</button>
          )}
        </div>
      </div>
      <h2 className="font-semibold text-slate-800">Risk Assessments</h2>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && !pregnancyId && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Select a pregnancy.</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No risk assessments found.</div>}
      {!loading && rows.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500"><tr>
              <th className="px-4 py-2">Date</th><th className="px-4 py-2">High risk</th><th className="px-4 py-2">Category</th><th className="px-4 py-2">Factor</th><th className="px-4 py-2">Action</th>
            </tr></thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.pregnancyRiskAssessmentID}>
                  <td className="px-4 py-2">{r.assessmentDate ? new Date(r.assessmentDate).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2">{r.isHighRisk ? <span className="text-red-600 font-medium">Yes</span> : "No"}</td>
                  <td className="px-4 py-2">{r.riskCategory || "—"}</td>
                  <td className="px-4 py-2">{r.riskFactor || "—"}</td>
                  <td className="px-4 py-2">{r.actionTaken || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-3">
            <h3 className="font-semibold">New risk assessment</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <form onSubmit={submit} className="space-y-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isHighRisk} onChange={(e) => set("isHighRisk", e.target.checked)} /> High risk</label>
              <input className={inputCls} placeholder="Category" value={form.riskCategory} onChange={(e) => set("riskCategory", e.target.value)} />
              <input className={inputCls} placeholder="Risk factor" value={form.riskFactor} onChange={(e) => set("riskFactor", e.target.value)} />
              <textarea className={inputCls} rows={2} placeholder="Description" value={form.riskDescription} onChange={(e) => set("riskDescription", e.target.value)} />
              <input className={inputCls} placeholder="Action taken" value={form.actionTaken} onChange={(e) => set("actionTaken", e.target.value)} />
              <input className={inputCls} placeholder="Referral required" value={form.referralRequired} onChange={(e) => set("referralRequired", e.target.value)} />
              <textarea className={inputCls} rows={2} placeholder="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
