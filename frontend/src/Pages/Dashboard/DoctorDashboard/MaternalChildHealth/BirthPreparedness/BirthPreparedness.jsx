import { useCallback, useEffect, useState } from "react";
import {useParams, useSearchParams, useNavigate} from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, BoolField, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function BirthPreparedness() {
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
    deliveryFacilityIdentified: false, deliveryFacility: "", transportArranged: false, transportPlan: "",
    birthCompanionIdentified: false, emergencyContactIdentified: false, financialPreparation: false,
    bloodDonorIdentified: false, emergencyPlan: "", counselingProvided: "", notes: "",
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
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/birth-preparedness`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load birth preparedness records.");
    } finally { setLoading(false); }
  }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/birth-preparedness`, {
        pregnancyID: Number(pregnancyId),
        deliveryFacilityIdentified: !!form.deliveryFacilityIdentified,
        deliveryFacility: form.deliveryFacility || null,
        transportArranged: !!form.transportArranged,
        transportPlan: form.transportPlan || null,
        birthCompanionIdentified: !!form.birthCompanionIdentified,
        emergencyContactIdentified: !!form.emergencyContactIdentified,
        financialPreparation: !!form.financialPreparation,
        bloodDonorIdentified: !!form.bloodDonorIdentified,
        emergencyPlan: form.emergencyPlan || null,
        counselingProvided: form.counselingProvided || null,
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
    <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader patientId={patientId} visitId={visitId} pregnancyId={pregnancyId || undefined}
        moduleTitle="Birth Preparedness" moduleIcon="bi-bag-heart" />

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
            <i className="bi bi-plus-lg me-1" /> Add Birth Plan
          </button>
        )}
      </div>

      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading birth preparedness...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-600">
          No birth preparedness records found for Pregnancy #{pregnancyId}.
        </div>
      )}

      {!loading && rows.map((r) => (
        <div key={r.birthPreparednessID} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
            onClick={() => setExpandedId(expandedId === r.birthPreparednessID ? null : r.birthPreparednessID)}>
            <div>
              <span className="font-medium text-sm">Birth Plan #{r.birthPreparednessID}</span>
              <span className="text-xs text-slate-500 ml-2">{fmtDate(r.assessmentDate, true)}</span>
            </div>
            <i className={`bi bi-chevron-${expandedId === r.birthPreparednessID ? "up" : "down"} text-slate-400`} />
          </button>
          {expandedId === r.birthPreparednessID && (
            <div className="border-t border-slate-100 p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="col-span-full text-xs font-semibold text-slate-500 uppercase">Facility & Transport</div>
              <BoolField label="Delivery Facility Identified" value={r.deliveryFacilityIdentified} />
              <Field label="Delivery Facility" value={r.deliveryFacility} />
              <BoolField label="Transport Arranged" value={r.transportArranged} />
              <Field label="Transport Plan" value={r.transportPlan} className="col-span-2" />
              <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Support & Emergency</div>
              <BoolField label="Birth Companion Identified" value={r.birthCompanionIdentified} />
              <BoolField label="Emergency Contact Identified" value={r.emergencyContactIdentified} />
              <BoolField label="Financial Preparation" value={r.financialPreparation} />
              <BoolField label="Blood Donor Identified" value={r.bloodDonorIdentified} />
              <Field label="Emergency Plan" value={r.emergencyPlan} className="col-span-2 sm:col-span-3" />
              <Field label="Counseling Provided" value={r.counselingProvided} className="col-span-2" />
              <Field label="Notes" value={r.notes} className="col-span-2 sm:col-span-3" />
              <Field label="Prepared By User ID" value={r.preparedByUserID} />
            </div>
          )}
        </div>
      ))}

      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold">Birth Preparedness Plan</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.deliveryFacilityIdentified} onChange={(e) => set("deliveryFacilityIdentified", e.target.checked)} /> Delivery facility identified</label>
            <input className={inputCls} placeholder="Delivery facility name" value={form.deliveryFacility} onChange={(e) => set("deliveryFacility", e.target.value)} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.transportArranged} onChange={(e) => set("transportArranged", e.target.checked)} /> Transport arranged</label>
            <input className={inputCls} placeholder="Transport plan" value={form.transportPlan} onChange={(e) => set("transportPlan", e.target.value)} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.birthCompanionIdentified} onChange={(e) => set("birthCompanionIdentified", e.target.checked)} /> Birth companion identified</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.emergencyContactIdentified} onChange={(e) => set("emergencyContactIdentified", e.target.checked)} /> Emergency contact identified</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.financialPreparation} onChange={(e) => set("financialPreparation", e.target.checked)} /> Financial preparation</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.bloodDonorIdentified} onChange={(e) => set("bloodDonorIdentified", e.target.checked)} /> Blood donor identified</label>
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
