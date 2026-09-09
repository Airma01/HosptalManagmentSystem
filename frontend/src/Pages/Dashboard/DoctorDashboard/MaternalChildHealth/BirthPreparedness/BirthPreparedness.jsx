import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function BirthPreparedness() {
  const { patientId, visitId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
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
  const [form, setForm] = useState({
    deliveryFacilityIdentified: false, deliveryFacility: "", transportArranged: false, transportPlan: "",
    birthCompanionIdentified: false, emergencyContactIdentified: false, financialPreparation: false,
    bloodDonorIdentified: false, emergencyPlan: "", counselingProvided: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (!cancelled) setCanWrite(ok);
    })();
    return () => { cancelled = true; };
  }, []);

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
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/birth-preparedness`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load birth preparedness.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      await API.post(`${api}/birth-preparedness`, { pregnancyID: Number(pregnancyId), ...form, deliveryFacility: form.deliveryFacility || null, transportPlan: form.transportPlan || null, emergencyPlan: form.emergencyPlan || null, counselingProvided: form.counselingProvided || null, notes: form.notes || null });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  const checks = [
    ["deliveryFacilityIdentified", "Delivery facility identified"],
    ["transportArranged", "Transport arranged"],
    ["birthCompanionIdentified", "Birth companion identified"],
    ["emergencyContactIdentified", "Emergency contact identified"],
    ["financialPreparation", "Financial preparation"],
    ["bloodDonorIdentified", "Blood donor identified"],
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate(base)} className="text-sm text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> Dashboard</button>
        <div className="flex gap-2">
          <select className={inputCls + " w-auto"} value={pregnancyId} onChange={(e) => setPregnancyId(e.target.value)}>
            <option value="">Pregnancy...</option>
            {pregnancies.map((p) => <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID}</option>)}
          </select>
          {canWrite && (
          <button type="button" onClick={() => setShow(true)} disabled={!pregnancyId} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50">Add</button>
        )}
        </div>
      </div>
      <h2 className="font-semibold">Birth Preparedness</h2>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No birth preparedness records.</div>}
      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.birthPreparednessID} className="bg-white border rounded-xl p-4 text-sm">
              <p className="text-xs text-slate-400">{r.assessmentDate ? new Date(r.assessmentDate).toLocaleString() : ""}</p>
              <p className="mt-1">Facility: {r.deliveryFacility || "—"} · Transport: {r.transportPlan || "—"}</p>
              <p className="text-xs text-slate-500 mt-1">{r.emergencyPlan || ""}</p>
            </div>
          ))}
        </div>
      )}
      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold">Birth preparedness plan</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            {checks.map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form[k]} onChange={(e) => set(k, e.target.checked)} /> {label}</label>
            ))}
            <input className={inputCls} placeholder="Delivery facility" value={form.deliveryFacility} onChange={(e) => set("deliveryFacility", e.target.value)} />
            <input className={inputCls} placeholder="Transport plan" value={form.transportPlan} onChange={(e) => set("transportPlan", e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Emergency plan" value={form.emergencyPlan} onChange={(e) => set("emergencyPlan", e.target.value)} />
            <input className={inputCls} placeholder="Counseling provided" value={form.counselingProvided} onChange={(e) => set("counselingProvided", e.target.value)} />
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
