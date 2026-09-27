import React, { useState } from "react";

const PAYMENT_METHODS = ["Cash", "Telebirr", "CBE Birr", "Bank Transfer", "Card"];

const PaymentForm = ({ remainingAmount, onSubmit, loading }) => {
  const [amount, setAmount] = useState(remainingAmount || "");
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    onSubmit({
      amountPaid: Number(amount),
      paymentMethod: method,
      transactionReference: reference || null,
      notes: notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (ETB)
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max={remainingAmount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Remaining: ETB {Number(remainingAmount).toLocaleString()}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Method
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {method !== "Cash" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Reference
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. Telebirr TXN ID"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
            Processing...
          </>
        ) : (
          <>
            <i className="bi bi-check-circle mr-2"></i>
            Confirm Payment
          </>
        )}
      </button>
    </form>
  );
};

export default PaymentForm;
