import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";
const MODES = ["NormalVaginalDelivery", "AssistedVaginalDelivery", "CesareanSection", "Other"];
export default function DeliveryRecord() {
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
  const [form, setForm] = useState({ laborRecordID: "", deliveryDate: new Date().toISOString().slice(0, 16), deliveryMode: "NormalVaginalDelivery", deliveryLocation: "", numberOfBabies: "1", maternalCondition: "", placentaCondition: "", bloodLoss: "", deliveryNotes: "" });
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

  useEffect(() => { API.get(`${api}/pregnancies`).then((res) => { const list = Array.isArray(res.data) ? res.data : []; setPregnancies(list); if (!pregnancyId && list.length) setPregnancyId(String(list[0].pregnancyID)); }).catch(() => {}); }, [api, pregnancyId]);
  const load = useCallback(async () => { if (!pregnancyId) { setRows([]); setLoading(false); return; } setLoading(true); setError(""); try { const res = await API.get(`${api}/pregnancies/${pregnancyId}/deliveries`); setRows(Array.isArray(res.data) ? res.data : []); } catch (err) { setError(err.response?.data?.message || "Unable to load deliveries."); } finally { setLoading(false); } }, [api, pregnancyId]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => { e.preventDefault(); setSaving(true); setFormError(""); try { await API.post(`${api}/deliveries`, { pregnancyID: Number(pregnancyId), laborRecordID: form.laborRecordID === "" ? null : Number(form.laborRecordID), deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : new Date().toISOString(), deliveryMode: form.deliveryMode, deliveryLocation: form.deliveryLocation || null, numberOfBabies: form.numberOfBabies === "" ? null : Number(form.numberOfBabies), maternalCondition: form.maternalCondition || null, placentaCondition: form.placentaCondition || null, bloodLoss: form.bloodLoss || null, deliveryNotes: form.deliveryNotes || null }); setShow(false); load(); } catch (err) { setFormError(err.response?.data?.message || "Failed to save."); } finally { setSaving(false); } };
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate(base)} className="text-sm text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> Dashboard</button>
        <div className="flex gap-2">
          <select className={inputCls + " w-auto"} value={pregnancyId} onChange={(e) => setPregnancyId(e.target.value)}><option value="">Pregnancy...</option>{pregnancies.map((p) => <option key={p.pregnancyID} value={p.pregnancyID}>#{p.pregnancyID}</option>)}</select>
          {canWrite && (
          <button type="button" onClick={() => setShow(true)} disabled={!pregnancyId} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50">Record delivery</button>
        )}
        </div>
      </div>
      <h2 className="font-semibold">Deliveries</h2>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && pregnancyId && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No delivery records.</div>}
      {!loading && rows.map((r) => (
        <div key={r.deliveryID} className="bg-white border rounded-xl p-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-medium">Delivery #{r.deliveryID} · {r.deliveryMode}</p>
            <div className="flex gap-2 text-xs">
              <Link to={`${base}/delivery/${r.deliveryID}/complications`} className="text-rose-600 hover:underline">Complications</Link>
              <Link to={`${base}/delivery/${r.deliveryID}/childbirths`} className="text-rose-600 hover:underline">Child births</Link>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">{r.deliveryDate ? new Date(r.deliveryDate).toLocaleString() : "—"} · Babies: {r.numberOfBabies ?? "—"}</p>
          <p className="mt-1 text-slate-600">{r.maternalCondition || r.deliveryNotes || "—"}</p>
        </div>
      ))}
      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-lg p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold">Delivery record</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input type="datetime-local" required className={inputCls} value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
            <select className={inputCls} value={form.deliveryMode} onChange={(e) => set("deliveryMode", e.target.value)}>{MODES.map((m) => <option key={m} value={m}>{m}</option>)}</select>
            <input className={inputCls} placeholder="Optional labor record ID" value={form.laborRecordID} onChange={(e) => set("laborRecordID", e.target.value)} />
            <input className={inputCls} placeholder="Location" value={form.deliveryLocation} onChange={(e) => set("deliveryLocation", e.target.value)} />
            <input type="number" className={inputCls} placeholder="Number of babies" value={form.numberOfBabies} onChange={(e) => set("numberOfBabies", e.target.value)} />
            <input className={inputCls} placeholder="Maternal condition" value={form.maternalCondition} onChange={(e) => set("maternalCondition", e.target.value)} />
            <input className={inputCls} placeholder="Placenta condition" value={form.placentaCondition} onChange={(e) => set("placentaCondition", e.target.value)} />
            <input className={inputCls} placeholder="Blood loss" value={form.bloodLoss} onChange={(e) => set("bloodLoss", e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Notes" value={form.deliveryNotes} onChange={(e) => set("deliveryNotes", e.target.value)} />
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
