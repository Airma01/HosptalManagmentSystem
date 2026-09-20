import { Fragment, useCallback, useEffect, useState } from "react";
import {useParams, useSearchParams, useNavigate} from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function LaborRecord() {
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
  const [detailCache, setDetailCache] = useState({});
  const [form, setForm] = useState({
    admissionDate: new Date().toISOString().slice(0, 16),
    laborStartDate: "", membraneRuptureDate: "", membraneStatus: "",
    cervicalDilation: "", contractionPattern: "", fetalHeartRate: "",
    laborProgress: "", laborManagement: "", deliveryPlan: "", notes: "",
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
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/labor`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load labor records.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (detailCache[id]) return;
    try {
      const res = await API.get(`${api}/labor/${id}`);
      setDetailCache((c) => ({ ...c, [id]: res.data }));
    } catch {
      setDetailCache((c) => ({ ...c, [id]: null }));
    }
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/labor`, {
        pregnancyID: Number(pregnancyId),
        admissionDate: form.admissionDate ? new Date(form.admissionDate).toISOString() : new Date().toISOString(),
        laborStartDate: form.laborStartDate ? new Date(form.laborStartDate).toISOString() : null,
        membraneRuptureDate: form.membraneRuptureDate ? new Date(form.membraneRuptureDate).toISOString() : null,
        membraneStatus: form.membraneStatus || null,
        cervicalDilation: form.cervicalDilation || null,
        contractionPattern: form.contractionPattern || null,
        fetalHeartRate: form.fetalHeartRate || null,
        laborProgress: form.laborProgress || null,
        laborManagement: form.laborManagement || null,
        deliveryPlan: form.deliveryPlan || null,
        notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save labor record.");
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
        moduleTitle="Labor Record" moduleIcon="bi-activity" />

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
            <i className="bi bi-plus-lg me-1" /> Record Labor
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading labor records...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No labor records found for Pregnancy #{pregnancyId}.
          {canWrite && <div className="mt-3"><button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">Record Labor</button></div>}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Labor #</th>
                <th className="px-4 py-3 font-medium">Admission</th>
                <th className="px-4 py-3 font-medium">Labor Start</th>
                <th className="px-4 py-3 font-medium">Cervical Dilation</th>
                <th className="px-4 py-3 font-medium">FHR</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.laborRecordID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium">#{r.laborRecordID}</td>
                    <td className="px-4 py-3">{fmtDate(r.admissionDate, true)}</td>
                    <td className="px-4 py-3">{fmtDate(r.laborStartDate, true)}</td>
                    <td className="px-4 py-3">{r.cervicalDilation || "—"}</td>
                    <td className="px-4 py-3">{r.fetalHeartRate || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-rose-600 text-xs font-medium" onClick={() => toggleExpand(r.laborRecordID)}>
                        {expandedId === r.laborRecordID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.laborRecordID && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50/50 px-4 py-4">
                        {(() => {
                          const d = detailCache[r.laborRecordID] || r;
                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div className="col-span-full text-xs font-semibold text-slate-500 uppercase">Labor Information</div>
                              <Field label="Labor Record ID" value={`#${d.laborRecordID}`} />
                              <Field label="Pregnancy ID" value={`#${d.pregnancyID}`} />
                              <Field label="Admission Date" value={fmtDate(d.admissionDate, true)} />
                              <Field label="Labor Start Date" value={fmtDate(d.laborStartDate, true)} />
                              <Field label="Membrane Rupture Date" value={fmtDate(d.membraneRuptureDate, true)} />
                              <Field label="Membrane Status" value={d.membraneStatus} />
                              <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Maternal & Fetal Findings</div>
                              <Field label="Cervical Dilation" value={d.cervicalDilation} />
                              <Field label="Contraction Pattern" value={d.contractionPattern} />
                              <Field label="Fetal Heart Rate" value={d.fetalHeartRate} />
                              <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Progress & Plan</div>
                              <Field label="Labor Progress" value={d.laborProgress} className="col-span-2" />
                              <Field label="Labor Management" value={d.laborManagement} className="col-span-2" />
                              <Field label="Delivery Plan" value={d.deliveryPlan} className="col-span-2" />
                              <Field label="Notes" value={d.notes} className="col-span-2 sm:col-span-3" />
                              <Field label="Recorded By User ID" value={d.recordedByUserID} />
                              {Array.isArray(d.deliveries) && d.deliveries.length > 0 && (
                                <>
                                  <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Linked Deliveries</div>
                                  {d.deliveries.map((del) => (
                                    <Field key={del.deliveryID} label={`Delivery #${del.deliveryID}`} value={`${del.deliveryMode || "—"} · ${fmtDate(del.deliveryDate, true)}`} />
                                  ))}
                                </>
                              )}
                            </div>
                          );
                        })()}
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
            <h3 className="font-semibold">New Labor Record</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div><label className="block text-xs font-medium mb-1">Admission Date *</label>
              <input type="datetime-local" required className={inputCls} value={form.admissionDate} onChange={(e) => set("admissionDate", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Labor Start</label>
                <input type="datetime-local" className={inputCls} value={form.laborStartDate} onChange={(e) => set("laborStartDate", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Membrane Rupture</label>
                <input type="datetime-local" className={inputCls} value={form.membraneRuptureDate} onChange={(e) => set("membraneRuptureDate", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Membrane Status</label>
              <input className={inputCls} value={form.membraneStatus} onChange={(e) => set("membraneStatus", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Cervical Dilation</label>
                <input className={inputCls} value={form.cervicalDilation} onChange={(e) => set("cervicalDilation", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Fetal Heart Rate</label>
                <input className={inputCls} value={form.fetalHeartRate} onChange={(e) => set("fetalHeartRate", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Contraction Pattern</label>
              <input className={inputCls} value={form.contractionPattern} onChange={(e) => set("contractionPattern", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Labor Progress</label>
              <textarea className={inputCls} rows={2} value={form.laborProgress} onChange={(e) => set("laborProgress", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Labor Management</label>
              <textarea className={inputCls} rows={2} value={form.laborManagement} onChange={(e) => set("laborManagement", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Delivery Plan</label>
              <input className={inputCls} value={form.deliveryPlan} onChange={(e) => set("deliveryPlan", e.target.value)} /></div>
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
