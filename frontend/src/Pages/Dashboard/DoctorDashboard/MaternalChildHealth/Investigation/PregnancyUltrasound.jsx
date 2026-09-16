import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function PregnancyUltrasound() {
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
    ancVisitID: "", gestationalAgeWeeks: "", fetalNumber: "", fetalPresentation: "",
    placentaLocation: "", amnioticFluid: "", fetalHeartRate: "", estimatedFetalWeight: "",
    findings: "", impression: "", notes: "",
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
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/ultrasounds`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ultrasound records.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
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
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader patientId={patientId} visitId={visitId} pregnancyId={pregnancyId || undefined}
        moduleTitle="Pregnancy Ultrasound" moduleIcon="bi-soundwave" />

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
            <i className="bi bi-plus-lg me-1" /> Add Ultrasound
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading ultrasound records...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No ultrasound records found for Pregnancy #{pregnancyId}.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">GA</th>
                <th className="px-4 py-3 font-medium">Presentation</th>
                <th className="px-4 py-3 font-medium">FHR</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.pregnancyUltrasoundID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">#{r.pregnancyUltrasoundID}</td>
                    <td className="px-4 py-3">{fmtDate(r.examinationDate, true)}</td>
                    <td className="px-4 py-3">{r.gestationalAgeWeeks != null ? `${r.gestationalAgeWeeks} wks` : "—"}</td>
                    <td className="px-4 py-3">{r.fetalPresentation || "—"}</td>
                    <td className="px-4 py-3">{r.fetalHeartRate || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-rose-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.pregnancyUltrasoundID ? null : r.pregnancyUltrasoundID)}>
                        {expandedId === r.pregnancyUltrasoundID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.pregnancyUltrasoundID && (
                    <tr><td colSpan={6} className="bg-slate-50/50 px-4 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="col-span-full text-xs font-semibold text-slate-500 uppercase">Examination</div>
                        <Field label="Ultrasound ID" value={`#${r.pregnancyUltrasoundID}`} />
                        <Field label="Examination Date" value={fmtDate(r.examinationDate, true)} />
                        <Field label="Gestational Age" value={r.gestationalAgeWeeks} unit="weeks" />
                        <Field label="ANC Visit ID" value={r.ancVisitID != null ? `#${r.ancVisitID}` : null} />
                        <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Findings</div>
                        <Field label="Fetal Number" value={r.fetalNumber} />
                        <Field label="Fetal Presentation" value={r.fetalPresentation} />
                        <Field label="Placenta Location" value={r.placentaLocation} />
                        <Field label="Amniotic Fluid" value={r.amnioticFluid} />
                        <Field label="Fetal Heart Rate" value={r.fetalHeartRate} />
                        <Field label="Estimated Fetal Weight" value={r.estimatedFetalWeight} />
                        <Field label="Findings" value={r.findings} className="col-span-2 sm:col-span-3" />
                        <Field label="Impression" value={r.impression} className="col-span-2 sm:col-span-3" />
                        <Field label="Notes" value={r.notes} className="col-span-2" />
                        <Field label="Requested By User ID" value={r.requestedByUserID} />
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
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold">New Ultrasound</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">GA (weeks)</label>
                <input type="number" className={inputCls} value={form.gestationalAgeWeeks} onChange={(e) => set("gestationalAgeWeeks", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">ANC Visit ID</label>
                <input className={inputCls} value={form.ancVisitID} onChange={(e) => set("ancVisitID", e.target.value)} /></div>
            </div>
            <input className={inputCls} placeholder="Fetal number" value={form.fetalNumber} onChange={(e) => set("fetalNumber", e.target.value)} />
            <input className={inputCls} placeholder="Fetal presentation" value={form.fetalPresentation} onChange={(e) => set("fetalPresentation", e.target.value)} />
            <input className={inputCls} placeholder="Placenta location" value={form.placentaLocation} onChange={(e) => set("placentaLocation", e.target.value)} />
            <input className={inputCls} placeholder="Amniotic fluid" value={form.amnioticFluid} onChange={(e) => set("amnioticFluid", e.target.value)} />
            <input className={inputCls} placeholder="Fetal heart rate" value={form.fetalHeartRate} onChange={(e) => set("fetalHeartRate", e.target.value)} />
            <input className={inputCls} placeholder="Estimated fetal weight" value={form.estimatedFetalWeight} onChange={(e) => set("estimatedFetalWeight", e.target.value)} />
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
