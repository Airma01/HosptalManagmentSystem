using HospitalSys.Data;
using HospitalSys.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using HospitalSys.Services;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/nurse/[Controller]")]
    public class NurseAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IJwtService _jwt;

        public NurseAuthController(AppDbContext context, IJwtService jwt)
        {
            _jwt = jwt;
            _context = context;
        }

        [HttpGet("auth_me")]
        [Authorize(Roles = "Nurse")]
        public IActionResult AuthMe()
        {
            var token = Request.Cookies["jwt"];
            if (token == null)
            {
                return Unauthorized(new { message = "No authentication token found" });
            }

            var principal = _jwt.ValidateToken(token);
            var fullName = principal.FindFirst(ClaimTypes.Name)?.Value;
            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = principal.FindFirst(ClaimTypes.Role)?.Value;
            var nurseId = principal.FindFirst("NurseID")?.Value; // optional – only if you still put it in the token

            return Ok(new
            {
                fullName = fullName,
                UserID = userId,
                NurseID = nurseId,   // can remove later if you stop using Nurse table
                role = role
            });
        }

        [HttpPost("nurse_login")]
        public async Task<IActionResult> NurseLogin([FromBody] NurseLoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(loginDto.username) || string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return BadRequest(new { message = "Username and Password are required" });
                }

                // ✅ Authenticate via Users schema + role "Nurse"
                var user = await _context.Users
                    .Include(u => u.UserRole)
                        .ThenInclude(ur => ur.Role)
                    .Include(u => u.Nurse)   // optional: only if you still want NurseID in the token
                    .FirstOrDefaultAsync(u => u.Username == loginDto.username);

                if (user == null)
                {
                    return NotFound(new { message = "User Not Found" });
                }

                if (user.UserRole == null || user.UserRole.All(r => r.Role?.RoleName != "Nurse"))
                {
                    return Unauthorized(new { message = "User is not a nurse" });
                }

                if (!user.IsActive)
                {
                    return Unauthorized(new { message = "Account is inactive" });
                }

                bool isPass = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashPassword);
                if (!isPass)
                {
                    return Unauthorized(new { message = "Incorrect Password" });
                }

                // Optional: get NurseID if a Nurse profile exists (for backward compatibility with NurseController)
                int? nurseId = user.Nurse?.FirstOrDefault()?.NurseID;

                string token = GenerateAuthToken(new NurseCookieDto
                {
                    username = user.Username,
                    UserID = user.UserID,
                    NurseID = nurseId ?? 0,   // 0 if no Nurse row exists
                    FullName = user.FirstName + " " + user.FatherName,
                    RoleName = user.UserRole.Select(r => r.Role!.RoleName).ToList()
                });

                _jwt.AppendAuthCookie(Response, token);

                return Ok(new { message = "Login successful" });
            }
            catch (Exception)
            {
                throw;
            }
        }

        public string GenerateAuthToken(NurseCookieDto user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.GivenName, user.username),
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, "Nurse")
            };

            // Keep NurseID claim only if you still need it in NurseController
            if (user.NurseID > 0)
            {
                claims.Add(new Claim("NurseID", user.NurseID.ToString()));
            }

            return _jwt.GenerateToken(claims.ToArray(), TimeSpan.FromHours(2));
        }
    }
}