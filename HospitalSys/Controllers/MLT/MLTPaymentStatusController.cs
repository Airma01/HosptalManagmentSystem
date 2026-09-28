using HospitalSys.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.MLT
{
    [ApiController]
    [Route("Hospital/Laboratory")]
    [Authorize] // or [Authorize(Roles = "LaboratoryTechnician,MLT,LaboratoryCashier")]
    public class MLTPaymentStatusController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MLTPaymentStatusController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// List tests with payment status. Keys match MLT queue testID.
        /// </summary>
        [HttpGet("tests-payment-status")]
        public async Task<IActionResult> GetTestsPaymentStatus(
            [FromQuery] string? paymentStatus = null)
        {
            try
            {
                var list = await _context.LaboratoryTests
                    .AsNoTracking()
                    .Select(t => new
                    {
                        testID = t.TestID,
                        laboratoryTestID = t.TestID, // alias for frontend merge
                        patientID = t.PatientID,
                        paymentStatus = _context.LaboratoryPayments.Any(p =>
                            p.TestID == t.TestID && p.PaymentStatus == "Paid")
                            ? "Paid" : "Unpaid",
                        canProcess = _context.LaboratoryPayments.Any(p =>
                            p.TestID == t.TestID && p.PaymentStatus == "Paid")
                    })
                    .ToListAsync();

                if (!string.IsNullOrWhiteSpace(paymentStatus))
                {
                    var ps = paymentStatus.Trim();
                    list = list
                        .Where(x => string.Equals(
                            x.paymentStatus, ps, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                return Ok(list);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("tests/{id:int}/ensure-paid")]
        public async Task<IActionResult> EnsureLabTestPaid(int id)
        {
            try
            {
                var isPaid = await _context.LaboratoryPayments.AnyAsync(p =>
                    p.TestID == id && p.PaymentStatus == "Paid");

                if (!isPaid)
                {
                    return BadRequest(new
                    {
                        message =
                            "Laboratory test is unpaid. Patient must pay at Laboratory Cashier first.",
                        paymentStatus = "Unpaid",
                        canProcess = false
                    });
                }

                return Ok(new { paymentStatus = "Paid", canProcess = true, testID = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}