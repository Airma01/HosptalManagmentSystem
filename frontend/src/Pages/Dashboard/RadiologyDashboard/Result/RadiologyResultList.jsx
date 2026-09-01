import { Link } from 'react-router-dom';

export default function RadiologyResultList() {
  return (
    <div className="bg-white border rounded-xl p-6 text-sm text-gray-600">
      Results are accessed from a request or the radiologist review queue.
      <div className="mt-3">
        <Link to="/radiology/radiologist/queue" className="text-indigo-600">Go to Review Queue</Link>
      </div>
    </div>
  );
}
