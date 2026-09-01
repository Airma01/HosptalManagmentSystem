import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import ExaminationInfo from '../Components/ExaminationInfo';
import ImageViewer from '../Components/ImageViewer';
import LoadingSpinner from '../Components/LoadingSpinner';
import PatientInfo from '../Components/PatientInfo';
import ReportForm from '../Components/ReportForm';
import FinalizeRadiologyResult from './FinalizeRadiologyResult';

export default function RadiologyResultWorkup() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [resultDescription, setResultDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/radiology/Radiologist/results/${id}`);
      setData(res.data);
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

  const saveReport = async () => {
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await API.put(`/radiology/Radiologist/results/${id}/report`, {
        radiologyResultID: Number(id),
        resultDescription,
      });
      setData(res.data);
      setMessage('Report saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !data) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Result #{data.radiologyResultID}</h2>
          <p className="text-sm text-gray-500">Request #{data.radiologyRequestID} · {data.requestStatus}</p>
        </div>
        <Link to="/radiology/radiologist/queue" className="px-3 py-2 rounded-lg border text-sm">Back to queue</Link>
      </div>

      {message ? <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">{message}</div> : null}
      {error ? <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div> : null}

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

      <ReportForm
        value={resultDescription}
        onChange={setResultDescription}
        onSubmit={saveReport}
        submitting={submitting}
        submitLabel="Save Findings / Impression"
      />

      <FinalizeRadiologyResult resultDescription={resultDescription} />
    </div>
  );
}
