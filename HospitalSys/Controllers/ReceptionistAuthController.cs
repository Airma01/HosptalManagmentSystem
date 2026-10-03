using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using HospitalSys.Services;
namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("receptionist/[controller]")]
    public class ReceptionistAuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly IJwtService _jwt;
        public ReceptionistAuthController(AppDbContext context, IJwtService jwt)
        {
            _jwt = jwt;
            _context = context;
        }
        [HttpGet("auth_me")]
        [Authorize(Roles = "Receptionist")]
        public IActionResult AuthMe()
        {
            var token = Request.Cookies["jwt"];
            if(token == null)
            {
                return Unauthorized(new { message = "No authentication token found" });
            }
            var princple = _jwt.ValidateToken(token);
            var fullName =  princple.FindFirst(ClaimTypes.GivenName)?.Value;
            var username = princple.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = princple.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new {
                fullName = fullName,
                username = username,
                role = role
            });
        }
        
        [HttpPost("receptionist_login")]
        public async Task<IActionResult> ReceptionistLogin([FromBody] ReceptionistLoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(loginDto.username) || string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return BadRequest(new { message = "Username and Password are required" });
                }
                var receptionist = await _context.Users
                    .Include(u => u.UserRole)
                    .ThenInclude(u => u.Role)
                    // .Include(u=> u.UserRole.Select(r => r.Role))
                    .FirstOrDefaultAsync(u => u.Username == loginDto.username);
                    if (receptionist == null)
                        {
                            return NotFound(new { message = "User Not Found" });
                        }
                    if(receptionist.UserRole.All(r => r.Role.RoleName != "Receptionist"))
                    {
                        return Unauthorized(new { message = "User is not a receptionist" });
                    }
                    bool IsPass = BCrypt.Net.BCrypt.Verify(loginDto.Password, receptionist.HashPassword);
                    if (!IsPass)
                    {
                        return Unauthorized(new { message = "Incorrect Password" });
                    }

                    string token = GenerateAuthToken(new ReceptionistCookieDto
                    {
                        username = receptionist.Username,
                        FullName = receptionist.FirstName + " " + receptionist.FatherName,
                        RoleName = receptionist.UserRole.Select(r => r.Role.RoleName).ToList() 
                    });
                    _jwt.AppendAuthCookie(Response, token);

                return Ok(new { message = "Login successful" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login.", error = ex.Message });
            }
        }

        public string GenerateAuthToken(ReceptionistCookieDto  user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.GivenName, user.username),
                new Claim(ClaimTypes.NameIdentifier, user.username),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, "Receptionist")};

            return _jwt.GenerateToken(claims, TimeSpan.FromHours(2));
        }
    }
}