import { useState } from "react";

/**
 * Formats camelCase / PascalCase keys into human-readable labels.
 * e.g. generalAppearance → General Appearance
 *      lastFollowUpDate → Last Follow Up Date
 *      physicalExaminationID → Physical Examination ID
 */
export function formatLabel(key) {
  if (!key) return "";
  // Handle common ID suffixes and acronyms
  const withSpaces = String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return withSpaces
    .split(" ")
    .map((w) => {
      if (w.length <= 3 && w === w.toUpperCase()) return w; // keep ID, HIV, etc.
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Format a single value for display.
 */
export function formatValue(value, key = "") {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "boolean") return value ? "Yes" : "No";

  // Date / DateTime detection
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        // If it has time component beyond midnight, show time
        const hasTime =
          value.includes("T") ||
          (d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0);
        if (hasTime) {
          return d.toLocaleString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
        return d.toLocaleDateString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      /* fall through */
    }
  }

  if (value instanceof Date) {
    return value.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value
      .map((item) => {
        if (item === null || item === undefined) return "—";
        if (typeof item === "object") {
          // Prefer common display fields
          return (
            item.name ||
            item.description ||
            item.label ||
            item.code ||
            item.testName ||
            JSON.stringify(item)
          );
        }
        return String(item);
      })
      .join(", ");
  }

  // Nested object
  if (typeof value === "object") {
    // Avoid dumping huge objects; show meaningful keys
    const meaningful = Object.entries(value)
      .filter(
        ([k, v]) =>
          v !== null &&
          v !== undefined &&
          v !== "" &&
          !k.toLowerCase().endsWith("id") &&
          typeof v !== "object"
      )
      .slice(0, 6)
      .map(([k, v]) => `${formatLabel(k)}: ${formatValue(v, k)}`);
    return meaningful.length ? meaningful.join("; ") : "—";
  }

  return String(value);
}

/** Keys that are almost always internal and should be hidden from the doctor view */
const DEFAULT_EXCLUDE = new Set([
  "patient",
  "consultation",
  "visit",
  "doctor",
  "recordedByUser",
  "createdBy",
  "updatedBy",
  "navigation",
  "__typename",
]);

/** Long-text fields that should span full width */
const LONG_TEXT_HINTS = [
  "notes",
  "clinicalnotes",
  "historyofpresentillness",
  "assessment",
  "treatmentplan",
  "managementplan",
  "lifestyleadvice",
  "followupplan",
  "findings",
  "mentalstatusexamination",
  "safetyplan",
  "psychosocialfactors",
  "laboratorymonitoringplan",
  "symptoms",
  "complications",
  "riskfactors",
  "triggers",
  "exacerbationhistory",
  "hospitalizationhistory",
  "inhalertechniqueeducation",
  "chiefcomplaint",
  "description",
  "resultdescription",
  "comments",
  "remarks",
  "plan",
  "advice",
  "education",
  "history",
];

function isLongTextKey(key) {
  const k = key.toLowerCase();
  return LONG_TEXT_HINTS.some((h) => k.includes(h)) || k.endsWith("notes") || k.endsWith("plan") || k.endsWith("history");
}

/**
 * Compact accordion that displays EVERY meaningful property of a clinical record.
 *
 * Props:
 *  - title: section title shown in header (e.g. "Physical Examination")
 *  - records: array of record objects from API
 *  - idKey: primary key property name (e.g. "physicalExaminationID")
 *  - onEdit: (record) => void
 *  - onDelete: (id) => void   (optional)
 *  - excludeKeys: extra keys to hide
 *  - defaultOpen: boolean
 */
export default function ClinicalRecordAccordion({
  title,
  records = [],
  idKey,
  onEdit,
  onDelete,
  excludeKeys = [],
  defaultOpen = false,
}) {
  const [openIds, setOpenIds] = useState(() =>
    defaultOpen && records.length ? new Set(records.map((r) => r[idKey])) : new Set()
  );

  const exclude = new Set([...DEFAULT_EXCLUDE, ...excludeKeys]);

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setOpenIds(new Set(records.map((r) => r[idKey])));
  };

  const collapseAll = () => {
    setOpenIds(new Set());
  };

  if (!records || records.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>
        <p className="p-4 text-sm text-slate-500">No records.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {records.length} record{records.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {records.length > 1 && (
            <>
              <button
                type="button"
                onClick={expandAll}
                className="text-indigo-600 hover:underline"
              >
                Expand All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-slate-500 hover:underline"
              >
                Collapse All
              </button>
            </>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {records.map((record, idx) => {
          const id = record[idKey] ?? idx;
          const isOpen = openIds.has(id);

          // Collect displayable entries
          const entries = Object.entries(record).filter(([k, v]) => {
            if (exclude.has(k)) return false;
            // hide pure navigation / complex nested entities that are not useful
            if (typeof v === "object" && v !== null && !Array.isArray(v) && !(v instanceof Date)) {
              // keep only if it has simple displayable content
              const simple = Object.values(v).some(
                (x) => typeof x === "string" || typeof x === "number" || typeof x === "boolean"
              );
              if (!simple) return false;
            }
            return true;
          });

          // Prefer a date field for the collapsed summary
          const dateKey = entries.find(([k]) =>
            /date|createdat|updatedat/i.test(k)
          )?.[0];
          const dateVal = dateKey ? formatValue(record[dateKey], dateKey) : null;

          return (
            <div key={id} className="text-sm">
              {/* Collapsed header */}
              <button
                type="button"
                onClick={() => toggle(id)}
                className="w-full px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-800 truncate">
                      {title} #{id}
                    </span>
                    {record.active === false && (
                      <span className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {entries.length} fields
                    {dateVal && dateVal !== "—" ? ` • ${dateVal}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(record);
                      }}
                      className="text-xs text-emerald-700 hover:underline px-1.5 py-0.5"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                      }}
                      className="text-xs text-red-600 hover:underline px-1.5 py-0.5"
                    >
                      Delete
                    </button>
                  )}
                  <i
                    className={`bi bi-chevron-${isOpen ? "up" : "down"} text-slate-400 text-xs`}
                  />
                </div>
              </button>

              {/* Expanded body – 4-column grid */}
              {isOpen && (
                <div className="px-4 pb-3 pt-1 bg-slate-50/50 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2.5">
                    {entries.map(([key, value]) => {
                      const long = isLongTextKey(key);
                      return (
                        <div
                          key={key}
                          className={long ? "sm:col-span-2 lg:col-span-4" : ""}
                        >
                          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide leading-tight">
                            {formatLabel(key)}
                          </div>
                          <div
                            className={`text-sm text-slate-800 mt-0.5 ${
                              long ? "whitespace-pre-wrap break-words" : "truncate"
                            }`}
                            title={typeof value === "string" ? value : undefined}
                          >
                            {formatValue(value, key)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
