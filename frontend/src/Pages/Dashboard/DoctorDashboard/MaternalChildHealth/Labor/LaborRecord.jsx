import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function LaborRecord() {
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
    admissionDate: new Date().toISOString().slice(0, 16),
    laborStartDate: "",
    membraneRuptureDate: "",
    membraneStatus: "",
    cervicalDilation: "",
    contractionPattern: "",
    fetalHeartRate: "",
    laborProgress: "",
    laborManagement: "",
    deliveryPlan: "",
    notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    API.get(`${api}/pregnancies`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setPregnancies(list);
        if (!pregnancyId && list.length) setPregnancyId(String(list[0].pregnancyID));
      })
      .catch(() => {});
  }, [api, pregnancyId]);

  const load = useCallback(async () => {
    if (!pregnancyId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/labor`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load labor records.");
    } finally {
      setLoading(false);
    }
  }, [api, pregnancyId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await API.post(`${api}/labor`, {
        pregnancyID: Number(pregnancyId),
        admissionDate: form.admissionDate
          ? new Date(form.admissionDate).toISOString()
          : new Date().toISOString(),
        laborStartDate: form.laborStartDate
          ? new Date(form.laborStartDate).toISOString()
          : null,
        membraneRuptureDate: form.membraneRuptureDate
          ? new Date(form.membraneRuptureDate).toISOString()
          : null,
        membraneStatus: form.membraneStatus || null,
        cervicalDilation: form.cervicalDilation || null,
        contractionPattern: form.contractionPattern || null,
        fetalHeartRate: form.fetalHeartRate || null,
        laborProgress: form.laborProgress || null,
        laborManagement: form.laborManagement || null,
        deliveryPlan: form.deliveryPlan || null,
        notes: form.notes || null,
      });
      setShow(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(base)}
          className="text-sm text-slate-500 hover:text-rose-600"
        >
          <i className="bi bi-arrow-left" /> Dashboard
        </button>
        <div className="flex gap-2">
          <select
            className={inputCls + " w-auto"}
            value={pregnancyId}
            onChange={(e) => setPregnancyId(e.target.value)}
          >
            <option value="">Pregnancy...</option>
            {pregnancies.map((p) => (
              <option key={p.pregnancyID} value={p.pregnancyID}>
                #{p.pregnancyID}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShow(true)}
            disabled={!pregnancyId}
            className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium disabled:opacity-50"
          >
            Admit labor
          </button>
        </div>
      </div>
      <h2 className="font-semibold">Labor Records</h2>
      {loading && (
        <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">
          Loading...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {!loading && pregnancyId && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">
          No labor records.
        </div>
      )}
      {!loading &&
        rows.map((r) => (
          <div
            key={r.laborRecordID}
            className="bg-white border rounded-xl p-4 text-sm"
          >
            <p className="font-medium">Labor #{r.laborRecordID}</p>
            <p className="text-xs text-slate-400">
              Admitted{" "}
              {r.admissionDate
                ? new Date(r.admissionDate).toLocaleString()
                : "—"}
            </p>
            <p className="mt-1">
              Progress: {r.laborProgress || "—"} · Dilation:{" "}
              {r.cervicalDilation || "—"} · FHR: {r.fetalHeartRate || "—"}
            </p>
          </div>
        ))}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={submit}
            className="bg-white rounded-xl w-full max-w-lg p-5 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-semibold">Labor admission</h3>
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Admission date *
              </label>
              <input
                required
                type="datetime-local"
                className={inputCls}
                value={form.admissionDate}
                onChange={(e) => set("admissionDate", e.target.value)}
              />
            </div>
            <input
              className={inputCls}
              placeholder="Cervical dilation"
              value={form.cervicalDilation}
              onChange={(e) => set("cervicalDilation", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="FHR"
              value={form.fetalHeartRate}
              onChange={(e) => set("fetalHeartRate", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Labor progress"
              value={form.laborProgress}
              onChange={(e) => set("laborProgress", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Management"
              value={form.laborManagement}
              onChange={(e) => set("laborManagement", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Delivery plan"
              value={form.deliveryPlan}
              onChange={(e) => set("deliveryPlan", e.target.value)}
            />
            <textarea
              className={inputCls}
              rows={2}
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShow(false)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}