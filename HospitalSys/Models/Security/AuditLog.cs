using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Security
{
    /// <summary>
    /// Append-only audit trail: WHO did WHAT, WHEN, FROM WHERE, TO WHICH RESOURCE.
    /// Never stores passwords, tokens, full medical payloads, or secrets.
    /// </summary>
    public class AuditLog
    {
        [Key]
        public long AuditLogId { get; set; }

        public int? UserId { get; set; }

        [MaxLength(100)]
        public string? Username { get; set; }

        [MaxLength(50)]
        public string? Role { get; set; }

        /// <summary>e.g. Create, Update, Delete, Login, BlockIp, UnblockIp</summary>
        [Required, MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        /// <summary>e.g. Consultation, Triage, User, Security</summary>
        [MaxLength(100)]
        public string? Module { get; set; }

        [MaxLength(100)]
        public string? EntityName { get; set; }

        [MaxLength(50)]
        public string? EntityId { get; set; }

        [MaxLength(300)]
        public string? Endpoint { get; set; }

        [MaxLength(10)]
        public string? HttpMethod { get; set; }

        [MaxLength(45)]
        public string? IpAddress { get; set; }

        /// <summary>Success, Failed, Denied, etc.</summary>
        [MaxLength(30)]
        public string Status { get; set; } = "Success";

        [MaxLength(500)]
        public string? Reason { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
