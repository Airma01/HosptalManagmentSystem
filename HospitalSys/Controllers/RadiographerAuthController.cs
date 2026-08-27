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
    [Route("radiographer/[controller]")]
    public class RadiographerAuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        private const string JwtSecret =
            "hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk";

        private const string JwtIssuer = "HospitalSys";
        private const string JwtAudience = "HospitalSysClient";

        private const string RadiographerRole = "Radiographer";

        public RadiographerAuthController(AppDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // LOGIN
        // POST: /radiographer/RadiographerAuth/radiographer_login
        // =========================================================

        [HttpPost("radiographer_login")]
        [AllowAnonymous]
        public async Task<IActionResult> RadiographerLogin(
            [FromBody] RadiographerLoginDto loginDto)
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
                        u => u.Username == loginDto.Username
                    );


                if (user == null)
                {
                    return Unauthorized(new
                    {
                        message = "Invalid username or password"
                    });
                }


                // -------------------------------------------------
                // Check Radiographer role
                // -------------------------------------------------

                bool isRadiographer =
                    user.UserRole.Any(
                        ur => ur.Role != null &&
                              ur.Role.RoleName == RadiographerRole
                    );


                if (!isRadiographer)
                {
                    return Unauthorized(new
                    {
                        message = "User is not a Radiographer"
                    });
                }


                // -------------------------------------------------
                // Verify password
                // -------------------------------------------------

                bool passwordValid;

                try
                {
                    passwordValid =
                        BCrypt.Net.BCrypt.Verify(
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

                string token =
                    GenerateAuthToken(
                        new RadiographerAuthDto
                        {
                            Username = user.Username,
                            FullName = fullName,
                            RoleName = RadiographerRole
                        }
                    );


                // -------------------------------------------------
                // JWT Cookie
                // -------------------------------------------------

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddHours(2),
                    Path = "/",
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
                    role = RadiographerRole
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An error occurred during login.",
                        error = ex.Message
                    }
                );
            }
        }


        // =========================================================
        // AUTH ME
        // GET: /radiographer/RadiographerAuth/auth_me
        // =========================================================

        [HttpGet("auth_me")]
        [Authorize(Roles = RadiographerRole)]
        public IActionResult AuthMe()
        {
            try
            {
                var token =
                    Request.Cookies["jwt"];


                if (string.IsNullOrWhiteSpace(token))
                {
                    return Unauthorized(new
                    {
                        message =
                            "No authentication token found"
                    });
                }


                // -------------------------------------------------
                // JWT validation
                // -------------------------------------------------

                var validationParameters =
                    new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,

                        IssuerSigningKey =
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(
                                    JwtSecret
                                )
                            ),

                        ValidateIssuer = true,

                        ValidIssuer = JwtIssuer,

                        ValidateAudience = true,

                        ValidAudience = JwtAudience,

                        ValidateLifetime = true,

                        ClockSkew = TimeSpan.Zero
                    };


                // -------------------------------------------------
                // Validate JWT
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

                if (role != RadiographerRole)
                {
                    return Unauthorized(new
                    {
                        message =
                            "Invalid Radiographer role"
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
                    message =
                        "Authentication token has expired"
                });
            }
            catch (SecurityTokenException)
            {
                Response.Cookies.Delete("jwt");

                return Unauthorized(new
                {
                    message =
                        "Invalid authentication token"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Authentication verification failed.",
                        error = ex.Message
                    }
                );
            }
        }


        // =========================================================
        // LOGOUT
        // POST: /radiographer/RadiographerAuth/logout
        // =========================================================

        [HttpPost("logout")]
        [Authorize(Roles = RadiographerRole)]
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

        private string GenerateAuthToken(
            RadiographerAuthDto user)
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

                // Full name
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
                    Encoding.UTF8.GetBytes(
                        JwtSecret
                    )
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

                    expires:
                        DateTime.UtcNow.AddHours(2),

                    signingCredentials:
                        credentials
                );


            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}