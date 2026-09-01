import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../Config/API';

/**
 * CreateRadiologyRequestDto fields:
 * ConsultationID, PatientID, DoctorID, RadiologyTestTypeID, Status?
 * DoctorID is validated against JWT DoctorID claim on backend.
 */
export default function CreateRadiologyRequest() {
  const navigate = useNavigate();
  const [testTypes, setTestTypes] = useState([]);
  const [form, setForm] = useState({
    consultationID: '',
    patientID: '',
    doctorID: '',
    radiologyTestTypeID: '',
    status: 'Pending',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/radiology/RadiologyTestType').then((res) => setTestTypes(res.data || [])).catch(() => {});
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.doctorID || user.DoctorID) {
        setForm((f) => ({ ...f, doctorID: String(user.doctorID || user.DoctorID) }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const body = {
        consultationID: Number(form.consultationID),
        patientID: Number(form.patientID),
        doctorID: Number(form.doctorID),
        radiologyTestTypeID: Number(form.radiologyTestTypeID),
        status: form.status || 'Pending',
      };
      const res = await API.post('/radiology/RadiologyRequest', body);
      navigate(`/radiology/requests/${res.data.radiologyRequestID}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4 bg-white border rounded-xl p-5">
      <h2 className="text-xl font-bold">Create Radiology Request</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <input required type="number" placeholder="ConsultationID" value={form.consultationID} onChange={(e) => setForm({ ...form, consultationID: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <input required type="number" placeholder="PatientID" value={form.patientID} onChange={(e) => setForm({ ...form, patientID: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <input required type="number" placeholder="DoctorID (from login)" value={form.doctorID} onChange={(e) => setForm({ ...form, doctorID: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <select required value={form.radiologyTestTypeID} onChange={(e) => setForm({ ...form, radiologyTestTypeID: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
        <option value="">Select test type</option>
        {testTypes.map((t) => (
          <option key={t.radiologyTestTypeID} value={t.radiologyTestTypeID}>
            {t.departmentName ? `${t.departmentName} — ` : ''}{t.testName}
          </option>
        ))}
      </select>
      <button disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">{submitting ? 'Creating...' : 'Create Request'}</button>
    </form>
  );
}
