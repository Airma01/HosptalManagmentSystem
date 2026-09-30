using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.Security
{
    /// <summary>
    /// IP block history is retained (IsActive=false on unblock). Exact IPv4/IPv6 only — no CIDR.
    /// </summary>
    public class BlockedIpAddress
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Reason { get; set; }

        public int? BlockedByUserId { get; set; }

        [MaxLength(100)]
        public string? BlockedByUsername { get; set; }

        public DateTime BlockedAt { get; set; } = DateTime.UtcNow;

        /// <summary>null = permanent block</summary>
        public DateTime? ExpiresAt { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? UnblockedAt { get; set; }

        public int? UnblockedByUserId { get; set; }

        [MaxLength(100)]
        public string? UnblockedByUsername { get; set; }
    }
}
