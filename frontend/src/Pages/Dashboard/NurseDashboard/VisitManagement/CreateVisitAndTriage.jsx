import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../../../Config/API';

const CreateVisitAndTriage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preFilledPatientId = searchParams.get('patientId') || '';

  const [formData, setFormData] = useState({
    patientId: preFilledPatientId,
    visitDate: '',
    visitType: 'Outpatient',
    status: 'Scheduled',
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

  // Patient search state
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

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

  // Pre-fill patient if patientId is in URL
  useEffect(() => {
    if (preFilledPatientId) {
      setFormData((prev) => ({ ...prev, patientId: preFilledPatientId }));
      // Try to load patient details for display
      API.get(`/Hospital/nurse/Nurse/patient/${preFilledPatientId}`)
        .then((res) => {
          setSelectedPatient(res.data);
        })
        .catch(() => {});
    }
  }, [preFilledPatientId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Case-insensitive patient search (frontend normalization)
  const searchPatients = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setPatientResults([]);
      setShowDropdown(false);
      return;
    }

    setSearchingPatients(true);
    try {
      // Send original query; backend may be case-sensitive.
      // We also send lowercase variants conceptually by normalizing results client-side.
      const res = await API.get('/Hospital/nurse/Nurse/search-patients', {
        params: {
          MRN: trimmed,
          FirstName: trimmed,
          LastName: trimmed,
        },
      });

      const normalizedQuery = trimmed.toLowerCase();
      // Frontend case-insensitive filter so "ermi", "Ermi", "ERMI" match the same results
      const filtered = (res.data || []).filter((p) => {
        const mrn = (p.mrn || '').toLowerCase();
        const first = (p.firstName || '').toLowerCase();
        const last = (p.lastName || '').toLowerCase();
        const full = `${first} ${last}`.trim();
        return (
          mrn.includes(normalizedQuery) ||
          first.includes(normalizedQuery) ||
          last.includes(normalizedQuery) ||
          full.includes(normalizedQuery)
        );
      });

      setPatientResults(filtered);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
      setPatientResults([]);
    } finally {
      setSearchingPatients(false);
    }
  };

  const handlePatientQueryChange = (e) => {
    const value = e.target.value;
    setPatientQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPatients(value), 300);
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData((prev) => ({ ...prev, patientId: patient.patientId }));
    setPatientQuery('');
    setPatientResults([]);
    setShowDropdown(false);
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setFormData((prev) => ({ ...prev, patientId: '' }));
    setPatientQuery('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.patientId) {
      setError('Please select a patient.');
      return;
    }
    if (!formData.clinicalDepartmentId) {
      setError('Clinical Department is required.');
      return;
    }

    setLoading(true);
    try {
      // Preserve existing request structure & field names (including backend typos)
      const payload = {
        patientId: formData.patientId,
        visitDate: formData.visitDate,
        visitType: formData.visitType,
        status: formData.status,
        triageDepartmentId: formData.triageDepartmentId || null,
        clinicalDepartmentId: formData.clinicalDepartmentId,
        temprature: formData.temprature || null,
        bloodPressure: formData.bloodPressure || null,
        heartRate: formData.heartRate || null,
        respiratyRate: formData.respiratyRate || null,
        weight: formData.weight || null,
        notes: formData.notes || null,
      };

      await API.post('/Hospital/nurse/Nurse/create-visit-triage', payload);
      setSuccess('Visit and triage created successfully.');
      setTimeout(() => navigate('/nurse/visits/today'), 1200);
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Create Visit &amp; Triage
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Select patient → choose clinical department → optional vital signs → submit
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
        {/* ── Patient Section ── */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <i className="bi bi-person text-teal-600" />
              Patient
              <span className="text-red-500">*</span>
            </h2>
          </div>
          <div className="p-5">
            {selectedPatient ? (
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-teal-50 border border-teal-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <i className="bi bi-person-check text-teal-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      MRN: <span className="font-medium">{selectedPatient.mrn}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedPatient.gender}
                      {selectedPatient.phone ? ` · ${selectedPatient.phone}` : ''}
                    </p>
                    <p className="text-xs text-teal-700 font-medium mt-2 flex items-center gap-1">
                      <i className="bi bi-check-circle-fill" /> Patient selected
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearPatient}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Change patient"
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            ) : (
              <div ref={searchRef} className="relative">
                <div className="relative">
                  <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={patientQuery}
                    onChange={handlePatientQueryChange}
                    onFocus={() => patientResults.length > 0 && setShowDropdown(true)}
                    placeholder="Search patient by name or MRN..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                    autoComplete="off"
                  />
                  {searchingPatients && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {showDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {patientResults.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">
                        No patients found
                      </div>
                    ) : (
                      patientResults.map((p) => (
                        <button
                          key={p.patientId}
                          type="button"
                          onClick={() => selectPatient(p)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <p className="font-medium text-slate-800 text-sm">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            MRN: {p.mrn}
                            {p.gender ? ` · ${p.gender}` : ''}
                            {p.phone ? ` · ${p.phone}` : ''}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Visit Information ── */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <i className="bi bi-calendar2-plus text-teal-600" />
              Visit Information
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Visit Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Visit Type <span className="text-red-500">*</span>
              </label>
              <input
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                required
                placeholder="e.g. Outpatient"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── Department ── */}
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

        {/* ── Vital Signs (Optional) ── */}
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
            <p className="text-xs text-slate-500 mt-1">Enter available measurements — empty fields will not block submission</p>
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

        {/* Submit */}
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
                Create Visit &amp; Triage
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVisitAndTriage;