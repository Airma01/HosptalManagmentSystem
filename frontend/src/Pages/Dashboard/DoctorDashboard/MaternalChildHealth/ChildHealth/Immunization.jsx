import { Fragment, useCallback, useEffect, useState } from "react";
import {useParams, useNavigate} from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import { Field, fmtDate, StatusBadge } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

export default function Immunization() {
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
  const api = `/api/doctor/patient/${patientId}/child-health`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    patientVisitID: visitId || "", vaccinationDate: new Date().toISOString().slice(0, 10),
    vaccineName: "", vaccineCode: "", dose: "", doseNumber: "", route: "",
    administrationSite: "", batchNumber: "", expiryDate: "", vaccinationReason: "",
    status: "Given", adverseEvent: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => { canWriteMaternalChildHealth().then(setCanWrite); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/immunization`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load immunizations.");
    } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/immunization`, {
        patientVisitID: form.patientVisitID === "" ? (visitId ? Number(visitId) : null) : Number(form.patientVisitID),
        vaccinationDate: form.vaccinationDate ? new Date(form.vaccinationDate).toISOString() : new Date().toISOString(),
        vaccineName: form.vaccineName || "",
        vaccineCode: form.vaccineCode || null,
        dose: form.dose || null,
        doseNumber: form.doseNumber || null,
        route: form.route || null,
        administrationSite: form.administrationSite || null,
        batchNumber: form.batchNumber || null,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
        vaccinationReason: form.vaccinationReason || null,
        status: form.status || "Given",
        adverseEvent: form.adverseEvent || null,
        notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">Immunization</h3>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium">
            <i className="bi bi-plus-lg me-1" /> Record Vaccine
          </button>
        )}
      </div>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading immunizations...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-600">No immunization records found.</div>
      )}
      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Vaccine</th>
                <th className="px-4 py-3 font-medium">Dose</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.immunizationID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">{fmtDate(r.vaccinationDate)}</td>
                    <td className="px-4 py-3 font-medium">{r.vaccineName || "—"}</td>
                    <td className="px-4 py-3">{r.dose || r.doseNumber || "—"}</td>
                    <td className="px-4 py-3">{r.route || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-sky-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.immunizationID ? null : r.immunizationID)}>
                        {expandedId === r.immunizationID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.immunizationID && (
                    <tr><td colSpan={6} className="bg-slate-50/50 px-4 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Field label="Immunization ID" value={`#${r.immunizationID}`} />
                        <Field label="Vaccination Date" value={fmtDate(r.vaccinationDate, true)} />
                        <Field label="Vaccine Name" value={r.vaccineName} />
                        <Field label="Vaccine Code" value={r.vaccineCode} />
                        <Field label="Dose" value={r.dose} />
                        <Field label="Dose Number" value={r.doseNumber} />
                        <Field label="Route" value={r.route} />
                        <Field label="Administration Site" value={r.administrationSite} />
                        <Field label="Batch Number" value={r.batchNumber} />
                        <Field label="Expiry Date" value={fmtDate(r.expiryDate)} />
                        <Field label="Status" value={r.status} />
                        <Field label="Vaccination Reason" value={r.vaccinationReason} />
                        <Field label="Adverse Event" value={r.adverseEvent} className="col-span-2" />
                        <Field label="Notes" value={r.notes} className="col-span-2 sm:col-span-3" />
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
            <h3 className="font-semibold">Record Immunization</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div><label className="block text-xs font-medium mb-1">Vaccine Name *</label>
              <input required className={inputCls} value={form.vaccineName} onChange={(e) => set("vaccineName", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Vaccination Date</label>
                <input type="date" className={inputCls} value={form.vaccinationDate} onChange={(e) => set("vaccinationDate", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Status</label>
                <input className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Dose</label>
                <input className={inputCls} value={form.dose} onChange={(e) => set("dose", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Dose Number</label>
                <input className={inputCls} value={form.doseNumber} onChange={(e) => set("doseNumber", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Route</label>
                <input className={inputCls} value={form.route} onChange={(e) => set("route", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Site</label>
                <input className={inputCls} value={form.administrationSite} onChange={(e) => set("administrationSite", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Batch Number</label>
                <input className={inputCls} value={form.batchNumber} onChange={(e) => set("batchNumber", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Expiry Date</label>
                <input type="date" className={inputCls} value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Vaccine Code</label>
              <input className={inputCls} value={form.vaccineCode} onChange={(e) => set("vaccineCode", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Reason</label>
              <input className={inputCls} value={form.vaccinationReason} onChange={(e) => set("vaccinationReason", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Adverse Event</label>
              <input className={inputCls} value={form.adverseEvent} onChange={(e) => set("adverseEvent", e.target.value)} /></div>
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
