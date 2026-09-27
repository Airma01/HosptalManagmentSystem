import React from "react";

const ReceiptCard = ({ receipt }) => {
  if (!receipt) return null;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 max-w-md mx-auto">
      <div className="text-center border-b pb-4 mb-4">
        <i className="bi bi-check-circle-fill text-4xl text-green-500"></i>
        <h2 className="text-lg font-bold text-gray-800 mt-2">Payment Successful</h2>
        <p className="text-sm text-gray-500">{receipt.message}</p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Receipt No.</span>
          <span className="font-mono font-semibold">{receipt.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Patient</span>
          <span className="font-medium">{receipt.patientName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">MRN</span>
          <span className="font-mono">{receipt.mrn}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Amount</span>
          <span className="font-bold text-green-600">
            ETB {Number(receipt.amountPaid).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Method</span>
          <span>{receipt.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span>
            {receipt.paymentDate
              ? new Date(receipt.paymentDate).toLocaleString()
              : "—"}
          </span>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="mt-6 w-full py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
      >
        <i className="bi bi-printer mr-2"></i> Print Receipt
      </button>
    </div>
  );
};

export default ReceiptCard;
