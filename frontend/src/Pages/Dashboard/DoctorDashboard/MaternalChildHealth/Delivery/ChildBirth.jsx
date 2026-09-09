import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function ChildBirth() {
  const { patientId, visitId, deliveryId } = useParams();
  const navigate = useNavigate();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const api = `/api/doctor/patient/${patientId}/maternal-child`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [lastCreated, setLastCreated] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    sex: "",
    birthDate: new Date().toISOString().slice(0, 16),
    birthWeight: "",
    birthLength: "",
    headCircumference: "",
    apgarScore: "",
    birthCondition: "",
    resuscitationRequired: "",
    notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (!cancelled) setCanWrite(ok);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`${api}/deliveries/${deliveryId}/childbirths`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load child births.");
    } finally {
      setLoading(false);
    }
  }, [api, deliveryId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    setLastCreated(null);
    try {
      if (!form.firstName?.trim() || !form.lastName?.trim()) {
        setFormError("First name and last name are required to register the newborn.");
        setSaving(false);
        return;
      }
      const res = await API.post(`${api}/deliveries/${deliveryId}/childbirths`, {
        deliveryID: Number(deliveryId),
        childPatientID: null,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        sex: form.sex || null,
        birthDate: form.birthDate
          ? new Date(form.birthDate).toISOString()
          : new Date().toISOString(),
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
        firstName: "",
        lastName: "",
        sex: "",
        birthDate: new Date().toISOString().slice(0, 16),
        birthWeight: "",
        birthLength: "",
        headCircumference: "",
        apgarScore: "",
        birthCondition: "",
        resuscitationRequired: "",
        notes: "",
      });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(`${base}/delivery`)}
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        <i className="bi bi-arrow-left" /> Deliveries
      </button>
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Child births · Delivery #{deliveryId}</h2>
        {canWrite && (
          <button
            type="button"
            onClick={() => setShow(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs"
          >
            Register newborn
          </button>
        )}
      </div>

      {lastCreated && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
          Newborn registered. Patient ID: <strong>{lastCreated.childPatientID}</strong>
          {lastCreated.childMRN && (
            <>
              {" "}
              · MRN: <strong>{lastCreated.childMRN}</strong>
            </>
          )}
          {lastCreated.childFirstName && (
            <>
              {" "}
              · {lastCreated.childFirstName} {lastCreated.childLastName}
            </>
          )}
        </div>
      )}

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
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">
          No child birth records. Register a newborn to create a Patient and link it to this
          delivery.
        </div>
      )}
      {!loading &&
        rows.map((r) => (
          <div key={r.childBirthID} className="bg-white border rounded-xl p-4 text-sm">
            <p className="font-medium">
              #{r.childBirthID}
              {r.childFirstName || r.childLastName
                ? ` · ${r.childFirstName || ""} ${r.childLastName || ""}`.trim()
                : ""}
              {r.sex ? ` · ${r.sex}` : ""}
              {r.birthWeight ? ` · ${r.birthWeight}` : ""}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {r.birthDate ? new Date(r.birthDate).toLocaleString() : ""}
              {r.apgarScore ? ` · Apgar ${r.apgarScore}` : ""}
              {r.childPatientID ? ` · Patient #${r.childPatientID}` : ""}
              {r.childMRN ? ` · ${r.childMRN}` : ""}
            </p>
          </div>
        ))}

      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={submit}
            className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-semibold">Register newborn</h3>
            <p className="text-xs text-slate-500">
              MRN is generated automatically by the server. Do not enter an MRN.
            </p>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input
              className={inputCls}
              placeholder="First name *"
              required
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Last name *"
              required
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
            <input
              type="datetime-local"
              required
              className={inputCls}
              value={form.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
            />
            <select
              className={inputCls}
              value={form.sex}
              onChange={(e) => set("sex", e.target.value)}
            >
              <option value="">Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              className={inputCls}
              placeholder="Birth weight"
              value={form.birthWeight}
              onChange={(e) => set("birthWeight", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Birth length"
              value={form.birthLength}
              onChange={(e) => set("birthLength", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Head circumference"
              value={form.headCircumference}
              onChange={(e) => set("headCircumference", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Apgar score"
              value={form.apgarScore}
              onChange={(e) => set("apgarScore", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Birth condition"
              value={form.birthCondition}
              onChange={(e) => set("birthCondition", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Resuscitation required"
              value={form.resuscitationRequired}
              onChange={(e) => set("resuscitationRequired", e.target.value)}
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
                {saving ? "Saving..." : "Register newborn"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}