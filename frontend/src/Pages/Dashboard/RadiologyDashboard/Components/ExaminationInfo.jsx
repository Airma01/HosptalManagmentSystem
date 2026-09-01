export default function ExaminationInfo({ data }) {
  if (!data) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <i className="bi bi-clipboard2-pulse text-indigo-600" />
        Examination Information
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Request ID</dt>
          <dd className="font-medium text-gray-900">{data.radiologyRequestID ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Test</dt>
          <dd className="font-medium text-gray-900">{data.testName || '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Department</dt>
          <dd className="font-medium text-gray-900">{data.departmentName || '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Doctor</dt>
          <dd className="font-medium text-gray-900">{data.doctorName || '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Request Date</dt>
          <dd className="font-medium text-gray-900">
            {data.requestDate ? new Date(data.requestDate).toLocaleString() : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Status</dt>
          <dd className="font-medium text-gray-900">{data.status || '—'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-gray-500">Clinical indication (Chief complaint)</dt>
          <dd className="font-medium text-gray-900 whitespace-pre-wrap">{data.chiefComplaint || '—'}</dd>
        </div>
        {data.historyOfPresentIllness ? (
          <div className="sm:col-span-2">
            <dt className="text-gray-500">History of present illness</dt>
            <dd className="font-medium text-gray-900 whitespace-pre-wrap">{data.historyOfPresentIllness}</dd>
          </div>
        ) : null}
        {data.assessment ? (
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Assessment</dt>
            <dd className="font-medium text-gray-900 whitespace-pre-wrap">{data.assessment}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
