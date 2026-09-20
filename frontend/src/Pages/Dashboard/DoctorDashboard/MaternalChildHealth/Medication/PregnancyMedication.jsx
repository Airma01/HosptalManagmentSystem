import { useCallback, useEffect, useState } from "react";
import {useParams, useSearchParams, useNavigate} from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate, StatusBadge } from "../shared/Field";

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

/**
 * Pregnancy medication integrated with hospital Pharmacy / Prescription workflow.
 * Medicines and branch pharmacies come from existing doctor lookups.
 * Creates PregnancyMedication (MCH record) + Prescription (pharmacy queue) when branch is selected.
 */
export default function PregnancyMedication() {
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
  const [medicines, setMedicines] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [canWrite, setCanWrite] = useState(false);

  const [form, setForm] = useState({
    medicineID: "",
    branchPharmacyID: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: "",
    route: "Oral",
    indication: "",
    notes: "",
    startDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    canWriteMaternalChildHealth().then(setCanWrite);
  }, []);

  useEffect(() => {
    API.get(`${api}/pregnancies`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setPregnancies(list);
        if (!pregnancyId && list.length) setPregnancyId(String(list[0].pregnancyID));
      })
      .catch(() => {});
  }, [api, pregnancyId]);

  useEffect(() => {
    Promise.all([
      API.get("/api/doctor/lookups/medicines").catch(() => ({ data: [] })),
      API.get("/api/doctor/lookups/branch-pharmacies").catch(() => ({ data: [] })),
    ]).then(([m, b]) => {
      setMedicines(Array.isArray(m.data) ? m.data : []);
      setBranches(Array.isArray(b.data) ? b.data : []);
    });
  }, []);

  const load = useCallback(async () => {
    if (!pregnancyId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`${api}/pregnancies/${pregnancyId}/medications`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load medications.");
    } finally {
      setLoading(false);
    }
  }, [api, pregnancyId]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (!form.medicineID) {
        setFormError("Select a medication.");
        setSaving(false);
        return;
      }
      await API.post(`${api}/medications`, {
        pregnancyID: Number(pregnancyId),
        medicineID: Number(form.medicineID),
        startDate: form.startDate,
        dosage: form.dosage || "",
        frequency: form.frequency || "",
        route: form.route || "",
        indication: form.indication || null,
        notes: form.notes || null,
        visitID: visitId ? Number(visitId) : null,
        branchPharmacyID: form.branchPharmacyID ? Number(form.branchPharmacyID) : null,
        quantity: form.quantity ? Number(form.quantity) : null,
        duration: form.duration ? Number(form.duration) : null,
      });
      setShow(false);
      setForm({
        medicineID: "",
        branchPharmacyID: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: "",
        route: "Oral",
        indication: "",
        notes: "",
        startDate: new Date().toISOString().slice(0, 10),
      });
      setMessage(
        form.branchPharmacyID
          ? "Medication saved and prescription sent to pharmacy."
          : "Medication saved for pregnancy (select branch pharmacy to also send to pharmacy)."
      );
      setTimeout(() => setMessage(""), 3500);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save medication.");
    } finally {
      setSaving(false);
    }
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
    <div className="space-y-4">
       <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader
        patientId={patientId}
        visitId={visitId}
        pregnancyId={pregnancyId}
        moduleTitle="Pregnancy Medication / Prescription"
        moduleIcon="bi-capsule"
      />
     

      <div className="bg-white border rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-[200px]">
            <label className="block text-xs text-slate-500 font-medium mb-1">Pregnancy</label>
            <select
              className={inputCls}
              value={pregnancyId}
              onChange={(e) => setPregnancyId(e.target.value)}
            >
              <option value="">Select pregnancy</option>
              {pregnancies.map((p) => (
                <option key={p.pregnancyID} value={p.pregnancyID}>
                  Pregnancy #{p.pregnancyID}
                  {p.status ? ` · ${p.status}` : ""}
                </option>
              ))}
            </select>
          </div>
          {canWrite && (
            <button
              type="button"
              onClick={() => setShow(true)}
              disabled={!pregnancyId}
              className="px-3 py-2 text-sm rounded-lg bg-rose-600 text-white disabled:opacity-50"
            >
              + Prescribe medication
            </button>
          )}
        </div>

        {message && (
          <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{message}</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {loading && <p className="text-sm text-slate-500">Loading…</p>}

        {!loading && rows.length === 0 && (
          <p className="text-sm text-slate-500">No medications for this pregnancy.</p>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Medicine</th>
                  <th className="text-left px-3 py-2 font-medium">Dosage</th>
                  <th className="text-left px-3 py-2 font-medium">Frequency</th>
                  <th className="text-left px-3 py-2 font-medium">Route</th>
                  <th className="text-left px-3 py-2 font-medium">Start</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.pregnancyMedicationID}>
                    <td className="px-3 py-2">
                      {r.medicineName || r.genericName || r.medicineID}
                    </td>
                    <td className="px-3 py-2">{r.dosage || "—"}</td>
                    <td className="px-3 py-2">{r.frequency || "—"}</td>
                    <td className="px-3 py-2">{r.route || "—"}</td>
                    <td className="px-3 py-2">{fmtDate(r.startDate)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge value={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={submit}
            className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-semibold text-slate-800">Prescribe medication</h3>
            <p className="text-xs text-slate-400">
              Medicines from hospital formulary. Select a branch pharmacy to create a prescription
              for the existing pharmacy workflow (payment + dispensing).
            </p>
            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div>
              <label className="block text-xs font-medium mb-1">Medication *</label>
              <select
                className={inputCls}
                value={form.medicineID}
                onChange={(e) => set("medicineID", e.target.value)}
                required
              >
                <option value="">Select medicine</option>
                {medicines.map((m) => (
                  <option key={m.medicineID} value={m.medicineID}>
                    {m.medicineName}
                    {m.genericName ? ` (${m.genericName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Branch pharmacy (required for pharmacy queue)
              </label>
              <select
                className={inputCls}
                value={form.branchPharmacyID}
                onChange={(e) => set("branchPharmacyID", e.target.value)}
              >
                <option value="">MCH record only (no pharmacy prescription)</option>
                {branches.map((b) => (
                  <option key={b.branchPharmacyID} value={b.branchPharmacyID}>
                    {b.branchName}
                    {b.location ? ` (${b.location})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Dosage</label>
                <input
                  className={inputCls}
                  value={form.dosage}
                  onChange={(e) => set("dosage", e.target.value)}
                  placeholder="e.g. 1 tablet"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Frequency</label>
                <input
                  className={inputCls}
                  value={form.frequency}
                  onChange={(e) => set("frequency", e.target.value)}
                  placeholder="e.g. 1 or Once daily"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Duration (days)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  className={inputCls}
                  value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Route</label>
              <input
                className={inputCls}
                value={form.route}
                onChange={(e) => set("route", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Start date</label>
              <input
                type="date"
                className={inputCls}
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Indication</label>
              <input
                className={inputCls}
                value={form.indication}
                onChange={(e) => set("indication", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Notes</label>
              <textarea
                className={inputCls}
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>

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
                {saving ? "Saving..." : "Save prescription"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
