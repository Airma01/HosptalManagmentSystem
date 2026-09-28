
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const DispenseMedicine = () => {
  const { id } = useParams(); // prescription ID from /pharmacy/dispense/new/:id
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [paymentOk, setPaymentOk] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Payment gate first
        try {
          const payRes = await pharmacyApi.ensurePrescriptionPaid(id);
          setPaymentOk(true);
          setPaymentStatus(payRes.data?.paymentStatus || "Paid");
        } catch (payErr) {
          setPaymentOk(false);
          setPaymentStatus("Unpaid");
          setError(
            payErr?.response?.data?.message ||
              "Prescription is unpaid. Patient must pay at Pharmacy Cashier before dispense."
          );
          // Still try to load details for display
        }

        const res = await pharmacyApi.getPrescriptionDetails(id);
        const data = res.data;
        setPrescription(data);

        const status =
          data.paymentStatus ?? data.PaymentStatus ?? paymentStatus;
        if (String(status).toLowerCase() === "paid") {
          setPaymentOk(true);
          setPaymentStatus("Paid");
        }

        const meds = data.medicines ?? data.Medicines ?? [];
        const initialItems = meds.map((med) => ({
          medicineId: med.medicineId ?? med.MedicineId,
          medicineName: med.medicineName ?? med.MedicineName,
          prescribedQuantity: med.quantity ?? med.Quantity,
          quantityToDispense: med.quantity ?? med.Quantity,
          availableQuantity: (med.availableQuantity ?? med.AvailableQuantity) || 0,
        }));
        setItems(initialItems);
      } catch (err) {
        console.error("Error loading prescription:", err);
        if (!error) {
          setError(
            err?.response?.data?.message ||
              "Failed to load prescription details. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    const qty = parseFloat(value) || 0;
    newItems[index].quantityToDispense = qty;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentOk) {
      setError(
        "Prescription is unpaid. Patient must pay at Pharmacy Cashier before dispense."
      );
      return;
    }

    for (const item of items) {
      if (item.quantityToDispense <= 0) {
        setError(`Quantity for ${item.medicineName} must be greater than 0.`);
        return;
      }
      if (item.quantityToDispense > item.availableQuantity) {
        setError(
          `Insufficient stock for ${item.medicineName}. Available: ${item.availableQuantity}, Requested: ${item.quantityToDispense}`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");
      // Double-check payment before POST
      await pharmacyApi.ensurePrescriptionPaid(id);

      const payload = {
        prescriptionId: parseInt(id, 10),
        items: items.map((item) => ({
          medicineId: item.medicineId,
          quantityDispensed: item.quantityToDispense,
        })),
      };
      const response = await pharmacyApi.dispenseMedicine(payload);
      const dispenseId =
        response.data?.dispenseId ?? response.data?.DispenseId;
      setSuccess(
        `Dispense completed successfully! (ID: ${dispenseId ?? "—"})`
      );
      setTimeout(() => {
        if (dispenseId) {
          navigate(`/pharmacy/dispense/${dispenseId}`);
        } else {
          navigate("/pharmacy/dispense");
        }
      }, 1500);
    } catch (err) {
      console.error("Dispense error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to dispense medicine. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-gray-600">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (error && !prescription) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <i className="bi bi-exclamation-circle" />
          <span>{error}</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/pharmacy/prescriptions")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Prescriptions
        </button>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen text-center text-gray-500">
        Prescription not found.
      </div>
    );
  }

  const patientName =
    prescription.patientName ?? prescription.PatientName ?? "";
  const doctorName = prescription.doctorName ?? prescription.DoctorName ?? "";
  const rxDate =
    prescription.prescriptionDate ?? prescription.PrescriptionDate;
  const rxId =
    prescription.prescriptionId ?? prescription.PrescriptionId ?? id;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => navigate(`/pharmacy/prescriptions/${id}`)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <i className="bi bi-arrow-left" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Dispense Prescription
        </h1>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            paymentOk
              ? "bg-emerald-100 text-emerald-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <i
            className={`bi ${
              paymentOk ? "bi-check-circle-fill" : "bi-x-circle-fill"
            }`}
          />
          {paymentStatus}
        </span>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-check-circle" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle" />
          <span>{error}</span>
        </div>
      )}

      {!paymentOk && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-lock-fill" />
          Waiting for Pharmacy Cashier payment before you can confirm dispense.
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="text-lg font-medium text-gray-800">{patientName}</p>
            <p className="text-sm text-gray-500">
              Prescription Date:{" "}
              {rxDate ? new Date(rxDate).toLocaleString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Doctor</p>
            <p className="text-lg font-medium text-gray-800">{doctorName}</p>
            <p className="text-sm text-gray-500">Prescription #{rxId}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Medicine
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Prescribed
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Available
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    To Dispense
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.medicineId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.medicineName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.prescribedQuantity}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          item.availableQuantity >= item.prescribedQuantity
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.availableQuantity}
                      </span>
                      {item.availableQuantity < item.prescribedQuantity && (
                        <span className="ml-1 text-xs text-red-500">
                          (low stock)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.quantityToDispense}
                        disabled={!paymentOk}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                      />
                      <span className="ml-1 text-xs text-gray-400">
                        max {item.availableQuantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting || !!success || !paymentOk}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle" />
                Confirm Dispense
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/pharmacy/prescriptions/${id}`)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DispenseMedicine;