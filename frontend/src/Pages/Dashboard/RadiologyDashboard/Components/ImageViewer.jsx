import { useMemo, useState } from 'react';
import API from '../../../../Config/API';

function resolveUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (API.defaults.baseURL || '').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export default function ImageViewer({ results = [] }) {
  const images = useMemo(
    () =>
      (results || [])
        .filter((r) => r.imagePath || r.ImagePath)
        .map((r) => ({
          id: r.radiologyResultID ?? r.RadiologyResultID,
          name: r.imageName || r.ImageName || 'Image',
          url: resolveUrl(r.imagePath || r.ImagePath),
          tech: r.radiologyTechnicianName || r.RadiologyTechnicianName,
          date: r.resultDate || r.ResultDate,
        })),
    [results]
  );

  const [index, setIndex] = useState(0);
  const current = images[index];

  if (!images.length) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
        <i className="bi bi-image text-3xl mb-2 block" />
        <p className="text-sm">No radiology images available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <i className="bi bi-images text-indigo-600" />
          Images ({images.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={index <= 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="h-8 w-8 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            <i className="bi bi-chevron-left" />
          </button>
          <span className="text-xs text-gray-500">
            {index + 1} / {images.length}
          </span>
          <button
            type="button"
            disabled={index >= images.length - 1}
            onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
            className="h-8 w-8 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      </div>

      {current?.url ? (
        <img
          src={current.url}
          alt={current.name}
          className="radiology-img-main"
          onError={(e) => {
            e.currentTarget.alt = 'Image failed to load';
            e.currentTarget.style.opacity = '0.4';
          }}
        />
      ) : (
        <div className="text-sm text-red-600">Invalid image path.</div>
      )}

      <div className="text-xs text-gray-500 flex flex-wrap gap-3">
        <span>{current?.name}</span>
        {current?.tech ? <span>Tech: {current.tech}</span> : null}
        {current?.date ? <span>{new Date(current.date).toLocaleString()}</span> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <button key={img.id || i} type="button" onClick={() => setIndex(i)} className={`border rounded-lg overflow-hidden ${i === index ? 'ring-2 ring-indigo-500' : ''}`}>
            <img src={img.url} alt="" className="radiology-img-thumb" />
          </button>
        ))}
      </div>
    </div>
  );
}
