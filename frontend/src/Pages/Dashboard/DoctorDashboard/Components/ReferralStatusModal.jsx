import { useState } from "react";
import { acceptReferral, rejectReferral, cancelReferral } from "../Services/referralApi";

/**
 * Confirm Accept / Reject / Cancel against real backend endpoints.
 * action: "accept" | "reject" | "cancel"
 */
export default function ReferralStatusModal({ open, action, referralId, onClose, onSuccess }) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const config = {
    accept: {
      title: "Accept Referral",
      icon: "bi-check-circle",
      tone: "text-emerald-600",
      btn: "bg-emerald-600 hover:bg-emerald-700",
      label: "Accept",
      body: "Accept this referral for your department. The existing triage for the referred visit will be reassigned to your department so you can continue care using the same patient visit.",
      needsNotes: false,
    },
    reject: {
      title: "Reject Referral",
      icon: "bi-x-circle",
      tone: "text-rose-600",
      btn: "bg-rose-600 hover:bg-rose-700",
      label: "Reject",
      body: "Reject this referral. Optional notes will be saved on the referral record.",
      needsNotes: true,
    },
    cancel: {
      title: "Cancel Referral",
      icon: "bi-slash-circle",
      tone: "text-amber-600",
      btn: "bg-amber-600 hover:bg-amber-700",
      label: "Cancel Referral",
      body: "Cancel this referral. Only pending/draft referrals can be cancelled by the referring department.",
      needsNotes: false,
    },
  }[action] || {};

  const handleSubmit = async () => {
    if (!referralId || !action) return;
    setSubmitting(true);
    setError("");
    try {
      if (action === "accept") {
        await acceptReferral(referralId);
      } else if (action === "reject") {
        await rejectReferral(referralId, notes ? { notes } : {});
      } else if (action === "cancel") {
        await cancelReferral(referralId);
      }
      onSuccess?.();
      onClose?.();
      setNotes("");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 401) setError("Unauthorized. Please log in again.");
      else if (status === 403) setError("You are not authorized to perform this action.");
      else if (status === 404) setError("Referral not found.");
      else if (status === 409) setError(msg || "This action is not allowed for the current referral status.");
      else setError(msg || "Unable to process referral.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`text-2xl ${config.tone}`}>
            <i className={`bi ${config.icon}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-800">{config.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{config.body}</p>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600"
            onClick={onClose}
            disabled={submitting}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {config.needsNotes && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              placeholder="Reason for rejection…"
              disabled={submitting}
            />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-60 ${config.btn}`}
          >
            {submitting && (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {config.label}
          </button>
        </div>
      </div>
    </div>
  );
}