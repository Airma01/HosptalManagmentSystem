import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function RiskAssessment() {
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
    pregnancyID: sp.get("pregnancyId") || "", ancVisitID: "", isHighRisk: false,
    riskCategory: "", riskFactor: "", riskDescription: "", actionTaken: "", referralRequired: "", notes: "",
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

  const loadRows = useCallback(async () => {
    if (!pregnancyId) { setRows([]); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/risk-assessments`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load risk assessments.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);
  useEffect(() => { loadRows(); }, [loadRows]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
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
      setShow(false); loadRows();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save risk assessment.");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader patientId={patientId} visitId={visitId} pregnancyId={pregnancyId || undefined}
        moduleTitle="Risk Assessment" moduleIcon="bi-exclamation-triangle" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Pregnancy</label>
          <select className={inputCls + " w-auto min-w-[8rem]"} value={pregnancyId} onChange={(e) => setPregnancyId(e.target.value)}>
            <option value="">Select...</option>
            {pregnancies.map((p) => <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID}</option>)}
          </select>
        </div>
        {canWrite && (
          <button type="button" onClick={() => { setForm((f) => ({ ...f, pregnancyID: pregnancyId })); setShow(true); }}
            disabled={!pregnancyId} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50">
            <i className="bi bi-plus-lg me-1" /> Add Risk Assessment
          </button>
        )}
      </div>

      {loading && <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">Loading risk assessments...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && !pregnancyId && <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">Select a pregnancy to view risk assessments.</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-600 text-sm mb-3">No risk assessments found for Pregnancy #{pregnancyId}.</p>
          {canWrite && (
            <button type="button" onClick={() => { setForm((f) => ({ ...f, pregnancyID: pregnancyId })); setShow(true); }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">Create Risk Assessment</button>
          )}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">High Risk</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Risk Factor</th>
                <th className="px-4 py-3 font-medium">Action Taken</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.pregnancyRiskAssessmentID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">{fmtDate(r.assessmentDate, true)}</td>
                    <td className="px-4 py-3">
                      {r.isHighRisk
                        ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">Yes</span>
                        : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">No</span>}
                    </td>
                    <td className="px-4 py-3">{r.riskCategory || "—"}</td>
                    <td className="px-4 py-3 max-w-[10rem] truncate">{r.riskFactor || "—"}</td>
                    <td className="px-4 py-3 max-w-[10rem] truncate">{r.actionTaken || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setExpandedId(expandedId === r.pregnancyRiskAssessmentID ? null : r.pregnancyRiskAssessmentID)}
                        className="text-rose-600 text-xs font-medium hover:underline">
                        {expandedId === r.pregnancyRiskAssessmentID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.pregnancyRiskAssessmentID && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50/50 px-4 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <Field label="Assessment ID" value={`#${r.pregnancyRiskAssessmentID}`} />
                          <Field label="Pregnancy ID" value={`#${r.pregnancyID}`} />
                          <Field label="ANC Visit ID" value={r.ancVisitID != null ? `#${r.ancVisitID}` : null} />
                          <Field label="Assessment Date" value={fmtDate(r.assessmentDate, true)} />
                          <Field label="High Risk" value={r.isHighRisk ? "Yes" : "No"} />
                          <Field label="Risk Category" value={r.riskCategory} />
                          <Field label="Risk Factor" value={r.riskFactor} className="col-span-2" />
                          <Field label="Risk Description" value={r.riskDescription} className="col-span-2 sm:col-span-3" />
                          <Field label="Action Taken" value={r.actionTaken} className="col-span-2" />
                          <Field label="Referral Required" value={r.referralRequired} />
                          <Field label="Notes" value={r.notes} className="col-span-2 sm:col-span-3" />
                          <Field label="Assessed By User ID" value={r.assessedByUserID} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold">New Risk Assessment</h3>
              <button type="button" onClick={() => setShow(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-3">
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isHighRisk} onChange={(e) => set("isHighRisk", e.target.checked)} /> High risk
              </label>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Risk Category</label>
                <input className={inputCls} value={form.riskCategory} onChange={(e) => set("riskCategory", e.target.value)} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Risk Factor</label>
                <input className={inputCls} value={form.riskFactor} onChange={(e) => set("riskFactor", e.target.value)} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Risk Description</label>
                <textarea className={inputCls} rows={2} value={form.riskDescription} onChange={(e) => set("riskDescription", e.target.value)} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Action Taken</label>
                <input className={inputCls} value={form.actionTaken} onChange={(e) => set("actionTaken", e.target.value)} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Referral Required</label>
                <input className={inputCls} value={form.referralRequired} onChange={(e) => set("referralRequired", e.target.value)} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Linked ANC Visit ID (optional)</label>
                <input className={inputCls} value={form.ancVisitID} onChange={(e) => set("ancVisitID", e.target.value)} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
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
