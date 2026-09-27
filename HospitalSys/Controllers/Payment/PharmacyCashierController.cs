using HospitalSys.Data;
using HospitalSys.DTO.Payment.Common;
using HospitalSys.DTO.Payment.Pharmacy;
using HospitalSys.Models.BillingAndPayment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HospitalSys.Controllers.Payment
{
    [ApiController]
    [Route("Hospital/PharmacyCashier")]
    [Authorize(Roles = "PharmacyCashier,Admin")]
    public class PharmacyCashierController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PharmacyCashierController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserIdFromToken()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet("unpaid-prescriptions")]
        public async Task<IActionResult> GetUnpaidPrescriptions(
            [FromQuery] string? mrn,
            [FromQuery] int? patientId,
            [FromQuery] int? branchPharmacyId)
        {
            try
            {
                var query = _context.Prescriptions
                    .Include(p => p.Patient)
                    .Include(p => p.Doctor).ThenInclude(d => d.Users)
                    .Include(p => p.BranchPharmacy)
                    .Include(p => p.PrescriptionDetail).ThenInclude(d => d.Medicine)
                    .Include(p => p.PharmacyPayment)
                    .Where(p => !p.PharmacyPayment.Any(pay => pay.PaymentStatus == "Paid"))
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(mrn))
                    query = query.Where(p => p.Patient != null && p.Patient.MRN == mrn);

                if (patientId.HasValue)
                    query = query.Where(p => p.PatientID == patientId.Value);

                if (branchPharmacyId.HasValue)
                    query = query.Where(p => p.BranchPharmacyID == branchPharmacyId.Value);

                var prescriptions = await query
                    .OrderByDescending(p => p.PrescriptionDate)
                    .Select(p => new UnpaidPrescriptionDto
                    {
                        PrescriptionID = p.PrescriptionID,
                        PatientID = p.PatientID,
                        PatientName = p.Patient != null ? p.Patient.FirstName + " " + p.Patient.LastName : "",
                        MRN = p.Patient != null ? p.Patient.MRN : "",
                        PrescriptionDate = p.PrescriptionDate,
                        TotalAmount = p.PrescriptionDetail.Sum(d => d.Quantity * (d.Medicine != null ? d.Medicine.UnitPrice : 0)),
                        Status = p.PharmacyPayment.Any() ? "Pending" : "Unpaid",
                        DoctorName = p.Doctor != null && p.Doctor.Users != null
                            ? p.Doctor.Users.FirstName + " " + p.Doctor.Users.FatherName : "",
                        BranchPharmacyID = p.BranchPharmacyID,
                        BranchName = p.BranchPharmacy != null ? p.BranchPharmacy.BranchName ?? "" : "",
                        Medicines = p.PrescriptionDetail.Select(d => new PrescriptionMedicineDto
                        {
                            MedicineName = d.Medicine != null ? d.Medicine.MedicineName ?? "" : "",
                            Quantity = d.Quantity,
                            Dosage = d.Dosage,
                            UnitPrice = d.Medicine != null ? d.Medicine.UnitPrice : null,
                            LineTotal = d.Medicine != null ? d.Quantity * d.Medicine.UnitPrice : null
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(prescriptions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving unpaid prescriptions", error = ex.Message });
            }
        }

        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] CreatePharmacyPaymentDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetUserIdFromToken();
                if (userId == 0)
                    return Unauthorized(new { message = "Invalid user session" });

                var prescription = await _context.Prescriptions
                    .Include(p => p.Patient)
                    .Include(p => p.PharmacyPayment)
                    .FirstOrDefaultAsync(p => p.PrescriptionID == dto.PrescriptionID);

                if (prescription == null)
                    return NotFound(new { message = "Prescription not found" });

                if (prescription.PharmacyPayment.Any(p => p.PaymentStatus == "Paid"))
                    return BadRequest(new { message = "This prescription is already paid" });

                var payment = new PharmacyPayment
                {
                    PrescriptionID = dto.PrescriptionID,
                    UserID = userId,
                    AmountPaid = dto.AmountPaid,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentDate = DateTime.UtcNow,
                    PaymentStatus = "Paid"
                };

                _context.PharmacyPayments.Add(payment);
                await _context.SaveChangesAsync();

                return Ok(new PaymentResponseDto
                {
                    Success = true,
                    Message = "Pharmacy payment recorded successfully",
                    PaymentId = payment.PharmacyPaymentID,
                    ReceiptNumber = $"PHARM-{payment.PharmacyPaymentID:D6}",
                    AmountPaid = payment.AmountPaid,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentDate = payment.PaymentDate,
                    PatientName = prescription.Patient != null
                        ? prescription.Patient.FirstName + " " + prescription.Patient.LastName : "",
                    MRN = prescription.Patient?.MRN
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Payment failed", error = ex.Message });
            }
        }

        [HttpGet("today-collection")]
        public async Task<IActionResult> TodayCollection()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);
                var userId = GetUserIdFromToken();
                var isAdmin = User.IsInRole("Admin");

                var query = _context.PharmacyPayments
                    .Include(p => p.Prescription).ThenInclude(pr => pr.Patient)
                    .Include(p => p.User)
                    .Where(p => p.PaymentDate >= today && p.PaymentDate < tomorrow && p.PaymentStatus == "Paid");

                if (!isAdmin)
                    query = query.Where(p => p.UserID == userId);

                var payments = await query.ToListAsync();

                return Ok(new
                {
                    Date = today,
                    TotalTransactions = payments.Count,
                    TotalCollected = payments.Sum(p => p.AmountPaid),
                    CashTotal = payments.Where(p => p.PaymentMethod == PaymentMethods.Cash).Sum(p => p.AmountPaid),
                    TelebirrTotal = payments.Where(p => p.PaymentMethod == PaymentMethods.Telebirr).Sum(p => p.AmountPaid),
                    Payments = payments.Select(p => new
                    {
                        p.PharmacyPaymentID,
                        ReceiptNumber = $"PHARM-{p.PharmacyPaymentID:D6}",
                        PatientName = p.Prescription?.Patient != null
                            ? p.Prescription.Patient.FirstName + " " + p.Prescription.Patient.LastName : "",
                        MRN = p.Prescription?.Patient?.MRN,
                        p.AmountPaid,
                        p.PaymentMethod,
                        p.PaymentDate,
                        CashierName = p.User != null ? p.User.FirstName + " " + p.User.FatherName : ""
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving today's collection", error = ex.Message });
            }
        }
    }
}