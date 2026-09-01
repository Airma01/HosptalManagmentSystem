import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../Config/API";
import PrescriptionDetails from "../Prescription/PrescriptionDetails";

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

  // Lookups (names for dropdowns)
  const [branchPharmacies, setBranchPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [labTestTypes, setLabTestTypes] = useState([]);
  const [radTestTypes, setRadTestTypes] = useState([]);

  // Multi-item create forms
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

  // Load dropdown lists once
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
        // Lookups optional; forms still render
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
      <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
        Loading patient visit...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate("/doctor/consultation/triage")}
          className="text-sm text-indigo-600"
        >
          ← Back to queue
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error || "Patient visit not found."}
        </div>
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => navigate("/doctor/consultation/triage")}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to consultation queue
        </button>
        {message && (
          <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
            {message}
          </span>
        )}
      </div>

      {/* Patient header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Patient ID: {patient.patientID}
              {patient.mrn ? ` · MRN: ${patient.mrn}` : ""}
              {patient.gender ? ` · ${patient.gender}` : ""}
              {patient.phone ? ` · ${patient.phone}` : ""}
            </p>
            {patient.dateOfBirth && (
              <p className="text-xs text-slate-400 mt-0.5">
                DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-sm text-slate-600 space-y-1 md:text-right">
            <p>
              <span className="text-slate-400">Visit #</span> {visit.visitID}
            </p>
            <p>
              <span className="text-slate-400">Date:</span>{" "}
              {visit.visitDate ? new Date(visit.visitDate).toLocaleString() : "—"}
            </p>
            <p>
              <span className="text-slate-400">Type:</span> {visit.visitType || "—"}
            </p>
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700">
              {visit.status || "—"}
            </span>
          </div>
        </div>
        {triage && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-slate-600">
            <div>
              <p className="text-slate-400">Temp</p>
              <p className="font-medium">{triage.temprature}</p>
            </div>
            <div>
              <p className="text-slate-400">BP</p>
              <p className="font-medium">{triage.bloodPressure}</p>
            </div>
            <div>
              <p className="text-slate-400">HR</p>
              <p className="font-medium">{triage.heartRate}</p>
            </div>
            <div>
              <p className="text-slate-400">RR</p>
              <p className="font-medium">{triage.respiratotyRate}</p>
            </div>
            <div>
              <p className="text-slate-400">Weight</p>
              <p className="font-medium">{triage.weight}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Section nav */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm sticky top-20">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition ${
                  section === s.id
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <i className={`bi ${s.icon}`} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9 space-y-4">
          {section === "overview" && (
            <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3 text-sm text-slate-600">
              <p>
                Use the sections on the left to review and update clinical records for this
                patient. Consultation, physical examination, and diagnosis are linked to a
                consultation for this visit.
              </p>
              <p>
                Previous consultations on file: <strong>{consultations.length}</strong>
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

          {section === "allergies" && (
            <RecordPanel
              title="Allergies"
              onAdd={() => openCreate("allergy", { isActive: true })}
              rows={data.allergies || []}
              columns={[
                { key: "allergen", label: "Allergen" },
                { key: "reaction", label: "Reaction" },
                { key: "severity", label: "Severity" },
                {
                  key: "isActive",
                  label: "Active",
                  render: (v) => (v ? "Yes" : "No"),
                },
              ]}
              idKey="allergyID"
              onEdit={(r) => openEdit("allergy", r)}
              onDelete={(r) => setConfirmDelete({ type: "allergy", id: r.allergyID })}
            />
          )}

          {section === "medicalHistory" && (
            <RecordPanel
              title="Medical History"
              onAdd={() => openCreate("medicalHistory")}
              rows={data.medicalHistory || []}
              columns={[
                { key: "conditionName", label: "Condition" },
                { key: "status", label: "Status" },
                { key: "treatment", label: "Treatment" },
              ]}
              idKey="medicalHistoryID"
              onEdit={(r) => openEdit("medicalHistory", r)}
              onDelete={(r) =>
                setConfirmDelete({ type: "medicalHistory", id: r.medicalHistoryID })
              }
            />
          )}

          {section === "familyHistory" && (
            <RecordPanel
              title="Family Medical History"
              onAdd={() => openCreate("familyHistory")}
              rows={data.familyMedicalHistory || []}
              columns={[
                { key: "relative", label: "Relative" },
                { key: "conditionName", label: "Condition" },
                { key: "notes", label: "Notes" },
              ]}
              idKey="familyMedicalHistoryID"
              onEdit={(r) => openEdit("familyHistory", r)}
              onDelete={(r) =>
                setConfirmDelete({
                  type: "familyHistory",
                  id: r.familyMedicalHistoryID,
                })
              }
            />
          )}

          {section === "socialHistory" && (
            <RecordPanel
              title="Social History"
              onAdd={() => openCreate("socialHistory")}
              rows={data.socialHistory || []}
              columns={[
                { key: "smokingStatus", label: "Smoking" },
                { key: "alcoholUse", label: "Alcohol" },
                { key: "occupation", label: "Occupation" },
                { key: "livingSituation", label: "Living" },
              ]}
              idKey="socialHistoryID"
              onEdit={(r) => openEdit("socialHistory", r)}
              onDelete={(r) =>
                setConfirmDelete({ type: "socialHistory", id: r.socialHistoryID })
              }
            />
          )}

          {section === "problemList" && (
            <RecordPanel
              title="Problem List"
              onAdd={() => openCreate("problemList", { status: "Active" })}
              rows={data.problemList || []}
              columns={[
                { key: "problemName", label: "Problem" },
                { key: "code", label: "Code" },
                { key: "status", label: "Status" },
              ]}
              idKey="problemListID"
              onEdit={(r) => openEdit("problemList", r)}
              onDelete={(r) =>
                setConfirmDelete({ type: "problemList", id: r.problemListID })
              }
            />
          )}

          {section === "consultation" && (
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-800">Consultations</h3>
                <button
                  type="button"
                  onClick={() => openCreate("consultation")}
                  className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white"
                >
                  + Start consultation
                </button>
              </div>
              <div className="p-5 space-y-3">
                {consultations.length === 0 && (
                  <p className="text-sm text-slate-500">No consultations yet.</p>
                )}
                {consultations.map((c) => (
                  <div
                    key={c.consultationID}
                    className="border border-slate-100 rounded-lg p-4 text-sm"
                  >
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-slate-800">
                        #{c.consultationID} · Visit {c.visitID}
                      </p>
                      <p className="text-xs text-slate-400">
                        {c.consultationDate
                          ? new Date(c.consultationDate).toLocaleString()
                          : ""}
                      </p>
                    </div>
                    <p className="mt-2 text-slate-600">
                      <span className="text-slate-400">Chief complaint:</span>{" "}
                      {c.chiefComplaint || "—"}
                    </p>
                    <p className="text-slate-600">
                      <span className="text-slate-400">HPI:</span>{" "}
                      {c.historyOfPresentIllness || "—"}
                    </p>
                    <p className="text-slate-600">
                      <span className="text-slate-400">Assessment:</span>{" "}
                      {c.assessment || "—"}
                    </p>
                    <p className="text-slate-600">
                      <span className="text-slate-400">Plan:</span>{" "}
                      {c.treatmentPlan || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "physicalExam" && (
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-800">Physical Examination</h3>
                <button
                  type="button"
                  disabled={!primaryConsultationId}
                  onClick={() =>
                    openCreate("physicalExam", {
                      consultationID: primaryConsultationId,
                    })
                  }
                  className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white disabled:opacity-40"
                >
                  + Add examination
                </button>
              </div>
              <div className="p-5 space-y-2 text-sm">
                {!primaryConsultationId && (
                  <p className="text-amber-600">Start a consultation first.</p>
                )}
                {consultations.flatMap((c) =>
                  (c.physicalExaminations || []).map((pe) => (
                    <div key={pe.physicalExaminationID} className="border rounded-lg p-3">
                      <p className="font-medium">
                        {pe.examinationArea}{" "}
                        <span className="text-xs text-slate-400">
                          (Consultation #{pe.consultationID})
                        </span>
                      </p>
                      <p className="text-slate-600">{pe.findings}</p>
                      {pe.notes && <p className="text-slate-400 text-xs">{pe.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {section === "diagnosis" && (
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-800">Diagnosis</h3>
                <button
                  type="button"
                  disabled={!primaryConsultationId}
                  onClick={() =>
                    openCreate("diagnosis", {
                      consultationID: primaryConsultationId,
                      isPrimary: false,
                    })
                  }
                  className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white disabled:opacity-40"
                >
                  + Add diagnosis
                </button>
              </div>
              <div className="p-5 space-y-2 text-sm">
                {!primaryConsultationId && (
                  <p className="text-amber-600">Start a consultation first.</p>
                )}
                {consultations.flatMap((c) =>
                  (c.diagnoses || []).map((d) => (
                    <div key={d.diagnosisID} className="border rounded-lg p-3">
                      <p className="font-medium">
                        {d.code} — {d.description}
                        {d.isPrimary && (
                          <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">
                        {d.codingSystem} · {d.diagnosisType || "—"} · Consultation #
                        {d.consultationID}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========== PRESCRIPTION ========== */}
          {section === "prescription" && (
            <div className="space-y-4">
              <PrescriptionDetails prescription={data.latestPrescription} />

              <div className="bg-white border rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-slate-800">New Prescription</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Consultation #{primaryConsultationId || "—"} · Select pharmacy and
                    medicines by name
                  </p>
                </div>
                <form onSubmit={submitPrescription} className="p-5 space-y-4">
                  {!primaryConsultationId && (
                    <p className="text-amber-600 text-sm">Start a consultation first.</p>
                  )}
                  <Field label="Branch Pharmacy">
                    <select
                      className={inputCls}
                      value={rxBranchId}
                      onChange={(e) => setRxBranchId(e.target.value)}
                      required
                      disabled={!primaryConsultationId}
                    >
                      <option value="">Select branch pharmacy</option>
                      {branchPharmacies.map((b) => (
                        <option key={b.branchPharmacyID} value={b.branchPharmacyID}>
                          {b.branchName}
                          {b.location ? ` (${b.location})` : ""}
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
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 p-3 border border-slate-100 rounded-lg"
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
                            <option value="">Select medicine</option>
                            {medicines.map((m) => (
                              <option key={m.medicineID} value={m.medicineID}>
                                {m.medicineName}
                                {m.genericName ? ` (${m.genericName})` : ""}
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
                            placeholder="500 mg"
                          />
                        </Field>
                        <Field label="Frequency">
                          <input
                            className={inputCls}
                            type="number"
                            step="0.1"
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
                            className={inputCls}
                            type="number"
                            step="0.1"
                            value={row.duration}
                            onChange={(e) => {
                              const next = [...rxItems];
                              next[idx] = { ...next[idx], duration: e.target.value };
                              setRxItems(next);
                            }}
                          />
                        </Field>
                        <Field label="Quantity">
                          <input
                            className={inputCls}
                            type="number"
                            step="0.1"
                            value={row.quantity}
                            onChange={(e) => {
                              const next = [...rxItems];
                              next[idx] = { ...next[idx], quantity: e.target.value };
                              setRxItems(next);
                            }}
                          />
                        </Field>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() =>
                              setRxItems(rxItems.filter((_, i) => i !== idx))
                            }
                            className="text-xs text-red-600 px-2 py-2"
                            disabled={rxItems.length === 1}
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {laboratoryTests.map((t) => (
                          <Fragment key={t.testID}>
                            <tr>
                              <td className="px-4 py-2">{t.testID}</td>
                              <td className="px-4 py-2">{t.sectionName || "—"}</td>
                              <td className="px-4 py-2">{t.testName || "—"}</td>
                              <td className="px-4 py-2">{t.status || "—"}</td>
                              <td className="px-4 py-2">
                                {t.requestDate
                                  ? new Date(t.requestDate).toLocaleString()
                                  : "—"}
                              </td>
                              <td className="px-4 py-2">#{t.consultationID}</td>
                            </tr>
                            <tr>
                              <td colSpan={6} className="bg-slate-50 px-4 py-2 text-xs text-slate-600">
                                <span className="font-medium text-slate-500">Results: </span>
                                {(t.results || []).length === 0 ? (
                                  <span className="text-slate-400">No result yet</span>
                                ) : (
                                  (t.results || []).map((r) => (
                                    <div key={r.resultID} className="mt-1">
                                      <strong>
                                        {r.resultDate
                                          ? new Date(r.resultDate).toLocaleString()
                                          : ""}
                                      </strong>
                                      {" · "}
                                      {r.technicianName || "Technician"}
                                      {": "}
                                      {r.resultDescription || "—"}
                                    </div>
                                  ))
                                )}
                              </td>
                            </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-slate-800">Request Laboratory Tests</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Consultation #{primaryConsultationId || "—"} · Select tests by name
                    (section shown)
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {radiologyRequests.map((r) => (
                          <Fragment key={r.radiologyRequestID}>
                            <tr>
                              <td className="px-4 py-2">{r.radiologyRequestID}</td>
                              <td className="px-4 py-2">{r.testName || "—"}</td>
                              <td className="px-4 py-2">{r.status || "—"}</td>
                              <td className="px-4 py-2">
                                {r.requestDate
                                  ? new Date(r.requestDate).toLocaleString()
                                  : "—"}
                              </td>
                              <td className="px-4 py-2">#{r.consultationID}</td>
                            </tr>
                            <tr>
                              <td colSpan={5} className="bg-slate-50 px-4 py-2 text-xs text-slate-600">
                                <span className="font-medium text-slate-500">Results: </span>
                                {(r.results || []).length === 0 ? (
                                  <span className="text-slate-400">No result yet</span>
                                ) : (
                                  (r.results || []).map((res) => (
                                    <div key={res.radiologyResultID} className="mt-1">
                                      <strong>
                                        {res.resultDate
                                          ? new Date(res.resultDate).toLocaleString()
                                          : ""}
                                      </strong>
                                      {" · "}
                                      {res.radiologyTechnicianName || "Technician"}
                                      {": "}
                                      {res.resultDescription || "—"}
                                      {res.imageName ? (
                                        <span className="text-slate-400">
                                          {" "}
                                          · Image: {res.imageName}
                                        </span>
                                      ) : null}
                                    </div>
                                  ))
                                )}
                              </td>
                            </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-slate-800">Request Radiology</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Consultation #{primaryConsultationId || "—"} · Select tests by name
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
                        <Field label="Status / Priority">
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
                            <option value="STAT">STAT</option>
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
      </div>

      {/* Create / Edit modal */}
      {modal && (
        <Modal
          title={`${modal.mode === "create" ? "Add" : "Edit"} ${modal.type}`}
          onClose={closeModal}
        >
          <form onSubmit={submitModal} className="space-y-3">
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
                  <input
                    className={inputCls}
                    value={form.severity || ""}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </>
            )}
            {modal.type === "medicalHistory" && (
              <>
                <Field label="Condition">
                  <input
                    className={inputCls}
                    value={form.conditionName || ""}
                    onChange={(e) => setForm({ ...form, conditionName: e.target.value })}
                    required
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
                    onChange={(e) => setForm({ ...form, conditionName: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
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
                    onChange={(e) => setForm({ ...form, smokingStatus: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, livingSituation: e.target.value })}
                  />
                </Field>
                <Field label="Physical activity">
                  <input
                    className={inputCls}
                    value={form.physicalActivity || ""}
                    onChange={(e) => setForm({ ...form, physicalActivity: e.target.value })}
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
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
                    onChange={(e) => setForm({ ...form, problemName: e.target.value })}
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
                <Field label="Coding system">
                  <input
                    className={inputCls}
                    value={form.codingSystem || ""}
                    onChange={(e) => setForm({ ...form, codingSystem: e.target.value })}
                  />
                </Field>
                <Field label="Status">
                  <input
                    className={inputCls}
                    value={form.status || "Active"}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </>
            )}
            {modal.type === "consultation" && (
              <>
                <Field label="Chief complaint">
                  <input
                    className={inputCls}
                    value={form.chiefComplaint || ""}
                    onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
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
                    value={form.assessment || ""}
                    onChange={(e) => setForm({ ...form, assessment: e.target.value })}
                  />
                </Field>
                <Field label="Treatment plan">
                  <textarea
                    className={inputCls}
                    value={form.treatmentPlan || ""}
                    onChange={(e) => setForm({ ...form, treatmentPlan: e.target.value })}
                  />
                </Field>
                <Field label="Clinical notes">
                  <textarea
                    className={inputCls}
                    value={form.clinicalNotes || ""}
                    onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })}
                  />
                </Field>
              </>
            )}
            {modal.type === "physicalExam" && (
              <>
                <Field label="Consultation ID">
                  <input
                    className={inputCls}
                    type="number"
                    value={form.consultationID || ""}
                    onChange={(e) =>
                      setForm({ ...form, consultationID: Number(e.target.value) })
                    }
                    required
                  />
                </Field>
                <Field label="Examination area">
                  <input
                    className={inputCls}
                    value={form.examinationArea || ""}
                    onChange={(e) => setForm({ ...form, examinationArea: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Findings">
                  <textarea
                    className={inputCls}
                    value={form.findings || ""}
                    onChange={(e) => setForm({ ...form, findings: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    className={inputCls}
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </>
            )}
            {modal.type === "diagnosis" && (
              <>
                <Field label="Consultation ID">
                  <input
                    className={inputCls}
                    type="number"
                    value={form.consultationID || ""}
                    onChange={(e) =>
                      setForm({ ...form, consultationID: Number(e.target.value) })
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
                <Field label="Description">
                  <input
                    className={inputCls}
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Coding system">
                  <input
                    className={inputCls}
                    value={form.codingSystem || ""}
                    onChange={(e) => setForm({ ...form, codingSystem: e.target.value })}
                    placeholder="ICD-10 / ICD-11"
                  />
                </Field>
                <Field label="Diagnosis type">
                  <input
                    className={inputCls}
                    value={form.diagnosisType || ""}
                    onChange={(e) => setForm({ ...form, diagnosisType: e.target.value })}
                    placeholder="Primary / Secondary"
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!form.isPrimary}
                    onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                  />
                  Primary diagnosis
                </label>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200"
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

      {confirmDelete && (
        <Modal title="Confirm delete" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to delete this record? This cannot be undone.
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

function RecordPanel({ title, onAdd, rows, columns, idKey, onEdit, onDelete }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white"
        >
          + Add
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">No records.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="text-left px-4 py-2 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r[idKey]}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-2 text-slate-700">
                      {c.render ? c.render(r[c.key], r) : r[c.key] ?? "—"}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => onEdit(r)}
                      className="text-indigo-600 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r)}
                      className="text-red-600 text-xs"
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
  );
}