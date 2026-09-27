using HospitalSys.Data;
using HospitalSys.DTO.Payment.Common;
using HospitalSys.DTO.Payment.Radiology;
using HospitalSys.Models.BillingAndPayment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HospitalSys.Controllers.Payment
{
    [ApiController]
    [Route("Hospital/RadiologyCashier")]
    [Authorize(Roles = "RadiologyCashier,Admin")]
    public class RadiologyCashierController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RadiologyCashierController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserIdFromToken()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet("unpaid-requests")]
        public async Task<IActionResult> GetUnpaidRequests([FromQuery] string? mrn, [FromQuery] int? patientId)
        {
            try
            {
                var query = _context.RadiologyRequests
                    .Include(r => r.Patient)
                    .Include(r => r.Doctor).ThenInclude(d => d.Users)
                    .Include(r => r.RadiologyTestType)
                    .Include(r => r.RadiologyPayment)
                    .Where(r => !r.RadiologyPayment.Any(p => p.PaymentStatus == "Paid"))
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(mrn))
                    query = query.Where(r => r.Patient != null && r.Patient.MRN == mrn);

                if (patientId.HasValue)
                    query = query.Where(r => r.PatientID == patientId.Value);

                var requests = await query
                    .OrderByDescending(r => r.RequestDate)
                    .Select(r => new UnpaidRadiologyDto
                    {
                        RadiologyRequestID = r.RadiologyRequestID,
                        PatientID = r.PatientID,
                        PatientName = r.Patient != null ? r.Patient.FirstName + " " + r.Patient.LastName : "",
                        MRN = r.Patient != null ? r.Patient.MRN : "",
                        ExamName = r.RadiologyTestType != null ? r.RadiologyTestType.TestName : "",
                        Price = r.RadiologyTestType != null ? r.RadiologyTestType.Price : 0,
                        RequestDate = r.RequestDate,
                        Status = r.Status,
                        DoctorName = r.Doctor != null && r.Doctor.Users != null
                            ? r.Doctor.Users.FirstName + " " + r.Doctor.Users.FatherName : "",
                        ConsultationID = r.ConsultationID
                    })
                    .ToListAsync();

                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving unpaid radiology requests", error = ex.Message });
            }
        }

        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] CreateRadiologyPaymentDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetUserIdFromToken();
                if (userId == 0)
                    return Unauthorized(new { message = "Invalid user session" });

                var request = await _context.RadiologyRequests
                    .Include(r => r.Patient)
                    .Include(r => r.RadiologyPayment)
                    .FirstOrDefaultAsync(r => r.RadiologyRequestID == dto.RadiologyRequestID);

                if (request == null)
                    return NotFound(new { message = "Radiology request not found" });

                if (request.RadiologyPayment.Any(p => p.PaymentStatus == "Paid"))
                    return BadRequest(new { message = "This radiology request is already paid" });

                var payment = new RadiologyPayment
                {
                    RadiologyRequestID = dto.RadiologyRequestID,
                    UserID = userId,
                    AmountPaid = dto.AmountPaid,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentDate = DateTime.UtcNow,
                    PaymentStatus = "Paid"
                };

                _context.RadiologyPayments.Add(payment);

                if (string.IsNullOrEmpty(request.Status) || request.Status == "Pending")
                    request.Status = "Paid";

                await _context.SaveChangesAsync();

                return Ok(new PaymentResponseDto
                {
                    Success = true,
                    Message = "Radiology payment recorded successfully",
                    PaymentId = payment.RadiologyPaymentID,
                    ReceiptNumber = $"RAD-{payment.RadiologyPaymentID:D6}",
                    AmountPaid = payment.AmountPaid,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentDate = payment.PaymentDate,
                    PatientName = request.Patient != null ? request.Patient.FirstName + " " + request.Patient.LastName : "",
                    MRN = request.Patient?.MRN
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

                var query = _context.RadiologyPayments
                    .Include(p => p.RadiologyRequest).ThenInclude(r => r.Patient)
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
                        p.RadiologyPaymentID,
                        ReceiptNumber = $"RAD-{p.RadiologyPaymentID:D6}",
                        PatientName = p.RadiologyRequest?.Patient != null
                            ? p.RadiologyRequest.Patient.FirstName + " " + p.RadiologyRequest.Patient.LastName : "",
                        MRN = p.RadiologyRequest?.Patient?.MRN,
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