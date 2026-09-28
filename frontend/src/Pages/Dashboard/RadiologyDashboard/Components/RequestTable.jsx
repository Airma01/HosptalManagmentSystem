import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

function PaymentBadge({ status }) {
  const paid = String(status || '').toLowerCase() === 'paid';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        paid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
      }`}
    >
      <i className={`bi ${paid ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} text-[11px]`} />
      {paid ? 'Paid' : 'Unpaid'}
    </span>
  );
}

/**
 * rows may include paymentStatus / canProcess from queue merge
 */
export default function RequestTable({
  rows = [],
  detailsBase = '/radiology/radiographer/requests',
  emptyMessage = 'No radiology requests found.',
  onProcess,
}) {
  if (!rows.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
        {emptyMessage}
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
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const id = r.radiologyRequestID ?? r.RadiologyRequestID;
              const paymentStatus =
                r.paymentStatus ?? r.PaymentStatus ?? 'Unpaid';
              const canProcess =
                r.canProcess ??
                r.CanProcess ??
                String(paymentStatus).toLowerCase() === 'paid';

              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {r.patientName || r.PatientName || '—'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.patientMRN || r.mrn || r.MRN || ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.testName || r.testType || r.TestName || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {r.departmentName || r.DepartmentName || '—'}
                  </td>
                  <td className="px-4 py-3">{r.doctorName || r.DoctorName || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.requestDate || r.RequestDate
                      ? new Date(r.requestDate || r.RequestDate).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status || r.clinicalStatus || r.Status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`${detailsBase}/${id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <i className="bi bi-eye" /> View
                      </Link>
                      {onProcess ? (
                        <button
                          type="button"
                          disabled={!canProcess}
                          title={
                            canProcess
                              ? 'Perform examination'
                              : 'Unpaid — Radiology Cashier first'
                          }
                          onClick={() => onProcess(id, canProcess)}
                          className={`inline-flex items-center gap-1 font-medium ${
                            canProcess
                              ? 'text-violet-600 hover:text-violet-800'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <i className="bi bi-play-circle" /> Process
                        </button>
                      ) : null}
                    </div>
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
