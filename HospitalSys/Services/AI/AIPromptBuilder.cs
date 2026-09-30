using HospitalSys.Models.AI;

namespace HospitalSys.Services.AI
{
    public static class AIPromptBuilder
    {
        public const string ClinicalDisclaimer =
            "You are a clinical decision-support assistant inside a hospital information system. " +
            "You must ONLY use the patient clinical context provided below. " +
            "Do NOT invent diagnoses, lab values, medications, allergies, or any clinical facts not present in the context. " +
            "If information is missing, say so clearly in plain English. " +
            "Never issue treatment orders or final diagnoses; provide decision support only. " +
            "Write in clear, professional clinical English that a doctor can read quickly. " +
            "Do NOT use Markdown formatting such as **bold**, ## headings, or raw asterisk lists in normal prose. " +
            "Use plain sentences and short paragraphs. You may use simple numbered sections like '1. Title' if needed. " +
            STRUCTURED_OUTPUT_RULES;

        /// <summary>
        /// Instructs the model to emit machine-parseable chart/table blocks when the doctor
        /// asks for diagrams, graphs, charts, or table analysis.
        /// Frontend (AIClinicalAssistant.jsx) parses these fences and renders Recharts + HTML tables.
        /// </summary>
        private const string STRUCTURED_OUTPUT_RULES =
            "\n\nSTRUCTURED VISUAL OUTPUT (important):\n" +
            "When the doctor asks for a diagram, graph, chart, bar chart, line chart, trend, " +
            "comparison, or table analysis of clinical data that EXISTS in the context, " +
            "you MUST also emit one or more machine-readable blocks AFTER your plain-English explanation.\n" +
            "Use EXACTLY these fenced formats (no extra text inside the fences):\n\n" +
            "For a bar or line chart:\n" +
            "```chart\n" +
            "{\"chartType\":\"bar\",\"title\":\"Short title\",\"xLabel\":\"X axis\",\"yLabel\":\"Y axis\"," +
            "\"series\":[{\"name\":\"Series A\",\"data\":[{\"label\":\"Item1\",\"value\":12},{\"label\":\"Item2\",\"value\":8}]}]}\n" +
            "```\n\n" +
            "chartType must be \"bar\" or \"line\". Values must be numbers taken only from the context " +
            "(vitals, lab results, counts). If a value is unknown, omit that point — never invent numbers.\n\n" +
            "For a data table:\n" +
            "```table\n" +
            "{\"title\":\"Short title\",\"headers\":[\"Col1\",\"Col2\"],\"rows\":[[\"a\",\"b\"],[\"c\",\"d\"]]}\n" +
            "```\n\n" +
            "You may emit multiple chart and table blocks. Always keep a short plain-English summary first. " +
            "If the doctor did NOT ask for a chart/table/diagram, do NOT emit these blocks.";

        public static string BuildPatientSummaryPrompt(AIClinicalContext ctx)
        {
            return $@"Module: {ctx.Module}
Patient reference: {ctx.PatientLabel}
Visit ID: {ctx.VisitId}

=== AUTHORIZED CLINICAL CONTEXT (source of truth) ===
{ctx.ContextText}
=== END CONTEXT ===

Task: Write a concise clinical patient summary in plain professional English for a doctor reviewing this visit.

Use this structure with short paragraphs (no Markdown, no ** asterisks):

1. Patient and visit overview
Briefly state age/sex if known, MRN if present, visit date, visit type, and status.

2. History, allergies, and problem list
Summarize allergies, medical history, social history, and active problems in natural sentences. If none are recorded, say so.

3. Current visit findings
Summarize consultation notes or exam findings for this visit if present. If not documented, state that clearly.

4. Diagnoses, medications, and laboratory results
Mention only items that appear in the context. Do not invent values.

5. Module-specific notes
If this is maternal, child, or adult care, briefly summarize the relevant records in plain English.

Rules:
- Use complete English sentences.
- No Markdown (**bold**, *italics*, ## headings).
- Do not invent missing data.
- Keep the summary readable and clinically useful.
- Only add ```chart or ```table blocks if numeric trends in the context clearly support a visual summary.";
        }

        public static string BuildChatPrompt(AIClinicalContext ctx, string question)
        {
            return $@"Module: {ctx.Module}
Patient reference: {ctx.PatientLabel}
Visit ID: {ctx.VisitId}

=== AUTHORIZED CLINICAL CONTEXT (source of truth) ===
{ctx.ContextText}
=== END CONTEXT ===

Doctor question: {question}

Answer in clear professional clinical English using ONLY the context above.
If the context does not contain enough information, say so.
Do not invent records.
Do not use Markdown formatting (**bold**, ## headings). Prefer plain sentences and short paragraphs.

If the doctor asked for a diagram, graph, chart, bar chart, line chart, trend, comparison, or table analysis,
emit ```chart and/or ```table JSON blocks (as defined in your system rules) using ONLY numbers present in the context.";
        }

        public static string BuildLabExplanationPrompt(AIClinicalContext ctx)
        {
            return $@"Module: {ctx.Module}
Patient reference: {ctx.PatientLabel}
Visit ID: {ctx.VisitId}

=== LABORATORY / CLINICAL CONTEXT ===
{ctx.ContextText}
=== END CONTEXT ===

Task: Explain the laboratory results that appear in the context in plain professional English.

Rules:
- Describe what each reported result means in clinical terms when possible.
- Mention reference ranges or abnormal flags ONLY if they appear in the context.
- Do NOT invent reference ranges or values that are not present.
- Separate general medical knowledge from the actual patient results.
- Use plain sentences. No Markdown (**bold**, ## headings).
- Advise that the attending clinician must interpret results in the full clinical context.
- If multiple numeric lab values are present, also emit a ```table block listing test name, result, and date,
  and optionally a ```chart block (bar) comparing those numeric values.";
        }

        public static string BuildClinicalRecordSummaryPrompt(AIClinicalContext ctx)
        {
            return $@"Module: {ctx.Module}
Patient reference: {ctx.PatientLabel}
Visit ID: {ctx.VisitId}

=== AUTHORIZED CLINICAL CONTEXT ===
{ctx.ContextText}
=== END CONTEXT ===

Task: Summarize the relevant clinical records for this patient and visit in the current module.
Write in clear professional clinical English with short paragraphs.
Only use data present in the context. Note important gaps briefly.
Do not use Markdown formatting (**bold**, ## headings).
If numeric series exist (vitals over time, repeated labs), you may add ```chart or ```table blocks.";
        }
    }
}