import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../../../Config/API';

const CreateTriage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get('visitId') || '';

  const [formData, setFormData] = useState({
    visitId: visitId,
    triageDepartmentId: '',
    clinicalDepartmentId: '',
    temprature: '',
    bloodPressure: '',
    heartRate: '',
    respiratyRate: '',
    weight: '',
    notes: '',
  });
  const [triageDepts, setTriageDepts] = useState([]);
  const [clinicalDepts, setClinicalDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const [triageRes, clinicalRes] = await Promise.all([
          API.get('/Hospital/nurse/Nurse/triage-departments'),
          API.get('/Hospital/nurse/Nurse/clinical-departments'),
        ]);
        setTriageDepts(triageRes.data);
        setClinicalDepts(clinicalRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.clinicalDepartmentId) {
      setError('Clinical Department is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        visitId: formData.visitId,
        triageDepartmentId: formData.triageDepartmentId || null,
        clinicalDepartmentId: formData.clinicalDepartmentId,
        temprature: formData.temprature || null,
        bloodPressure: formData.bloodPressure || null,
        heartRate: formData.heartRate || null,
        respiratyRate: formData.respiratyRate || null,
        weight: formData.weight || null,
        notes: formData.notes || null,
      };
      await API.post('/Hospital/nurse/Nurse/create-triage', payload);
      setSuccess('Triage created successfully.');
      setTimeout(() => navigate('/nurse/triage/pending'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Create Triage</h1>
        <p className="text-slate-500 text-sm mt-1">
          Record triage information and optional vital signs for an existing visit
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
          <i className="bi bi-exclamation-circle text-red-500 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
          <i className="bi bi-check-circle text-emerald-600 mt-0.5" />
          <p className="text-emerald-700 text-sm font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Visit */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <i className="bi bi-calendar2-check text-teal-600" />
              Visit
            </h2>
          </div>
          <div className="p-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Visit ID <span className="text-red-500">*</span>
            </label>
            <input
              name="visitId"
              value={formData.visitId}
              readOnly
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
            />
          </div>
        </section>

        {/* Department */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <i className="bi bi-building text-teal-600" />
              Department
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Clinical Department <span className="text-red-500">*</span>
              </label>
              <select
                name="clinicalDepartmentId"
                value={formData.clinicalDepartmentId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white font-medium"
              >
                <option value="">Select clinical department</option>
                {clinicalDepts.map((d) => (
                  <option key={d.clinicalDepartmentID} value={d.clinicalDepartmentID}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
              {formData.clinicalDepartmentId && (
                <p className="mt-1.5 text-xs text-teal-700 flex items-center gap-1">
                  <i className="bi bi-check-circle-fill" />
                  {clinicalDepts.find(
                    (d) => String(d.clinicalDepartmentID) === String(formData.clinicalDepartmentId)
                  )?.departmentName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Triage Department
              </label>
              <select
                name="triageDepartmentId"
                value={formData.triageDepartmentId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
              >
                <option value="">Select triage department (optional)</option>
                {triageDepts.map((d) => (
                  <option key={d.triageDepartmentID} value={d.triageDepartmentID}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Vital Signs */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <i className="bi bi-heart-pulse text-teal-600" />
                Vital Signs
              </h2>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Empty fields will not block submission</p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <i className="bi bi-speedometer2 mr-1 text-slate-400" /> Weight
              </label>
              <div className="relative">
                <input
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="—"
                  className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <i className="bi bi-thermometer-half mr-1 text-slate-400" /> Temperature
              </label>
              <div className="relative">
                <input
                  name="temprature"
                  value={formData.temprature}
                  onChange={handleChange}
                  placeholder="—"
                  className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">°C</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <i className="bi bi-droplet mr-1 text-slate-400" /> Blood Pressure
              </label>
              <input
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                placeholder="e.g. 120/80"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <i className="bi bi-heart mr-1 text-slate-400" /> Heart Rate
              </label>
              <div className="relative">
                <input
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleChange}
                  placeholder="—"
                  className="w-full px-3 py-2.5 pr-12 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">bpm</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <i className="bi bi-wind mr-1 text-slate-400" /> Respiratory Rate
              </label>
              <div className="relative">
                <input
                  name="respiratyRate"
                  value={formData.respiratyRate}
                  onChange={handleChange}
                  placeholder="—"
                  className="w-full px-3 py-2.5 pr-14 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">/min</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <i className="bi bi-journal-text mr-1 text-slate-400" /> Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional clinical notes (optional)"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg" />
                Create Triage
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTriage;