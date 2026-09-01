import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import ImageUpload from '../Components/ImageUpload';

/** Dedicated upload page using POST /radiology/Radiographer/results/{requestId}/upload */
export default function UploadRadiologyImage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [resultDescription, setResultDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (!file) {
      setError('Select an image file.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      if (resultDescription) form.append('resultDescription', resultDescription);
      await API.post(`/radiology/Radiographer/results/${id}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Upload successful.');
      setTimeout(() => navigate(`/radiology/radiographer/requests/${id}`), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">Upload Radiology Image</h2>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      {message ? <div className="text-sm text-green-600">{message}</div> : null}
      <ImageUpload onFileChange={setFile} disabled={submitting} />
      <textarea
        rows={3}
        value={resultDescription}
        onChange={(e) => setResultDescription(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        placeholder="Optional ResultDescription"
      />
      <button type="button" onClick={submit} disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">
        {submitting ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
