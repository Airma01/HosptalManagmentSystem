import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import { Field, BoolField, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

export default function NeonatalCare() {
  const { patientId, visitId } = useParams();
  const api = `/api/doctor/patient/${patientId}/child-health`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    patientVisitID: visitId || "", childBirthID: "", ageInDays: "",
    generalCondition: "", feedingStatus: "", breastfeedingStatus: "",
    temperature: "", respiratoryRate: "", heartRate: "", oxygenSaturation: "",
    jaundiceStatus: "", cordCondition: "", weight: "", length: "", headCircumference: "",
    resuscitationRequired: false, neonatalProblems: "", treatment: "",
    counselingProvided: "", referralRequired: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => { canWriteMaternalChildHealth().then(setCanWrite); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/neonatal-care`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load neonatal care records.");
    } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/neonatal-care`, {
        patientVisitID: form.patientVisitID === "" ? (visitId ? Number(visitId) : null) : Number(form.patientVisitID),
        childBirthID: form.childBirthID === "" ? null : Number(form.childBirthID),
        ageInDays: form.ageInDays === "" ? null : Number(form.ageInDays),
        generalCondition: form.generalCondition || null,
        feedingStatus: form.feedingStatus || null,
        breastfeedingStatus: form.breastfeedingStatus || null,
        temperature: form.temperature || null,
        respiratoryRate: form.respiratoryRate || null,
        heartRate: form.heartRate || null,
        oxygenSaturation: form.oxygenSaturation || null,
        jaundiceStatus: form.jaundiceStatus || null,
        cordCondition: form.cordCondition || null,
        weight: form.weight || null,
        length: form.length || null,
        headCircumference: form.headCircumference || null,
        resuscitationRequired: !!form.resuscitationRequired,
        neonatalProblems: form.neonatalProblems || null,
        treatment: form.treatment || null,
        counselingProvided: form.counselingProvided || null,
        referralRequired: form.referralRequired || null,
        notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">Neonatal Care Records</h3>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium">
            <i className="bi bi-plus-lg me-1" /> Add Assessment
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading neonatal care...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-600">
          No neonatal care records found for this child.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Age (days)</th>
                <th className="px-4 py-3 font-medium">Condition</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 font-medium">Feeding</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.neonatalCareID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">#{r.neonatalCareID}</td>
                    <td className="px-4 py-3">{fmtDate(r.assessmentDate, true)}</td>
                    <td className="px-4 py-3">{r.ageInDays ?? "—"}</td>
                    <td className="px-4 py-3">{r.generalCondition || "—"}</td>
                    <td className="px-4 py-3">{r.weight || "—"}</td>
                    <td className="px-4 py-3">{r.feedingStatus || r.breastfeedingStatus || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-sky-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.neonatalCareID ? null : r.neonatalCareID)}>
                        {expandedId === r.neonatalCareID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.neonatalCareID && (
                    <tr>
                      <td colSpan={7} className="bg-slate-50/50 px-4 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="col-span-full text-xs font-semibold text-slate-500 uppercase">Assessment</div>
                          <Field label="Neonatal Care ID" value={`#${r.neonatalCareID}`} />
                          <Field label="Patient ID" value={`#${r.patientID}`} />
                          <Field label="Visit ID" value={r.patientVisitID != null ? `#${r.patientVisitID}` : null} />
                          <Field label="Child Birth ID" value={r.childBirthID != null ? `#${r.childBirthID}` : null} />
                          <Field label="Assessment Date" value={fmtDate(r.assessmentDate, true)} />
                          <Field label="Age in Days" value={r.ageInDays} />
                          <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Clinical Findings</div>
                          <Field label="General Condition" value={r.generalCondition} />
                          <Field label="Feeding Status" value={r.feedingStatus} />
                          <Field label="Breastfeeding Status" value={r.breastfeedingStatus} />
                          <Field label="Temperature" value={r.temperature} />
                          <Field label="Respiratory Rate" value={r.respiratoryRate} />
                          <Field label="Heart Rate" value={r.heartRate} />
                          <Field label="Oxygen Saturation" value={r.oxygenSaturation} />
                          <Field label="Jaundice Status" value={r.jaundiceStatus} />
                          <Field label="Cord Condition" value={r.cordCondition} />
                          <Field label="Weight" value={r.weight} />
                          <Field label="Length" value={r.length} />
                          <Field label="Head Circumference" value={r.headCircumference} />
                          <BoolField label="Resuscitation Required" value={r.resuscitationRequired} />
                          <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Plan</div>
                          <Field label="Neonatal Problems" value={r.neonatalProblems} className="col-span-2" />
                          <Field label="Treatment" value={r.treatment} className="col-span-2" />
                          <Field label="Counseling Provided" value={r.counselingProvided} />
                          <Field label="Referral Required" value={r.referralRequired} />
                          <Field label="Notes" value={r.notes} className="col-span-2 sm:col-span-3" />
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
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold">Neonatal Care Assessment</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Visit ID</label>
                <input className={inputCls} value={form.patientVisitID} onChange={(e) => set("patientVisitID", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Age in Days</label>
                <input type="number" className={inputCls} value={form.ageInDays} onChange={(e) => set("ageInDays", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">General Condition</label>
              <input className={inputCls} value={form.generalCondition} onChange={(e) => set("generalCondition", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Feeding Status</label>
                <input className={inputCls} value={form.feedingStatus} onChange={(e) => set("feedingStatus", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Breastfeeding</label>
                <input className={inputCls} value={form.breastfeedingStatus} onChange={(e) => set("breastfeedingStatus", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Temperature</label>
                <input className={inputCls} value={form.temperature} onChange={(e) => set("temperature", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Respiratory Rate</label>
                <input className={inputCls} value={form.respiratoryRate} onChange={(e) => set("respiratoryRate", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Heart Rate</label>
                <input className={inputCls} value={form.heartRate} onChange={(e) => set("heartRate", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">O₂ Saturation</label>
                <input className={inputCls} value={form.oxygenSaturation} onChange={(e) => set("oxygenSaturation", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Jaundice</label>
                <input className={inputCls} value={form.jaundiceStatus} onChange={(e) => set("jaundiceStatus", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Cord Condition</label>
                <input className={inputCls} value={form.cordCondition} onChange={(e) => set("cordCondition", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs font-medium mb-1">Weight</label>
                <input className={inputCls} value={form.weight} onChange={(e) => set("weight", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Length</label>
                <input className={inputCls} value={form.length} onChange={(e) => set("length", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Head Circ.</label>
                <input className={inputCls} value={form.headCircumference} onChange={(e) => set("headCircumference", e.target.value)} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.resuscitationRequired} onChange={(e) => set("resuscitationRequired", e.target.checked)} /> Resuscitation required
            </label>
            <div><label className="block text-xs font-medium mb-1">Neonatal Problems</label>
              <textarea className={inputCls} rows={2} value={form.neonatalProblems} onChange={(e) => set("neonatalProblems", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Treatment</label>
              <textarea className={inputCls} rows={2} value={form.treatment} onChange={(e) => set("treatment", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Counseling</label>
              <input className={inputCls} value={form.counselingProvided} onChange={(e) => set("counselingProvided", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Referral Required</label>
              <input className={inputCls} value={form.referralRequired} onChange={(e) => set("referralRequired", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Notes</label>
              <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
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
