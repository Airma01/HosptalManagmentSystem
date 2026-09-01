import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import ExaminationInfo from '../Components/ExaminationInfo';
import ImageViewer from '../Components/ImageViewer';
import LoadingSpinner from '../Components/LoadingSpinner';
import PatientInfo from '../Components/PatientInfo';

export default function RadiologyResultDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/radiology/RadiologyResult/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Load failed.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Radiology Report #{data.radiologyResultID}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PatientInfo data={data} />
        <ExaminationInfo
          data={{
            radiologyRequestID: data.radiologyRequestID,
            testName: data.testName,
            departmentName: data.departmentName,
            doctorName: data.doctorName,
            requestDate: data.requestDate,
            status: data.requestStatus,
            chiefComplaint: data.chiefComplaint,
            historyOfPresentIllness: data.historyOfPresentIllness,
            assessment: data.assessment,
          }}
        />
      </div>
      <ImageViewer results={[data]} />
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-2">Findings / Impression</h3>
        <p className="text-sm whitespace-pre-wrap text-gray-800">{data.resultDescription || '—'}</p>
        <p className="text-xs text-gray-500 mt-3">
          Technician: {data.radiologyTechnicianName || '—'} · {data.resultDate ? new Date(data.resultDate).toLocaleString() : ''}
        </p>
      </div>
    </div>
  );
}
