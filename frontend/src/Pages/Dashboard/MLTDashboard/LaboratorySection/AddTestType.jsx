import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import MLTError from '../MLTError';
import MLTMessage from '../MLTMessage';

export default function AddTestType() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [sectionName, setSectionName] = useState('');
  const [testName, setTestName] = useState('');
  const [price, setPrice] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [description, setDescription] = useState('');
  const [loadingSection, setLoadingSection] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSection = async () => {
      setLoadingSection(true);
      setError('');
      try {
        const res = await API.get(`/mlt/MLTSection/${sectionId}`);
        setSectionName(res.data?.sectionName || `Section #${sectionId}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Laboratory section not found.');
        if (err.response?.status === 401) {
          setTimeout(() => navigate('/Bishoftu/login'), 1500);
        }
      } finally {
        setLoadingSection(false);
      }
    };
    if (sectionId) loadSection();
  }, [sectionId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testName.trim()) {
      setError('Test type name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      // MLTTestTypeCreateDto — exact backend property names (camelCase JSON)
      const res = await API.post('/mlt/MLTTestType', {
        laboratorySectionID: Number(sectionId),
        testName: testName.trim(),
        price: price === '' ? 0 : Number(price),
        normalRange: normalRange === '' ? 0 : Number(normalRange),
        description: description.trim() || null,
      });
      setMessage(
        res.data?.message ||
          `Test type "${res.data?.testName || testName}" created successfully.`
      );
      setTimeout(
        () => navigate(`/mlt/laboratory-sections/${sectionId}`),
        800
      );
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setError(
          err.response?.data?.message ||
            'Test type already exists in this laboratory section.'
        );
      } else if (status === 404) {
        setError(err.response?.data?.message || 'Laboratory section not found.');
      } else if (status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/Bishoftu/login'), 1500);
      } else {
        setError(err.response?.data?.message || 'Failed to create test type.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-xl">
        <Link
          to={`/mlt/laboratory-sections/${sectionId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
        >
          <i className="bi bi-arrow-left" /> Back to Section
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            <i className="bi bi-plus-circle mr-2 text-teal-600" />
            Add Test Type
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            New test type will belong to the selected laboratory section.
          </p>

          {message && <div className="mt-4"><MLTMessage message={message} type="success" /></div>}
          {error && <div className="mt-4"><MLTError title="Could not save test type" message={error} /></div>}

          {loadingSection ? (
            <div className="mt-6 flex items-center gap-2 text-gray-500">
              <i className="bi bi-arrow-repeat animate-spin" /> Loading section…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Laboratory Section
                </label>
                <input
                  type="text"
                  readOnly
                  value={sectionName}
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Test Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g. CBC"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Normal range
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={normalRange}
                    onChange={(e) => setNormalRange(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* No SampleType or Status on LaboratoryTestType model — omitted */}

              <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                <Link
                  to={`/mlt/laboratory-sections/${sectionId}`}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || loadingSection}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle" /> Save Test Type
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}