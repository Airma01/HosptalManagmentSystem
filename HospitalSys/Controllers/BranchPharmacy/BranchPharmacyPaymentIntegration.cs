// ============================================================
// MERGE into BranchPharmacyController.cs
// Namespace/route: keep YOUR existing [Route] on the controller
// ============================================================
using HospitalSys.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers
{
    // Partial example methods — paste into your BranchPharmacyController class

    public partial class BranchPharmacyPaymentIntegration_DOCS
    {
        /*
        /// <summary>
        /// GET .../prescriptions-payment-status
        /// Pharmacist sees all Rx with Paid/Unpaid and canDispense flag
        /// </summary>
        [HttpGet("prescriptions-payment-status")]
        [Authorize(Roles = "Pharmacist,PharmacyCashier,Admin")]
        public async Task<IActionResult> GetPrescriptionsWithPayment(
            [FromQuery] string? paymentStatus = null, // Paid | Unpaid | null = all
            [FromQuery] string? search = null)
        {
            var q = _context.Prescriptions.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(p => p.Patient != null && (
                    p.Patient.MRN.Contains(s) ||
                    p.Patient.FirstName.Contains(s) ||
                    p.Patient.LastName.Contains(s)));
            }

            var list = await q
                .OrderByDescending(p => p.PrescriptionDate)
                .Select(p => new
                {
                    prescriptionID = p.PrescriptionID,
                    patientID = p.PatientID,
                    patientName = p.Patient != null
                        ? p.Patient.FirstName + " " + p.Patient.LastName : "",
                    mrn = p.Patient != null ? p.Patient.MRN : "",
                    prescriptionDate = p.PrescriptionDate,
                    branchPharmacyID = p.BranchPharmacyID,
                    branchName = p.BranchPharmacy != null ? p.BranchPharmacy.BranchName : "",
                    paymentStatus = _context.PharmacyPayments.Any(pp =>
                        pp.PrescriptionID == p.PrescriptionID && pp.PaymentStatus == "Paid")
                        ? "Paid" : "Unpaid",
                    canDispense = _context.PharmacyPayments.Any(pp =>
                        pp.PrescriptionID == p.PrescriptionID && pp.PaymentStatus == "Paid"),
                    paidAmount = _context.PharmacyPayments
                        .Where(pp => pp.PrescriptionID == p.PrescriptionID && pp.PaymentStatus == "Paid")
                        .Sum(pp => (decimal?)pp.AmountPaid) ?? 0,
                    paidAt = _context.PharmacyPayments
                        .Where(pp => pp.PrescriptionID == p.PrescriptionID && pp.PaymentStatus == "Paid")
                        .OrderByDescending(pp => pp.PaymentDate)
                        .Select(pp => (DateTime?)pp.PaymentDate)
                        .FirstOrDefault()
                })
                .ToListAsync();

            if (!string.IsNullOrWhiteSpace(paymentStatus))
            {
                var ps = paymentStatus.Trim();
                list = list.Where(x =>
                    string.Equals(x.paymentStatus, ps, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return Ok(list);
        }

        /// <summary>
        /// Call at the START of your existing Dispense action.
        /// prescriptionId = the Rx being dispensed.
        /// </summary>
        private async Task<IActionResult?> EnsurePrescriptionPaidOrError(int prescriptionId)
        {
            var isPaid = await _context.PharmacyPayments.AnyAsync(p =>
                p.PrescriptionID == prescriptionId && p.PaymentStatus == "Paid");

            if (!isPaid)
            {
                return BadRequest(new
                {
                    message = "Prescription is unpaid. Patient must pay at Pharmacy Cashier before dispense.",
                    paymentStatus = "Unpaid",
                    canDispense = false
                });
            }
            return null; // OK to continue
        }

        // Example dispense wrapper:
        // [HttpPost("dispense/{prescriptionId}")]
        // public async Task<IActionResult> Dispense(int prescriptionId, [FromBody] ...)
        // {
        //     var block = await EnsurePrescriptionPaidOrError(prescriptionId);
        //     if (block != null) return block;
        //     // ... existing dispense logic
        // }
        */
    }
}
