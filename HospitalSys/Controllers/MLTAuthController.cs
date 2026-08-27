using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using HospitalSys.Data;
using HospitalSys.Dto;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("mlt/[controller]")]
    public class MLTAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private const string JwtSecret =
            "hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk";
        private const string JwtIssuer = "HospitalSys";
        private const string JwtAudience = "HospitalSysClient";

        private const string MltRole = "LaboratoryTechnician";

        public MLTAuthController(AppDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // LOGIN
        // POST: /mlt/MLTAuth/mlt_login
        // =========================================================

        [HttpPost("mlt_login")]
        [AllowAnonymous]
        public async Task<IActionResult> MLTLogin(
            [FromBody] MLTLoginDto loginDto)
        {
            try
            {
                // -------------------------------------------------
                // Validate request
                // -------------------------------------------------

                if (loginDto == null)
                {
                    return BadRequest(new
                    {
                        message = "Login data is required"
                    });
                }

                if (string.IsNullOrWhiteSpace(loginDto.Username) ||
                    string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return BadRequest(new
                    {
                        message = "Username and Password are required"
                    });
                }


                // -------------------------------------------------
                // Find user
                // -------------------------------------------------

                var user = await _context.Users
                    .Include(u => u.UserRole)
                        .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(
                        u => u.Username == loginDto.Username);


                if (user == null)
                {
                    return Unauthorized(new
                    {
                        message = "Invalid username or password"
                    });
                }


                // -------------------------------------------------
                // Check Laboratory Technician role
                // -------------------------------------------------

                bool isLaboratoryTechnician =
                    user.UserRole.Any(
                        ur => ur.Role != null &&
                              ur.Role.RoleName == MltRole
                    );


                if (!isLaboratoryTechnician)
                {
                    return Unauthorized(new
                    {
                        message = "User is not a Laboratory Technician"
                    });
                }


                // -------------------------------------------------
                // Verify password
                // -------------------------------------------------

                bool passwordValid;

                try
                {
                    passwordValid = BCrypt.Net.BCrypt.Verify(
                        loginDto.Password,
                        user.HashPassword
                    );
                }
                catch
                {
                    passwordValid = false;
                }


                if (!passwordValid)
                {
                    return Unauthorized(new
                    {
                        message = "Invalid username or password"
                    });
                }


                // -------------------------------------------------
                // Full name
                // -------------------------------------------------

                string fullName =
                    $"{user.FirstName} {user.FatherName}".Trim();


                // -------------------------------------------------
                // Generate JWT
                // -------------------------------------------------

                string token = GenerateAuthToken(
                    new MLTAuthDto
                    {
                        Username = user.Username,
                        FullName = fullName,
                        RoleName = MltRole
                    }
                );


                // -------------------------------------------------
                // JWT Cookie
                // -------------------------------------------------

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,

                    // Required when using HTTPS.
                    // For your production deployment this should remain true.
                    Secure = true,

                    SameSite = SameSiteMode.Lax,

                    Expires = DateTimeOffset.UtcNow.AddHours(2),

                    Path = "/",

                    // DO NOT set Domain = "localhost".
                    // Let ASP.NET create a host-only cookie.
                    IsEssential = true
                };


                Response.Cookies.Append(
                    "jwt",
                    token,
                    cookieOptions
                );


                return Ok(new
                {
                    message = "Login successful",
                    username = user.Username,
                    fullName = fullName,
                    role = MltRole
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An error occurred during login.",
                        error = ex.Message
                    }
                );
            }
        }


        // =========================================================
        // AUTH ME
        // GET: /mlt/MLTAuth/auth_me
        // =========================================================

        [HttpGet("auth_me")]
        [Authorize(Roles = MltRole)]
        public IActionResult AuthMe()
        {
            try
            {
                var token = Request.Cookies["jwt"];


                if (string.IsNullOrWhiteSpace(token))
                {
                    return Unauthorized(new
                    {
                        message = "No authentication token found"
                    });
                }


                // -------------------------------------------------
                // JWT validation parameters
                // -------------------------------------------------

                var validationParameters =
                    new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,

                        IssuerSigningKey =
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(JwtSecret)
                            ),

                        ValidateIssuer = true,
                        ValidIssuer = JwtIssuer,

                        ValidateAudience = true,
                        ValidAudience = JwtAudience,

                        ValidateLifetime = true,

                        ClockSkew = TimeSpan.Zero
                    };


                // -------------------------------------------------
                // Validate token
                // -------------------------------------------------

                var principal =
                    new JwtSecurityTokenHandler()
                        .ValidateToken(
                            token,
                            validationParameters,
                            out _
                        );


                // -------------------------------------------------
                // Read claims
                // -------------------------------------------------

                var username =
                    principal.FindFirst(
                        ClaimTypes.NameIdentifier
                    )?.Value;


                var fullName =
                    principal.FindFirst(
                        ClaimTypes.Name
                    )?.Value;


                var role =
                    principal.FindFirst(
                        ClaimTypes.Role
                    )?.Value;


                // -------------------------------------------------
                // Verify role
                // -------------------------------------------------

                if (role != MltRole)
                {
                    return Unauthorized(new
                    {
                        message = "Invalid Laboratory Technician role"
                    });
                }


                return Ok(new
                {
                    fullName = fullName,
                    username = username,
                    role = role
                });
            }
            catch (SecurityTokenExpiredException)
            {
                Response.Cookies.Delete("jwt");

                return Unauthorized(new
                {
                    message = "Authentication token has expired"
                });
            }
            catch (SecurityTokenException)
            {
                Response.Cookies.Delete("jwt");

                return Unauthorized(new
                {
                    message = "Invalid authentication token"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Authentication verification failed.",
                        error = ex.Message
                    }
                );
            }
        }


        // =========================================================
        // LOGOUT
        // POST: /mlt/MLTAuth/logout
        // =========================================================

        [HttpPost("logout")]
        [Authorize(Roles = MltRole)]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt");

            return Ok(new
            {
                message = "Logout successful"
            });
        }


        // =========================================================
        // GENERATE JWT
        // =========================================================

        private string GenerateAuthToken(MLTAuthDto user)
        {
            var claims = new[]
            {
                // Username
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Username
                ),

                // Full name
                new Claim(
                    ClaimTypes.Name,
                    user.FullName
                ),

                // GivenName can also be useful to your frontend
                new Claim(
                    ClaimTypes.GivenName,
                    user.FullName
                ),

                // Role
                new Claim(
                    ClaimTypes.Role,
                    user.RoleName
                )
            };


            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(JwtSecret)
                );


            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256
                );


            var token =
                new JwtSecurityToken(
                    issuer: JwtIssuer,
                    audience: JwtAudience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(2),
                    signingCredentials: credentials
                );


            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}