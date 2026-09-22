
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../../Config/API";
import NeonatalCare from "./NeonatalCare";
import GrowthMonitoring from "./GrowthMonitoring";
import DevelopmentAssessment from "./DevelopmentAssessment";
import Immunization from "./Immunization";
import NutritionAssessment from "./NutritionAssessment";
import IMNCIEncounter from "./IMNCIEncounter";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";

const TABS = [
  { key: "neonatal", label: "Neonatal", icon: "bi-moon-stars" },
  { key: "growth", label: "Growth", icon: "bi-graph-up" },
  { key: "development", label: "Development", icon: "bi-puzzle" },
  { key: "immunization", label: "Immunization", icon: "bi-syringe" },
  { key: "nutrition", label: "Nutrition", icon: "bi-apple" },
  { key: "imnci", label: "IMNCI", icon: "bi-clipboard2-pulse" },
];


function readDirectChildEntry(routePatientId, routeVisitId) {
  try {
    const raw = sessionStorage.getItem("ch_queue_direct");
    if (!raw) return null;
    const data = JSON.parse(raw);
    const pid = Number(data.patientId);
    const vid = Number(data.visitId);
    if (
      pid > 0 &&
      vid > 0 &&
      pid === Number(routePatientId) &&
      vid === Number(routeVisitId)
    ) {
      sessionStorage.removeItem("ch_queue_direct");
      return { patientId: pid, visitId: vid };
    }
  } catch (_e) {
    /* ignore */
  }
  return null;
}

function readSessionNumber(key, fallback) {
  try {
    const saved = sessionStorage.getItem(key);
    if (saved != null && saved !== "") {
      const n = Number(saved);
      if (!Number.isNaN(n)) return n;
    }
  } catch (_e) {
    /* ignore */
  }
  const n = Number(fallback);
  return Number.isNaN(n) ? 0 : n;
}

export default function ChildHealthDashboard() {
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

  const { patientId: routePatientId, visitId: routeVisitId } = useParams();
  

  const [motherPatientId, setMotherPatientId] = useState(() =>
    readSessionNumber("mch_mother_patient_id", routePatientId)
  );
  const [motherVisitId, setMotherVisitId] = useState(() =>
    readSessionNumber("mch_mother_visit_id", routeVisitId || 0)
  );

  const base = `/doctor/maternal/patient/${motherPatientId}/${motherVisitId}`;
  const maternalApi = `/api/doctor/patient/${motherPatientId}/maternal-child`;

  const [tab, setTab] = useState("neonatal");
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [busyChildId, setBusyChildId] = useState(null);

  // Direct entry from Child Health Queue: open this patient as the child immediately
  // (do not load a mother → children list).
  const [directChildEntry] = useState(() =>
    readDirectChildEntry(routePatientId, routeVisitId)
  );

  const [selectedChildId, setSelectedChildId] = useState(() =>
    directChildEntry ? directChildEntry.patientId : null
  );
  const [selectedChild, setSelectedChild] = useState(() =>
    directChildEntry
      ? {
          childPatientID: directChildEntry.patientId,
          firstName: "",
          lastName: "",
          childMRN: "",
        }
      : null
  );
  const [selectedVisitId, setSelectedVisitId] = useState(() =>
    directChildEntry ? directChildEntry.visitId : null
  );

  useEffect(() => {
    if (selectedChildId != null) return;
    const pid = Number(routePatientId);
    const vid = Number(routeVisitId) || 0;
    setMotherPatientId(pid);
    setMotherVisitId(vid);
    try {
      sessionStorage.setItem("mch_mother_patient_id", String(pid));
      sessionStorage.setItem("mch_mother_visit_id", String(vid));
    } catch (_e) {
      /* ignore */
    }
  }, [routePatientId, routeVisitId, selectedChildId]);

  const loadChildren = useCallback(async () => {
    if (!motherPatientId) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`${maternalApi}/children`);
      const list = Array.isArray(res.data) ? res.data : [];
      setChildren(list);
    } catch (err) {
      const msg =
        err.response && err.response.status === 404
          ? (err.response.data && err.response.data.message) ||
            "Mother not found or no access."
          : (err.response && err.response.data && err.response.data.message) ||
            "Unable to load children for this mother.";
      setError(msg);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, [maternalApi, motherPatientId]);

  useEffect(() => {
    if (selectedChildId == null) {
      loadChildren();
    }
  }, [loadChildren, selectedChildId]);


  const createVisit = async (child) => {
    setBusyChildId(child.childPatientID);
    setActionMsg("");
    try {
      const res = await API.post(
        `/api/doctor/patient/${child.childPatientID}/child-health/visits`
      );
      const visitID =
        (res.data && (res.data.visitID ?? res.data.VisitID)) || null;
      setActionMsg(
        `Visit #${visitID} created for ${child.firstName} ${child.lastName}.`
      );
      await loadChildren();
    } catch (err) {
      setActionMsg(
        (err.response && err.response.data && err.response.data.message) ||
          "Failed to create visit for child."
      );
    } finally {
      setBusyChildId(null);
    }
  };

  const openChildHealth = async (child) => {
    setBusyChildId(child.childPatientID);
    setActionMsg("");
    try {
      let visitId = child.latestVisitID ?? child.latestVisitId ?? null;

      if (!visitId) {
        const res = await API.post(
          `/api/doctor/patient/${child.childPatientID}/child-health/visits`
        );
        visitId =
          (res.data && (res.data.visitID ?? res.data.VisitID)) || null;
      }

      if (!visitId) {
        setActionMsg("Could not resolve a visit for this child.");
        return;
      }

      setSelectedChildId(child.childPatientID);
      setSelectedChild(child);
      setSelectedVisitId(visitId);
      setTab("neonatal");

      navigate(
        `/doctor/maternal/patient/${child.childPatientID}/${visitId}/child-health`,
        { replace: true }
      );
    } catch (err) {
      setActionMsg(
        (err.response && err.response.data && err.response.data.message) ||
          "Failed to open child health."
      );
    } finally {
      setBusyChildId(null);
    }
  };

  const backToList = () => {
    // From Child Health Queue direct entry → go back to that queue, not mother list
    if (directChildEntry) {
      navigate("/doctor/maternal/child-health/triage");
      return;
    }
    setSelectedChildId(null);
    setSelectedChild(null);
    setSelectedVisitId(null);
    navigate(
      `/doctor/maternal/patient/${motherPatientId}/${motherVisitId || 0}/child-health`,
      { replace: true }
    );
  };

  // Load basic patient label for direct child entry (queue → child modules)
  useEffect(() => {
    if (!directChildEntry || !selectedChildId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get(`/api/doctor/patient/${selectedChildId}`);
        const p = res.data || {};
        if (cancelled) return;
        setSelectedChild((prev) => ({
          ...(prev || {}),
          childPatientID: selectedChildId,
          firstName: p.firstName || p.FirstName || prev?.firstName || "",
          lastName: p.lastName || p.LastName || prev?.lastName || "",
          childMRN: p.mrn || p.MRN || prev?.childMRN || "",
        }));
      } catch (_e) {
        /* optional – modules still work with ids only */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [directChildEntry, selectedChildId]);

  if (selectedChildId == null) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto px-2 sm:px-0">
        <button
          type="button"
          onClick={() => navigate(base)}
          className="text-sm text-slate-500 hover:text-sky-600"
        >
          <i className="bi bi-arrow-left" /> MCH Dashboard
        </button>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border-b border-sky-100 px-4 py-2.5 flex items-center gap-2">
            <i className="bi bi-emoji-smile text-sky-600" />
            <span className="text-sm font-semibold text-slate-800">Child Health</span>
          </div>
          <div className="p-4 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Mother Patient ID</div>
                <div className="font-medium text-slate-900">#{motherPatientId}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Mother Visit</div>
                <div className="font-medium text-slate-900">{motherVisitId ? `#${motherVisitId}` : "—"}</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Relationship: Mother → Pregnancy → Delivery → Child Birth → Child Patient → Child Health.
              Open a child to manage neonatal care, growth, immunization, and IMNCI under the child&apos;s Patient ID and Visit ID.
            </p>
          </div>
        </div>

        {actionMsg ? (
          <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl px-4 py-3 text-sm">
            {actionMsg}
          </div>
        ) : null}

        {loading ? (
          <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-500">
            Loading children...
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        {!loading && !error && children.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center">
            <i className="bi bi-person-hearts text-3xl text-slate-300" />
            <p className="text-sm text-slate-600 mt-2 font-medium">
              No children have been registered for this mother yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Register a newborn under Delivery then Child births to create a
              Patient and link it here.
            </p>
            <button
              type="button"
              onClick={() => navigate(`${base}/delivery`)}
              className="mt-4 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs"
            >
              Go to Deliveries
            </button>
          </div>
        ) : null}

        {!loading && children.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-700">
              Children ({children.length})
            </h3>
            {children.map((c) => {
              const latestVisit = c.latestVisitID ?? c.latestVisitId;
              const busy = busyChildId === c.childPatientID;
              return (
                <div
                  key={c.childBirthID}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      MRN:{" "}
                      <span className="font-medium text-slate-700">
                        {c.childMRN}
                      </span>
                      {c.sex ? ` · ${c.sex}` : ""}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Birth:{" "}
                      {c.birthDate
                        ? new Date(c.birthDate).toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                      {c.deliveryID != null ? ` · Delivery #${c.deliveryID}` : ""}
                    </p>
                    <p className="text-xs mt-1">
                      {latestVisit ? (
                        <span className="text-emerald-700">
                          <i className="bi bi-check-circle me-1" />
                          Latest visit #{latestVisit}
                          {c.latestVisitDate
                            ? ` · ${new Date(
                                c.latestVisitDate
                              ).toLocaleDateString()}`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-amber-700">
                          <i className="bi bi-exclamation-circle me-1" />
                          No visit yet — create one or use Open Child Health
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => createVisit(c)}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
                    >
                      <i className="bi bi-calendar-plus me-1" />
                      {busy ? "Working..." : "Create Visit"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openChildHealth(c)}
                      className="px-3 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-60"
                    >
                      <i className="bi bi-box-arrow-up-right me-1" />
                      Open Child Health
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  if (mchAccessAllowed !== true) {
    return (
      <div className="p-6 text-slate-500 text-sm flex items-center gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        Checking access…
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <button
        type="button"
        onClick={backToList}
        className="text-sm text-slate-500 hover:text-sky-600"
      >
        <i className="bi bi-arrow-left" />{" "}
        {directChildEntry ? "Child Health Queue" : "All children"}
      </button>

      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <i className="bi bi-emoji-smile text-sky-600" /> Child Health
        </h2>
        {selectedChild ? (
          <p className="text-sm text-slate-700 mt-1">
            {selectedChild.firstName} {selectedChild.lastName}
            <span className="text-xs text-slate-500 ms-2">
              MRN {selectedChild.childMRN} · Patient #
              {selectedChild.childPatientID}
              {selectedVisitId ? ` · Visit #${selectedVisitId}` : ""}
            </span>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1 mt-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={
                tab === t.key
                  ? "px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 text-white"
                  : "px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
              }
            >
              <i className={`bi ${t.icon} me-1`} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <ChildHealthModules
        childPatientId={selectedChildId}
        childVisitId={selectedVisitId}
        tab={tab}
      />
    </div>
  );
}

function ChildHealthModules({ childPatientId, childVisitId, tab }) {
  const navigate = useNavigate();
  const { patientId: currentParamId, visitId: currentVisitId } = useParams();

  useEffect(() => {
    if (
      String(currentParamId) !== String(childPatientId) ||
      String(currentVisitId) !== String(childVisitId)
    ) {
      navigate(
        `/doctor/maternal/patient/${childPatientId}/${childVisitId}/child-health`,
        { replace: true }
      );
    }
  }, [childPatientId, childVisitId, currentParamId, currentVisitId, navigate]);

  if (
    String(currentParamId) !== String(childPatientId) ||
    String(currentVisitId) !== String(childVisitId)
  ) {
    return (
      <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">
        Opening child record...
      </div>
    );
  }

  return (
    <>
      {tab === "neonatal" ? <NeonatalCare /> : null}
      {tab === "growth" ? <GrowthMonitoring /> : null}
      {tab === "development" ? <DevelopmentAssessment /> : null}
      {tab === "immunization" ? <Immunization /> : null}
      {tab === "nutrition" ? <NutritionAssessment /> : null}
      {tab === "imnci" ? <IMNCIEncounter /> : null}
    </>
  );
}