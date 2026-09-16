import { Fragment, useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function DeliveryComplication() {
  const { patientId, visitId, deliveryId } = useParams();
  const [sp] = useSearchParams();
  const pregnancyId = sp.get("pregnancyId") || "";
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const api = `/api/doctor/patient/${patientId}/maternal-child`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    complicationType: "", description: "", severity: "", management: "",
    referralRequired: false, outcome: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => { canWriteMaternalChildHealth().then(setCanWrite); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/deliveries/${deliveryId}/complications`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load complications.");
    } finally { setLoading(false); }
  }, [api, deliveryId]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.complicationType.trim()) { setFormError("Complication type is required."); return; }
    setSaving(true); setFormError("");
    try {
      await API.post(`${api}/deliveries/${deliveryId}/complications`, {
        deliveryID: Number(deliveryId),
        complicationType: form.complicationType,
        description: form.description || null,
        severity: form.severity || null,
        management: form.management || null,
        referralRequired: !!form.referralRequired,
        outcome: form.outcome || null,
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
        moduleTitle={`Delivery Complications · #${deliveryId}`} moduleIcon="bi-exclamation-octagon" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`${base}/delivery${pregnancyId ? `?pregnancyId=${pregnancyId}` : ""}`}
          className="text-sm text-slate-500 hover:text-rose-600">
          <i className="bi bi-arrow-left" /> Back to Deliveries
        </Link>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">
            <i className="bi bi-plus-lg me-1" /> Add Complication
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading complications...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No complications recorded for Delivery #{deliveryId}.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Referral</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.deliveryComplicationID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">#{r.deliveryComplicationID}</td>
                    <td className="px-4 py-3 font-medium">{r.complicationType || "—"}</td>
                    <td className="px-4 py-3">{r.severity || "—"}</td>
                    <td className="px-4 py-3">{r.referralRequired ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">{r.outcome || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-rose-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.deliveryComplicationID ? null : r.deliveryComplicationID)}>
                        {expandedId === r.deliveryComplicationID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.deliveryComplicationID && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50/50 px-4 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <Field label="Complication ID" value={`#${r.deliveryComplicationID}`} />
                          <Field label="Delivery ID" value={`#${r.deliveryID}`} />
                          <Field label="Type" value={r.complicationType} />
                          <Field label="Severity" value={r.severity} />
                          <Field label="Referral Required" value={r.referralRequired ? "Yes" : "No"} />
                          <Field label="Outcome" value={r.outcome} />
                          <Field label="Description" value={r.description} className="col-span-2 sm:col-span-3" />
                          <Field label="Management" value={r.management} className="col-span-2" />
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
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold">Add Complication</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div><label className="block text-xs font-medium mb-1">Complication Type *</label>
              <input required className={inputCls} value={form.complicationType} onChange={(e) => set("complicationType", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Severity</label>
              <input className={inputCls} value={form.severity} onChange={(e) => set("severity", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Description</label>
              <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Management</label>
              <textarea className={inputCls} rows={2} value={form.management} onChange={(e) => set("management", e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.referralRequired} onChange={(e) => set("referralRequired", e.target.checked)} /> Referral required
            </label>
            <div><label className="block text-xs font-medium mb-1">Outcome</label>
              <input className={inputCls} value={form.outcome} onChange={(e) => set("outcome", e.target.value)} /></div>
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
