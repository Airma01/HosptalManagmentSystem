using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HospitalSys.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HospitalSys.Services
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _settings;
        private readonly byte[] _keyBytes;

        public JwtService(IOptions<JwtSettings> options)
        {
            _settings = options.Value;
            if (string.IsNullOrWhiteSpace(_settings.Secret))
                throw new InvalidOperationException(
                    "JWT Secret is not configured. Set JWT_SECRET or Jwt:Secret environment/configuration value.");

            _keyBytes = Encoding.UTF8.GetBytes(_settings.Secret);
        }

        public string CookieName =>
            string.IsNullOrWhiteSpace(_settings.CookieName) ? "jwt" : _settings.CookieName;

        public string GenerateToken(IEnumerable<Claim> claims, TimeSpan? expiration = null)
        {
            var lifetime = expiration ?? TimeSpan.FromMinutes(
                _settings.ExpirationMinutes > 0 ? _settings.ExpirationMinutes : 120);

            var key = new SymmetricSecurityKey(_keyBytes);
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.Add(lifetime),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal ValidateToken(string token)
        {
            var parameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(_keyBytes),
                // Controllers historically validated only the signing key.
                // Middleware validates issuer/audience; keep controller checks compatible.
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            return new JwtSecurityTokenHandler().ValidateToken(token, parameters, out _);
        }

        public void AppendAuthCookie(HttpResponse response, string token, TimeSpan? expiration = null)
        {
            var lifetime = expiration ?? TimeSpan.FromMinutes(
                _settings.ExpirationMinutes > 0 ? _settings.ExpirationMinutes : 120);

            var options = BuildCookieOptions(lifetime);
            response.Cookies.Append(CookieName, token, options);
        }

        public void DeleteAuthCookie(HttpResponse response)
        {
            var options = BuildCookieOptions(TimeSpan.Zero);
            response.Cookies.Delete(CookieName, options);
        }

        private CookieOptions BuildCookieOptions(TimeSpan lifetime)
        {
            var sameSite = ParseSameSite(_settings.CookieSameSite);

            var options = new CookieOptions
            {
                HttpOnly = true,
                Secure = _settings.CookieSecure,
                SameSite = sameSite,
                Expires = DateTime.UtcNow.Add(lifetime),
                Path = "/"
            };

            // Only set Domain when explicitly configured. Omitting it keeps the cookie host-only,
            // which works for localhost development and Docker service hostnames.
            if (!string.IsNullOrWhiteSpace(_settings.CookieDomain))
                options.Domain = _settings.CookieDomain;

            return options;
        }

        private static SameSiteMode ParseSameSite(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return SameSiteMode.Lax;

            return value.Trim().ToLowerInvariant() switch
            {
                "strict" => SameSiteMode.Strict,
                "none" => SameSiteMode.None,
                _ => SameSiteMode.Lax
            };
        }
    }
}
