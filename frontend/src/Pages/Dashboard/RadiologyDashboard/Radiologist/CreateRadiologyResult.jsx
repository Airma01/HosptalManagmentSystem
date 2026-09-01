import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import ReportForm from '../Components/ReportForm';

/** Creates result via POST /radiology/RadiologyResult using CreateRadiologyResultDto */
export default function CreateRadiologyResult() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [resultDescription, setResultDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const body = {
        radiologyRequestID: Number(requestId),
        resultDescription,
        imageName: '',
        imagePath: '',
      };
      const res = await API.post('/radiology/RadiologyResult', body);
      navigate(`/radiology/radiologist/results/${res.data.radiologyResultID}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create result.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-xl font-bold">Create Radiology Result</h2>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <ReportForm value={resultDescription} onChange={setResultDescription} onSubmit={submit} submitting={submitting} submitLabel="Create Result" />
    </div>
  );
}
