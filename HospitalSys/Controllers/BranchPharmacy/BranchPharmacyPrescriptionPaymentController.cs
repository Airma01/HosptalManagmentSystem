using HospitalSys.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers
{
    /// <summary>
    /// Standalone endpoints for pharmacist payment tracking.
    /// If BranchPharmacyController already has similar routes, merge logic instead of dual routes.
    /// </summary>
    [ApiController]
    [Route("Hospital/BranchPharmacy")]
    [Authorize(Roles = "Pharmacist,PharmacyCashier,Admin")]
    public class BranchPharmacyPrescriptionPaymentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BranchPharmacyPrescriptionPaymentController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /Hospital/BranchPharmacy/prescriptions-payment-status?paymentStatus=Paid|Unpaid
        /// </summary>
        [HttpGet("prescriptions-payment-status")]
        public async Task<IActionResult> GetPrescriptionsWithPayment(
            [FromQuery] string? paymentStatus = null,
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
                list = list
                    .Where(x => string.Equals(x.paymentStatus, ps, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            return Ok(list);
        }

        /// <summary>
        /// GET /Hospital/BranchPharmacy/prescriptions/{id}/payment-status
        /// </summary>
        [HttpGet("prescriptions/{id:int}/payment-status")]
        public async Task<IActionResult> GetOnePaymentStatus(int id)
        {
            var exists = await _context.Prescriptions.AnyAsync(p => p.PrescriptionID == id);
            if (!exists) return NotFound(new { message = "Prescription not found" });

            var paid = await _context.PharmacyPayments
                .Where(p => p.PrescriptionID == id && p.PaymentStatus == "Paid")
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new { p.AmountPaid, p.PaymentDate, p.PaymentMethod })
                .FirstOrDefaultAsync();

            return Ok(new
            {
                prescriptionID = id,
                paymentStatus = paid != null ? "Paid" : "Unpaid",
                canDispense = paid != null,
                paid
            });
        }

        /// <summary>
        /// Call before dispense. Returns 400 if unpaid.
        /// GET /Hospital/BranchPharmacy/prescriptions/{id}/ensure-paid
        /// </summary>
        [HttpGet("prescriptions/{id:int}/ensure-paid")]
        public async Task<IActionResult> EnsurePaid(int id)
        {
            var isPaid = await _context.PharmacyPayments.AnyAsync(p =>
                p.PrescriptionID == id && p.PaymentStatus == "Paid");

            if (!isPaid)
                return BadRequest(new
                {
                    message = "Prescription is unpaid. Patient must pay at Pharmacy Cashier before dispense.",
                    paymentStatus = "Unpaid",
                    canDispense = false
                });

            return Ok(new { paymentStatus = "Paid", canDispense = true });
        }
    }
}
