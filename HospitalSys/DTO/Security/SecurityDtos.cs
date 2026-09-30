using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Security
{
    public class AuditLogDto
    {
        public long AuditLogId { get; set; }
        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string? Role { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? Module { get; set; }
        public string? EntityName { get; set; }
        public string? EntityId { get; set; }
        public string? Endpoint { get; set; }
        public string? HttpMethod { get; set; }
        public string? IpAddress { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class AuditLogFilterDto
    {
        public string? Username { get; set; }
        public string? Role { get; set; }
        public string? IpAddress { get; set; }
        public string? Module { get; set; }
        public string? Action { get; set; }
        public string? Status { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class ApiRequestLogDto
    {
        public long Id { get; set; }
        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string? Role { get; set; }
        public string? IpAddress { get; set; }
        public string Endpoint { get; set; } = string.Empty;
        public string HttpMethod { get; set; } = string.Empty;
        public int StatusCode { get; set; }
        public long ResponseTimeMs { get; set; }
        public bool WasRateLimited { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class ApiRequestFilterDto
    {
        public string? Username { get; set; }
        public string? Role { get; set; }
        public string? IpAddress { get; set; }
        public string? Endpoint { get; set; }
        public int? StatusCode { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class SecurityEventDto
    {
        public long Id { get; set; }
        public string EventType { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string? Role { get; set; }
        public string? IpAddress { get; set; }
        public string? Endpoint { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class SecurityEventFilterDto
    {
        public string? EventType { get; set; }
        public string? Username { get; set; }
        public string? IpAddress { get; set; }
        public string? Severity { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class BlockIpDto
    {
        [Required]
        [MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Reason { get; set; }

        /// <summary>true = permanent (ExpiresAt null)</summary>
        public bool IsPermanent { get; set; } = true;

        public DateTime? ExpiresAt { get; set; }
    }

    public class BlockedIpDto
    {
        public int Id { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public int? BlockedByUserId { get; set; }
        public string? BlockedByUsername { get; set; }
        public DateTime BlockedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; }
        public DateTime? UnblockedAt { get; set; }
        public string? UnblockedByUsername { get; set; }
    }

    public class SecurityStatisticsDto
    {
        public long TotalApiRequests { get; set; }
        public long FailedLogins { get; set; }
        public long RateLimitedRequests { get; set; }
        public int ActiveBlockedIps { get; set; }
        public long Unauthorized401 { get; set; }
        public long Forbidden403 { get; set; }
        public long HighRequestActivityCount { get; set; }
        public List<HighActivityItemDto> HighActivity { get; set; } = new();
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
    }

    public class HighActivityItemDto
    {
        public string? IpAddress { get; set; }
        public string? Username { get; set; }
        public long RequestCount { get; set; }
    }

    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}
