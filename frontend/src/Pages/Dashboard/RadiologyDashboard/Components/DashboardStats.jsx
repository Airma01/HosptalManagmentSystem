export default function DashboardStats({ cards = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4"
        >
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${c.color || 'bg-indigo-50 text-indigo-600'}`}>
            <i className={`bi ${c.icon || 'bi-activity'}`} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900">{c.value ?? 0}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
