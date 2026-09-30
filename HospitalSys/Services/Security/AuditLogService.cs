using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.Dto.Security;
using HospitalSys.Helpers;
using HospitalSys.Models.Security;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Services.Security
{
    public class AuditLogService : IAuditLogService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<AuditLogService> _logger;

        public AuditLogService(AppDbContext db, ILogger<AuditLogService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task CreateAsync(
            string action,
            string? module = null,
            string? entityName = null,
            string? entityId = null,
            string? endpoint = null,
            string? httpMethod = null,
            string? ipAddress = null,
            int? userId = null,
            string? username = null,
            string? role = null,
            string status = "Success",
            string? reason = null,
            CancellationToken ct = default)
        {
            try
            {
                var log = new AuditLog
                {
                    Action = action,
                    Module = module,
                    EntityName = entityName,
                    EntityId = entityId,
                    Endpoint = endpoint,
                    HttpMethod = httpMethod,
                    IpAddress = ipAddress,
                    UserId = userId,
                    Username = username,
                    Role = role,
                    Status = status,
                    Reason = reason,
                    Timestamp = DateTime.UtcNow
                };

                _db.AuditLogs.Add(log);
                await _db.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                // Never break business flow because audit failed
                _logger.LogError(ex, "Failed to write audit log for action {Action}", action);
            }
        }

        public Task CreateFromHttpContextAsync(
            HttpContext httpContext,
            string action,
            string? module = null,
            string? entityName = null,
            string? entityId = null,
            string status = "Success",
            string? reason = null,
            CancellationToken ct = default)
        {
            var user = httpContext.User;
            int? userId = null;
            if (int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
                userId = id;

            var username = user.FindFirstValue(ClaimTypes.GivenName)
                           ?? user.FindFirstValue(ClaimTypes.Name);
            var role = user.FindFirstValue(ClaimTypes.Role);
            var ip = IpAddressHelper.GetClientIp(httpContext);

            return CreateAsync(
                action: action,
                module: module,
                entityName: entityName,
                entityId: entityId,
                endpoint: httpContext.Request.Path.Value,
                httpMethod: httpContext.Request.Method,
                ipAddress: ip,
                userId: userId,
                username: username,
                role: role,
                status: status,
                reason: reason,
                ct: ct);
        }

        public async Task<PagedResultDto<AuditLogDto>> GetPagedAsync(AuditLogFilterDto filter, CancellationToken ct = default)
        {
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 200);

            var q = _db.AuditLogs.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Username))
                q = q.Where(x => x.Username != null && x.Username.Contains(filter.Username));
            if (!string.IsNullOrWhiteSpace(filter.Role))
                q = q.Where(x => x.Role == filter.Role);
            if (!string.IsNullOrWhiteSpace(filter.IpAddress))
                q = q.Where(x => x.IpAddress == filter.IpAddress);
            if (!string.IsNullOrWhiteSpace(filter.Module))
                q = q.Where(x => x.Module == filter.Module);
            if (!string.IsNullOrWhiteSpace(filter.Action))
                q = q.Where(x => x.Action == filter.Action);
            if (!string.IsNullOrWhiteSpace(filter.Status))
                q = q.Where(x => x.Status == filter.Status);
            if (filter.DateFrom.HasValue)
                q = q.Where(x => x.Timestamp >= filter.DateFrom.Value.ToUniversalTime());
            if (filter.DateTo.HasValue)
                q = q.Where(x => x.Timestamp <= filter.DateTo.Value.ToUniversalTime());

            var total = await q.CountAsync(ct);
            var items = await q
                .OrderByDescending(x => x.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new AuditLogDto
                {
                    AuditLogId = x.AuditLogId,
                    UserId = x.UserId,
                    Username = x.Username,
                    Role = x.Role,
                    Action = x.Action,
                    Module = x.Module,
                    EntityName = x.EntityName,
                    EntityId = x.EntityId,
                    Endpoint = x.Endpoint,
                    HttpMethod = x.HttpMethod,
                    IpAddress = x.IpAddress,
                    Status = x.Status,
                    Reason = x.Reason,
                    Timestamp = x.Timestamp
                })
                .ToListAsync(ct);

            return new PagedResultDto<AuditLogDto>
            {
                Items = items,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
