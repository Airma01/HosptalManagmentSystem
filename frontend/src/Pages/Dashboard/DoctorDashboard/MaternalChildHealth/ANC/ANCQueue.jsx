import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function ANCQueue() {
  const { patientId, visitId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const api = `/api/doctor/patient/${patientId}/maternal-child`;
  const [rows, setRows] = useState([]);
  const [pregnancies, setPregnancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const preselected = searchParams.get("pregnancyId") || "";
  const [form, setForm] = useState({
    pregnancyID: preselected,
    patientVisitID: visitId || "",
    gestationalAgeWeeks: "",
    chiefComplaint: "",
    maternalCondition: "",
    fetalCondition: "",
    fetalHeartRate: "",
    fundalHeight: "",
    edema: "",
    counselingProvided: "",
    treatmentPlan: "",
    notes: "",
  });

  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (!cancelled) setCanWrite(ok);
    })();
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ancRes, pregRes] = await Promise.all([
        API.get(`${api}/anc`),
        API.get(`${api}/pregnancies`),
      ]);
      setRows(Array.isArray(ancRes.data) ? ancRes.data : []);
      setPregnancies(Array.isArray(pregRes.data) ? pregRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ANC visits.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (preselected) setForm((f) => ({ ...f, pregnancyID: preselected }));
  }, [preselected]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.pregnancyID) { setFormError("Select a pregnancy."); return; }
    setSaving(true);
    setFormError("");
    try {
      const body = {
        pregnancyID: Number(form.pregnancyID),
        patientVisitID: Number(form.patientVisitID || visitId),
        gestationalAgeWeeks: form.gestationalAgeWeeks === "" ? null : Number(form.gestationalAgeWeeks),
        chiefComplaint: form.chiefComplaint || null,
        maternalCondition: form.maternalCondition || null,
        fetalCondition: form.fetalCondition || null,
        fetalHeartRate: form.fetalHeartRate || null,
        fundalHeight: form.fundalHeight || null,
        edema: form.edema || null,
        counselingProvided: form.counselingProvided || null,
        treatmentPlan: form.treatmentPlan || null,
        notes: form.notes || null,
      };
      await API.post(`${api}/anc`, body);
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create ANC visit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <button type="button" onClick={() => navigate(base)} className="text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> Dashboard</button>
          <span className="text-slate-300">/</span>
          <span className="font-medium">ANC Visits</span>
        </div>
        {canWrite && (
          <button type="button" onClick={() => setShowForm(true)} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">
          <i className="bi bi-plus-lg me-1" /> Add ANC Visit
        </button>
        )}
      </div>
      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading ANC visits...</div>}
      {error && !loading && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">No ANC visits found.</div>
      )}
      {!loading && rows.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Pregnancy</th>
                  <th className="px-4 py-3">Visit</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">GA (wks)</th>
                  <th className="px-4 py-3">Complaint</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.ancVisitID}>
                    <td className="px-4 py-3">#{r.ancVisitID}</td>
                    <td className="px-4 py-3">#{r.pregnancyID}</td>
                    <td className="px-4 py-3">#{r.patientVisitID}</td>
                    <td className="px-4 py-3">{r.visitDate ? new Date(r.visitDate).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">{r.gestationalAgeWeeks ?? "—"}</td>
                    <td className="px-4 py-3 max-w-[12rem] truncate">{r.chiefComplaint || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`${base}/anc/${r.ancVisitID}`} className="text-rose-600 text-xs font-medium">Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {canWrite && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold">New ANC Visit</h3>
              <button type="button" onClick={() => setShowForm(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-3">
              {formError && <div className="text-sm text-red-600">{formError}</div>}
              <div>
                <label className="block text-xs font-medium mb-1">Pregnancy *</label>
                <select required className={inputCls} value={form.pregnancyID} onChange={(e) => set("pregnancyID", e.target.value)}>
                  <option value="">Select...</option>
                  {pregnancies.map((p) => (
                    <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID} · {p.status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Patient visit ID *</label>
                <input required className={inputCls} value={form.patientVisitID} onChange={(e) => set("patientVisitID", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">GA weeks</label>
                  <input type="number" className={inputCls} value={form.gestationalAgeWeeks} onChange={(e) => set("gestationalAgeWeeks", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Fetal heart rate</label>
                  <input className={inputCls} value={form.fetalHeartRate} onChange={(e) => set("fetalHeartRate", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Chief complaint</label>
                <input className={inputCls} value={form.chiefComplaint} onChange={(e) => set("chiefComplaint", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Maternal condition</label>
                <input className={inputCls} value={form.maternalCondition} onChange={(e) => set("maternalCondition", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Fetal condition</label>
                <input className={inputCls} value={form.fetalCondition} onChange={(e) => set("fetalCondition", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Fundal height</label>
                <input className={inputCls} value={form.fundalHeight} onChange={(e) => set("fundalHeight", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Edema</label>
                <input className={inputCls} value={form.edema} onChange={(e) => set("edema", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Counseling</label>
                <input className={inputCls} value={form.counselingProvided} onChange={(e) => set("counselingProvided", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Treatment plan</label>
                <textarea rows={2} className={inputCls} value={form.treatmentPlan} onChange={(e) => set("treatmentPlan", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Notes</label>
                <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-sm disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
