import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDoctorAppointments,
  getDoctorAppointmentDetails,
  startDoctorAppointment,
  createDoctorAppointment,
  getPatientsForSearch,
} from "../Services/appointmentApi";

// ETHIOPIAN CALENDAR
import { DayPicker } from "@daypicker/ethiopic";
import "@daypicker/react/style.css";

// ============================================================
// FIXED Ethiopian calendar conversion (no +2 day bug)
// JDN epoch 1723856 = 1 Meskerem 1
// Months: Meskerem=1 … Pagumen=13
// ============================================================

function gregorianToJdn(year, month, day) {
  // month: 1–12
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

function jdnToEthiopian(jdn) {
  const offset = jdn - 1723856;
  const r = ((offset % 1461) + 1461) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor(offset / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

function ethiopianToJdn(year, month, day) {
  // month: 1–13 (Pagumen = 13)
  return (
    1723856 +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    (day - 1)
  );
}

/** GC Date (local Y/M/D) → EC { year, month, day } */
function gregorianToEthiopian(date) {
  if (!date || isNaN(date.getTime())) return null;
  const jdn = gregorianToJdn(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return jdnToEthiopian(jdn);
}

/** EC Y/M/D → local JS Date at midnight (calendar date only) */
function ethiopianToGregorianDate(year, month, day) {
  const jdn = ethiopianToJdn(year, month, day);
  const g = jdnToGregorian(jdn);
  return new Date(g.year, g.month - 1, g.day);
}

const ETH_MONTHS = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagumen",
];

// ETHIOPIAN DISPLAY
function formatEthiopianShort(date) {
  const eth = gregorianToEthiopian(date);
  if (!eth) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${eth.year}/${pad(eth.month)}/${pad(eth.day)}`;
}

function formatEthiopianDate(date, withTime = false) {
  const eth = gregorianToEthiopian(date);
  if (!eth) return "—";
  const name = ETH_MONTHS[eth.month - 1] || eth.month;
  const datePart = `${eth.day} ${name} ${eth.year}`;
  if (!withTime) return datePart;
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} ${time}`;
}

/**
 * Parse API DateTime WITHOUT timezone day-shift.
 * Uses YYYY-MM-DD only → local calendar Date.
 */
function parseApiDate(value) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const s = String(value);
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * API GREGORIAN DATE – local YYYY-MM-DDTHH:mm:00
 * DO NOT use toISOString() (UTC can shift the day).
 */
function toLocalDateTimeString(date, timeStr) {
  if (!date || isNaN(date.getTime())) return null;
  const [h = 0, m = 0] = (timeStr || "00:00").split(":").map(Number);
  const y = date.getFullYear();
  const mo = date.getMonth() + 1;
  const d = date.getDate();
  const pad = (n) => String(n).padStart(2, "0");
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(m)}:00`;
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

  // List
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

  // Create modal + patient search
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    patientID: "",
    reason: "",
  });

  // ETHIOPIAN CALENDAR state
  // selectedDate = Gregorian JS Date for the selected EC day (from DayPicker)
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const [allPatients, setAllPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

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

  // Load patients when Create modal opens
  useEffect(() => {
    if (!showCreate) return;

    let cancelled = false;
    (async () => {
      setPatientsLoading(true);
      try {
        const res = await getPatientsForSearch();
        if (!cancelled) setAllPatients(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setCreateError("Failed to load patients for search.");
      } finally {
        if (!cancelled) setPatientsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showCreate]);

  // Client-side patient filter
  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return allPatients.slice(0, 30);

    return allPatients
      .filter((p) => {
        const first = (p.firstName || "").toLowerCase();
        const last = (p.lastName || "").toLowerCase();
        const mrn = (p.mrn || "").toLowerCase();
        const fayda = (p.faydaFIN || "").toLowerCase();
        const full = `${first} ${last}`;

        return (
          first.includes(q) ||
          last.includes(q) ||
          full.includes(q) ||
          mrn.includes(q) ||
          fayda.includes(q) ||
          String(p.patientID).includes(q)
        );
      })
      .slice(0, 50);
  }, [allPatients, patientSearch]);

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

  async function handleStartOrContinue() {
    if (!details) return;
    setStarting(true);
    setStartError("");
    try {
      const res = await startDoctorAppointment(details.appointmentID);
      const data = res.data;
      setDetails(null);
      navigate(
        `/doctor/consultation/patient/${data.patientID}/${data.visitID}`
      );
    } catch (err) {
      setStartError(
        err.response?.data?.message ||
          "Failed to start appointment. Please try again."
      );
    } finally {
      setStarting(false);
    }
  }

  function selectPatient(p) {
    setSelectedPatient(p);
    setCreateForm((prev) => ({
      ...prev,
      patientID: String(p.patientID),
    }));
    setPatientSearch(`${p.firstName} ${p.lastName}`);
  }

  // DayPicker already returns Gregorian Date for selected EC day — no extra conversion
  function handleDateSelect(date) {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    if (!createForm.patientID) {
      setCreateError("Please select a patient.");
      setCreating(false);
      return;
    }

    if (!selectedDate) {
      setCreateError("Please select an appointment date.");
      setCreating(false);
      return;
    }

    try {
      // EC → GC already done by DayPicker (selectedDate is Gregorian calendar day)
      // API GREGORIAN DATE — local string, no toISOString()
      const appointmentDate = toLocalDateTimeString(
        selectedDate,
        appointmentTime
      );

      const payload = {
        patientID: Number(createForm.patientID),
        appointmentDate,
        reason: createForm.reason.trim(),
      };

      await createDoctorAppointment(payload);

      const res = await getDoctorAppointments();
      setRows(Array.isArray(res.data) ? res.data : []);

      setShowCreate(false);
      setCreateForm({ patientID: "", reason: "" });
      setSelectedPatient(null);
      setPatientSearch("");
      setSelectedDate(undefined);
      setAppointmentTime("09:00");
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
              setSelectedPatient(null);
              setPatientSearch("");
              setCreateForm({ patientID: "", reason: "" });
              setSelectedDate(undefined);
              setAppointmentTime("09:00");
              setShowCalendar(false);
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition whitespace-nowrap"
          >
            <i className="bi bi-plus-lg" />
            New Appointment
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          <i className="bi bi-arrow-repeat animate-spin text-2xl" />
          <p className="mt-2 text-sm">Loading appointments...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          <i className="bi bi-calendar-x text-3xl" />
          <p className="mt-2 text-sm">No appointments found.</p>
        </div>
      )}

      {/* Table – ETHIOPIAN DISPLAY via parseApiDate + formatEthiopianShort */}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Date (EC)</th>
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
                {filtered.map((item) => {
                  const d = parseApiDate(item.appointmentDate);
                  return (
                    <tr
                      key={item.appointmentID}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {formatEthiopianShort(d)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {d
                          ? d.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
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
                  );
                })}
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
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
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

            <form
              onSubmit={handleCreate}
              className="p-5 space-y-4 overflow-y-auto"
            >
              {/* Patient Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Search Patient <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setSelectedPatient(null);
                      setCreateForm((p) => ({ ...p, patientID: "" }));
                    }}
                    placeholder="Search by First Name, Last Name, MRN or Fayda ID..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {selectedPatient && (
                  <div className="mt-2 flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-sm">
                    <i className="bi bi-person-check text-indigo-600" />
                    <span className="font-medium text-indigo-800">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </span>
                    <span className="text-indigo-600 text-xs">
                      MRN: {selectedPatient.mrn}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(null);
                        setCreateForm((p) => ({ ...p, patientID: "" }));
                        setPatientSearch("");
                      }}
                      className="ml-auto text-indigo-400 hover:text-indigo-600"
                    >
                      <i className="bi bi-x" />
                    </button>
                  </div>
                )}

                {!selectedPatient && (
                  <div className="mt-2 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {patientsLoading ? (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        <i className="bi bi-arrow-repeat animate-spin me-1" />
                        Loading patients...
                      </div>
                    ) : filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        No patients found
                      </div>
                    ) : (
                      filteredPatients.map((p) => (
                        <button
                          key={p.patientID}
                          type="button"
                          onClick={() => selectPatient(p)}
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition"
                        >
                          <div className="font-medium text-slate-800 text-sm">
                            {p.firstName} {p.lastName}
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 mt-0.5">
                            <span>MRN: {p.mrn || "—"}</span>
                            {p.faydaFIN && <span>Fayda: {p.faydaFIN}</span>}
                            <span>ID: {p.patientID}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* ETHIOPIAN CALENDAR – Date picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Appointment Date (Ethiopian){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={calendarRef}>
                  <button
                    type="button"
                    onClick={() => setShowCalendar((v) => !v)}
                    className="w-full flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-left hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <i className="bi bi-calendar3 text-indigo-600" />
                    <span
                      className={
                        selectedDate ? "text-slate-800" : "text-slate-400"
                      }
                    >
                      {selectedDate
                        ? formatEthiopianShort(selectedDate) + " EC"
                        : "Select Ethiopian date..."}
                    </span>
                  </button>

                  {showCalendar && (
                    <div className="absolute z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-3">
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        numerals="latn"
                      />
                    </div>
                  )}
                </div>
                {selectedDate && (
                  <p className="text-xs text-slate-400 mt-1">
                    {formatEthiopianDate(selectedDate)} EC
                  </p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Appointment Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Reason */}
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
                  disabled={creating || !createForm.patientID || !selectedDate}
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
                        {details.dateOfBirth
                          ? formatEthiopianShort(
                              parseApiDate(details.dateOfBirth)
                            )
                          : "—"}
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
                        Appointment Date (EC)
                      </p>
                      <p className="text-slate-700">
                        {details.appointmentDate
                          ? formatEthiopianDate(
                              parseApiDate(details.appointmentDate),
                              true
                            )
                          : "—"}
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