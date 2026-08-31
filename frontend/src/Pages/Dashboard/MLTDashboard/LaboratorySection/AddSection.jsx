import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../../../Config/API';
import MLTError from '../MLTError';
import MLTMessage from '../MLTMessage';

export default function AddSection() {
  const navigate = useNavigate();
  const [sectionName, setSectionName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      setError('Section name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      // MLTSectionCreateDto: sectionName, description
      const res = await API.post('/mlt/MLTSection', {
        sectionName: sectionName.trim(),
        description: description.trim() || null,
      });
      setMessage(
        res.data?.message ||
          `Laboratory section "${res.data?.sectionName || sectionName}" created successfully.`
      );
      setTimeout(() => navigate('/mlt/laboratory-sections'), 800);
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setError(err.response?.data?.message || 'Laboratory section already exists.');
      } else if (status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/Bishoftu/login'), 1500);
      } else {
        setError(err.response?.data?.message || 'Failed to create laboratory section.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-xl">
        <Link
          to="/mlt/laboratory-sections"
          className="mb-4 inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
        >
          <i className="bi bi-arrow-left" /> Back to Laboratory Sections
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            <i className="bi bi-plus-circle mr-2 text-teal-600" />
            Add Laboratory Section
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a medical laboratory category (e.g. Hematology, Microbiology).
          </p>

          {message && <div className="mt-4"><MLTMessage message={message} type="success" /></div>}
          {error && <div className="mt-4"><MLTError title="Could not save section" message={error} /></div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Section Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                required
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g. Hematology"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            {/* No Status field on LaboratorySection model — omitted intentionally */}
            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
              <Link
                to="/mlt/laboratory-sections"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle" /> Save Section
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}