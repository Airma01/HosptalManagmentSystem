using HospitalSys.Data;
using HospitalSys.DTO.Payment.Cashier;
using HospitalSys.DTO.Payment.Common;
using HospitalSys.Models.BillingAndPayment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HospitalSys.Controllers.Payment
{
    [ApiController]
    [Route("Hospital/Cashier")]
    [Authorize(Roles = "Cashier,Admin")]
    public class CashierController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CashierController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserIdFromToken()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet("unpaid-bills")]
        public async Task<IActionResult> GetUnpaidBills([FromQuery] BillSearchDto search)
        {
            try
            {
                var query = _context.Bills
                    .Include(b => b.Patient)
                    .Include(b => b.BillItem)
                    .Include(b => b.PaymentHospital)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(search.MRN))
                    query = query.Where(b => b.Patient != null && b.Patient.MRN == search.MRN);

                if (!string.IsNullOrWhiteSpace(search.PatientName))
                    query = query.Where(b => b.Patient != null &&
                        (b.Patient.FirstName + " " + b.Patient.LastName).Contains(search.PatientName));

                if (search.VisitID.HasValue)
                    query = query.Where(b => b.VisitID == search.VisitID.Value);

                if (search.PatientID.HasValue)
                    query = query.Where(b => b.PatientID == search.PatientID.Value);

                if (search.FromDate.HasValue)
                    query = query.Where(b => b.BillDate >= search.FromDate.Value);

                if (search.ToDate.HasValue)
                    query = query.Where(b => b.BillDate <= search.ToDate.Value);

                if (string.IsNullOrWhiteSpace(search.Status))
                    query = query.Where(b => b.Status != "Paid" && b.Status != "Waived");
                else
                    query = query.Where(b => b.Status == search.Status);

                var bills = await query
                    .OrderByDescending(b => b.BillDate)
                    .Select(b => new UnpaidBillDto
                    {
                        BillID = b.BillID,
                        VisitID = b.VisitID,
                        PatientID = b.PatientID,
                        PatientName = b.Patient != null ? b.Patient.FirstName + " " + b.Patient.LastName : "",
                        MRN = b.Patient != null ? b.Patient.MRN : "",
                        BillDate = b.BillDate,
                        TotalAmount = (decimal)b.TotalAmount,
                        PaidAmount = b.PaymentHospital.Sum(p => p.AmountPaid),
                        RemainingAmount = (decimal)b.TotalAmount - b.PaymentHospital.Sum(p => p.AmountPaid),
                        Status = b.Status,
                        Items = b.BillItem.Select(i => new BillItemDto
                        {
                            BillItemID = i.BillItemID,
                            ServiceName = i.ServiceName,
                            Quantity = i.Quantity,
                            UnitPrice = i.UnitPrice,
                            TotalPrice = i.TotalPrice
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(bills);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving unpaid bills", error = ex.Message });
            }
        }

        [HttpGet("bill/{billId}")]
        public async Task<IActionResult> GetBill(int billId)
        {
            try
            {
                var bill = await _context.Bills
                    .Include(b => b.Patient)
                    .Include(b => b.BillItem)
                    .Include(b => b.PaymentHospital)
                    .Where(b => b.BillID == billId)
                    .Select(b => new UnpaidBillDto
                    {
                        BillID = b.BillID,
                        VisitID = b.VisitID,
                        PatientID = b.PatientID,
                        PatientName = b.Patient != null ? b.Patient.FirstName + " " + b.Patient.LastName : "",
                        MRN = b.Patient != null ? b.Patient.MRN : "",
                        BillDate = b.BillDate,
                        TotalAmount = (decimal)b.TotalAmount,
                        PaidAmount = b.PaymentHospital.Sum(p => p.AmountPaid),
                        RemainingAmount = (decimal)b.TotalAmount - b.PaymentHospital.Sum(p => p.AmountPaid),
                        Status = b.Status,
                        Items = b.BillItem.Select(i => new BillItemDto
                        {
                            BillItemID = i.BillItemID,
                            ServiceName = i.ServiceName,
                            Quantity = i.Quantity,
                            UnitPrice = i.UnitPrice,
                            TotalPrice = i.TotalPrice
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (bill == null)
                    return NotFound(new { message = "Bill not found" });

                return Ok(bill);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving bill", error = ex.Message });
            }
        }

        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] CreatePaymentDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetUserIdFromToken();
                if (userId == 0)
                    return Unauthorized(new { message = "Invalid user session" });

                var bill = await _context.Bills
                    .Include(b => b.Patient)
                    .Include(b => b.PaymentHospital)
                    .FirstOrDefaultAsync(b => b.BillID == dto.BillID);

                if (bill == null)
                    return NotFound(new { message = "Bill not found" });

                if (bill.Status == "Paid" || bill.Status == "Waived")
                    return BadRequest(new { message = "Bill is already fully paid or waived" });

                var alreadyPaid = bill.PaymentHospital.Sum(p => p.AmountPaid);
                var remaining = (decimal)bill.TotalAmount - alreadyPaid;

                if (dto.AmountPaid > remaining)
                    return BadRequest(new { message = $"Amount exceeds remaining balance ({remaining})" });

                var payment = new PaymentHospital
                {
                    BillID = dto.BillID,
                    UserID = userId,
                    AmountPaid = dto.AmountPaid,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentDate = DateTime.UtcNow,
                    PaymentStatus = "Paid"
                };

                _context.PaymentHospitals.Add(payment);

                var newPaidTotal = alreadyPaid + dto.AmountPaid;
                bill.Status = newPaidTotal >= (decimal)bill.TotalAmount ? "Paid" : "Partial";

                await _context.SaveChangesAsync();

                return Ok(new PaymentResponseDto
                {
                    Success = true,
                    Message = "Payment recorded successfully",
                    PaymentId = payment.PaymentID,
                    ReceiptNumber = $"HOS-{payment.PaymentID:D6}",
                    AmountPaid = payment.AmountPaid,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentDate = payment.PaymentDate,
                    PatientName = bill.Patient != null ? bill.Patient.FirstName + " " + bill.Patient.LastName : "",
                    MRN = bill.Patient?.MRN
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

                var query = _context.PaymentHospitals
                    .Include(p => p.Bill).ThenInclude(b => b.Patient)
                    .Include(p => p.User)
                    .Where(p => p.PaymentDate >= today && p.PaymentDate < tomorrow);

                if (!isAdmin)
                    query = query.Where(p => p.UserID == userId);

                var payments = await query
                    .OrderByDescending(p => p.PaymentDate)
                    .Select(p => new TodayPaymentItemDto
                    {
                        PaymentID = p.PaymentID,
                        ReceiptNumber = $"HOS-{p.PaymentID:D6}",
                        PatientName = p.Bill != null && p.Bill.Patient != null
                            ? p.Bill.Patient.FirstName + " " + p.Bill.Patient.LastName : "",
                        MRN = p.Bill != null && p.Bill.Patient != null ? p.Bill.Patient.MRN : "",
                        AmountPaid = p.AmountPaid,
                        PaymentMethod = p.PaymentMethod,
                        PaymentDate = p.PaymentDate,
                        CashierName = p.User != null
                            ? p.User.FirstName + " " + p.User.FatherName : ""
                    })
                    .ToListAsync();

                return Ok(new TodayCollectionDto
                {
                    Date = today,
                    TotalTransactions = payments.Count,
                    TotalCollected = payments.Sum(p => p.AmountPaid),
                    CashTotal = payments.Where(p => p.PaymentMethod == PaymentMethods.Cash).Sum(p => p.AmountPaid),
                    TelebirrTotal = payments.Where(p => p.PaymentMethod == PaymentMethods.Telebirr).Sum(p => p.AmountPaid),
                    OtherTotal = payments.Where(p => p.PaymentMethod != PaymentMethods.Cash && p.PaymentMethod != PaymentMethods.Telebirr).Sum(p => p.AmountPaid),
                    Payments = payments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving today's collection", error = ex.Message });
            }
        }
    }
}