using HospitalSys.Data;
using HospitalSys.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using HospitalSys.Services;
namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/Pharmacist/[Controller]")]
    public class PharmacistAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IJwtService _jwt;
        public PharmacistAuthController(AppDbContext context, IJwtService jwt)
        {
            _jwt = jwt;
            _context = context;
        }
        [HttpGet("auth_me")]
        [Authorize(Roles = "Pharmacist")]
        public IActionResult AuthMe()
        {
            var token = Request.Cookies["jwt"];

            if (token == null)
            {
                return Unauthorized(new { message = "No authentication token found" });
            }

            var principal = _jwt.ValidateToken(token);

            return Ok(new
            {
                fullName = principal.FindFirst(ClaimTypes.Name)?.Value,
                username = principal.FindFirst(ClaimTypes.GivenName)?.Value,
                userID = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                pharmacistID = principal.FindFirst("PharmacistID")?.Value,
                branchPharmacyID = principal.FindFirst("BranchPharmacyID")?.Value,
                role = principal.FindFirst(ClaimTypes.Role)?.Value
            });
        }
        [HttpPost("pharmacist_login")]
        public async Task<IActionResult> PharmacistLogin([FromBody] PharmacistLoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(loginDto.username) || string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return BadRequest(new { message = "Username and Password are required" });
                }
                var pharmacist = await _context.Pharmacists
                    .Include(u => u.Users)
                    .ThenInclude(u => u.UserRole)
                    .ThenInclude(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Users.Username == loginDto.username);
                    if (pharmacist == null)
                        {
                            return NotFound(new { message = "User Not Found" });
                        }
                    if(pharmacist.Users.UserRole.All(r => r.Role.RoleName != "Pharmacist"))
                    {
                        return Unauthorized(new { message = "User is not a pharmacist" });
                    }
                    bool IsPass = BCrypt.Net.BCrypt.Verify(loginDto.Password, pharmacist.Users.HashPassword);
                    if (!IsPass)
                    {
                        return Unauthorized(new { message = "Incorrect Password" });
                    }

                    string token = GenerateAuthToken(new PharmacistCookieDto
                                {
                                    username = pharmacist.Users.Username,
                                    PharmacistID = pharmacist.PharmacistID,
                                    BranchPharmacyID = pharmacist.BranchPharmacyID,
                                    UserID = pharmacist.Users.UserID,
                                    Fullname = pharmacist.Users.FirstName + " " + pharmacist.Users.FatherName
                                });
                    _jwt.AppendAuthCookie(Response, token);

                

                return Ok(new { message = "Login successful" });
            }
            catch (System.Exception)
            {
                
                throw;
            }
        }

         public string GenerateAuthToken(PharmacistCookieDto user)
        {
            var claims = new[]
                {
                    new Claim(ClaimTypes.GivenName, user.username),
                    new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                    new Claim("PharmacistID", user.PharmacistID.ToString()),
                    new Claim("BranchPharmacyID", user.BranchPharmacyID.ToString()),
                    new Claim(ClaimTypes.Name, user.Fullname),
                    new Claim(ClaimTypes.Role, "Pharmacist")
                };

            return _jwt.GenerateToken(claims, TimeSpan.FromHours(2));
        }
    }
}