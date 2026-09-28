export default function PaymentStatusBadge({ status }) {
  const paid = String(status || '').toLowerCase() === 'paid';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        paid
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      <i className={`bi ${paid ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} text-[11px]`} />
      {paid ? 'Paid' : 'Unpaid'}
    </span>
  );
}
