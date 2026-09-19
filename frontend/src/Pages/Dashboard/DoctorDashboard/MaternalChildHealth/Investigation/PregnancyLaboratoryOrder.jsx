import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate, StatusBadge } from "../shared/Field";

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

/**
 * Pregnancy laboratory orders integrated with the hospital Laboratory module.
 * Categories/test types come from existing LaboratoryTestType + LaboratorySection lookups.
 * Creating an order also creates a LaboratoryTest (MLT workflow) when visit context exists.
 */
export default function PregnancyLaboratoryOrder() {
  const { patientId, visitId } = useParams();
  const [sp] = useSearchParams();
  const api = `/api/doctor/patient/${patientId}/maternal-child`;

  const [pregnancies, setPregnancies] = useState([]);
  const [pregnancyId, setPregnancyId] = useState(sp.get("pregnancyId") || "");
  const [rows, setRows] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    sectionId: "",
    laboratoryTestTypeID: "",
    clinicalReason: "",
    notes: "",
    status: "Requested",
  });
  const [canWrite, setCanWrite] = useState(false);

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
    API.get("/api/doctor/lookups/laboratory-test-types")
      .then((res) => setTestTypes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTestTypes([]));
  }, []);

  const sections = useMemo(() => {
    const map = new Map();
    testTypes.forEach((t) => {
      const id = t.laboratorySectionID ?? t.sectionID ?? t.sectionName ?? "other";
      const name = t.sectionName || `Section ${id}`;
      if (!map.has(String(id))) map.set(String(id), { id: String(id), name });
    });
    return Array.from(map.values());
  }, [testTypes]);

  const filteredTypes = useMemo(() => {
    if (!form.sectionId) return testTypes;
    return testTypes.filter((t) => {
      const id = String(t.laboratorySectionID ?? t.sectionID ?? t.sectionName ?? "other");
      return id === form.sectionId;
    });
  }, [testTypes, form.sectionId]);

  const load = useCallback(async () => {
    if (!pregnancyId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [ordersRes, visitRes] = await Promise.all([
        API.get(`${api}/pregnancies/${pregnancyId}/laboratory-orders`),
        visitId
          ? API.get(`/api/doctor/patient/${patientId}/visit/${visitId}`).catch(() => null)
          : Promise.resolve(null),
      ]);
      setRows(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setLabTests(
        visitRes?.data?.laboratoryTests
          ? Array.isArray(visitRes.data.laboratoryTests)
            ? visitRes.data.laboratoryTests
            : []
          : []
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load laboratory orders.");
    } finally {
      setLoading(false);
    }
  }, [api, pregnancyId, patientId, visitId]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (!form.laboratoryTestTypeID) {
        setFormError("Select a laboratory test type.");
        setSaving(false);
        return;
      }
      await API.post(`${api}/laboratory-orders`, {
        pregnancyID: Number(pregnancyId),
        laboratoryTestTypeID: Number(form.laboratoryTestTypeID),
        clinicalReason: form.clinicalReason || null,
        notes: form.notes || null,
        visitID: visitId ? Number(visitId) : null,
        status: form.status || "Requested",
      });
      setShow(false);
      setForm({
        sectionId: "",
        laboratoryTestTypeID: "",
        clinicalReason: "",
        notes: "",
        status: "Requested",
      });
      setMessage("Laboratory request created (MCH + hospital lab workflow).");
      setTimeout(() => setMessage(""), 3000);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create laboratory order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
       <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader
        patientId={patientId}
        visitId={visitId}
        pregnancyId={pregnancyId}
        moduleTitle="Pregnancy Laboratory"
        moduleIcon="bi-droplet"
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
                  {p.expectedDeliveryDate
                    ? ` · EDD ${fmtDate(p.expectedDeliveryDate)}`
                    : ""}
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
              + New laboratory request
            </button>
          )}
        </div>

        {message && (
          <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{message}</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {loading && <p className="text-sm text-slate-500">Loading…</p>}

        {!loading && rows.length === 0 && (
          <p className="text-sm text-slate-500">No laboratory orders for this pregnancy.</p>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Order</th>
                  <th className="text-left px-3 py-2 font-medium">Test</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.pregnancyLaboratoryOrderID}>
                    <td className="px-3 py-2">#{r.pregnancyLaboratoryOrderID}</td>
                    <td className="px-3 py-2">{r.laboratoryTestTypeName || r.laboratoryTestTypeID}</td>
                    <td className="px-3 py-2">{fmtDate(r.orderDate, true)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge value={r.status} />
                    </td>
                    <td className="px-3 py-2 text-slate-600 max-w-xs truncate">
                      {r.clinicalReason || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {labTests.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <h4 className="text-sm font-semibold text-slate-800">
              Hospital laboratory requests (this visit)
            </h4>
            <p className="text-xs text-slate-400">
              Visible to Laboratory / MLT staff via existing laboratory workflow.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">ID</th>
                    <th className="text-left px-3 py-2 font-medium">Section</th>
                    <th className="text-left px-3 py-2 font-medium">Test</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                    <th className="text-left px-3 py-2 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labTests.map((t) => {
                    const latest = (t.results || [])[0];
                    return (
                      <tr key={t.testID}>
                        <td className="px-3 py-2">#{t.testID}</td>
                        <td className="px-3 py-2">{t.sectionName || "—"}</td>
                        <td className="px-3 py-2">{t.testName || "—"}</td>
                        <td className="px-3 py-2">
                          <StatusBadge value={t.status} />
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {latest?.resultDescription || "No result yet"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={submit}
            className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 shadow-xl"
          >
            <h3 className="font-semibold text-slate-800">New Laboratory Request</h3>
            <p className="text-xs text-slate-400">
              Uses existing laboratory categories and test types. Creates MCH order and hospital
              LaboratoryTest for the lab department.
            </p>
            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div>
              <label className="block text-xs font-medium mb-1">Category / Section *</label>
              <select
                className={inputCls}
                value={form.sectionId}
                onChange={(e) => {
                  set("sectionId", e.target.value);
                  set("laboratoryTestTypeID", "");
                }}
                required
              >
                <option value="">Select section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Test Type *</label>
              <select
                className={inputCls}
                value={form.laboratoryTestTypeID}
                onChange={(e) => set("laboratoryTestTypeID", e.target.value)}
                required
                disabled={!form.sectionId && sections.length > 0}
              >
                <option value="">Select test type</option>
                {filteredTypes.map((t) => (
                  <option key={t.laboratoryTestTypeID} value={t.laboratoryTestTypeID}>
                    {t.testName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Status / Priority</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="Requested">Requested</option>
                <option value="Urgent">Urgent</option>
                <option value="STAT">STAT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Clinical Reason</label>
              <input
                className={inputCls}
                value={form.clinicalReason}
                onChange={(e) => set("clinicalReason", e.target.value)}
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

            <div className="flex justify-end gap-2 pt-1">
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
                {saving ? "Saving..." : "Create laboratory request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
