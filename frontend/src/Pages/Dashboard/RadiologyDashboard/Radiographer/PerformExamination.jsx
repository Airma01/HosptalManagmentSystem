import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import ExaminationInfo from '../Components/ExaminationInfo';
import ImageUpload from '../Components/ImageUpload';
import LoadingSpinner from '../Components/LoadingSpinner';
import PatientInfo from '../Components/PatientInfo';
import { ensureRadiologyPaid } from '../Services/radiologyPaymentApi';

export default function PerformExamination() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [resultDescription, setResultDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [paymentOk, setPaymentOk] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Payment gate
      try {
        const pay = await ensureRadiologyPaid(id);
        setPaymentOk(true);
        setPaymentStatus(pay.data?.paymentStatus || 'Paid');
      } catch (payErr) {
        setPaymentOk(false);
        setPaymentStatus('Unpaid');
        setError(
          payErr?.response?.data?.message ||
            'Radiology request is unpaid. Patient must pay at Radiology Cashier before examination/result.'
        );
      }

      const res = await API.get(`/radiology/Radiographer/requests/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load request.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async () => {
    if (!paymentOk) {
      setError(
        'Radiology request is unpaid. Patient must pay at Radiology Cashier first.'
      );
      return;
    }
    if (!file) {
      setError('Please select an image file.');
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await ensureRadiologyPaid(id);
      const form = new FormData();
      form.append('file', file);
      if (resultDescription) {
        form.append('resultDescription', resultDescription);
      }
      await API.post(`/radiology/Radiographer/results/${id}/upload`, form);
      setMessage('Result submitted successfully. Request status is now Completed.');
      await load();
      setFile(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Upload failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!paymentOk) {
      setError(
        'Radiology request is unpaid. Patient must pay at Radiology Cashier first.'
      );
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await ensureRadiologyPaid(id);
      await API.put(`/radiology/Radiographer/requests/${id}/complete`);
      setMessage('Examination marked ready for review.');
      navigate(`/radiology/radiographer/requests/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete examination.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) {
    return (
      <div className="text-sm text-red-600">{error || 'Request not found.'}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Perform Examination</h2>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              paymentOk
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <i
              className={`bi ${
                paymentOk ? 'bi-check-circle-fill' : 'bi-x-circle-fill'
              }`}
            />
            {paymentStatus}
          </span>
        </div>
        <Link
          to={`/radiology/radiographer/requests/${id}`}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
        >
          Back
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">
          {message}
        </div>
      ) : null}

      {!paymentOk && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-sm flex items-center gap-2">
          <i className="bi bi-lock-fill" />
          Waiting for Radiology Cashier payment before upload / complete is allowed.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PatientInfo data={data} />
        <ExaminationInfo data={data} />
      </div>

      <ImageUpload onFileChange={setFile} disabled={submitting || !paymentOk} />

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="text-sm font-semibold text-gray-900">
          Notes / preliminary description (optional)
        </label>
        <textarea
          rows={4}
          value={resultDescription}
          onChange={(e) => setResultDescription(e.target.value)}
          disabled={!paymentOk}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
          placeholder="Optional notes stored in ResultDescription"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting || !paymentOk}
          onClick={handleUpload}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-60"
        >
          <i className="bi bi-cloud-upload mr-1" /> Upload Image &amp; Save Result
        </button>
        <button
          type="button"
          disabled={submitting || !paymentOk}
          onClick={handleComplete}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-60"
        >
          <i className="bi bi-check2-circle mr-1" /> Mark Ready for Review
        </button>
      </div>
    </div>
  );
}
