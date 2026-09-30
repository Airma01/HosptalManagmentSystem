using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.Security
{
    /// <summary>
    /// Discrete security-relevant events (failed login, rate limit, IP block, etc.).
    /// Neutral wording — never labels a user as "attacker".
    /// </summary>
    public class SecurityEvent
    {
        [Key]
        public long Id { get; set; }

        /// <summary>
        /// FailedLogin, SuccessfulLogin, Logout, UnauthorizedRequest, ForbiddenRequest,
        /// RateLimitExceeded, IpBlocked, IpUnblocked, HighRequestActivity, SuspiciousActivity
        /// </summary>
        [Required, MaxLength(80)]
        public string EventType { get; set; } = string.Empty;

        public int? UserId { get; set; }

        [MaxLength(100)]
        public string? Username { get; set; }

        [MaxLength(50)]
        public string? Role { get; set; }

        [MaxLength(45)]
        public string? IpAddress { get; set; }

        [MaxLength(300)]
        public string? Endpoint { get; set; }

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        /// <summary>Info, Warning, Critical</summary>
        [MaxLength(20)]
        public string Severity { get; set; } = "Info";

        /// <summary>Open, Acknowledged, Resolved</summary>
        [MaxLength(20)]
        public string Status { get; set; } = "Open";

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
