using System.Security.Claims;
using System.Text;
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models;
using Microsoft.AspNetCore.Mvc;
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

        public Admin_authController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto admin)
        {
            if (string.IsNullOrWhiteSpace(admin.username) || string.IsNullOrWhiteSpace(admin.Password))
            {
                return BadRequest(new { message = "Username and Password are required" });
            }

            var Admin = await _context.SuperAdmin.FirstOrDefaultAsync(u => u.Username == admin.username);
            if (Admin == null)
            {
                return NotFound(new { message = "User Not Found" });
            }

            bool IsPass = BCrypt.Net.BCrypt.Verify(admin.Password, Admin.HashPassword);
            if (!IsPass)
            {
                return Unauthorized(new { message = "Incorrect Password" });
            }

            // Generate token
            string token = GenerateAuthToken(Admin);

            // Set HttpOnly Cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,          // Can't be accessed by JavaScript
                Secure = true,            // Only sent over HTTPS (set to false for local development with HTTP)
                SameSite = SameSiteMode.Lax, // CSRF protection
                Expires = DateTime.UtcNow.AddHours(2),
                Path = "/",
                Domain = "localhost"      // Optional: specify domain
            };

            // Append the cookie to the response
            Response.Cookies.Append("jwt", token, cookieOptions);

            // Return success response (without token in body)
            return Ok(new 
            { 
                message = "Login successful", 
                username = Admin.Username,
                role = Admin.AdminRole.ToString()
            });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Delete the cookie
            Response.Cookies.Delete("jwt", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Path = "/",
                Domain = "localhost"
            });

            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // Get token from cookie
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