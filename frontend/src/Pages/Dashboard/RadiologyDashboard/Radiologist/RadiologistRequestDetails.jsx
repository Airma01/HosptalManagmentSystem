import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import ExaminationInfo from '../Components/ExaminationInfo';
import ImageViewer from '../Components/ImageViewer';
import LoadingSpinner from '../Components/LoadingSpinner';
import PatientInfo from '../Components/PatientInfo';

export default function RadiologistRequestDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/radiology/Radiologist/requests/${id}`);
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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return null;

  const latest = (data.results || [])[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Request #{data.radiologyRequestID}</h2>
        <div className="flex gap-2">
          <Link to="/radiology/radiologist/queue" className="px-3 py-2 rounded-lg border text-sm">Back</Link>
          {latest ? (
            <Link to={`/radiology/radiologist/results/${latest.radiologyResultID}`} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">
              Open Result / Report
            </Link>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PatientInfo data={data} />
        <ExaminationInfo data={data} />
      </div>
      <ImageViewer results={data.results || []} />
    </div>
  );
}
