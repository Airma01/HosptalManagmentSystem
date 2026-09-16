import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function HighRiskPregnancy() {
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
    riskLevel: "High", riskReason: "", managementPlan: "", specialistRequired: "",
    referralPlan: "", followUpFrequency: "", active: true, notes: "",
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

  const load = useCallback(async () => {
    if (!pregnancyId) { setRows([]); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/high-risk`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load high-risk records.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/high-risk`, {
        pregnancyID: Number(pregnancyId),
        riskLevel: form.riskLevel || "High",
        riskReason: form.riskReason || "",
        managementPlan: form.managementPlan || null,
        specialistRequired: form.specialistRequired || null,
        referralPlan: form.referralPlan || null,
        followUpFrequency: form.followUpFrequency || null,
        active: !!form.active,
        notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader patientId={patientId} visitId={visitId} pregnancyId={pregnancyId || undefined}
        moduleTitle="High-Risk Pregnancy" moduleIcon="bi-heart-pulse" />

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
            <i className="bi bi-plus-lg me-1" /> Register High Risk
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading high-risk records...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No high-risk pregnancy records found for Pregnancy #{pregnancyId}.
          {canWrite && <div className="mt-3"><button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">Register High Risk</button></div>}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Identified</th>
                <th className="px-4 py-3 font-medium">Risk Level</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.highRiskPregnancyID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">#{r.highRiskPregnancyID}</td>
                    <td className="px-4 py-3">{fmtDate(r.identificationDate)}</td>
                    <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">{r.riskLevel || "—"}</span></td>
                    <td className="px-4 py-3 max-w-[12rem] truncate">{r.riskReason || "—"}</td>
                    <td className="px-4 py-3">{r.active ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-rose-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.highRiskPregnancyID ? null : r.highRiskPregnancyID)}>
                        {expandedId === r.highRiskPregnancyID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.highRiskPregnancyID && (
                    <tr><td colSpan={6} className="bg-slate-50/50 px-4 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Field label="High-Risk ID" value={`#${r.highRiskPregnancyID}`} />
                        <Field label="Pregnancy ID" value={`#${r.pregnancyID}`} />
                        <Field label="Identification Date" value={fmtDate(r.identificationDate, true)} />
                        <Field label="Risk Level" value={r.riskLevel} />
                        <Field label="Active" value={r.active ? "Yes" : "No"} />
                        <Field label="Resolved Date" value={fmtDate(r.resolvedDate)} />
                        <Field label="Risk Reason" value={r.riskReason} className="col-span-2 sm:col-span-3" />
                        <Field label="Management Plan" value={r.managementPlan} className="col-span-2" />
                        <Field label="Specialist Required" value={r.specialistRequired} />
                        <Field label="Referral Plan" value={r.referralPlan} className="col-span-2" />
                        <Field label="Follow-up Frequency" value={r.followUpFrequency} />
                        <Field label="Outcome" value={r.outcome} />
                        <Field label="Notes" value={r.notes} className="col-span-2 sm:col-span-3" />
                        <Field label="Managed By User ID" value={r.managedByUserID} />
                      </div>
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold">Register High-Risk Pregnancy</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div><label className="block text-xs font-medium mb-1">Risk Level</label>
              <input className={inputCls} value={form.riskLevel} onChange={(e) => set("riskLevel", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Risk Reason *</label>
              <textarea required className={inputCls} rows={2} value={form.riskReason} onChange={(e) => set("riskReason", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Management Plan</label>
              <textarea className={inputCls} rows={2} value={form.managementPlan} onChange={(e) => set("managementPlan", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Specialist Required</label>
              <input className={inputCls} value={form.specialistRequired} onChange={(e) => set("specialistRequired", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Referral Plan</label>
              <input className={inputCls} value={form.referralPlan} onChange={(e) => set("referralPlan", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Follow-up Frequency</label>
              <input className={inputCls} value={form.followUpFrequency} onChange={(e) => set("followUpFrequency", e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} /> Active</label>
            <div><label className="block text-xs font-medium mb-1">Notes</label>
              <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
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
