using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.Dto.Security;
using HospitalSys.Helpers;
using HospitalSys.Models.Security;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Services.Security
{
    public class SecurityEventService : ISecurityEventService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<SecurityEventService> _logger;
        private readonly IAuditLogService _audit;

        public SecurityEventService(AppDbContext db, ILogger<SecurityEventService> logger, IAuditLogService audit)
        {
            _db = db;
            _logger = logger;
            _audit = audit;
        }

        public async Task RecordAsync(
            string eventType,
            string description,
            string severity = "Info",
            string? ipAddress = null,
            int? userId = null,
            string? username = null,
            string? role = null,
            string? endpoint = null,
            CancellationToken ct = default)
        {
            try
            {
                _db.SecurityEvents.Add(new SecurityEvent
                {
                    EventType = eventType,
                    Description = description,
                    Severity = severity,
                    IpAddress = ipAddress,
                    UserId = userId,
                    Username = username,
                    Role = role,
                    Endpoint = endpoint,
                    Status = "Open",
                    Timestamp = DateTime.UtcNow
                });
                await _db.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to record security event {EventType}", eventType);
            }
        }

        public Task RecordFromHttpContextAsync(
            HttpContext httpContext,
            string eventType,
            string description,
            string severity = "Info",
            CancellationToken ct = default)
        {
            var user = httpContext.User;
            int? userId = null;
            if (int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
                userId = id;

            return RecordAsync(
                eventType,
                description,
                severity,
                IpAddressHelper.GetClientIp(httpContext),
                userId,
                user.FindFirstValue(ClaimTypes.GivenName) ?? user.FindFirstValue(ClaimTypes.Name),
                user.FindFirstValue(ClaimTypes.Role),
                httpContext.Request.Path.Value,
                ct);
        }

        public async Task<PagedResultDto<SecurityEventDto>> GetPagedAsync(SecurityEventFilterDto filter, CancellationToken ct = default)
        {
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 200);
            var q = _db.SecurityEvents.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.EventType))
                q = q.Where(x => x.EventType == filter.EventType);
            if (!string.IsNullOrWhiteSpace(filter.Username))
                q = q.Where(x => x.Username != null && x.Username.Contains(filter.Username));
            if (!string.IsNullOrWhiteSpace(filter.IpAddress))
                q = q.Where(x => x.IpAddress == filter.IpAddress);
            if (!string.IsNullOrWhiteSpace(filter.Severity))
                q = q.Where(x => x.Severity == filter.Severity);
            if (filter.DateFrom.HasValue)
                q = q.Where(x => x.Timestamp >= filter.DateFrom.Value.ToUniversalTime());
            if (filter.DateTo.HasValue)
                q = q.Where(x => x.Timestamp <= filter.DateTo.Value.ToUniversalTime());

            var total = await q.CountAsync(ct);
            var items = await q.OrderByDescending(x => x.Timestamp)
                .Skip((page - 1) * pageSize).Take(pageSize)
                .Select(x => new SecurityEventDto
                {
                    Id = x.Id,
                    EventType = x.EventType,
                    UserId = x.UserId,
                    Username = x.Username,
                    Role = x.Role,
                    IpAddress = x.IpAddress,
                    Endpoint = x.Endpoint,
                    Description = x.Description,
                    Severity = x.Severity,
                    Status = x.Status,
                    Timestamp = x.Timestamp
                }).ToListAsync(ct);

            return new PagedResultDto<SecurityEventDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
        }

        public async Task LogApiRequestAsync(ApiRequestLog log, CancellationToken ct = default)
        {
            try
            {
                _db.ApiRequestLogs.Add(log);
                await _db.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log API request");
            }
        }

        public async Task<PagedResultDto<ApiRequestLogDto>> GetApiRequestsPagedAsync(ApiRequestFilterDto filter, CancellationToken ct = default)
        {
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 200);
            var q = _db.ApiRequestLogs.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Username))
                q = q.Where(x => x.Username != null && x.Username.Contains(filter.Username));
            if (!string.IsNullOrWhiteSpace(filter.Role))
                q = q.Where(x => x.Role == filter.Role);
            if (!string.IsNullOrWhiteSpace(filter.IpAddress))
                q = q.Where(x => x.IpAddress == filter.IpAddress);
            if (!string.IsNullOrWhiteSpace(filter.Endpoint))
                q = q.Where(x => x.Endpoint.Contains(filter.Endpoint));
            if (filter.StatusCode.HasValue)
                q = q.Where(x => x.StatusCode == filter.StatusCode.Value);
            if (filter.DateFrom.HasValue)
                q = q.Where(x => x.Timestamp >= filter.DateFrom.Value.ToUniversalTime());
            if (filter.DateTo.HasValue)
                q = q.Where(x => x.Timestamp <= filter.DateTo.Value.ToUniversalTime());

            var total = await q.CountAsync(ct);
            var items = await q.OrderByDescending(x => x.Timestamp)
                .Skip((page - 1) * pageSize).Take(pageSize)
                .Select(x => new ApiRequestLogDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    Username = x.Username,
                    Role = x.Role,
                    IpAddress = x.IpAddress,
                    Endpoint = x.Endpoint,
                    HttpMethod = x.HttpMethod,
                    StatusCode = x.StatusCode,
                    ResponseTimeMs = x.ResponseTimeMs,
                    WasRateLimited = x.WasRateLimited,
                    Timestamp = x.Timestamp
                }).ToListAsync(ct);

            return new PagedResultDto<ApiRequestLogDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
        }

        public async Task<SecurityStatisticsDto> GetStatisticsAsync(DateTime? from = null, DateTime? to = null, CancellationToken ct = default)
        {
            var fromUtc = (from ?? DateTime.UtcNow.AddDays(-7)).ToUniversalTime();
            var toUtc = (to ?? DateTime.UtcNow).ToUniversalTime();

            var apiQ = _db.ApiRequestLogs.AsNoTracking().Where(x => x.Timestamp >= fromUtc && x.Timestamp <= toUtc);
            var evtQ = _db.SecurityEvents.AsNoTracking().Where(x => x.Timestamp >= fromUtc && x.Timestamp <= toUtc);

            var totalApi = await apiQ.CountAsync(ct);
            var rateLimited = await apiQ.CountAsync(x => x.WasRateLimited, ct);
            var c401 = await apiQ.CountAsync(x => x.StatusCode == 401, ct);
            var c403 = await apiQ.CountAsync(x => x.StatusCode == 403, ct);
            var failedLogins = await evtQ.CountAsync(x => x.EventType == "FailedLogin", ct);
            var highActivityEvents = await evtQ.CountAsync(x => x.EventType == "HighRequestActivity", ct);
            var blocked = await _db.BlockedIpAddresses.AsNoTracking()
                .CountAsync(x => x.IsActive && (x.ExpiresAt == null || x.ExpiresAt > DateTime.UtcNow), ct);

            var high = await apiQ
                .GroupBy(x => new { x.IpAddress, x.Username })
                .Select(g => new HighActivityItemDto
                {
                    IpAddress = g.Key.IpAddress,
                    Username = g.Key.Username ?? "unknown",
                    RequestCount = g.Count()
                })
                .OrderByDescending(x => x.RequestCount)
                .Take(15)
                .ToListAsync(ct);

            return new SecurityStatisticsDto
            {
                TotalApiRequests = totalApi,
                FailedLogins = failedLogins,
                RateLimitedRequests = rateLimited,
                ActiveBlockedIps = blocked,
                Unauthorized401 = c401,
                Forbidden403 = c403,
                HighRequestActivityCount = highActivityEvents,
                HighActivity = high,
                From = fromUtc,
                To = toUtc
            };
        }

        public async Task<bool> IsIpBlockedAsync(string ipAddress, CancellationToken ct = default)
        {
            var normalized = IpAddressHelper.NormalizeIp(ipAddress);
            var now = DateTime.UtcNow;
            return await _db.BlockedIpAddresses.AsNoTracking()
                .AnyAsync(x => x.IsActive
                               && x.IpAddress == normalized
                               && (x.ExpiresAt == null || x.ExpiresAt > now), ct);
        }

        public async Task<BlockedIpDto> BlockIpAsync(BlockIpDto dto, int? adminUserId, string? adminUsername, CancellationToken ct = default)
        {
            if (!IpAddressHelper.IsValidIpAddress(dto.IpAddress))
                throw new ArgumentException("Invalid IP address. Only valid IPv4 or IPv6 is accepted.");

            var normalized = IpAddressHelper.NormalizeIp(dto.IpAddress);

            // Deactivate any previous active blocks for same IP
            var existing = await _db.BlockedIpAddresses
                .Where(x => x.IpAddress == normalized && x.IsActive)
                .ToListAsync(ct);
            foreach (var e in existing)
            {
                e.IsActive = false;
                e.UnblockedAt = DateTime.UtcNow;
                e.UnblockedByUserId = adminUserId;
                e.UnblockedByUsername = adminUsername;
            }

            DateTime? expires = dto.IsPermanent ? null : dto.ExpiresAt?.ToUniversalTime();
            if (!dto.IsPermanent && expires.HasValue && expires.Value <= DateTime.UtcNow)
                throw new ArgumentException("Expiration must be in the future for temporary blocks.");

            var block = new BlockedIpAddress
            {
                IpAddress = normalized,
                Reason = dto.Reason,
                BlockedByUserId = adminUserId,
                BlockedByUsername = adminUsername,
                BlockedAt = DateTime.UtcNow,
                ExpiresAt = expires,
                IsActive = true
            };
            _db.BlockedIpAddresses.Add(block);
            await _db.SaveChangesAsync(ct);

            await RecordAsync(
                "IpBlocked",
                $"IP {normalized} blocked by {adminUsername ?? "admin"}. Reason: {dto.Reason ?? "n/a"}. Permanent: {dto.IsPermanent}",
                "Warning",
                normalized,
                adminUserId,
                adminUsername,
                "Admin",
                ct: ct);

            await _audit.CreateAsync(
                action: "BlockIp",
                module: "Security",
                entityName: "BlockedIpAddress",
                entityId: block.Id.ToString(),
                ipAddress: null,
                userId: adminUserId,
                username: adminUsername,
                role: "Admin",
                status: "Success",
                reason: dto.Reason,
                ct: ct);

            return MapBlocked(block);
        }

        public async Task<bool> UnblockIpAsync(int id, int? adminUserId, string? adminUsername, CancellationToken ct = default)
        {
            var block = await _db.BlockedIpAddresses.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (block == null) return false;
            if (!block.IsActive) return true;

            block.IsActive = false;
            block.UnblockedAt = DateTime.UtcNow;
            block.UnblockedByUserId = adminUserId;
            block.UnblockedByUsername = adminUsername;
            await _db.SaveChangesAsync(ct);

            await RecordAsync(
                "IpUnblocked",
                $"IP {block.IpAddress} unblocked by {adminUsername ?? "admin"}",
                "Info",
                block.IpAddress,
                adminUserId,
                adminUsername,
                "Admin",
                ct: ct);

            await _audit.CreateAsync(
                action: "UnblockIp",
                module: "Security",
                entityName: "BlockedIpAddress",
                entityId: block.Id.ToString(),
                userId: adminUserId,
                username: adminUsername,
                role: "Admin",
                status: "Success",
                ct: ct);

            return true;
        }

        public async Task<List<BlockedIpDto>> GetBlockedIpsAsync(bool activeOnly = true, CancellationToken ct = default)
        {
            var q = _db.BlockedIpAddresses.AsNoTracking().AsQueryable();
            if (activeOnly)
            {
                var now = DateTime.UtcNow;
                q = q.Where(x => x.IsActive && (x.ExpiresAt == null || x.ExpiresAt > now));
            }

            var list = await q.OrderByDescending(x => x.BlockedAt).ToListAsync(ct);
            return list.Select(MapBlocked).ToList();
        }

        private static BlockedIpDto MapBlocked(BlockedIpAddress x) => new()
        {
            Id = x.Id,
            IpAddress = x.IpAddress,
            Reason = x.Reason,
            BlockedByUserId = x.BlockedByUserId,
            BlockedByUsername = x.BlockedByUsername,
            BlockedAt = x.BlockedAt,
            ExpiresAt = x.ExpiresAt,
            IsActive = x.IsActive,
            UnblockedAt = x.UnblockedAt,
            UnblockedByUsername = x.UnblockedByUsername
        };
    }
}
