using HospitalSys.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Radiology
{
    [ApiController]
    [Route("Hospital/Radiology")]
    [Authorize(Roles = "RadiologyTechnician,Radiographer,Radiologist,Admin")]
    public class RadiographerPaymentStatusController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RadiographerPaymentStatusController(AppDbContext context) => _context = context;

        /// <summary>
        /// GET /Hospital/Radiology/requests-payment-status?paymentStatus=Paid|Unpaid
        /// </summary>
        [HttpGet("requests-payment-status")]
        public async Task<IActionResult> GetRequestsWithPayment(
            [FromQuery] string? paymentStatus = null,
            [FromQuery] string? search = null)
        {
            var q = _context.RadiologyRequests.AsNoTracking()
                .Where(r => r.Status != "Completed" && r.Status != "Cancelled");

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(r => r.Patient != null && (
                    r.Patient.MRN.Contains(s) ||
                    r.Patient.FirstName.Contains(s) ||
                    r.Patient.LastName.Contains(s)));
            }

            var list = await q
                .OrderByDescending(r => r.RequestDate)
                .Select(r => new
                {
                    radiologyRequestID = r.RadiologyRequestID,
                    patientID = r.PatientID,
                    patientName = r.Patient != null
                        ? r.Patient.FirstName + " " + r.Patient.LastName : "",
                    mrn = r.Patient != null ? r.Patient.MRN : "",
                    testType = r.RadiologyTestType != null ? r.RadiologyTestType.TestName : "",
                    clinicalStatus = r.Status,
                    requestDate = r.RequestDate,
                    paymentStatus = _context.RadiologyPayments.Any(p =>
                        p.RadiologyRequestID == r.RadiologyRequestID && p.PaymentStatus == "Paid")
                        ? "Paid" : "Unpaid",
                    canProcess = _context.RadiologyPayments.Any(p =>
                        p.RadiologyRequestID == r.RadiologyRequestID && p.PaymentStatus == "Paid"),
                    paidAt = _context.RadiologyPayments
                        .Where(p => p.RadiologyRequestID == r.RadiologyRequestID && p.PaymentStatus == "Paid")
                        .OrderByDescending(p => p.PaymentDate)
                        .Select(p => (DateTime?)p.PaymentDate)
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
        /// GET /Hospital/Radiology/requests/{id}/ensure-paid
        /// </summary>
        [HttpGet("requests/{id:int}/ensure-paid")]
        public async Task<IActionResult> EnsurePaid(int id)
        {
            var isPaid = await _context.RadiologyPayments.AnyAsync(p =>
                p.RadiologyRequestID == id && p.PaymentStatus == "Paid");

            if (!isPaid)
                return BadRequest(new
                {
                    message = "Radiology request is unpaid. Patient must pay at Radiology Cashier before examination/result.",
                    paymentStatus = "Unpaid",
                    canProcess = false
                });

            return Ok(new { paymentStatus = "Paid", canProcess = true });
        }
    }
}