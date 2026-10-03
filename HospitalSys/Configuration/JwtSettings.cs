namespace HospitalSys.Configuration
{
    /// <summary>
    /// JWT configuration bound from environment / configuration.
    /// Never hardcode secrets — use JWT_SECRET / Jwt:Secret.
    /// </summary>
    public class JwtSettings
    {
        public const string SectionName = "Jwt";

        /// <summary>Signing key. Must be a long random secret from environment.</summary>
        public string Secret { get; set; } = string.Empty;

        public string Issuer { get; set; } = "HospitalSys";

        public string Audience { get; set; } = "HospitalSysClient";

        /// <summary>Default token lifetime in minutes when not overridden per-call.</summary>
        public int ExpirationMinutes { get; set; } = 120;

        /// <summary>Cookie name used by the frontend (withCredentials).</summary>
        public string CookieName { get; set; } = "jwt";

        /// <summary>
        /// When true, cookie is marked Secure (HTTPS only).
        /// Defaults false for local HTTP development; set true in production.
        /// </summary>
        public bool CookieSecure { get; set; } = false;

        /// <summary>SameSite mode: Lax, Strict, or None.</summary>
        public string CookieSameSite { get; set; } = "Lax";

        /// <summary>
        /// Optional cookie Domain. Leave empty so the cookie is host-only
        /// (works for localhost and Docker service names without hardcoding).
        /// </summary>
        public string? CookieDomain { get; set; }
    }
}
