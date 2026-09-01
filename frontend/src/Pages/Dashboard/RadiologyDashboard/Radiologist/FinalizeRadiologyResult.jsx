import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../Config/API';

export default function FinalizeRadiologyResult({ resultDescription }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await API.put(`/radiology/Radiologist/results/${id}/finalize`, {
        radiologyResultID: Number(id),
        resultDescription: resultDescription || undefined,
      });
      setOpen(false);
      navigate('/radiology/radiologist/completed');
    } catch (err) {
      setError(err.response?.data?.message || 'Finalize failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium"
      >
        <i className="bi bi-check2-all mr-1" /> Finalize Report
      </button>
      {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Finalize Radiology Report?</h3>
            <p className="text-sm text-gray-600">
              After finalization, the parent request status is set to <strong>Completed</strong>. Ensure findings and impression are complete.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg border text-sm">Cancel</button>
              <button type="button" disabled={submitting} onClick={confirm} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm">
                {submitting ? 'Finalizing...' : 'Confirm Finalize'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
