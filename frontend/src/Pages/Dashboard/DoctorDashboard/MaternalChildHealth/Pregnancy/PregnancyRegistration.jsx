import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../../Config/API";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function PregnancyRegistration() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    lastMenstrualPeriod: "",
    expectedDeliveryDate: "",
    gravida: "",
    para: "",
    abortions: "",
    livingChildren: "",
    notes: "",
    gestationalAgeWeeks: "",
    registrationReason: "",
    previousPregnancyHistory: "",
    currentPregnancyHistory: "",
    registrationNotes: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        lastMenstrualPeriod: form.lastMenstrualPeriod || null,
        expectedDeliveryDate: form.expectedDeliveryDate || null,
        gravida: form.gravida === "" ? null : Number(form.gravida),
        para: form.para === "" ? null : Number(form.para),
        abortions: form.abortions === "" ? null : Number(form.abortions),
        livingChildren: form.livingChildren === "" ? null : Number(form.livingChildren),
        notes: form.notes || null,
        gestationalAgeWeeks: form.gestationalAgeWeeks === "" ? null : Number(form.gestationalAgeWeeks),
        registrationReason: form.registrationReason || null,
        previousPregnancyHistory: form.previousPregnancyHistory || null,
        currentPregnancyHistory: form.currentPregnancyHistory || null,
        registrationNotes: form.registrationNotes || null,
      };
      // POST /api/doctor/patient/{patientId}/maternal-child/pregnancies
      const res = await API.post(`/api/doctor/patient/${patientId}/maternal-child/pregnancies`, body);
      const id = res.data?.pregnancyID;
      navigate(id ? `${base}/pregnancy/${id}` : `${base}/pregnancies`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register pregnancy.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button type="button" onClick={() => navigate(`${base}/pregnancies`)} className="text-sm text-slate-500 hover:text-rose-600">
        <i className="bi bi-arrow-left" /> Back to list
      </button>
      <div className="bg-white border rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Register Pregnancy</h2>
        {error && <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last menstrual period</label>
              <input type="date" className={inputCls} value={form.lastMenstrualPeriod} onChange={(e) => set("lastMenstrualPeriod", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expected delivery date</label>
              <input type="date" className={inputCls} value={form.expectedDeliveryDate} onChange={(e) => set("expectedDeliveryDate", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gravida</label>
              <input type="number" min="0" className={inputCls} value={form.gravida} onChange={(e) => set("gravida", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Para</label>
              <input type="number" min="0" className={inputCls} value={form.para} onChange={(e) => set("para", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Abortions</label>
              <input type="number" min="0" className={inputCls} value={form.abortions} onChange={(e) => set("abortions", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Living children</label>
              <input type="number" min="0" className={inputCls} value={form.livingChildren} onChange={(e) => set("livingChildren", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gestational age (weeks)</label>
              <input type="number" min="0" className={inputCls} value={form.gestationalAgeWeeks} onChange={(e) => set("gestationalAgeWeeks", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Registration reason</label>
              <input className={inputCls} value={form.registrationReason} onChange={(e) => set("registrationReason", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Previous pregnancy history</label>
            <textarea rows={2} className={inputCls} value={form.previousPregnancyHistory} onChange={(e) => set("previousPregnancyHistory", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Current pregnancy history</label>
            <textarea rows={2} className={inputCls} value={form.currentPregnancyHistory} onChange={(e) => set("currentPregnancyHistory", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => navigate(`${base}/pregnancies`)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium disabled:opacity-60">
              {saving ? "Saving..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
