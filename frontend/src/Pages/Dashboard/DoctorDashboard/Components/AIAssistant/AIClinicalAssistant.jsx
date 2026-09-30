
import React, { useState } from "react";
import API from "../../../../../Config/API";

/**
 * Light Markdown → HTML for clinical AI text.
 * Handles headings, bold, italics, bullets, numbered lists, paragraphs.
 */
function formatAiText(raw) {
  if (!raw) return "";

  let text = String(raw)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  // Escape HTML
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic *text* or _text_ (avoid list markers)
  text = text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  text = text.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");

  const lines = text.split("\n");
  const html = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      closeLists();
      continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const h1 = line.match(/^#\s+(.+)$/);
    if (h3 || h2 || h1) {
      closeLists();
      const content = (h3 || h2 || h1)[1];
      html.push(
        `<h4 class="mt-3 mb-1.5 text-sm font-semibold text-slate-800 border-b border-slate-100 pb-1">${content}</h4>`
      );
      continue;
    }

    // Numbered section title: "1. Something" on its own as heading-like
    const numberedTitle = line.match(/^(\d+)\.\s+([A-Z].{2,80})$/);
    const isShortTitle =
      numberedTitle &&
      !line.endsWith(".") &&
      line.length < 90 &&
      !line.includes(",");

    if (isShortTitle) {
      closeLists();
      html.push(
        `<h4 class="mt-3 mb-1.5 flex items-center gap-2 text-sm font-semibold text-indigo-800">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">${numberedTitle[1]}</span>
          <span>${numberedTitle[2]}</span>
        </h4>`
      );
      continue;
    }

    // Bullet list
    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        html.push('<ul class="my-1.5 list-disc space-y-1 pl-5 text-sm text-slate-700">');
        inUl = true;
      }
      html.push(`<li class="leading-relaxed">${bullet[1]}</li>`);
      continue;
    }

    // Numbered list item with longer body
    const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (numbered && !isShortTitle) {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        html.push('<ol class="my-1.5 list-decimal space-y-1 pl-5 text-sm text-slate-700">');
        inOl = true;
      }
      html.push(`<li class="leading-relaxed">${numbered[2]}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p class="mb-2 text-sm leading-relaxed text-slate-700">${line}</p>`);
  }

  closeLists();
  return html.join("");
}

export default function AIClinicalAssistant({
  patientId,
  visitId,
  module = "Consultation",
  laboratoryResultIds = null,
}) {
  const [activeTab, setActiveTab] = useState("summary");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [disclaimer, setDisclaimer] = useState("");

  const TABS = [
    {
      id: "summary",
      label: "Patient Summary",
      icon: "bi-file-earmark-medical",
      hint: "Clear English overview from authorized clinical records",
    },
    {
      id: "chat",
      label: "Clinical Chat",
      icon: "bi-chat-dots",
      hint: "Ask a question about this patient's records",
    },
    {
      id: "lab",
      label: "Lab Explanation",
      icon: "bi-droplet-half",
      hint: "Explain reported laboratory results only",
    },
    {
      id: "records",
      label: "Record Summary",
      icon: "bi-journal-text",
      hint: "Summarize module-specific clinical records",
    },
  ];

  const clearOutput = () => {
    setError("");
    setResponse("");
    setDisclaimer("");
  };

  const handleError = (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "AI request failed";
    setError(String(msg));
    setResponse("");
  };

  const runPatientSummary = async () => {
    clearOutput();
    setLoading(true);
    try {
      const { data } = await API.post("/api/doctor/ai/patient-summary", {
        patientId,
        visitId,
        module,
      });
      setResponse(data.summary || "");
      setDisclaimer(data.disclaimer || "");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const runChat = async () => {
    if (!question || question.trim().length < 3) {
      setError("Please enter a clinical question (at least 3 characters).");
      return;
    }
    clearOutput();
    setLoading(true);
    try {
      const { data } = await API.post("/api/doctor/ai/chat", {
        patientId,
        visitId,
        module,
        question: question.trim(),
      });
      setResponse(data.answer || "");
      setDisclaimer(data.disclaimer || "");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const runLabExplanation = async () => {
    clearOutput();
    setLoading(true);
    try {
      const payload = { patientId, visitId, module };
      if (laboratoryResultIds && laboratoryResultIds.length > 0) {
        payload.laboratoryResultIds = laboratoryResultIds;
      }
      const { data } = await API.post("/api/doctor/ai/lab-explanation", payload);
      setResponse(data.answer || "");
      setDisclaimer(data.disclaimer || "");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const runRecordSummary = async () => {
    clearOutput();
    setLoading(true);
    try {
      const { data } = await API.post("/api/doctor/ai/clinical-record-summary", {
        patientId,
        visitId,
        module,
      });
      setResponse(data.answer || "");
      setDisclaimer(data.disclaimer || "");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const activeMeta = TABS.find((t) => t.id === activeTab) || TABS[0];

  if (!patientId || !visitId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <i className="bi bi-exclamation-triangle text-lg" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Patient & visit required</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Open a patient from the clinical queue so Patient ID and Visit ID are available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-md shadow-violet-100/40">
      {/* Header — solid white, no gradient */}
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
              <i className="bi bi-robot text-xl" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-slate-800">
                AI Clinical Assistant
              </h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <i className="bi bi-layers text-violet-500" />
                  {module}
                </span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <i className="bi bi-person-badge text-violet-500" />
                  Patient #{patientId}
                </span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <i className="bi bi-calendar2-check text-violet-500" />
                  Visit #{visitId}
                </span>
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-700 ring-1 ring-violet-100">
            <i className="bi bi-stars" />
            AI support
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTab(t.id);
                clearOutput();
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                active
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-violet-50 hover:text-violet-700 hover:ring-violet-200"
              }`}
            >
              <i className={`bi ${t.icon} ${active ? "text-violet-100" : "text-violet-500"}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <i className={`bi ${activeMeta.icon}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800">{activeMeta.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{activeMeta.hint}</p>
          </div>
        </div>

        {activeTab === "summary" && (
          <button
            type="button"
            disabled={loading}
            onClick={runPatientSummary}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating summary…
              </>
            ) : (
              <>
                <i className="bi bi-magic" />
                Generate Patient Summary
              </>
            )}
          </button>
        )}

        {activeTab === "chat" && (
          <div className="space-y-3">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-3 text-violet-400">
                <i className="bi bi-chat-left-text" />
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="e.g. What allergies and active problems should I review before prescribing?"
                className="w-full resize-y rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={runChat}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Thinking…
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill" />
                  Ask AI
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === "lab" && (
          <button
            type="button"
            disabled={loading}
            onClick={runLabExplanation}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Explaining labs…
              </>
            ) : (
              <>
                <i className="bi bi-droplet-half" />
                Explain Lab Results
              </>
            )}
          </button>
        )}

        {activeTab === "records" && (
          <button
            type="button"
            disabled={loading}
            onClick={runRecordSummary}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Summarizing…
              </>
            ) : (
              <>
                <i className="bi bi-journal-richtext" />
                Summarize Clinical Records
              </>
            )}
          </button>
        )}

        {loading && (
          <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <span>
              Contacting Gemini… writing a clear clinical summary in English.
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <i className="bi bi-x-circle" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-800">Request failed</p>
              <p className="mt-0.5 text-xs leading-relaxed text-red-700">{error}</p>
            </div>
          </div>
        )}

        {response && !loading && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-violet-50 px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <i className="bi bi-file-text text-violet-600" />
                Clinical summary
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                <i className="bi bi-stars" />
                AI · review required
              </span>
            </div>

            <div className="max-h-[32rem] overflow-y-auto px-5 py-4">
              <div
                className="ai-clinical-prose"
                dangerouslySetInnerHTML={{ __html: formatAiText(response) }}
              />
            </div>

            <div className="border-t border-amber-100 bg-amber-50 px-4 py-3">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-amber-800">
                <i className="bi bi-shield-exclamation mt-0.5 shrink-0 text-amber-600" />
                <span>
                  {disclaimer ||
                    "This content is AI-generated decision support only. It is not a diagnosis or treatment order. The attending doctor must review and decide."}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}