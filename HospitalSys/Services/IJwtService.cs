using System.Security.Claims;

namespace HospitalSys.Services
{
    public interface IJwtService
    {
        /// <summary>
        /// Creates a signed JWT with the given claims.
        /// Expiration defaults to JwtSettings.ExpirationMinutes when null.
        /// </summary>
        string GenerateToken(IEnumerable<Claim> claims, TimeSpan? expiration = null);

        /// <summary>
        /// Validates a JWT and returns the principal. Throws on invalid/expired tokens.
        /// Signing key is always validated; issuer/audience validation matches Program.cs middleware.
        /// </summary>
        ClaimsPrincipal ValidateToken(string token);

        /// <summary>
        /// Appends the JWT as an HttpOnly cookie using centralized cookie settings.
        /// </summary>
        void AppendAuthCookie(HttpResponse response, string token, TimeSpan? expiration = null);

        /// <summary>
        /// Deletes the auth cookie with matching path/domain options.
        /// </summary>
        void DeleteAuthCookie(HttpResponse response);

        /// <summary>Configured cookie name (default "jwt").</summary>
        string CookieName { get; }
    }
}
