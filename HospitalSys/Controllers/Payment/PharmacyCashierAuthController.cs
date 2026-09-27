using HospitalSys.Data;
using HospitalSys.DTO.Payment.Auth;
using HospitalSys.DTO.Payment.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HospitalSys.Controllers.Payment
{
    /// <summary>
    /// Auth via Users + UserRole + Role only (no PharmacyCashier table on login).
    /// One Pharmacy Cashier can handle ALL branch pharmacies.
    /// </summary>
    [ApiController]
    [Route("Hospital/PharmacyCashier/[controller]")]
    public class PharmacyCashierAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private const string JwtSecret = "hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk";
        private const string RoleName = "PharmacyCashier";

        public PharmacyCashierAuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("auth_me")]
        [Authorize(Roles = "PharmacyCashier")]
        public IActionResult AuthMe()
        {
            var token = Request.Cookies["jwt"];
            if (token == null)
                return Unauthorized(new { message = "No authentication token found" });

            var principal = ValidateToken(token);
            return Ok(new
            {
                fullName = principal.FindFirst(ClaimTypes.Name)?.Value,
                username = principal.FindFirst(ClaimTypes.GivenName)?.Value,
                userID = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                canAccessAllBranches = true,
                role = principal.FindFirst(ClaimTypes.Role)?.Value
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(loginDto.username) || string.IsNullOrWhiteSpace(loginDto.Password))
                    return BadRequest(new { message = "Username and Password are required" });

                var user = await _context.Users
                    .Include(u => u.UserRole)
                        .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.Username == loginDto.username);

                if (user == null)
                    return NotFound(new { message = "User Not Found" });

                if (!user.IsActive)
                    return Unauthorized(new { message = "User account is inactive" });

                if (user.UserRole.All(r => r.Role.RoleName != RoleName))
                    return Unauthorized(new { message = "User is not a Pharmacy Cashier" });

                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashPassword))
                    return Unauthorized(new { message = "Incorrect Password" });

                var fullName = $"{user.FirstName} {user.FatherName}";
                var token = GenerateAuthToken(user.UserID, user.Username, fullName, RoleName);

                Response.Cookies.Append("jwt", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTime.UtcNow.AddHours(8),
                    Path = "/",
                    Domain = "localhost"
                });

                return Ok(new PharmacyCashierLoginResponseDto
                {
                    Message = "Login successful",
                    PharmacyCashierID = 0,
                    UserID = user.UserID,
                    FullName = fullName,
                    Username = user.Username,
                    Role = RoleName,
                    CanAccessAllBranches = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Login failed", error = ex.Message });
            }
        }

        [HttpPost("logout")]
        [Authorize(Roles = "PharmacyCashier")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt", new CookieOptions { Path = "/", Domain = "localhost" });
            return Ok(new { message = "Logged out successfully" });
        }

        private ClaimsPrincipal ValidateToken(string token)
        {
            var parameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };
            return new JwtSecurityTokenHandler().ValidateToken(token, parameters, out _);
        }

        private string GenerateAuthToken(int userId, string username, string fullName, string role)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.GivenName, username),
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, fullName),
                new Claim(ClaimTypes.Role, role),
                new Claim("CanAccessAllBranches", "true")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var jwt = new JwtSecurityToken(
                claims: claims,
                signingCredentials: credentials,
                expires: DateTime.UtcNow.AddHours(8),
                issuer: "HospitalSys",
                audience: "HospitalSysClient"
            );
            return new JwtSecurityTokenHandler().WriteToken(jwt);
        }
    }
}
