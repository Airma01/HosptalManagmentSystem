import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../Config/API";
import PrescriptionDetails from "../Prescription/PrescriptionDetails";

// Change this if your API runs on a different host/port
const API_BASE = import.meta.env.VITE_API_URL || API.defaults.baseURL || "http://localhost:5000";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: "bi-person-vcard" },
  { id: "allergies", label: "Allergies", icon: "bi-exclamation-triangle" },
  { id: "medicalHistory", label: "Medical History", icon: "bi-journal-medical" },
  { id: "familyHistory", label: "Family History", icon: "bi-people" },
  { id: "socialHistory", label: "Social History", icon: "bi-house-heart" },
  { id: "consultation", label: "Consultation", icon: "bi-clipboard2-pulse" },
  { id: "physicalExam", label: "Physical Exam", icon: "bi-body-text" },
  { id: "diagnosis", label: "Diagnosis", icon: "bi-file-medical" },
  { id: "problemList", label: "Problem List", icon: "bi-list-check" },
  { id: "prescription", label: "Prescription", icon: "bi-prescription2" },
  { id: "laboratory", label: "Laboratory", icon: "bi-droplet" },
  { id: "radiology", label: "Radiology", icon: "bi-radioactive" },
];

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${
          wide ? "max-w-2xl" : "max-w-lg"
        } max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

const emptyMedicineRow = () => ({
  medicineID: "",
  dosage: "",
  frequency: "",
  duration: "",
  quantity: "",
});

const emptyLabRow = () => ({
  laboratoryTestTypeID: "",
  status: "Requested",
});

const emptyRadRow = () => ({
  radiologyTestTypeID: "",
  status: "Requested",
});

function buildRadiologyImageUrl(res) {
  if (!res) return null;
  if (res.imagePath) {
    if (res.imagePath.startsWith("http")) return res.imagePath;
    if (res.imagePath.startsWith("/")) return `${API_BASE}${res.imagePath}`;
    return `${API_BASE}/uploads/radiology/${res.imagePath}`;
  }
  if (res.imageName) {
    return `${API_BASE}/uploads/radiology/${res.imageName}`;
  }
  return null;
}

export default function ConsultationPatient() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [branchPharmacies, setBranchPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [labTestTypes, setLabTestTypes] = useState([]);
  const [radTestTypes, setRadTestTypes] = useState([]);

  const [rxItems, setRxItems] = useState([emptyMedicineRow()]);
  const [rxBranchId, setRxBranchId] = useState("");
  const [labItems, setLabItems] = useState([emptyLabRow()]);
  const [radItems, setRadItems] = useState([emptyRadRow()]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/api/doctor/patient/${patientId}/visit/${visitId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patient visit.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [patientId, visitId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const [b, m, l, r] = await Promise.all([
          API.get("/api/doctor/lookups/branch-pharmacies"),
          API.get("/api/doctor/lookups/medicines"),
          API.get("/api/doctor/lookups/laboratory-test-types"),
          API.get("/api/doctor/lookups/radiology-test-types"),
        ]);
        setBranchPharmacies(b.data || []);
        setMedicines(m.data || []);
        setLabTestTypes(l.data || []);
        setRadTestTypes(r.data || []);
      } catch {
        // lookups optional
      }
    })();
  }, []);

  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const openCreate = (type, defaults = {}) => {
    setForm(defaults);
    setModal({ type, mode: "create" });
  };

  const openEdit = (type, record) => {
    setForm({ ...record });
    setModal({ type, mode: "edit", record });
  };

  const closeModal = () => {
    setModal(null);
    setForm({});
  };

  const submitModal = async (e) => {
    e.preventDefault();
    if (!modal) return;
    setSaving(true);
    try {
      const { type, mode, record } = modal;
      if (type === "allergy") {
        const body = {
          allergen: form.allergen || "",
          reaction: form.reaction || null,
          severity: form.severity || null,
          isActive: form.isActive ?? true,
          onsetDate: form.onsetDate || null,
          notes: form.notes || null,
        };
        if (mode === "create") {
          await API.post(`/api/doctor/patient/${patientId}/allergies`, body);
        } else {
          await API.put(
            `/api/doctor/patient/${patientId}/allergies/${record.allergyID}`,
            body
          );
        }
      } else if (type === "medicalHistory") {
        const body = {
          conditionName: form.conditionName || "",
          diagnosedDate: form.diagnosedDate || null,
          status: form.status || null,
          treatment: form.treatment || null,
          notes: form.notes || null,
        };
        if (mode === "create") {
          await API.post(`/api/doctor/patient/${patientId}/medical-history`, body);
        } else {
          await API.put(
            `/api/doctor/patient/${patientId}/medical-history/${record.medicalHistoryID}`,
            body
          );
        }
      } else if (type === "familyHistory") {
        const body = {
          relative: form.relative || "",
          conditionName: form.conditionName || "",
          notes: form.notes || null,
        };
        if (mode === "create") {
          await API.post(`/api/doctor/patient/${patientId}/family-medical-history`, body);
        } else {
          await API.put(
            `/api/doctor/patient/${patientId}/family-medical-history/${record.familyMedicalHistoryID}`,
            body
          );
        }
      } else if (type === "socialHistory") {
        const body = {
          smokingStatus: form.smokingStatus || null,
          alcoholUse: form.alcoholUse || null,
          occupation: form.occupation || null,
          livingSituation: form.livingSituation || null,
          physicalActivity: form.physicalActivity || null,
          notes: form.notes || null,
        };
        if (mode === "create") {
          await API.post(`/api/doctor/patient/${patientId}/social-history`, body);
        } else {
          await API.put(
            `/api/doctor/patient/${patientId}/social-history/${record.socialHistoryID}`,
            body
          );
        }
      } else if (type === "problemList") {
        const body = {
          problemName: form.problemName || "",
          code: form.code || null,
          codingSystem: form.codingSystem || null,
          status: form.status || "Active",
          onsetDate: form.onsetDate || null,
          resolvedDate: form.resolvedDate || null,
          notes: form.notes || null,
        };
        if (mode === "create") {
          await API.post(`/api/doctor/patient/${patientId}/problem-list`, body);
        } else {
          await API.put(
            `/api/doctor/patient/${patientId}/problem-list/${record.problemListID}`,
            body
          );
        }
      } else if (type === "consultation") {
        await API.post(`/api/doctor/patient/${patientId}/visit/${visitId}/consultation`, {
          chiefComplaint: form.chiefComplaint || "",
          historyOfPresentIllness: form.historyOfPresentIllness || "",
          assessment: form.assessment || null,
          treatmentPlan: form.treatmentPlan || null,
          clinicalNotes: form.clinicalNotes || null,
        });
      } else if (type === "physicalExam") {
        await API.post(`/api/doctor/consultation/${form.consultationID}/physical-examination`, {
          examinationArea: form.examinationArea || "",
          findings: form.findings || "",
          notes: form.notes || null,
        });
      } else if (type === "diagnosis") {
        await API.post(`/api/doctor/consultation/${form.consultationID}/diagnosis`, {
          code: form.code || "",
          description: form.description || "",
          codingSystem: form.codingSystem || "",
          diagnosisType: form.diagnosisType || null,
          isPrimary: !!form.isPrimary,
        });
      }
      closeModal();
      flash("Saved successfully.");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    if (!primaryConsultationId) {
      alert("Start a consultation first.");
      return;
    }
    if (!rxBranchId) {
      alert("Please select a branch pharmacy.");
      return;
    }
    const items = rxItems
      .filter((r) => r.medicineID)
      .map((r) => ({
        medicineID: Number(r.medicineID),
        dosage: r.dosage || "",
        frequency: Number(r.frequency) || 0,
        duration: Number(r.duration) || 0,
        quantity: Number(r.quantity) || 0,
      }));
    if (items.length === 0) {
      alert("Add at least one medicine.");
      return;
    }
    setSaving(true);
    try {
      await API.post(`/api/doctor/consultation/${primaryConsultationId}/prescription`, {
        branchPharmacyID: Number(rxBranchId),
        items,
      });
      setRxItems([emptyMedicineRow()]);
      setRxBranchId("");
      flash("Prescription created.");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create prescription.");
    } finally {
      setSaving(false);
    }
  };

  const submitLaboratory = async (e) => {
    e.preventDefault();
    if (!primaryConsultationId) {
      alert("Start a consultation first.");
      return;
    }
    const tests = labItems
      .filter((r) => r.laboratoryTestTypeID)
      .map((r) => ({
        laboratoryTestTypeID: Number(r.laboratoryTestTypeID),
        status: r.status || "Requested",
      }));
    if (tests.length === 0) {
      alert("Add at least one laboratory test.");
      return;
    }
    setSaving(true);
    try {
      await API.post(`/api/doctor/consultation/${primaryConsultationId}/laboratory-tests`, {
        tests,
      });
      setLabItems([emptyLabRow()]);
      flash("Laboratory tests requested.");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request laboratory tests.");
    } finally {
      setSaving(false);
    }
  };

  const submitRadiology = async (e) => {
    e.preventDefault();
    if (!primaryConsultationId) {
      alert("Start a consultation first.");
      return;
    }
    const requests = radItems
      .filter((r) => r.radiologyTestTypeID)
      .map((r) => ({
        radiologyTestTypeID: Number(r.radiologyTestTypeID),
        status: r.status || "Requested",
      }));
    if (requests.length === 0) {
      alert("Add at least one radiology test.");
      return;
    }
    setSaving(true);
    try {
      await API.post(`/api/doctor/consultation/${primaryConsultationId}/radiology-requests`, {
        requests,
      });
      setRadItems([emptyRadRow()]);
      flash("Radiology requests created.");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create radiology requests.");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      const { type, id } = confirmDelete;
      const map = {
        allergy: `/api/doctor/patient/${patientId}/allergies/${id}`,
        medicalHistory: `/api/doctor/patient/${patientId}/medical-history/${id}`,
        familyHistory: `/api/doctor/patient/${patientId}/family-medical-history/${id}`,
        socialHistory: `/api/doctor/patient/${patientId}/social-history/${id}`,
        problemList: `/api/doctor/patient/${patientId}/problem-list/${id}`,
      };
      await API.delete(map[type]);
      setConfirmDelete(null);
      flash("Deleted.");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500">
        Loading patient data...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">{error || "Patient data not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
        >
          Go back
        </button>
      </div>
    );
  }

  const patient = data.patient || {};
  const visit = data.currentVisit || {};
  const triage = data.currentTriage;
  const consultations = data.previousConsultations || [];
  const visitConsultations = consultations.filter(
    (c) => String(c.visitID) === String(visitId)
  );
  const primaryConsultationId =
    visitConsultations[0]?.consultationID || consultations[0]?.consultationID;

  const laboratoryTests = data.laboratoryTests || [];
  const radiologyRequests = data.radiologyRequests || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
        >
          <i className="bi bi-arrow-left" /> Back to queue
        </button>
        {message && (
          <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {message}
          </span>
        )}
      </div>

      {/* Patient card */}
      <div className="bg-white border rounded-xl shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              MRN: <strong>{patient.mrn || "—"}</strong> ·{" "}
              {patient.gender || "—"} · DOB:{" "}
              {patient.dateOfBirth
                ? new Date(patient.dateOfBirth).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-sm text-slate-500">
              Phone: {patient.phone || "—"} · {patient.address || "—"}
            </p>
          </div>
          <div className="text-sm text-right">
            <p>
              Visit #{visit.visitID} · {visit.visitType || "—"} ·{" "}
              <span className="font-medium">{visit.status || "—"}</span>
            </p>
            <p className="text-slate-500">
              {visit.visitDate
                ? new Date(visit.visitDate).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
        {triage && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Temp</span>
              {triage.temprature ?? "—"} °C
            </div>
            <div>
              <span className="text-slate-400 block text-xs">BP</span>
              {triage.bloodPressure ?? "—"}
            </div>
            <div>
              <span className="text-slate-400 block text-xs">HR</span>
              {triage.heartRate ?? "—"}
            </div>
            <div>
              <span className="text-slate-400 block text-xs">RR</span>
              {triage.respiratotyRate ?? "—"}
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Weight</span>
              {triage.weight ?? "—"} kg
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Notes</span>
              {triage.notes || "—"}
            </div>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1 bg-white border rounded-xl p-2 shadow-sm">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition ${
              section === s.id
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <i className={`bi ${s.icon}`} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[320px]">
        {/* ========== OVERVIEW ========== */}
        {section === "overview" && (
          <div className="bg-white border rounded-xl shadow-sm p-5 space-y-3 text-sm">
            <p>
              Consultations: <strong>{consultations.length}</strong>
            </p>
            <p>
              Allergies: <strong>{(data.allergies || []).length}</strong> · Problems:{" "}
              <strong>{(data.problemList || []).length}</strong>
            </p>
            <p>
              Lab tests: <strong>{laboratoryTests.length}</strong> · Radiology:{" "}
              <strong>{radiologyRequests.length}</strong>
            </p>
            {!primaryConsultationId && (
              <p className="text-amber-600">
                Start a consultation before ordering prescription, lab, or radiology.
              </p>
            )}
          </div>
        )}

        {/* ========== ALLERGIES ========== */}
        {section === "allergies" && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Allergies</h3>
              <button
                type="button"
                onClick={() => openCreate("allergy")}
                className="text-sm text-indigo-600"
              >
                + Add
              </button>
            </div>
            {(data.allergies || []).length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No allergies recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-2">Allergen</th>
                      <th className="text-left px-4 py-2">Reaction</th>
                      <th className="text-left px-4 py-2">Severity</th>
                      <th className="text-left px-4 py-2">Active</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(data.allergies || []).map((a) => (
                      <tr key={a.allergyID}>
                        <td className="px-4 py-2">{a.allergen}</td>
                        <td className="px-4 py-2">{a.reaction || "—"}</td>
                        <td className="px-4 py-2">{a.severity || "—"}</td>
                        <td className="px-4 py-2">{a.isActive ? "Yes" : "No"}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            type="button"
                            className="text-indigo-600 text-xs"
                            onClick={() => openEdit("allergy", a)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-red-600 text-xs"
                            onClick={() =>
                              setConfirmDelete({ type: "allergy", id: a.allergyID })
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========== MEDICAL HISTORY ========== */}
        {section === "medicalHistory" && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Medical History</h3>
              <button
                type="button"
                onClick={() => openCreate("medicalHistory")}
                className="text-sm text-indigo-600"
              >
                + Add
              </button>
            </div>
            {(data.medicalHistory || []).length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No medical history.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-2">Condition</th>
                      <th className="text-left px-4 py-2">Diagnosed</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(data.medicalHistory || []).map((m) => (
                      <tr key={m.medicalHistoryID}>
                        <td className="px-4 py-2">{m.conditionName}</td>
                        <td className="px-4 py-2">
                          {m.diagnosedDate
                            ? new Date(m.diagnosedDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-2">{m.status || "—"}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            type="button"
                            className="text-indigo-600 text-xs"
                            onClick={() => openEdit("medicalHistory", m)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-red-600 text-xs"
                            onClick={() =>
                              setConfirmDelete({
                                type: "medicalHistory",
                                id: m.medicalHistoryID,
                              })
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========== FAMILY HISTORY ========== */}
        {section === "familyHistory" && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Family History</h3>
              <button
                type="button"
                onClick={() => openCreate("familyHistory")}
                className="text-sm text-indigo-600"
              >
                + Add
              </button>
            </div>
            {(data.familyMedicalHistory || []).length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No family history.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-2">Relative</th>
                      <th className="text-left px-4 py-2">Condition</th>
                      <th className="text-left px-4 py-2">Notes</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(data.familyMedicalHistory || []).map((f) => (
                      <tr key={f.familyMedicalHistoryID}>
                        <td className="px-4 py-2">{f.relative}</td>
                        <td className="px-4 py-2">{f.conditionName}</td>
                        <td className="px-4 py-2">{f.notes || "—"}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            type="button"
                            className="text-indigo-600 text-xs"
                            onClick={() => openEdit("familyHistory", f)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-red-600 text-xs"
                            onClick={() =>
                              setConfirmDelete({
                                type: "familyHistory",
                                id: f.familyMedicalHistoryID,
                              })
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========== SOCIAL HISTORY ========== */}
        {section === "socialHistory" && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Social History</h3>
              <button
                type="button"
                onClick={() => openCreate("socialHistory")}
                className="text-sm text-indigo-600"
              >
                + Add / Update
              </button>
            </div>
            {(data.socialHistory || []).length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No social history.</p>
            ) : (
              <div className="p-5 space-y-2 text-sm">
                {(data.socialHistory || []).map((s) => (
                  <div key={s.socialHistoryID} className="border rounded-lg p-3">
                    <p>Smoking: {s.smokingStatus || "—"}</p>
                    <p>Alcohol: {s.alcoholUse || "—"}</p>
                    <p>Occupation: {s.occupation || "—"}</p>
                    <p>Living: {s.livingSituation || "—"}</p>
                    <p>Activity: {s.physicalActivity || "—"}</p>
                    <p>Notes: {s.notes || "—"}</p>
                    <div className="mt-2 space-x-2">
                      <button
                        type="button"
                        className="text-indigo-600 text-xs"
                        onClick={() => openEdit("socialHistory", s)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600 text-xs"
                        onClick={() =>
                          setConfirmDelete({
                            type: "socialHistory",
                            id: s.socialHistoryID,
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== CONSULTATION ========== */}
        {section === "consultation" && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Consultations</h3>
              <button
                type="button"
                onClick={() => openCreate("consultation")}
                className="text-sm text-indigo-600"
              >
                + New consultation
              </button>
            </div>
            {consultations.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No consultations yet.</p>
            ) : (
              <div className="divide-y">
                {consultations.map((c) => (
                  <div key={c.consultationID} className="p-5 text-sm space-y-1">
                    <p className="font-medium">
                      #{c.consultationID} ·{" "}
                      {c.consultationDate
                        ? new Date(c.consultationDate).toLocaleString()
                        : "—"}
                    </p>
                    <p>
                      <span className="text-slate-500">Chief complaint:</span>{" "}
                      {c.chiefComplaint || "—"}
                    </p>
                    <p>
                      <span className="text-slate-500">HPI:</span>{" "}
                      {c.historyOfPresentIllness || "—"}
                    </p>
                    <p>
                      <span className="text-slate-500">Assessment:</span>{" "}
                      {c.assessment || "—"}
                    </p>
                    <p>
                      <span className="text-slate-500">Plan:</span>{" "}
                      {c.treatmentPlan || "—"}
                    </p>
                    <p>
                      <span className="text-slate-500">Notes:</span>{" "}
                      {c.clinicalNotes || "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== PHYSICAL EXAM ========== */}
        {section === "physicalExam" && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Physical Examination</h3>
              <button
                type="button"
                disabled={!primaryConsultationId}
                onClick={() =>
                  openCreate("physicalExam", { consultationID: primaryConsultationId })
                }
                className="text-sm text-indigo-600 disabled:opacity-40"
              >
                + Add finding
              </button>
            </div>
            {visitConsultations.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">Start a consultation first.</p>
            ) : (
              <div className="divide-y">
                {visitConsultations.map((c) =>
                  (c.physicalExaminations || []).map((pe) => (
                    <div key={pe.physicalExaminationID} className="p-4 text-sm">
                      <p className="font-medium">{pe.examinationArea}</p>
                      <p>{pe.findings}</p>
                      {pe.notes && <p className="text-slate-500">{pe.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ========== DIAGNOSIS ========== */}
        {section === "diagnosis" && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Diagnosis</h3>
              <button
                type="button"
                disabled={!primaryConsultationId}
                onClick={() =>
                  openCreate("diagnosis", { consultationID: primaryConsultationId })
                }
                className="text-sm text-indigo-600 disabled:opacity-40"
              >
                + Add diagnosis
              </button>
            </div>
            {visitConsultations.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">Start a consultation first.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-2">Code</th>
                      <th className="text-left px-4 py-2">Description</th>
                      <th className="text-left px-4 py-2">Type</th>
                      <th className="text-left px-4 py-2">Primary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {visitConsultations.flatMap((c) =>
                      (c.diagnoses || []).map((d) => (
                        <tr key={d.diagnosisID}>
                          <td className="px-4 py-2">{d.code}</td>
                          <td className="px-4 py-2">{d.description}</td>
                          <td className="px-4 py-2">{d.diagnosisType || "—"}</td>
                          <td className="px-4 py-2">{d.isPrimary ? "Yes" : "No"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========== PROBLEM LIST ========== */}
        {section === "problemList" && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Problem List</h3>
              <button
                type="button"
                onClick={() => openCreate("problemList")}
                className="text-sm text-indigo-600"
              >
                + Add
              </button>
            </div>
            {(data.problemList || []).length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No problems recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-2">Problem</th>
                      <th className="text-left px-4 py-2">Code</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(data.problemList || []).map((p) => (
                      <tr key={p.problemListID}>
                        <td className="px-4 py-2">{p.problemName}</td>
                        <td className="px-4 py-2">{p.code || "—"}</td>
                        <td className="px-4 py-2">{p.status || "—"}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            type="button"
                            className="text-indigo-600 text-xs"
                            onClick={() => openEdit("problemList", p)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-red-600 text-xs"
                            onClick={() =>
                              setConfirmDelete({
                                type: "problemList",
                                id: p.problemListID,
                              })
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========== PRESCRIPTION ========== */}
        {section === "prescription" && (
          <div className="space-y-4">
            {data.latestPrescription && (
              <div className="bg-white border rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-3">Latest Prescription</h3>
                <PrescriptionDetails prescription={data.latestPrescription} />
              </div>
            )}

            <div className="bg-white border rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-800">New Prescription</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Consultation #{primaryConsultationId || "—"}
                </p>
              </div>
              <form onSubmit={submitPrescription} className="p-5 space-y-4">
                {!primaryConsultationId && (
                  <p className="text-amber-600 text-sm">Start a consultation first.</p>
                )}
                <Field label="Branch pharmacy">
                  <select
                    className={inputCls}
                    value={rxBranchId}
                    onChange={(e) => setRxBranchId(e.target.value)}
                    required
                    disabled={!primaryConsultationId}
                  >
                    <option value="">Select branch</option>
                    {branchPharmacies.map((b) => (
                      <option key={b.branchPharmacyID} value={b.branchPharmacyID}>
                        {b.branchName} {b.location ? `(${b.location})` : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Medicines</span>
                    <button
                      type="button"
                      onClick={() => setRxItems([...rxItems, emptyMedicineRow()])}
                      className="text-xs text-indigo-600"
                      disabled={!primaryConsultationId}
                    >
                      + Add medicine
                    </button>
                  </div>
                  {rxItems.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 border border-slate-100 rounded-lg"
                    >
                      <Field label="Medicine">
                        <select
                          className={inputCls}
                          value={row.medicineID}
                          onChange={(e) => {
                            const next = [...rxItems];
                            next[idx] = { ...next[idx], medicineID: e.target.value };
                            setRxItems(next);
                          }}
                          required
                        >
                          <option value="">Select</option>
                          {medicines.map((m) => (
                            <option key={m.medicineID} value={m.medicineID}>
                              {m.medicineName}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Dosage">
                        <input
                          className={inputCls}
                          value={row.dosage}
                          onChange={(e) => {
                            const next = [...rxItems];
                            next[idx] = { ...next[idx], dosage: e.target.value };
                            setRxItems(next);
                          }}
                        />
                      </Field>
                      <Field label="Frequency">
                        <input
                          type="number"
                          className={inputCls}
                          value={row.frequency}
                          onChange={(e) => {
                            const next = [...rxItems];
                            next[idx] = { ...next[idx], frequency: e.target.value };
                            setRxItems(next);
                          }}
                        />
                      </Field>
                      <Field label="Duration">
                        <input
                          type="number"
                          className={inputCls}
                          value={row.duration}
                          onChange={(e) => {
                            const next = [...rxItems];
                            next[idx] = { ...next[idx], duration: e.target.value };
                            setRxItems(next);
                          }}
                        />
                      </Field>
                      <div className="flex items-end gap-2">
                        <Field label="Qty">
                          <input
                            type="number"
                            className={inputCls}
                            value={row.quantity}
                            onChange={(e) => {
                              const next = [...rxItems];
                              next[idx] = { ...next[idx], quantity: e.target.value };
                              setRxItems(next);
                            }}
                          />
                        </Field>
                        <button
                          type="button"
                          onClick={() => setRxItems(rxItems.filter((_, i) => i !== idx))}
                          className="text-xs text-red-600 px-2 py-2"
                          disabled={rxItems.length === 1}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !primaryConsultationId}
                    className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Create prescription"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== LABORATORY ========== */}
        {section === "laboratory" && (
          <div className="space-y-4">
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-800">Laboratory Tests</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Existing requests and results for this patient
                </p>
              </div>
              {laboratoryTests.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">No laboratory tests yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium">ID</th>
                        <th className="text-left px-4 py-2 font-medium">Section</th>
                        <th className="text-left px-4 py-2 font-medium">Test</th>
                        <th className="text-left px-4 py-2 font-medium">Status</th>
                        <th className="text-left px-4 py-2 font-medium">Date</th>
                        <th className="text-left px-4 py-2 font-medium">Consultation</th>
                        <th className="text-left px-4 py-2 font-medium">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {laboratoryTests.map((t) => {
                        const results = t.results || [];
                        const latest = results[0];
                        return (
                          <tr key={t.testID}>
                            <td className="px-4 py-2">{t.testID}</td>
                            <td className="px-4 py-2">{t.sectionName || "—"}</td>
                            <td className="px-4 py-2">{t.testName || "—"}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  t.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : t.status === "Urgent" || t.status === "STAT"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {t.status || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {t.requestDate
                                ? new Date(t.requestDate).toLocaleString()
                                : "—"}
                            </td>
                            <td className="px-4 py-2">#{t.consultationID}</td>
                            <td className="px-4 py-2 text-xs max-w-xs">
                              {latest ? (
                                <div>
                                  <div className="font-medium text-slate-800">
                                    {latest.resultDescription || "—"}
                                  </div>
                                  <div className="text-slate-400 mt-0.5">
                                    {latest.resultDate
                                      ? new Date(latest.resultDate).toLocaleString()
                                      : ""}
                                    {latest.technicianName
                                      ? ` · ${latest.technicianName}`
                                      : ""}
                                  </div>
                                  {results.length > 1 && (
                                    <div className="text-indigo-600 mt-1">
                                      +{results.length - 1} more result(s)
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400">No result yet</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white border rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-800">Request Laboratory Tests</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Consultation #{primaryConsultationId || "—"}
                </p>
              </div>
              <form onSubmit={submitLaboratory} className="p-5 space-y-4">
                {!primaryConsultationId && (
                  <p className="text-amber-600 text-sm">Start a consultation first.</p>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Tests</span>
                    <button
                      type="button"
                      onClick={() => setLabItems([...labItems, emptyLabRow()])}
                      className="text-xs text-indigo-600"
                      disabled={!primaryConsultationId}
                    >
                      + Add test
                    </button>
                  </div>
                  {labItems.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 border border-slate-100 rounded-lg"
                    >
                      <Field label="Test type">
                        <select
                          className={inputCls}
                          value={row.laboratoryTestTypeID}
                          onChange={(e) => {
                            const next = [...labItems];
                            next[idx] = {
                              ...next[idx],
                              laboratoryTestTypeID: e.target.value,
                            };
                            setLabItems(next);
                          }}
                          required
                        >
                          <option value="">Select test type</option>
                          {labTestTypes.map((t) => (
                            <option
                              key={t.laboratoryTestTypeID}
                              value={t.laboratoryTestTypeID}
                            >
                              {t.sectionName ? `${t.sectionName} — ` : ""}
                              {t.testName}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Status / Priority">
                        <select
                          className={inputCls}
                          value={row.status}
                          onChange={(e) => {
                            const next = [...labItems];
                            next[idx] = { ...next[idx], status: e.target.value };
                            setLabItems(next);
                          }}
                        >
                          <option value="Requested">Requested</option>
                          <option value="Urgent">Urgent</option>
                          <option value="STAT">STAT</option>
                        </select>
                      </Field>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            setLabItems(labItems.filter((_, i) => i !== idx))
                          }
                          className="text-xs text-red-600 px-2 py-2"
                          disabled={labItems.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !primaryConsultationId}
                    className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Submit laboratory request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== RADIOLOGY ========== */}
        {section === "radiology" && (
          <div className="space-y-4">
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-800">Radiology Requests</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Existing requests and results for this patient
                </p>
              </div>
              {radiologyRequests.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">No radiology requests yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium">ID</th>
                        <th className="text-left px-4 py-2 font-medium">Test</th>
                        <th className="text-left px-4 py-2 font-medium">Status</th>
                        <th className="text-left px-4 py-2 font-medium">Date</th>
                        <th className="text-left px-4 py-2 font-medium">Consultation</th>
                        <th className="text-left px-4 py-2 font-medium">Result</th>
                        <th className="text-left px-4 py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {radiologyRequests.map((r) => {
                        const results = r.results || [];
                        const latest = results[0];
                        return (
                          <tr key={r.radiologyRequestID}>
                            <td className="px-4 py-2">{r.radiologyRequestID}</td>
                            <td className="px-4 py-2">{r.testName || "—"}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  r.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : r.status === "InProgress"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {r.status || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {r.requestDate
                                ? new Date(r.requestDate).toLocaleString()
                                : "—"}
                            </td>
                            <td className="px-4 py-2">#{r.consultationID}</td>
                            <td className="px-4 py-2 text-xs max-w-xs">
                              {latest ? (
                                <div>
                                  <div className="font-medium text-slate-800 line-clamp-2">
                                    {latest.resultDescription || "—"}
                                  </div>
                                  <div className="text-slate-400 mt-0.5">
                                    {latest.resultDate
                                      ? new Date(latest.resultDate).toLocaleString()
                                      : ""}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400">No result yet</span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setModal({
                                    type: "radiologyResults",
                                    request: r,
                                  })
                                }
                                className="text-xs text-indigo-600 hover:underline font-medium"
                              >
                                View Results
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white border rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-800">Request Radiology</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Consultation #{primaryConsultationId || "—"}
                </p>
              </div>
              <form onSubmit={submitRadiology} className="p-5 space-y-4">
                {!primaryConsultationId && (
                  <p className="text-amber-600 text-sm">Start a consultation first.</p>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Tests</span>
                    <button
                      type="button"
                      onClick={() => setRadItems([...radItems, emptyRadRow()])}
                      className="text-xs text-indigo-600"
                      disabled={!primaryConsultationId}
                    >
                      + Add test
                    </button>
                  </div>
                  {radItems.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 border border-slate-100 rounded-lg"
                    >
                      <Field label="Radiology test">
                        <select
                          className={inputCls}
                          value={row.radiologyTestTypeID}
                          onChange={(e) => {
                            const next = [...radItems];
                            next[idx] = {
                              ...next[idx],
                              radiologyTestTypeID: e.target.value,
                            };
                            setRadItems(next);
                          }}
                          required
                        >
                          <option value="">Select radiology test</option>
                          {radTestTypes.map((t) => (
                            <option
                              key={t.radiologyTestTypeID}
                              value={t.radiologyTestTypeID}
                            >
                              {t.testName}
                              {t.departmentName ? ` (${t.departmentName})` : ""}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Status">
                        <select
                          className={inputCls}
                          value={row.status}
                          onChange={(e) => {
                            const next = [...radItems];
                            next[idx] = { ...next[idx], status: e.target.value };
                            setRadItems(next);
                          }}
                        >
                          <option value="Requested">Requested</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </Field>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            setRadItems(radItems.filter((_, i) => i !== idx))
                          }
                          className="text-xs text-red-600 px-2 py-2"
                          disabled={radItems.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !primaryConsultationId}
                    className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Submit radiology request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ========== FORM MODALS (create/edit) ========== */}
      {modal && modal.type !== "radiologyResults" && (
        <Modal
          title={
            modal.mode === "create"
              ? `Add ${modal.type}`
              : `Edit ${modal.type}`
          }
          onClose={closeModal}
          wide={modal.type === "consultation"}
        >
          <form onSubmit={submitModal} className="space-y-4">
            {modal.type === "allergy" && (
              <>
                <Field label="Allergen">
                  <input
                    className={inputCls}
                    value={form.allergen || ""}
                    onChange={(e) => setForm({ ...form, allergen: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Reaction">
                  <input
                    className={inputCls}
                    value={form.reaction || ""}
                    onChange={(e) => setForm({ ...form, reaction: e.target.value })}
                  />
                </Field>
                <Field label="Severity">
                  <select
                    className={inputCls}
                    value={form.severity || ""}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  >
                    <option value="">—</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </Field>
                <Field label="Active">
                  <select
                    className={inputCls}
                    value={form.isActive === false ? "false" : "true"}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.value === "true" })
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </>
            )}

            {modal.type === "medicalHistory" && (
              <>
                <Field label="Condition name">
                  <input
                    className={inputCls}
                    value={form.conditionName || ""}
                    onChange={(e) =>
                      setForm({ ...form, conditionName: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Diagnosed date">
                  <input
                    type="date"
                    className={inputCls}
                    value={
                      form.diagnosedDate
                        ? String(form.diagnosedDate).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setForm({ ...form, diagnosedDate: e.target.value })
                    }
                  />
                </Field>
                <Field label="Status">
                  <input
                    className={inputCls}
                    value={form.status || ""}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  />
                </Field>
                <Field label="Treatment">
                  <input
                    className={inputCls}
                    value={form.treatment || ""}
                    onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </>
            )}

            {modal.type === "familyHistory" && (
              <>
                <Field label="Relative">
                  <input
                    className={inputCls}
                    value={form.relative || ""}
                    onChange={(e) => setForm({ ...form, relative: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Condition">
                  <input
                    className={inputCls}
                    value={form.conditionName || ""}
                    onChange={(e) =>
                      setForm({ ...form, conditionName: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </>
            )}

            {modal.type === "socialHistory" && (
              <>
                <Field label="Smoking status">
                  <input
                    className={inputCls}
                    value={form.smokingStatus || ""}
                    onChange={(e) =>
                      setForm({ ...form, smokingStatus: e.target.value })
                    }
                  />
                </Field>
                <Field label="Alcohol use">
                  <input
                    className={inputCls}
                    value={form.alcoholUse || ""}
                    onChange={(e) => setForm({ ...form, alcoholUse: e.target.value })}
                  />
                </Field>
                <Field label="Occupation">
                  <input
                    className={inputCls}
                    value={form.occupation || ""}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  />
                </Field>
                <Field label="Living situation">
                  <input
                    className={inputCls}
                    value={form.livingSituation || ""}
                    onChange={(e) =>
                      setForm({ ...form, livingSituation: e.target.value })
                    }
                  />
                </Field>
                <Field label="Physical activity">
                  <input
                    className={inputCls}
                    value={form.physicalActivity || ""}
                    onChange={(e) =>
                      setForm({ ...form, physicalActivity: e.target.value })
                    }
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </>
            )}

            {modal.type === "problemList" && (
              <>
                <Field label="Problem name">
                  <input
                    className={inputCls}
                    value={form.problemName || ""}
                    onChange={(e) =>
                      setForm({ ...form, problemName: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Code">
                  <input
                    className={inputCls}
                    value={form.code || ""}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </Field>
                <Field label="Status">
                  <select
                    className={inputCls}
                    value={form.status || "Active"}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </>
            )}

            {modal.type === "consultation" && (
              <>
                <Field label="Chief complaint">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.chiefComplaint || ""}
                    onChange={(e) =>
                      setForm({ ...form, chiefComplaint: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="History of present illness">
                  <textarea
                    className={inputCls}
                    rows={3}
                    value={form.historyOfPresentIllness || ""}
                    onChange={(e) =>
                      setForm({ ...form, historyOfPresentIllness: e.target.value })
                    }
                  />
                </Field>
                <Field label="Assessment">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.assessment || ""}
                    onChange={(e) => setForm({ ...form, assessment: e.target.value })}
                  />
                </Field>
                <Field label="Treatment plan">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.treatmentPlan || ""}
                    onChange={(e) =>
                      setForm({ ...form, treatmentPlan: e.target.value })
                    }
                  />
                </Field>
                <Field label="Clinical notes">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.clinicalNotes || ""}
                    onChange={(e) =>
                      setForm({ ...form, clinicalNotes: e.target.value })
                    }
                  />
                </Field>
              </>
            )}

            {modal.type === "physicalExam" && (
              <>
                <Field label="Examination area">
                  <input
                    className={inputCls}
                    value={form.examinationArea || ""}
                    onChange={(e) =>
                      setForm({ ...form, examinationArea: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Findings">
                  <textarea
                    className={inputCls}
                    rows={3}
                    value={form.findings || ""}
                    onChange={(e) => setForm({ ...form, findings: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </>
            )}

            {modal.type === "diagnosis" && (
              <>
                <Field label="Code">
                  <input
                    className={inputCls}
                    value={form.code || ""}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Description">
                  <input
                    className={inputCls}
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Coding system">
                  <input
                    className={inputCls}
                    value={form.codingSystem || ""}
                    onChange={(e) =>
                      setForm({ ...form, codingSystem: e.target.value })
                    }
                    placeholder="e.g. ICD-10"
                  />
                </Field>
                <Field label="Diagnosis type">
                  <input
                    className={inputCls}
                    value={form.diagnosisType || ""}
                    onChange={(e) =>
                      setForm({ ...form, diagnosisType: e.target.value })
                    }
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!form.isPrimary}
                    onChange={(e) =>
                      setForm({ ...form, isPrimary: e.target.checked })
                    }
                  />
                  Primary diagnosis
                </label>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-lg border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========== RADIOLOGY RESULTS MODAL ========== */}
      {modal?.type === "radiologyResults" && (
        <Modal
          title={`Radiology Results — ${modal.request?.testName || "Request"} #${
            modal.request?.radiologyRequestID
          }`}
          onClose={closeModal}
          wide
        >
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 text-sm grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">Status:</span>{" "}
                <strong>{modal.request?.status || "—"}</strong>
              </div>
              <div>
                <span className="text-slate-500">Request date:</span>{" "}
                {modal.request?.requestDate
                  ? new Date(modal.request.requestDate).toLocaleString()
                  : "—"}
              </div>
              <div>
                <span className="text-slate-500">Consultation:</span> #
                {modal.request?.consultationID}
              </div>
              <div>
                <span className="text-slate-500">Results count:</span>{" "}
                {(modal.request?.results || []).length}
              </div>
            </div>

            {(modal.request?.results || []).length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No results recorded yet for this request.
              </p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {(modal.request.results || []).map((res, idx) => {
                  const imageUrl = buildRadiologyImageUrl(res);
                  return (
                    <div
                      key={res.radiologyResultID || idx}
                      className="border border-slate-200 rounded-xl p-4 space-y-3"
                    >
                      <div>
                        <p className="text-xs text-slate-400">
                          Result #{res.radiologyResultID}
                        </p>
                        <p className="font-medium text-slate-800 mt-0.5">
                          {res.radiologyTechnicianName || "Technician"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {res.resultDate
                            ? new Date(res.resultDate).toLocaleString()
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">
                          Report / Description
                        </p>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">
                          {res.resultDescription || "—"}
                        </p>
                      </div>

                      {imageUrl ? (
  <div>
    <p className="text-xs font-medium text-slate-500 mb-2">
      Image
      {res.imageName ? ` — ${res.imageName}` : ""}
    </p>

    <div className="space-y-2">
      <img
        src={imageUrl}
        alt={res.imageName || "Radiology image"}
        className="max-w-full max-h-80 rounded-lg border border-slate-200 object-contain bg-slate-50"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fallback = e.currentTarget.nextElementSibling;
          if (fallback) fallback.classList.remove("hidden");
        }}
      />

      {/* Fallback message — NOT nested inside an <a> */}
      <p className="hidden text-xs text-red-500">
        Image could not be loaded.{" "}
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Open image in new tab
        </a>
      </p>

      {/* Always available open link (not wrapping the img) */}
      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
      >
        <i className="bi bi-box-arrow-up-right" />
        Open full image
      </a>
    </div>
  </div>
) : (
  <p className="text-xs text-slate-400">No image attached.</p>
)}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <Modal title="Confirm delete" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to delete this record?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 text-sm rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={doDelete}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}