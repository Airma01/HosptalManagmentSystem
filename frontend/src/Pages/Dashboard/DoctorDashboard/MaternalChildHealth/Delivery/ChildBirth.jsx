import { Fragment, useCallback, useEffect, useState } from "react";
import {Link, useParams, useSearchParams, useNavigate} from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function ChildBirth() {
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
  const [lastCreated, setLastCreated] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", sex: "",
    birthDate: new Date().toISOString().slice(0, 16),
    birthWeight: "", birthLength: "", headCircumference: "",
    apgarScore: "", birthCondition: "", resuscitationRequired: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => { canWriteMaternalChildHealth().then(setCanWrite); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/deliveries/${deliveryId}/childbirths`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load child births.");
    } finally { setLoading(false); }
  }, [api, deliveryId]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError(""); setLastCreated(null);
    try {
      if (!form.firstName?.trim() || !form.lastName?.trim()) {
        setFormError("First name and last name are required to register the newborn.");
        setSaving(false); return;
      }
      const res = await API.post(`${api}/deliveries/${deliveryId}/childbirths`, {
        deliveryID: Number(deliveryId),
        childPatientID: null,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        sex: form.sex || null,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : new Date().toISOString(),
        birthWeight: form.birthWeight || null,
        birthLength: form.birthLength || null,
        headCircumference: form.headCircumference || null,
        apgarScore: form.apgarScore || null,
        birthCondition: form.birthCondition || null,
        resuscitationRequired: form.resuscitationRequired || null,
        notes: form.notes || null,
      });
      setLastCreated(res.data);
      setShow(false);
      setForm({
        firstName: "", lastName: "", sex: "",
        birthDate: new Date().toISOString().slice(0, 16),
        birthWeight: "", birthLength: "", headCircumference: "",
        apgarScore: "", birthCondition: "", resuscitationRequired: "", notes: "",
      });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to register child birth.");
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
        moduleTitle={`Child Births · Delivery #${deliveryId}`} moduleIcon="bi-emoji-smile" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`${base}/delivery${pregnancyId ? `?pregnancyId=${pregnancyId}` : ""}`}
          className="text-sm text-slate-500 hover:text-rose-600">
          <i className="bi bi-arrow-left" /> Back to Deliveries
        </Link>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">
            <i className="bi bi-plus-lg me-1" /> Register Newborn
          </button>
        )}
      </div>

      <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-sm text-sky-800">
        <i className="bi bi-info-circle me-1" />
        Mother → Pregnancy → Delivery #{deliveryId} → Child Birth → Child Patient (MRN generated by backend)
      </div>

      {lastCreated && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
          Newborn registered
          {lastCreated.childMRN ? ` · MRN ${lastCreated.childMRN}` : ""}
          {lastCreated.childPatientID ? ` · Patient #${lastCreated.childPatientID}` : ""}.
          You can open Child Health from the MCH dashboard.
        </div>
      )}

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading child births...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No child births recorded for Delivery #{deliveryId}.
          {canWrite && <div className="mt-3"><button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">Register Newborn</button></div>}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Child Birth #</th>
                <th className="px-4 py-3 font-medium">Child Patient</th>
                <th className="px-4 py-3 font-medium">MRN</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Sex</th>
                <th className="px-4 py-3 font-medium">Birth Date</th>
                <th className="px-4 py-3 font-medium">Weight / Apgar</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.childBirthID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">#{r.childBirthID}</td>
                    <td className="px-4 py-3">{r.childPatientID != null ? `#${r.childPatientID}` : "—"}</td>
                    <td className="px-4 py-3 font-medium">{r.childMRN || "—"}</td>
                    <td className="px-4 py-3">{[r.childFirstName, r.childLastName].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-4 py-3">{r.sex || "—"}</td>
                    <td className="px-4 py-3">{fmtDate(r.birthDate, true)}</td>
                    <td className="px-4 py-3">{[r.birthWeight, r.apgarScore].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-rose-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.childBirthID ? null : r.childBirthID)}>
                        {expandedId === r.childBirthID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.childBirthID && (
                    <tr>
                      <td colSpan={8} className="bg-slate-50/50 px-4 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="col-span-full text-xs font-semibold text-slate-500 uppercase">Child Birth Information</div>
                          <Field label="Child Birth ID" value={`#${r.childBirthID}`} />
                          <Field label="Delivery ID" value={`#${r.deliveryID}`} />
                          <Field label="Child Patient ID" value={r.childPatientID != null ? `#${r.childPatientID}` : null} />
                          <Field label="Child MRN" value={r.childMRN} />
                          <Field label="First Name" value={r.childFirstName} />
                          <Field label="Last Name" value={r.childLastName} />
                          <Field label="Sex" value={r.sex} />
                          <Field label="Birth Date" value={fmtDate(r.birthDate, true)} />
                          <Field label="Birth Weight" value={r.birthWeight} />
                          <Field label="Birth Length" value={r.birthLength} />
                          <Field label="Head Circumference" value={r.headCircumference} />
                          <Field label="Apgar Score" value={r.apgarScore} />
                          <Field label="Birth Condition" value={r.birthCondition} />
                          <Field label="Resuscitation Required" value={r.resuscitationRequired} />
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
            <h3 className="font-semibold">Register Newborn</h3>
            <p className="text-xs text-slate-500">Creates a ChildBirth and a new Patient record (MRN by backend).</p>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">First Name *</label>
                <input required className={inputCls} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Last Name *</label>
                <input required className={inputCls} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Sex</label>
                <select className={inputCls} value={form.sex} onChange={(e) => set("sex", e.target.value)}>
                  <option value="">—</option><option value="Male">Male</option><option value="Female">Female</option>
                </select></div>
              <div><label className="block text-xs font-medium mb-1">Birth Date *</label>
                <input type="datetime-local" required className={inputCls} value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs font-medium mb-1">Birth Weight</label>
                <input className={inputCls} value={form.birthWeight} onChange={(e) => set("birthWeight", e.target.value)} placeholder="e.g. 3.2 kg" /></div>
              <div><label className="block text-xs font-medium mb-1">Birth Length</label>
                <input className={inputCls} value={form.birthLength} onChange={(e) => set("birthLength", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Head Circ.</label>
                <input className={inputCls} value={form.headCircumference} onChange={(e) => set("headCircumference", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Apgar Score</label>
                <input className={inputCls} value={form.apgarScore} onChange={(e) => set("apgarScore", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Resuscitation</label>
                <input className={inputCls} value={form.resuscitationRequired} onChange={(e) => set("resuscitationRequired", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Birth Condition</label>
              <input className={inputCls} value={form.birthCondition} onChange={(e) => set("birthCondition", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Notes</label>
              <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Register"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
