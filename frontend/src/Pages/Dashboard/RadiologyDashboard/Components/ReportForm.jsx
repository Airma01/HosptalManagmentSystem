export default function ReportForm({ value, onChange, onSubmit, submitting, submitLabel = 'Save Report' }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
    >
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <i className="bi bi-file-earmark-medical text-indigo-600" />
        Report / Impression
      </h3>
      <textarea
        rows={8}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Enter findings and impression (maps to ResultDescription)..."
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        <i className="bi bi-save" />
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
