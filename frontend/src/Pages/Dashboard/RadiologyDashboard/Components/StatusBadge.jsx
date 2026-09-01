export default function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  let cls = 'bg-gray-100 text-gray-700';
  if (s === 'completed') cls = 'bg-green-100 text-green-800';
  else if (s === 'inprogress' || s === 'in progress') cls = 'bg-blue-100 text-blue-800';
  else if (s === 'readyforreview' || s === 'ready for review') cls = 'bg-indigo-100 text-indigo-800';
  else if (s === 'pending' || !s) cls = 'bg-amber-100 text-amber-800';
  else if (s === 'cancelled' || s === 'canceled') cls = 'bg-red-100 text-red-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status || 'Pending'}
    </span>
  );
}
