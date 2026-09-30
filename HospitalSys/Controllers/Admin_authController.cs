using System.Security.Claims;
using System.Text;
using HospitalSys.Attributes;
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Helpers;
using HospitalSys.Models;
using HospitalSys.RateLimiting;
using HospitalSys.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/[controller]")]
    public class Admin_authController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ISecurityEventService _security;
        private readonly IAuditLogService _audit;

        public Admin_authController(
            AppDbContext context,
            IConfiguration configuration,
            ISecurityEventService security,
            IAuditLogService audit)
        {
            _context = context;
            _configuration = configuration;
            _security = security;
            _audit = audit;
        }

        [HttpPost("login")]
        [EnableRateLimiting(RateLimitExtensions.LoginPolicy)]
        public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto admin)
        {
            var ip = IpAddressHelper.GetClientIp(HttpContext);

            if (string.IsNullOrWhiteSpace(admin.username) || string.IsNullOrWhiteSpace(admin.Password))
            {
                return BadRequest(new { message = "Username and Password are required" });
            }

            var Admin = await _context.SuperAdmin.FirstOrDefaultAsync(u => u.Username == admin.username);
            if (Admin == null)
            {
                await _security.RecordAsync(
                    "FailedLogin",
                    $"Failed admin login — user not found: '{admin.username}'",
                    "Warning",
                    ip,
                    username: admin.username,
                    endpoint: "/Hospital/Admin_auth/login");

                return NotFound(new { message = "User Not Found" });
            }

            bool IsPass = BCrypt.Net.BCrypt.Verify(admin.Password, Admin.HashPassword);
            if (!IsPass)
            {
                await _security.RecordAsync(
                    "FailedLogin",
                    $"Failed admin login — incorrect password for '{admin.username}'",
                    "Warning",
                    ip,
                    username: admin.username,
                    role: "Admin",
                    endpoint: "/Hospital/Admin_auth/login");

                return Unauthorized(new { message = "Incorrect Password" });
            }

            string token = GenerateAuthToken(Admin);
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,            // set false for local HTTP-only testing if needed
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddHours(2),
                Path = "/",
                Domain = "localhost"
            };

            Response.Cookies.Append("jwt", token, cookieOptions);

            await _security.RecordAsync(
                "SuccessfulLogin",
                $"Admin '{Admin.Username}' logged in",
                "Info",
                ip,
                Admin.ID,
                Admin.Username,
                Admin.AdminRole.ToString(),
                "/Hospital/Admin_auth/login");

            await _audit.CreateAsync(
                action: "Login",
                module: "Auth",
                entityName: "SuperAdmins",
                entityId: Admin.ID.ToString(),
                endpoint: "/Hospital/Admin_auth/login",
                httpMethod: "POST",
                ipAddress: ip,
                userId: Admin.ID,
                username: Admin.Username,
                role: Admin.AdminRole.ToString(),
                status: "Success");

            return Ok(new
            {
                message = "Login successful",
                username = Admin.Username,
                role = Admin.AdminRole.ToString()
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var ip = IpAddressHelper.GetClientIp(HttpContext);
            var username = User.FindFirstValue(ClaimTypes.GivenName);
            int? userId = null;
            if (int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
                userId = id;

            Response.Cookies.Delete("jwt", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Path = "/",
                Domain = "localhost"
            });

            await _security.RecordAsync(
                "Logout",
                $"Admin '{username ?? "unknown"}' logged out",
                "Info",
                ip,
                userId,
                username,
                "Admin",
                "/Hospital/Admin_auth/logout");

            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("me")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var token = Request.Cookies["jwt"];

            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized(new { message = "No authentication token found" });
            }

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk");
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var username = principal.FindFirst(ClaimTypes.GivenName)?.Value;
                var role = principal.FindFirst(ClaimTypes.Role)?.Value;

                return Ok(new
                {
                    id = userId,
                    username = username,
                    role = role
                });
            }
            catch
            {
                return Unauthorized(new { message = "Invalid token" });
            }
        }

        public string GenerateAuthToken(SuperAdmins admin)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.GivenName, admin.Username),
                new Claim(ClaimTypes.NameIdentifier, admin.ID.ToString()),
                new Claim(ClaimTypes.Role, admin.AdminRole.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk"));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                signingCredentials: credentials,
                expires: DateTime.UtcNow.AddHours(2),
                issuer: "HospitalSys",
                audience: "HospitalSysClient"
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}