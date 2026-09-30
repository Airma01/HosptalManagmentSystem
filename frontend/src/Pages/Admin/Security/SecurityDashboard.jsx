import { useCallback, useEffect, useState } from "react";
import securityService from "../../../Services/Security/securityService";

const emptyFilters = {
  username: "",
  role: "",
  ipAddress: "",
  module: "",
  action: "",
  endpoint: "",
  status: "",
  eventType: "",
  statusCode: "",
  dateFrom: "",
  dateTo: "",
  page: 1,
  pageSize: 25,
};

export default function SecurityDashboard() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [audit, setAudit] = useState({ items: [], totalCount: 0 });
  const [apiLogs, setApiLogs] = useState({ items: [], totalCount: 0 });
  const [events, setEvents] = useState({ items: [], totalCount: 0 });
  const [blocked, setBlocked] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBlock, setShowBlock] = useState(false);
  const [blockForm, setBlockForm] = useState({
    ipAddress: "",
    reason: "",
    isPermanent: true,
    expiresAt: "",
  });

  const loadStats = useCallback(async () => {
    try {
      const data = await securityService.getStatistics({
        from: filters.dateFrom || undefined,
        to: filters.dateTo || undefined,
      });
      setStats(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load statistics");
    }
  }, [filters.dateFrom, filters.dateTo]);

  const loadTabData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === "stats") {
        await loadStats();
      } else if (tab === "audit") {
        const data = await securityService.getAuditLogs({
          username: filters.username || undefined,
          role: filters.role || undefined,
          ipAddress: filters.ipAddress || undefined,
          module: filters.module || undefined,
          action: filters.action || undefined,
          status: filters.status || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          page: filters.page,
          pageSize: filters.pageSize,
        });
        setAudit(data);
      } else if (tab === "api") {
        const data = await securityService.getApiRequests({
          username: filters.username || undefined,
          role: filters.role || undefined,
          ipAddress: filters.ipAddress || undefined,
          endpoint: filters.endpoint || undefined,
          statusCode: filters.statusCode ? Number(filters.statusCode) : undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          page: filters.page,
          pageSize: filters.pageSize,
        });
        setApiLogs(data);
      } else if (tab === "events") {
        const data = await securityService.getEvents({
          eventType: filters.eventType || undefined,
          username: filters.username || undefined,
          ipAddress: filters.ipAddress || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          page: filters.page,
          pageSize: filters.pageSize,
        });
        setEvents(data);
      } else if (tab === "blocked") {
        const data = await securityService.getBlockedIps(false);
        setBlocked(data);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }, [tab, filters, loadStats]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value, page: 1 }));
  };

  const handleBlock = async (e) => {
    e.preventDefault();
    try {
      await securityService.blockIp({
        ipAddress: blockForm.ipAddress.trim(),
        reason: blockForm.reason,
        isPermanent: blockForm.isPermanent,
        expiresAt: blockForm.isPermanent ? null : blockForm.expiresAt || null,
      });
      setShowBlock(false);
      setBlockForm({ ipAddress: "", reason: "", isPermanent: true, expiresAt: "" });
      setTab("blocked");
      await loadTabData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to block IP");
    }
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Unblock this IP address?")) return;
    try {
      await securityService.unblockIp(id);
      await loadTabData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to unblock");
    }
  };

  const tabs = [
    { id: "stats", label: "Statistics" },
    { id: "audit", label: "Audit Logs" },
    { id: "api", label: "API Requests" },
    { id: "events", label: "Security Events" },
    { id: "blocked", label: "Blocked IPs" },
  ];

  const totalPages = (t) =>
    t?.pageSize ? Math.max(1, Math.ceil((t.totalCount || 0) / t.pageSize)) : 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Security Monitoring</h1>
        <button
          onClick={() => setShowBlock(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Block IP
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-t-lg text-sm font-medium ${
              tab === t.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-white p-3 rounded-lg shadow-sm">
        <input name="username" placeholder="User" value={filters.username} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <input name="role" placeholder="Role" value={filters.role} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <input name="ipAddress" placeholder="IP Address" value={filters.ipAddress} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <input name="module" placeholder="Module" value={filters.module} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <input name="action" placeholder="Action" value={filters.action} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <input name="endpoint" placeholder="Endpoint" value={filters.endpoint} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <input name="eventType" placeholder="Event Type" value={filters.eventType} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <input name="statusCode" placeholder="Status Code" value={filters.statusCode} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <input type="datetime-local" name="dateFrom" value={filters.dateFrom} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <input type="datetime-local" name="dateTo" value={filters.dateTo} onChange={onFilterChange} className="border rounded px-2 py-1 text-sm" />
        <button onClick={loadTabData} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Apply</button>
        <button onClick={() => setFilters(emptyFilters)} className="px-3 py-1 bg-gray-200 rounded text-sm">Reset</button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}
      {loading && <div className="text-gray-500">Loading…</div>}

      {/* Statistics */}
      {tab === "stats" && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["Total API Requests", stats.totalApiRequests],
              ["Failed Logins", stats.failedLogins],
              ["Rate-Limited", stats.rateLimitedRequests],
              ["Blocked IPs", stats.activeBlockedIps],
              ["401 Unauthorized", stats.unauthorized401],
              ["403 Forbidden", stats.forbidden403],
              ["High Activity Events", stats.highRequestActivityCount],
            ].map(([label, val]) => (
              <div key={label} className="bg-white rounded-xl shadow p-4">
                <div className="text-sm text-gray-500">{label}</div>
                <div className="text-2xl font-bold text-gray-800">{val ?? 0}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">High Request Activity</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">IP</th>
                  <th>User</th>
                  <th>Requests</th>
                </tr>
              </thead>
              <tbody>
                {(stats.highActivity || []).map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-1.5 font-mono">{row.ipAddress || "—"}</td>
                    <td>{row.username || "unknown"}</td>
                    <td>{row.requestCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit */}
      {tab === "audit" && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-2">Time</th>
                <th className="p-2">User</th>
                <th className="p-2">Role</th>
                <th className="p-2">Action</th>
                <th className="p-2">Module</th>
                <th className="p-2">Entity</th>
                <th className="p-2">IP</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(audit.items || []).map((r) => (
                <tr key={r.auditLogId} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="p-2">{r.username || "—"}</td>
                  <td className="p-2">{r.role || "—"}</td>
                  <td className="p-2">{r.action}</td>
                  <td className="p-2">{r.module || "—"}</td>
                  <td className="p-2">{[r.entityName, r.entityId].filter(Boolean).join(" #") || "—"}</td>
                  <td className="p-2 font-mono">{r.ipAddress || "—"}</td>
                  <td className="p-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={filters.page}
            totalPages={totalPages(audit)}
            onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </div>
      )}

      {/* API */}
      {tab === "api" && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-2">Time</th>
                <th className="p-2">IP</th>
                <th className="p-2">User</th>
                <th className="p-2">Endpoint</th>
                <th className="p-2">Method</th>
                <th className="p-2">Status</th>
                <th className="p-2">ms</th>
              </tr>
            </thead>
            <tbody>
              {(apiLogs.items || []).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="p-2 font-mono">{r.ipAddress || "—"}</td>
                  <td className="p-2">{r.username || "—"}</td>
                  <td className="p-2 max-w-xs truncate">{r.endpoint}</td>
                  <td className="p-2">{r.httpMethod}</td>
                  <td className={`p-2 ${r.statusCode >= 400 ? "text-red-600" : ""}`}>
                    {r.statusCode}{r.wasRateLimited ? " (RL)" : ""}
                  </td>
                  <td className="p-2">{r.responseTimeMs}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={filters.page}
            totalPages={totalPages(apiLogs)}
            onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </div>
      )}

      {/* Events */}
      {tab === "events" && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-2">Time</th>
                <th className="p-2">Type</th>
                <th className="p-2">User</th>
                <th className="p-2">IP</th>
                <th className="p-2">Description</th>
                <th className="p-2">Severity</th>
              </tr>
            </thead>
            <tbody>
              {(events.items || []).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="p-2">{r.eventType}</td>
                  <td className="p-2">{r.username || "—"}</td>
                  <td className="p-2 font-mono">{r.ipAddress || "—"}</td>
                  <td className="p-2">{r.description}</td>
                  <td className="p-2">{r.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={filters.page}
            totalPages={totalPages(events)}
            onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </div>
      )}

      {/* Blocked IPs */}
      {tab === "blocked" && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-2">IP Address</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Blocked By</th>
                <th className="p-2">Blocked At</th>
                <th className="p-2">Expires At</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {(blocked || []).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 font-mono">{r.ipAddress}</td>
                  <td className="p-2">{r.reason || "—"}</td>
                  <td className="p-2">{r.blockedByUsername || "—"}</td>
                  <td className="p-2">{new Date(r.blockedAt).toLocaleString()}</td>
                  <td className="p-2">{r.expiresAt ? new Date(r.expiresAt).toLocaleString() : "Permanent"}</td>
                  <td className="p-2">{r.isActive ? "Active" : "Inactive"}</td>
                  <td className="p-2">
                    {r.isActive && (
                      <button
                        onClick={() => handleUnblock(r.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        Unblock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Block IP Dialog */}
      {showBlock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleBlock}
            className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl"
          >
            <h2 className="text-xl font-bold">Block IP Address</h2>
            <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
              Warning: Blocking an IP address may affect multiple hospital users if they share the same network/public IP (NAT).
            </p>
            <div>
              <label className="block text-sm font-medium">IP Address</label>
              <input
                required
                value={blockForm.ipAddress}
                onChange={(e) => setBlockForm({ ...blockForm, ipAddress: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="192.168.1.25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Reason</label>
              <input
                value={blockForm.reason}
                onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="Excessive API requests"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={blockForm.isPermanent}
                  onChange={() => setBlockForm({ ...blockForm, isPermanent: true })}
                />
                Permanent
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={!blockForm.isPermanent}
                  onChange={() => setBlockForm({ ...blockForm, isPermanent: false })}
                />
                Temporary
              </label>
            </div>
            {!blockForm.isPermanent && (
              <div>
                <label className="block text-sm font-medium">Expiration</label>
                <input
                  type="datetime-local"
                  required={!blockForm.isPermanent}
                  value={blockForm.expiresAt}
                  onChange={(e) => setBlockForm({ ...blockForm, expiresAt: e.target.value })}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowBlock(false)} className="px-4 py-2 bg-gray-200 rounded">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">
                Block IP
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 text-sm">
      <span>
        Page {page} / {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Prev
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
