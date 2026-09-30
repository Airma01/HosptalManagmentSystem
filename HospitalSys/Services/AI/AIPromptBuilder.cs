
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
            "Do NOT use Markdown formatting such as **bold**, ## headings, or raw asterisk lists. " +
            "Use plain sentences and short paragraphs. You may use simple numbered sections like '1. Title' if needed.";

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
- Keep the summary readable and clinically useful.";
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
Do not use Markdown formatting (**bold**, ## headings). Prefer plain sentences and short paragraphs.";
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
- Advise that the attending clinician must interpret results in the full clinical context.";
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
Do not use Markdown formatting (**bold**, ## headings).";
        }
    }
}