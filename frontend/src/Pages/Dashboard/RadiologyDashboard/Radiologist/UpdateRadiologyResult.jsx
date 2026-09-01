import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';
import ReportForm from '../Components/ReportForm';

export default function UpdateRadiologyResult() {
  const { id } = useParams();
  const [resultDescription, setResultDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/radiology/Radiologist/results/${id}`);
      setResultDescription(res.data.resultDescription || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load result.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await API.put(`/radiology/Radiologist/results/${id}/report`, {
        radiologyResultID: Number(id),
        resultDescription,
      });
      setMessage('Report saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-xl font-bold">Update Report</h2>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      {message ? <div className="text-sm text-green-600">{message}</div> : null}
      <ReportForm value={resultDescription} onChange={setResultDescription} onSubmit={submit} submitting={submitting} />
    </div>
  );
}
