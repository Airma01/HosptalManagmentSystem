import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import ExaminationInfo from '../Components/ExaminationInfo';
import ImageViewer from '../Components/ImageViewer';
import LoadingSpinner from '../Components/LoadingSpinner';
import PatientInfo from '../Components/PatientInfo';
import StatusBadge from '../Components/StatusBadge';

export default function RadiographerRequestDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/radiology/Radiographer/requests/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load request details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Request #{data.radiologyRequestID}</h2>
          <div className="mt-1"><StatusBadge status={data.status} /></div>
        </div>
        <div className="flex gap-2">
          <Link to="/radiology/radiographer/queue" className="px-3 py-2 rounded-lg border border-gray-200 text-sm">Back</Link>
          <Link
            to={`/radiology/radiographer/requests/${id}/perform`}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium"
          >
            <i className="bi bi-play-circle mr-1" /> Perform Examination
          </Link>
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
