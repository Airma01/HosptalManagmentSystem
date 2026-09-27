using HospitalSys.Data;
using HospitalSys.DTO.Payment.Common;
using HospitalSys.DTO.Payment.Laboratory;
using HospitalSys.Models.BillingAndPayment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HospitalSys.Controllers.Payment
{
    [ApiController]
    [Route("Hospital/LaboratoryCashier")]
    [Authorize(Roles = "LaboratoryCashier,Admin")]
    public class LaboratoryCashierController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LaboratoryCashierController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserIdFromToken()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        // ========== GET UNPAID LAB TESTS ==========
        [HttpGet("unpaid-tests")]
        public async Task<IActionResult> GetUnpaidTests([FromQuery] string? mrn, [FromQuery] int? patientId)
        {
            try
            {
                var query = _context.LaboratoryTests
                    .Include(t => t.Patient)
                    .Include(t => t.Doctor).ThenInclude(d => d.Users)
                    .Include(t => t.LaboratoryTestType)
                    .Include(t => t.LaboratoryPayments)
                    .Where(t => !t.LaboratoryPayments.Any(p => p.PaymentStatus == "Paid"))
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(mrn))
                    query = query.Where(t => t.Patient != null && t.Patient.MRN == mrn);

                if (patientId.HasValue)
                    query = query.Where(t => t.PatientID == patientId.Value);

                var tests = await query
                    .OrderByDescending(t => t.RequestDate)
                    .Select(t => new UnpaidLabTestDto
                    {
                        TestID = t.TestID,
                        PatientID = t.PatientID,
                        PatientName = t.Patient != null ? t.Patient.FirstName + " " + t.Patient.LastName : "",
                        MRN = t.Patient != null ? t.Patient.MRN : "",
                        TestName = t.LaboratoryTestType != null ? t.LaboratoryTestType.TestName : "",
                        Price = t.LaboratoryTestType != null ? t.LaboratoryTestType.Price : 0,
                        RequestDate = t.RequestDate,
                        Status = t.Status,
                        DoctorName = t.Doctor != null && t.Doctor.Users != null
                            ? t.Doctor.Users.FirstName + " " + t.Doctor.Users.FatherName : "",
                        ConsultationID = t.ConsultationID
                    })
                    .ToListAsync();

                return Ok(tests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving unpaid lab tests", error = ex.Message });
            }
        }

        // ========== PAY ==========
        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] CreateLabPaymentDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetUserIdFromToken();
                if (userId == 0)
                    return Unauthorized(new { message = "Invalid user session" });

                var test = await _context.LaboratoryTests
                    .Include(t => t.Patient)
                    .Include(t => t.LaboratoryPayments)
                    .FirstOrDefaultAsync(t => t.TestID == dto.TestID);

                if (test == null)
                    return NotFound(new { message = "Laboratory test not found" });

                if (test.LaboratoryPayments.Any(p => p.PaymentStatus == "Paid"))
                    return BadRequest(new { message = "This lab test is already paid" });

                var payment = new LaboratoryPayment
                {
                    TestID = dto.TestID,
                    UserID = userId,                    // Users only – no LaboratoryCashierID
                    AmountPaid = dto.AmountPaid,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentDate = DateTime.UtcNow,
                    PaymentStatus = "Paid"
                };

                _context.LaboratoryPayments.Add(payment);

                if (string.IsNullOrEmpty(test.Status) || test.Status == "Pending")
                    test.Status = "Paid";

                await _context.SaveChangesAsync();

                return Ok(new PaymentResponseDto
                {
                    Success = true,
                    Message = "Laboratory payment recorded successfully",
                    PaymentId = payment.LaboratoryPaymentID,
                    ReceiptNumber = $"LAB-{payment.LaboratoryPaymentID:D6}",
                    AmountPaid = payment.AmountPaid,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentDate = payment.PaymentDate,
                    PatientName = test.Patient != null ? test.Patient.FirstName + " " + test.Patient.LastName : "",
                    MRN = test.Patient?.MRN
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Payment failed", error = ex.Message });
            }
        }

        // ========== TODAY COLLECTION ==========
        [HttpGet("today-collection")]
        public async Task<IActionResult> TodayCollection()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);
                var userId = GetUserIdFromToken();
                var isAdmin = User.IsInRole("Admin");

                var query = _context.LaboratoryPayments
                    .Include(p => p.LaboratoryTest).ThenInclude(t => t.Patient)
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
                        p.LaboratoryPaymentID,
                        ReceiptNumber = $"LAB-{p.LaboratoryPaymentID:D6}",
                        PatientName = p.LaboratoryTest?.Patient != null
                            ? p.LaboratoryTest.Patient.FirstName + " " + p.LaboratoryTest.Patient.LastName : "",
                        MRN = p.LaboratoryTest?.Patient?.MRN,
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