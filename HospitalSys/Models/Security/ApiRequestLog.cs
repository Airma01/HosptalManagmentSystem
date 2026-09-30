using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.Security
{
    /// <summary>
    /// API traffic monitoring. High volume — indexes on Timestamp, IpAddress, UserId, Endpoint, StatusCode.
    /// For a student project we persist to PostgreSQL with pagination; production may add retention/archival.
    /// </summary>
    public class ApiRequestLog
    {
        [Key]
        public long Id { get; set; }

        public int? UserId { get; set; }

        [MaxLength(100)]
        public string? Username { get; set; }

        [MaxLength(50)]
        public string? Role { get; set; }

        [MaxLength(45)]
        public string? IpAddress { get; set; }

        [MaxLength(300)]
        public string Endpoint { get; set; } = string.Empty;

        [MaxLength(10)]
        public string HttpMethod { get; set; } = string.Empty;

        public int StatusCode { get; set; }

        public long ResponseTimeMs { get; set; }

        public bool WasRateLimited { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
