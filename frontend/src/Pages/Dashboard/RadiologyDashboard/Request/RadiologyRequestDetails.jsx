import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import ExaminationInfo from '../Components/ExaminationInfo';
import ImageViewer from '../Components/ImageViewer';
import LoadingSpinner from '../Components/LoadingSpinner';
import PatientInfo from '../Components/PatientInfo';
import StatusBadge from '../Components/StatusBadge';

export default function RadiologyRequestDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/radiology/RadiologyRequest/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Load failed.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Request #{data.radiologyRequestID}</h2>
          <StatusBadge status={data.status} />
        </div>
        <Link to="/radiology/requests" className="px-3 py-2 border rounded-lg text-sm">Back</Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PatientInfo data={data} />
        <ExaminationInfo data={data} />
      </div>
      <ImageViewer results={data.results || []} />
      {(data.results || []).map((r) => (
        <div key={r.radiologyResultID} className="bg-white border rounded-xl p-4 text-sm">
          <p className="font-semibold">Result #{r.radiologyResultID}</p>
          <p className="text-gray-600 whitespace-pre-wrap mt-2">{r.resultDescription || 'No report text yet.'}</p>
        </div>
      ))}
    </div>
  );
}
