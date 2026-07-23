using HospitalSys.Attributes;
using HospitalSys.Data;
using HospitalSys.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("doctor/[controller]")]
    public class DoctorAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DoctorAuthController(AppDbContext context)
        {
            _context = context;
        }

        public async Task <IActionResult> Login([FromBody] DoctorLoginDto request)
    {
        var doctor = await _context.Users
                           .Include(u => u.Doctor)
                           .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (doctor == null || !BCrypt.Net.BCrypt.Verify(request.Password, doctor.HashPassword))
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var doc = new DoctorCoockieDto
        {
            Username = doctor.Username,
            FullName = $"{doctor.FirstName} {doctor.FatherName}",
            Password = request.Password,
            RoleID = doctor.RoleID
        };

        var token = GenerateJwtToken(doc);
        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7) 
        });

        return Ok(new { message = "Login successful" });
    }

   
        private string GenerateJwtToken(DoctorCoockieDto doctor)
        {

          var claim = new[]
            {
                new System.Security.Claims.Claim("Username", doctor.Username),
                new System.Security.Claims.Claim("FullName", doctor.FullName),
                new System.Security.Claims.Claim("Password", doctor.Password),
                new System.Security.Claims.Claim("RoleID", doctor.RoleID.ToString())
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: "HospitalSys",
                audience: "HospitalSysClient",
                claims: claim,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return tokenHandler.WriteToken(token);
        }

        [AuthorizeRole("Doctor")]
        [HttpGet("auth/doctor")]
        public async Task<IActionResult> AuthMe()
        {

            var token = Request.Cookies["jwt"];
            if(token == null)
            {
                return Unauthorized(new { message = "No authentication token found" });
            }
            var validationParameter = new TokenValidationParameters
            {
              ValidateSignatureLast = true,
              IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("")),
              ValidateIssuer = false,
              ValidateAudience = false,
              ClockSkew = TimeSpan.Zero
            };

            var princple = new JwtSecurityTokenHandler().ValidateToken(token,validationParameter,out _);
            var fullName =  princple.FindFirst(ClaimTypes.GivenName)?.Value;
            var username = princple.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = princple.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new {
                fullName = fullName,
                username = username,
                role = role
            });
        }
    }

}