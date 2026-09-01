export default function RadiologyHeader({ title, subtitle, user, onLogout, onMenu }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenu}
          className="lg:hidden h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600"
          aria-label="Open menu"
        >
          <i className="bi bi-list text-xl" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle ? <p className="text-xs text-gray-500 truncate">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-gray-800">{user?.fullName || user?.username || 'User'}</p>
          <p className="text-xs text-gray-500">{user?.role || ''}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
        >
          <i className="bi bi-box-arrow-right" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
