import { useState } from 'react';

export default function ImageUpload({ onFileChange, previewUrl, disabled }) {
  const [localPreview, setLocalPreview] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setLocalPreview(URL.createObjectURL(file));
    } else {
      setLocalPreview(null);
    }
    onFileChange?.(file);
  };

  const src = localPreview || previewUrl;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <i className="bi bi-cloud-upload text-indigo-600" />
        Upload Image
      </h3>
      <input
        type="file"
        accept="image/*,.dcm"
        disabled={disabled}
        onChange={handleChange}
        className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700"
      />
      {src ? (
        <img src={src} alt="Preview" className="max-h-64 rounded-lg border border-gray-200 object-contain w-full bg-slate-900" />
      ) : (
        <p className="text-xs text-gray-500">Select an image file to preview before upload.</p>
      )}
    </div>
  );
}
