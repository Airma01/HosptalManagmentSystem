import { Fragment, useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";
const MODES = ["NormalVaginalDelivery", "AssistedVaginalDelivery", "CesareanSection", "Other"];

export default function DeliveryRecord() {
  const { patientId, visitId } = useParams();
  const [sp] = useSearchParams();
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
  const [expandedId, setExpandedId] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [form, setForm] = useState({
    laborRecordID: "", deliveryDate: new Date().toISOString().slice(0, 16),
    deliveryMode: "NormalVaginalDelivery", deliveryLocation: "", numberOfBabies: "1",
    maternalCondition: "", placentaCondition: "", bloodLoss: "", deliveryNotes: "",
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
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/deliveries`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load deliveries.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (detailCache[id]) return;
    try {
      const res = await API.get(`${api}/deliveries/${id}`);
      setDetailCache((c) => ({ ...c, [id]: res.data }));
    } catch {
      setDetailCache((c) => ({ ...c, [id]: null }));
    }
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/deliveries`, {
        pregnancyID: Number(pregnancyId),
        laborRecordID: form.laborRecordID === "" ? null : Number(form.laborRecordID),
        deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : new Date().toISOString(),
        deliveryMode: form.deliveryMode,
        deliveryLocation: form.deliveryLocation || null,
        numberOfBabies: form.numberOfBabies === "" ? null : Number(form.numberOfBabies),
        maternalCondition: form.maternalCondition || null,
        placentaCondition: form.placentaCondition || null,
        bloodLoss: form.bloodLoss || null,
        deliveryNotes: form.deliveryNotes || null,
      });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save delivery.");
    } finally { setSaving(false); }
  };

  const modeLabel = (m) => {
    if (!m) return "—";
    return String(m).replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader patientId={patientId} visitId={visitId} pregnancyId={pregnancyId || undefined}
        moduleTitle="Delivery Record" moduleIcon="bi-hospital" />

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
            <i className="bi bi-plus-lg me-1" /> Record Delivery
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading deliveries...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No delivery records found for Pregnancy #{pregnancyId}.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r) => {
            const d = detailCache[r.deliveryID];
            return (
              <div key={r.deliveryID} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-sm">Delivery #{r.deliveryID}</span>
                    <span className="ml-2 text-xs text-slate-500">{modeLabel(r.deliveryMode)}</span>
                    <span className="ml-2 text-xs text-slate-400">{fmtDate(r.deliveryDate, true)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button type="button" className="text-rose-600 font-medium" onClick={() => toggleExpand(r.deliveryID)}>
                      {expandedId === r.deliveryID ? "Collapse" : "Expand"}
                    </button>
                    <Link to={`${base}/delivery/${r.deliveryID}/complications${pregnancyId ? `?pregnancyId=${pregnancyId}` : ""}`}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600">Complications</Link>
                    <Link to={`${base}/delivery/${r.deliveryID}/childbirths${pregnancyId ? `?pregnancyId=${pregnancyId}` : ""}`}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600">Child Births</Link>
                  </div>
                </div>
                {expandedId === r.deliveryID && (
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="col-span-full text-xs font-semibold text-slate-500 uppercase">Delivery Information</div>
                    <Field label="Delivery ID" value={`#${r.deliveryID}`} />
                    <Field label="Pregnancy ID" value={`#${r.pregnancyID}`} />
                    <Field label="Labor Record ID" value={r.laborRecordID != null ? `#${r.laborRecordID}` : null} />
                    <Field label="Delivery Date" value={fmtDate(r.deliveryDate, true)} />
                    <Field label="Delivery Mode" value={modeLabel(r.deliveryMode)} />
                    <Field label="Delivery Location" value={r.deliveryLocation} />
                    <Field label="Number of Babies" value={r.numberOfBabies} />
                    <Field label="Maternal Condition" value={r.maternalCondition} />
                    <Field label="Placenta Condition" value={r.placentaCondition} />
                    <Field label="Blood Loss" value={r.bloodLoss} />
                    <Field label="Delivery Notes" value={r.deliveryNotes} className="col-span-2" />
                    <Field label="Recorded By User ID" value={r.recordedByUserID} />

                    {d && Array.isArray(d.complications) && d.complications.length > 0 && (
                      <>
                        <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Complications</div>
                        {d.complications.map((c) => (
                          <div key={c.deliveryComplicationID} className="col-span-full border border-slate-100 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Field label="Type" value={c.complicationType} />
                            <Field label="Severity" value={c.severity} />
                            <Field label="Referral" value={c.referralRequired ? "Yes" : "No"} />
                            <Field label="Outcome" value={c.outcome} />
                            <Field label="Description" value={c.description} className="col-span-2" />
                            <Field label="Management" value={c.management} className="col-span-2" />
                          </div>
                        ))}
                      </>
                    )}

                    {d && Array.isArray(d.childBirths) && d.childBirths.length > 0 && (
                      <>
                        <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Child Births → Child Patient</div>
                        {d.childBirths.map((cb) => (
                          <div key={cb.childBirthID} className="col-span-full border border-emerald-100 bg-emerald-50/40 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Field label="Child Birth ID" value={`#${cb.childBirthID}`} />
                            <Field label="Child Patient ID" value={cb.childPatientID != null ? `#${cb.childPatientID}` : null} />
                            <Field label="Child MRN" value={cb.childMRN} />
                            <Field label="Name" value={[cb.childFirstName, cb.childLastName].filter(Boolean).join(" ") || null} />
                            <Field label="Sex" value={cb.sex} />
                            <Field label="Birth Date" value={fmtDate(cb.birthDate, true)} />
                            <Field label="Birth Weight" value={cb.birthWeight} />
                            <Field label="Apgar Score" value={cb.apgarScore} />
                            <Field label="Birth Condition" value={cb.birthCondition} />
                            <Field label="Resuscitation" value={cb.resuscitationRequired} />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold">Record Delivery</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div><label className="block text-xs font-medium mb-1">Delivery Date *</label>
              <input type="datetime-local" required className={inputCls} value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Delivery Mode</label>
              <select className={inputCls} value={form.deliveryMode} onChange={(e) => set("deliveryMode", e.target.value)}>
                {MODES.map((m) => <option key={m} value={m}>{modeLabel(m)}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium mb-1">Labor Record ID (optional)</label>
              <input className={inputCls} value={form.laborRecordID} onChange={(e) => set("laborRecordID", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Location</label>
                <input className={inputCls} value={form.deliveryLocation} onChange={(e) => set("deliveryLocation", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Number of Babies</label>
                <input type="number" min={1} className={inputCls} value={form.numberOfBabies} onChange={(e) => set("numberOfBabies", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Maternal Condition</label>
              <input className={inputCls} value={form.maternalCondition} onChange={(e) => set("maternalCondition", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Placenta Condition</label>
              <input className={inputCls} value={form.placentaCondition} onChange={(e) => set("placentaCondition", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Blood Loss</label>
              <input className={inputCls} value={form.bloodLoss} onChange={(e) => set("bloodLoss", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Delivery Notes</label>
              <textarea className={inputCls} rows={2} value={form.deliveryNotes} onChange={(e) => set("deliveryNotes", e.target.value)} /></div>
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
