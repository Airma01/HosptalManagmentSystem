using HospitalSys.Data;
using HospitalSys.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/CSM/[controller]")]
    public class CSMAuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        private const string JwtKey =
            "hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk";

        public CSMAuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("auth_me")]
        public IActionResult AuthMe()
        {
            try
            {
                var token = Request.Cookies["jwt"];

                if (string.IsNullOrEmpty(token))
                {
                    return Unauthorized(new
                    {
                        message = "No authentication token found"
                    });
                }

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey =
                        new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(JwtKey)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };

                var principal =
                    new JwtSecurityTokenHandler()
                    .ValidateToken(token, validationParameters, out _);

                return Ok(new
                {
                    fullName = principal.FindFirst(ClaimTypes.Name)?.Value,
                    username = principal.FindFirst(ClaimTypes.GivenName)?.Value,
                    userID = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    managerID = principal.FindFirst("ManagerID")?.Value,
                    centralPharmacyID = principal.FindFirst("CentralPharmacyID")?.Value,
                    role = principal.FindFirst(ClaimTypes.Role)?.Value
                });
            }
            catch
            {
                return Unauthorized(new
                {
                    message = "Invalid or expired token"
                });
            }
        }

        [HttpPost("CSM_login")]
        public async Task<IActionResult> CSMLogin(
            [FromBody] CSMLoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(loginDto.username) ||
                    string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return BadRequest(new
                    {
                        message = "Username and Password are required"
                    });
                }

                var manager = await _context.CentralStoreManagers
                    .Include(c => c.MainPharmacyManager)
                        .ThenInclude(m => m.Users)
                            .ThenInclude(u => u.UserRole)
                                .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(c =>
                        c.MainPharmacyManager.Users.Username ==
                        loginDto.username &&
                        c.IsActive &&
                        c.IsCurrent);

                if (manager == null)
                {
                    return NotFound(new
                    {
                        message = "User not found"
                    });
                }

                bool hasRole =
                    manager.MainPharmacyManager.Users.UserRole
                    .Any(r => r.Role.RoleName == "CSM");

                if (!hasRole)
                {
                    return Unauthorized(new
                    {
                        message = "User is not a Central Store Manager"
                    });
                }

                bool isPasswordCorrect =
                    BCrypt.Net.BCrypt.Verify(
                        loginDto.Password,
                        manager.MainPharmacyManager.Users.HashPassword);

                if (!isPasswordCorrect)
                {
                    return Unauthorized(new
                    {
                        message = "Incorrect password"
                    });
                }

                string token = GenerateAuthToken(
                    new CSMtCookieDto
                    {
                        username =
                            manager.MainPharmacyManager.Users.Username,

                        ManagerID =
                            manager.MainPharmacyManager.ManagerID,

                        UserID =
                            manager.MainPharmacyManager.Users.UserID,

                        Fullname =
                            manager.MainPharmacyManager.Users.FirstName +
                            " " +
                            manager.MainPharmacyManager.Users.FatherName,

                        RoleName = "CSM"
                    },
                    manager.CentralPharmacyID
                );

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, // true in production HTTPS
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTime.UtcNow.AddHours(2),
                    Path = "/"
                };

                Response.Cookies.Append(
                    "jwt",
                    token,
                    cookieOptions);

                return Ok(new
                {
                    message = "Login successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt");

            return Ok(new
            {
                message = "Logout successful"
            });
        }

        private string GenerateAuthToken(
            CSMtCookieDto user,
            int centralPharmacyId)
        {
            var claims = new[]
            {
                new Claim(
                    ClaimTypes.GivenName,
                    user.username),

                new Claim(
                    ClaimTypes.Name,
                    user.Fullname),

                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.UserID.ToString()),

                new Claim(
                    "ManagerID",
                    user.ManagerID.ToString()),

                new Claim(
                    "CentralPharmacyID",
                    centralPharmacyId.ToString()),

                new Claim(
                    ClaimTypes.Role,
                    "CSM")
            };

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(JwtKey));

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "HospitalSys",
                audience: "HospitalSysClient",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}