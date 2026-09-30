using System.Security.Claims;
using HospitalSys.Attributes;
using HospitalSys.Dto.Security;
using HospitalSys.Services.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using HospitalSys.RateLimiting;

namespace HospitalSys.Controllers.Security
{
    /// <summary>
    /// Admin-only security management APIs.
    /// Route follows existing convention: Hospital/[controller]
    /// </summary>
    [ApiController]
    [Route("Hospital/admin/security")]
    [Authorize]
    [AuthorizeRole("Admin")]
    [EnableRateLimiting(RateLimitExtensions.GeneralPolicy)]
    public class SecurityController : ControllerBase
    {
        private readonly IAuditLogService _audit;
        private readonly ISecurityEventService _security;

        public SecurityController(IAuditLogService audit, ISecurityEventService security)
        {
            _audit = audit;
            _security = security;
        }

        private (int? userId, string? username) CurrentAdmin()
        {
            int? id = null;
            if (int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var parsed))
                id = parsed;
            var name = User.FindFirstValue(ClaimTypes.GivenName) ?? User.FindFirstValue(ClaimTypes.Name);
            return (id, name);
        }

        // ---------- Audit logs ----------
        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogFilterDto filter, CancellationToken ct)
        {
            var result = await _audit.GetPagedAsync(filter, ct);
            return Ok(result);
        }

        // ---------- API request monitoring ----------
        [HttpGet("api-requests")]
        public async Task<IActionResult> GetApiRequests([FromQuery] ApiRequestFilterDto filter, CancellationToken ct)
        {
            var result = await _security.GetApiRequestsPagedAsync(filter, ct);
            return Ok(result);
        }

        // ---------- Security events ----------
        [HttpGet("events")]
        public async Task<IActionResult> GetEvents([FromQuery] SecurityEventFilterDto filter, CancellationToken ct)
        {
            var result = await _security.GetPagedAsync(filter, ct);
            return Ok(result);
        }

        // ---------- Statistics ----------
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
        {
            var stats = await _security.GetStatisticsAsync(from, to, ct);
            return Ok(stats);
        }

        // ---------- Blocked IPs ----------
        [HttpGet("blocked-ips")]
        public async Task<IActionResult> GetBlockedIps([FromQuery] bool activeOnly = true, CancellationToken ct = default)
        {
            var list = await _security.GetBlockedIpsAsync(activeOnly, ct);
            return Ok(list);
        }

        [HttpPost("blocked-ips")]
        public async Task<IActionResult> BlockIp([FromBody] BlockIpDto dto, CancellationToken ct)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var (userId, username) = CurrentAdmin();
                var result = await _security.BlockIpAsync(dto, userId, username, ct);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Soft-unblock (IsActive = false). History retained.
        /// </summary>
        [HttpDelete("blocked-ips/{id:int}")]
        public async Task<IActionResult> UnblockIp(int id, CancellationToken ct)
        {
            var (userId, username) = CurrentAdmin();
            var ok = await _security.UnblockIpAsync(id, userId, username, ct);
            if (!ok) return NotFound(new { message = "Blocked IP record not found" });
            return Ok(new { message = "IP unblocked" });
        }
    }
}
