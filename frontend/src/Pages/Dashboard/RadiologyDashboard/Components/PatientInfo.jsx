export default function PatientInfo({ data }) {
  if (!data) return null;
  const name =
    data.patientName ||
    [data.patientFirstName, data.patientLastName].filter(Boolean).join(' ') ||
    '—';
  const age = (() => {
    if (!data.patientDateOfBirth) return null;
    const dob = new Date(data.patientDateOfBirth);
    if (Number.isNaN(dob.getTime())) return null;
    const today = new Date();
    let a = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
    return a;
  })();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <i className="bi bi-person-vcard text-indigo-600" />
        Patient Information
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Name</dt>
          <dd className="font-medium text-gray-900">{name}</dd>
        </div>
        <div>
          <dt className="text-gray-500">MRN</dt>
          <dd className="font-medium text-gray-900">{data.patientMRN || '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Patient ID</dt>
          <dd className="font-medium text-gray-900">{data.patientID ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Gender</dt>
          <dd className="font-medium text-gray-900">
            {data.patientGender === 0 || data.patientGender === 'Male'
              ? 'Male'
              : data.patientGender === 1 || data.patientGender === 'Female'
                ? 'Female'
                : data.patientGender ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Age</dt>
          <dd className="font-medium text-gray-900">{age != null ? `${age} yrs` : '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Phone</dt>
          <dd className="font-medium text-gray-900">{data.patientPhone || '—'}</dd>
        </div>
      </dl>
    </div>
  );
}
