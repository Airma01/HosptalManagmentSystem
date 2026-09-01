import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function RequestTable({ rows = [], detailsBase = '/radiology/radiographer/requests' }) {
  if (!rows.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
        No radiology requests found.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Patient</th>
              <th className="px-4 py-3 font-semibold">Examination</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Doctor</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const id = r.radiologyRequestID ?? r.RadiologyRequestID;
              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.patientName || '—'}</div>
                    <div className="text-xs text-gray-500">{r.patientMRN || ''}</div>
                  </td>
                  <td className="px-4 py-3">{r.testName || '—'}</td>
                  <td className="px-4 py-3">{r.departmentName || '—'}</td>
                  <td className="px-4 py-3">{r.doctorName || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.requestDate ? new Date(r.requestDate).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`${detailsBase}/${id}`}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <i className="bi bi-eye" /> View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
