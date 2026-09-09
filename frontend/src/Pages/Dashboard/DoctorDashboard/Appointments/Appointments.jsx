import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDoctorAppointments,
  getDoctorAppointmentDetails,
  startDoctorAppointment,
  createDoctorAppointment,
} from "../Services/appointmentApi";

function formatDateTime(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

function formatTime(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(v);
  }
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  let cls = "bg-slate-100 text-slate-700";
  if (s === "scheduled") cls = "bg-blue-50 text-blue-700";
  else if (s === "inprogress") cls = "bg-amber-50 text-amber-700";
  else if (s === "completed") cls = "bg-emerald-50 text-emerald-700";
  else if (s === "cancelled") cls = "bg-red-50 text-red-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status || "—"}
    </span>
  );
}

export default function Appointments() {
  const navigate = useNavigate();

  // List state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Details modal
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    patientID: "",
    appointmentDate: "",
    reason: "",
  });

  // Load appointments
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getDoctorAppointments();
        if (!cancelled) setRows(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) setError("Unauthorized. Please log in again.");
        else if (status === 403)
          setError("You are not authorized to view appointments.");
        else
          setError(
            err.response?.data?.message || "Failed to load appointments."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const status = (r.status || "").toLowerCase();
      if (statusFilter !== "all" && status !== statusFilter.toLowerCase())
        return false;
      if (!q) return true;
      return (
        String(r.patientID ?? "").includes(q) ||
        String(r.appointmentID ?? "").includes(q) ||
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.mrn || "").toLowerCase().includes(q) ||
        (r.departmentName || "").toLowerCase().includes(q) ||
        (r.reason || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const statuses = useMemo(() => {
    const s = new Set(rows.map((r) => r.status).filter(Boolean));
    return Array.from(s);
  }, [rows]);

  // Open details
  async function openDetails(appointmentId) {
    setDetailsLoading(true);
    setStartError("");
    setDetails(null);
    try {
      const res = await getDoctorAppointmentDetails(appointmentId);
      setDetails(res.data);
    } catch (err) {
      setStartError(
        err.response?.data?.message || "Failed to load appointment details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  // Start or Continue
  async function handleStartOrContinue() {
  if (!details) return;
  setStarting(true);
  setStartError("");
  try {
    const res = await startDoctorAppointment(details.appointmentID);
    const data = res.data;

    setDetails(null);

    // Correct path matching your App.jsx route
    navigate(`/doctor/consultation/patient/${data.patientID}/${data.visitID}`);
  } catch (err) {
    setStartError(
      err.response?.data?.message ||
        "Failed to start appointment. Please try again."
    );
  } finally {
    setStarting(false);
  }
}

  // Create appointment
  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const payload = {
        patientID: Number(createForm.patientID),
        appointmentDate: new Date(createForm.appointmentDate).toISOString(),
        reason: createForm.reason.trim(),
      };

      await createDoctorAppointment(payload);

      // Refresh list
      const res = await getDoctorAppointments();
      setRows(Array.isArray(res.data) ? res.data : []);

      setShowCreate(false);
      setCreateForm({ patientID: "", appointmentDate: "", reason: "" });
    } catch (err) {
      setCreateError(
        err.response?.data?.message || "Failed to create appointment."
      );
    } finally {
      setCreating(false);
    }
  }

  function ActionButton({ item }) {
    const status = (item.status || "").toLowerCase();

    if (status === "scheduled") {
      return (
        <button
          type="button"
          onClick={() => openDetails(item.appointmentID)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <i className="bi bi-play-fill" />
          Start
        </button>
      );
    }

    if (status === "inprogress") {
      return (
        <button
          type="button"
          onClick={() => openDetails(item.appointmentID)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"
        >
          <i className="bi bi-arrow-right-circle" />
          Continue
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => openDetails(item.appointmentID)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
      >
        <i className="bi bi-eye" />
        View
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Appointments</h2>
          <p className="text-sm text-slate-500">
            Appointments assigned to you
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, MRN, reason..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setCreateError("");
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition whitespace-nowrap"
          >
            <i className="bi bi-plus-lg" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          <i className="bi bi-arrow-repeat animate-spin text-2xl" />
          <p className="mt-2 text-sm">Loading appointments...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          <i className="bi bi-calendar-x text-3xl" />
          <p className="mt-2 text-sm">No appointments found.</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">MRN</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr
                    key={item.appointmentID}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {formatTime(item.appointmentDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {item.patientName || "—"}
                      </div>
                      <div className="text-xs text-slate-400">
                        ID: {item.patientID}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.mrn || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.departmentName || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                      {item.reason || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionButton item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== CREATE APPOINTMENT MODAL ==================== */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !creating && setShowCreate(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                New Appointment
              </h3>
              <button
                type="button"
                disabled={creating}
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="bi bi-x-lg text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Patient ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={createForm.patientID}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      patientID: e.target.value,
                    }))
                  }
                  placeholder="Enter Patient ID"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Find Patient ID from the patient list or search.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Appointment Date & Time{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={createForm.appointmentDate}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      appointmentDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason
                </label>
                <textarea
                  rows={3}
                  value={createForm.reason}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, reason: e.target.value }))
                  }
                  placeholder="e.g. Follow-up, Consultation, Review..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  <i className="bi bi-exclamation-triangle me-1" />
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                  {creating ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg" />
                      Create Appointment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DETAILS MODAL ==================== */}
      {(details || detailsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !starting && setDetails(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Appointment Details
              </h3>
              <button
                type="button"
                disabled={starting}
                onClick={() => setDetails(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="bi bi-x-lg text-lg" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {detailsLoading && (
                <div className="py-8 text-center text-slate-500">
                  <i className="bi bi-arrow-repeat animate-spin text-xl" />
                  <p className="mt-2 text-sm">Loading details...</p>
                </div>
              )}

              {!detailsLoading && details && (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs">Patient</p>
                      <p className="font-medium text-slate-800">
                        {details.patientFirstName} {details.patientLastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">MRN</p>
                      <p className="font-medium text-slate-800">
                        {details.mrn}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Gender</p>
                      <p className="text-slate-700">{details.gender}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Date of Birth</p>
                      <p className="text-slate-700">
                        {formatDateTime(details.dateOfBirth).split(",")[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Phone</p>
                      <p className="text-slate-700">
                        {details.phone || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Department</p>
                      <p className="text-slate-700">
                        {details.departmentName}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 text-xs">
                        Appointment Date
                      </p>
                      <p className="text-slate-700">
                        {formatDateTime(details.appointmentDate)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 text-xs">Reason</p>
                      <p className="text-slate-700">
                        {details.reason || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Status</p>
                      <StatusBadge status={details.status} />
                    </div>
                  </div>

                  {startError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                      <i className="bi bi-exclamation-triangle me-1" />
                      {startError}
                    </div>
                  )}
                </>
              )}
            </div>

            {!detailsLoading && details && (
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50">
                <button
                  type="button"
                  disabled={starting}
                  onClick={() => setDetails(null)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition"
                >
                  Close
                </button>

                {(details.status || "").toLowerCase() === "scheduled" ||
                (details.status || "").toLowerCase() === "inprogress" ? (
                  <button
                    type="button"
                    disabled={starting}
                    onClick={handleStartOrContinue}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition"
                  >
                    {starting ? (
                      <>
                        <i className="bi bi-arrow-repeat animate-spin" />
                        Processing...
                      </>
                    ) : (details.status || "").toLowerCase() ===
                      "inprogress" ? (
                      <>
                        <i className="bi bi-arrow-right-circle" />
                        Continue
                      </>
                    ) : (
                      <>
                        <i className="bi bi-play-fill" />
                        Start Appointment
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}