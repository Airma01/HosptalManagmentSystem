
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const PendingPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState(""); // "" | Paid | Unpaid
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
  try {
    setLoading(true);
    // Option A – pending only (not dispensed), Paid + Unpaid
    const res = await pharmacyApi.getPendingPrescriptions();

    // Option B – all prescriptions on branch (incl. dispensed)
    // const res = await pharmacyApi.getPrescriptionsPaymentStatus();

    const list = Array.isArray(res.data) ? res.data : [];
    setPrescriptions(list);
    setError("");
  } catch (err) {
    setError(err?.response?.data?.message || "Failed to load prescriptions.");
  } finally {
    setLoading(false);
  }
};

  const getId = (p) => p.prescriptionId ?? p.PrescriptionId;
  const getPayment = (p) => p.paymentStatus ?? p.PaymentStatus ?? "Unpaid";
  const canDispense = (p) =>
    Boolean(p.canDispense ?? p.CanDispense) ||
    String(getPayment(p)).toLowerCase() === "paid";

  const filtered = prescriptions.filter((p) => {
    const id = String(getId(p) ?? "");
    const name = (p.patientName ?? p.PatientName ?? "").toLowerCase();
    const matchSearch =
      name.includes(searchTerm.toLowerCase()) || id.includes(searchTerm);
    if (!matchSearch) return false;
    if (!paymentFilter) return true;
    return (
      String(getPayment(p)).toLowerCase() === paymentFilter.toLowerCase()
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (id) => {
    navigate(`/pharmacy/prescriptions/${id}`);
  };

  const handleCheckAvailability = (id) => {
    navigate(`/pharmacy/prescriptions/${id}/availability`);
  };

  const handleDispense = async (p) => {
    const id = getId(p);
    if (!canDispense(p)) {
      alert(
        "Prescription is unpaid. Patient must pay at Pharmacy Cashier before dispense."
      );
      return;
    }
    try {
      await pharmacyApi.ensurePrescriptionPaid(id);
      // Your App routes: /pharmacy/dispense/new/:prescriptionId
      navigate(`/pharmacy/dispense/new/${id}`);
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          "Prescription is unpaid. Patient must pay at Pharmacy Cashier before dispense."
      );
    }
  };

  const PaymentBadge = ({ status }) => {
    const paid = String(status || "").toLowerCase() === "paid";
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          paid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
        }`}
      >
        <i
          className={`bi ${
            paid ? "bi-check-circle-fill" : "bi-x-circle-fill"
          } text-[11px]`}
        />
        {paid ? "Paid" : "Unpaid"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Pending Prescriptions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dispense only when payment status is <strong>Paid</strong>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchPrescriptions}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate("/pharmacy/dispense")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <i className="bi bi-clock-history" /> Dispense History
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or prescription ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { v: "", label: "All", icon: "bi-list-ul" },
            { v: "Unpaid", label: "Unpaid", icon: "bi-exclamation-circle" },
            { v: "Paid", label: "Paid", icon: "bi-check2-circle" },
          ].map((f) => (
            <button
              key={f.v || "all"}
              type="button"
              onClick={() => {
                setPaymentFilter(f.v);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                paymentFilter === f.v
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <i className={`bi ${f.icon}`} />
              {f.label}
            </button>
          ))}
          <span className="text-sm text-gray-500">
            Total: <span className="font-medium">{filtered.length}</span>
          </span>
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="bi bi-prescription2 text-5xl text-gray-300 block mb-3" />
          <p className="text-gray-500">No pending prescriptions found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Prescription ID
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Doctor
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p) => {
                  const id = getId(p);
                  const paid = canDispense(p);
                  return (
                    <tr
                      key={id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        #{id}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(
                          p.prescriptionDate ?? p.PrescriptionDate
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {p.patientName ?? p.PatientName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.doctorName ?? p.DoctorName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.totalItems ?? p.TotalItems}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentBadge status={getPayment(p)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          >
                            <i className="bi bi-eye" /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCheckAvailability(id)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center gap-1"
                          >
                            <i className="bi bi-box" /> Stock
                          </button>
                          <button
                            type="button"
                            disabled={!paid}
                            title={
                              paid
                                ? "Dispense"
                                : "Unpaid — pay at Pharmacy Cashier first"
                            }
                            onClick={() => handleDispense(p)}
                            className={`text-sm font-medium flex items-center gap-1 ${
                              paid
                                ? "text-green-600 hover:text-green-800"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <i className="bi bi-check-circle" /> Dispense
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, filtered.length)} of{" "}
                {filtered.length}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <i className="bi bi-chevron-left" />
                </button>
                <span className="px-3 py-1 rounded bg-blue-600 text-white">
                  {currentPage}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingPrescriptions;