import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import MLTError from '../MLTError';
import MLTMessage from '../MLTMessage';

export default function SectionDetails() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editType, setEditType] = useState(null);
  const [editForm, setEditForm] = useState({ testName: '', price: 0, normalRange: 0, description: '' });
  const [saving, setSaving] = useState(false);
  const [editSectionOpen, setEditSectionOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({ sectionName: '', description: '' });

  const load = useCallback(async () => {
    if (!sectionId) return;
    setLoading(true);
    setError('');
    try {
      // Prefer detail endpoint (section + nested types)
      const detailRes = await API.get(`/mlt/MLTSection/${sectionId}`);
      setSection(detailRes.data);
      setSectionForm({
        sectionName: detailRes.data?.sectionName || '',
        description: detailRes.data?.description || '',
      });

      // Also load dedicated by-section list (keeps in sync with dropdown API)
      try {
        const typesRes = await API.get(`/mlt/MLTTestType/section/${sectionId}`);
        setTestTypes(Array.isArray(typesRes.data) ? typesRes.data : detailRes.data?.testTypes || []);
      } catch {
        setTestTypes(Array.isArray(detailRes.data?.testTypes) ? detailRes.data.testTypes : []);
      }
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Laboratory section not found.'
          : err.response?.data?.message || 'Unable to load section details.';
      setError(msg);
      if (err.response?.status === 401) {
        setTimeout(() => navigate('/Bishoftu/login'), 1500);
      }
    } finally {
      setLoading(false);
    }
  }, [sectionId, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const openEditType = (t) => {
    setEditType(t);
    setEditForm({
      testName: t.testName || '',
      price: t.price ?? 0,
      normalRange: t.normalRange ?? 0,
      description: t.description || '',
    });
  };

  const saveEditType = async (e) => {
    e.preventDefault();
    if (!editType) return;
    setSaving(true);
    setError('');
    try {
      // MLTTestTypeUpdateDto
      const res = await API.put('/mlt/MLTTestType', {
        laboratoryTestTypeID: editType.laboratoryTestTypeID,
        laboratorySectionID: Number(sectionId),
        testName: editForm.testName.trim(),
        price: Number(editForm.price) || 0,
        normalRange: Number(editForm.normalRange) || 0,
        description: editForm.description?.trim() || null,
      });
      setMessage('Test type updated successfully.');
      setEditType(null);
      setTestTypes((prev) =>
        prev.map((x) =>
          x.laboratoryTestTypeID === res.data.laboratoryTestTypeID ? res.data : x
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update test type.');
    } finally {
      setSaving(false);
    }
  };

  const deleteType = async (id) => {
    if (!window.confirm('Delete this test type? This only works if no laboratory tests reference it.')) {
      return;
    }
    setError('');
    try {
      const res = await API.delete(`/mlt/MLTTestType/${id}`);
      setMessage(res.data?.message || 'Test type deleted.');
      setTestTypes((prev) => prev.filter((t) => t.laboratoryTestTypeID !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete test type.');
    }
  };

  const saveSection = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await API.put('/mlt/MLTSection', {
        laboratorySectionID: Number(sectionId),
        sectionName: sectionForm.sectionName.trim(),
        description: sectionForm.description?.trim() || null,
      });
      setMessage('Laboratory section updated successfully.');
      setSection((prev) =>
        prev
          ? {
              ...prev,
              sectionName: res.data.sectionName,
              description: res.data.description,
            }
          : prev
      );
      setEditSectionOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update section.');
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async () => {
    if (
      !window.confirm(
        'Delete this laboratory section? Only allowed if it has no test types.'
      )
    ) {
      return;
    }
    try {
      const res = await API.delete(`/mlt/MLTSection/${sectionId}`);
      setMessage(res.data?.message || 'Section deleted.');
      setTimeout(() => navigate('/mlt/laboratory-sections'), 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete section.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/mlt/laboratory-sections"
          className="mb-4 inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
        >
          <i className="bi bi-arrow-left" /> Back to Laboratory Sections
        </Link>

        {message && <MLTMessage message={message} type="success" onClose={() => setMessage('')} />}
        {error && <MLTError message={error} onRetry={load} />}

        {loading ? (
          <div className="flex justify-center py-20 text-gray-500">
            <i className="bi bi-arrow-repeat mr-2 animate-spin text-2xl" />
            Loading section details…
          </div>
        ) : section ? (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <i className="bi bi-flask text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{section.sectionName}</h1>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Laboratory Section
                    </p>
                    {section.description ? (
                      <p className="mt-2 text-sm text-gray-600">{section.description}</p>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">No description</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditSectionOpen(true)}
                    className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <i className="bi bi-pencil mr-1" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={deleteSection}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <i className="bi bi-trash mr-1" /> Delete
                  </button>
                  <Link
                    to={`/mlt/laboratory-sections/${sectionId}/add-test-type`}
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    <i className="bi bi-plus-circle" /> Add Test Type
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Test Types</h2>

              {testTypes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                  <i className="bi bi-flask text-4xl text-gray-300" />
                  <h3 className="mt-3 text-lg font-semibold text-gray-800">No Test Types Yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This laboratory section does not have any test types configured.
                  </p>
                  <Link
                    to={`/mlt/laboratory-sections/${sectionId}/add-test-type`}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    <i className="bi bi-plus-circle" /> Add Test Type
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {testTypes.map((t) => (
                    <div
                      key={t.laboratoryTestTypeID}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.testName}</h3>
                          {t.description ? (
                            <p className="mt-1 text-sm text-gray-600">{t.description}</p>
                          ) : null}
                          <p className="mt-2 text-xs text-gray-500">
                            Price: {t.price != null ? Number(t.price).toFixed(2) : '—'}
                            {' · '}
                            Normal range: {t.normalRange ?? '—'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditType(t)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            <i className="bi bi-pencil" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteType(t.laboratoryTestTypeID)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            <i className="bi bi-trash" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* Edit section modal */}
        {editSectionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form
              onSubmit={saveSection}
              className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            >
              <h3 className="text-lg font-semibold">Edit Section</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Section Name *</label>
                  <input
                    required
                    maxLength={100}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={sectionForm.sectionName}
                    onChange={(e) =>
                      setSectionForm((f) => ({ ...f, sectionName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={sectionForm.description}
                    onChange={(e) =>
                      setSectionForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditSectionOpen(false)}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit test type modal */}
        {editType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form
              onSubmit={saveEditType}
              className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            >
              <h3 className="text-lg font-semibold">Edit Test Type</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Test Type Name *</label>
                  <input
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={editForm.testName}
                    onChange={(e) => setEditForm((f) => ({ ...f, testName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      value={editForm.price}
                      onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Normal range</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      value={editForm.normalRange}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, normalRange: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditType(null)}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}