import { Fragment, useCallback, useEffect, useState } from "react";
import {useParams, useSearchParams, useNavigate} from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function PNCVisit() {
  const navigate = useNavigate();
  const [mchAccessAllowed, setMchAccessAllowed] = useState(null); // null = checking

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (cancelled) return;
      if (!ok) {
        navigate("/doctor", { replace: true });
        setMchAccessAllowed(false);
      } else {
        setMchAccessAllowed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

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
    deliveryID: "", daysAfterDelivery: "", maternalCondition: "", bleedingStatus: "",
    breastfeedingStatus: "", uterusCondition: "", mentalHealthAssessment: "",
    counselingProvided: "", familyPlanningCounseling: "", treatmentPlan: "", notes: "",
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
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/pnc`);
      let list = Array.isArray(res.data) ? res.data : [];
      if (pregnancyId) list = list.filter((r) => String(r.pregnancyID) === String(pregnancyId));
      setRows(list);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load PNC visits.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/pnc`, {
        pregnancyID: Number(pregnancyId),
        patientVisitID: Number(visitId),
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
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save PNC visit.");
    } finally { setSaving(false); }
  };

  if (mchAccessAllowed !== true) {
    return (
      <div className="p-6 text-slate-500 text-sm flex items-center gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        Checking access…
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader patientId={patientId} visitId={visitId} pregnancyId={pregnancyId || undefined}
        moduleTitle="Postnatal Care (PNC)" moduleIcon="bi-person-heart" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Pregnancy</label>
          <select className={inputCls + " w-auto"} value={pregnancyId} onChange={(e) => setPregnancyId(e.target.value)}>
            <option value="">All</option>
            {pregnancies.map((p) => <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID}</option>)}
          </select>
        </div>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)} disabled={!pregnancyId}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50">
            <i className="bi bi-plus-lg me-1" /> Add PNC Visit
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading PNC visits...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No PNC visits found{pregnancyId ? ` for Pregnancy #${pregnancyId}` : ""}.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">PNC #</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Days After Delivery</th>
                <th className="px-4 py-3 font-medium">Maternal Condition</th>
                <th className="px-4 py-3 font-medium">Bleeding</th>
                <th className="px-4 py-3 font-medium">Breastfeeding</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.pncVisitID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">#{r.pncVisitID}</td>
                    <td className="px-4 py-3">{fmtDate(r.visitDate, true)}</td>
                    <td className="px-4 py-3">{r.daysAfterDelivery != null ? r.daysAfterDelivery : "—"}</td>
                    <td className="px-4 py-3 max-w-[10rem] truncate">{r.maternalCondition || "—"}</td>
                    <td className="px-4 py-3">{r.bleedingStatus || "—"}</td>
                    <td className="px-4 py-3">{r.breastfeedingStatus || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-rose-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.pncVisitID ? null : r.pncVisitID)}>
                        {expandedId === r.pncVisitID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.pncVisitID && (
                    <tr>
                      <td colSpan={7} className="bg-slate-50/50 px-4 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="col-span-full text-xs font-semibold text-slate-500 uppercase">Visit Information</div>
                          <Field label="PNC Visit ID" value={`#${r.pncVisitID}`} />
                          <Field label="Pregnancy ID" value={`#${r.pregnancyID}`} />
                          <Field label="Patient Visit ID" value={`#${r.patientVisitID}`} />
                          <Field label="Delivery ID" value={r.deliveryID != null ? `#${r.deliveryID}` : null} />
                          <Field label="Visit Date" value={fmtDate(r.visitDate, true)} />
                          <Field label="Days After Delivery" value={r.daysAfterDelivery} />
                          <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Maternal Assessment</div>
                          <Field label="Maternal Condition" value={r.maternalCondition} />
                          <Field label="Bleeding Status" value={r.bleedingStatus} />
                          <Field label="Breastfeeding Status" value={r.breastfeedingStatus} />
                          <Field label="Uterus Condition" value={r.uterusCondition} />
                          <Field label="Mental Health Assessment" value={r.mentalHealthAssessment} className="col-span-2" />
                          <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Counseling & Plan</div>
                          <Field label="Counseling Provided" value={r.counselingProvided} className="col-span-2" />
                          <Field label="Family Planning Counseling" value={r.familyPlanningCounseling} className="col-span-2" />
                          <Field label="Treatment Plan" value={r.treatmentPlan} className="col-span-2" />
                          <Field label="Notes" value={r.notes} className="col-span-2 sm:col-span-3" />
                          <Field label="Recorded By User ID" value={r.recordedByUserID} />
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
            <h3 className="font-semibold">New PNC Visit</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Delivery ID (optional)</label>
                <input className={inputCls} value={form.deliveryID} onChange={(e) => set("deliveryID", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Days After Delivery</label>
                <input type="number" min={0} className={inputCls} value={form.daysAfterDelivery} onChange={(e) => set("daysAfterDelivery", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Maternal Condition</label>
              <input className={inputCls} value={form.maternalCondition} onChange={(e) => set("maternalCondition", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Bleeding Status</label>
                <input className={inputCls} value={form.bleedingStatus} onChange={(e) => set("bleedingStatus", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Breastfeeding Status</label>
                <input className={inputCls} value={form.breastfeedingStatus} onChange={(e) => set("breastfeedingStatus", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Uterus Condition</label>
              <input className={inputCls} value={form.uterusCondition} onChange={(e) => set("uterusCondition", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Mental Health Assessment</label>
              <input className={inputCls} value={form.mentalHealthAssessment} onChange={(e) => set("mentalHealthAssessment", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Counseling Provided</label>
              <input className={inputCls} value={form.counselingProvided} onChange={(e) => set("counselingProvided", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Family Planning Counseling</label>
              <input className={inputCls} value={form.familyPlanningCounseling} onChange={(e) => set("familyPlanningCounseling", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Treatment Plan</label>
              <textarea className={inputCls} rows={2} value={form.treatmentPlan} onChange={(e) => set("treatmentPlan", e.target.value)} /></div>
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
