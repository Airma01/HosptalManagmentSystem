import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../../../../Config/API";

export default function PregnancyList() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const apiBase = `/api/doctor/patient/${patientId}/maternal-child`;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`${apiBase}/pregnancies`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pregnancies.");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <button type="button" onClick={() => navigate(base)} className="text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> Dashboard</button>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-800">Pregnancies</span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="px-3 py-1.5 border rounded-lg text-xs text-slate-600"><i className="bi bi-arrow-clockwise" /></button>
          <Link to={`${base}/pregnancies/register`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700">
            <i className="bi bi-plus-lg" /> Register
          </Link>
        </div>
      </div>
      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">Loading pregnancies...</div>}
      {error && !loading && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-sm">
          No pregnancy records found.
          <div className="mt-3"><Link to={`${base}/pregnancies/register`} className="text-rose-600 font-medium">Register Pregnancy</Link></div>
        </div>
      )}
      {!loading && rows.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">LMP</th>
                  <th className="px-4 py-3">EDD</th>
                  <th className="px-4 py-3">Gravida/Para</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((p) => (
                  <tr key={p.pregnancyID} className="hover:bg-slate-50">
                    <td className="px-4 py-3">#{p.pregnancyID}</td>
                    <td className="px-4 py-3">{p.lastMenstrualPeriod ? new Date(p.lastMenstrualPeriod).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">{p.expectedDeliveryDate ? new Date(p.expectedDeliveryDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">{p.gravida ?? "—"} / {p.para ?? "—"}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100">{p.status ?? "—"}</span></td>
                    <td className="px-4 py-3">{p.registrationDate ? new Date(p.registrationDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`${base}/pregnancy/${p.pregnancyID}`} className="text-rose-600 text-xs font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
