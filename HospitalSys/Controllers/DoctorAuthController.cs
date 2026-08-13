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
    [Route("Hospital/doctor/[Controller]")]
    public class DoctorAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DoctorAuthController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("auth_me")]
        [Authorize(Roles = "Doctor")]
        public IActionResult AuthMe()
        {
            var token = Request.Cookies["jwt"];
            if(token == null)
            {
                return Unauthorized(new { message = "No authentication token found" });
            }
                        var validationParameter = new TokenValidationParameters
                        {
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk")),
                            ValidateIssuer = false,
                            ValidateAudience = false,
                            ClockSkew = TimeSpan.Zero
                        };

            var princple = new JwtSecurityTokenHandler().ValidateToken(token,validationParameter,out _);
            var fullName =  princple.FindFirst(ClaimTypes.Name)?.Value;
            var username = princple.FindFirst(ClaimTypes.GivenName)?.Value;
            var departmentID = princple.FindFirst("DepartmentID")?.Value;
            var departmentName = princple.FindFirst("DepartmentName")?.Value;
            var doctorID = princple.FindFirst("DoctorID")?.Value;
            var role = princple.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new {
                fullName = fullName,
                username = username,
                role = role,
                departmentID = departmentID,
                doctorID = doctorID,
                departmentName = departmentName
            });
        }
        [HttpPost("doctor_login")]
        public async Task<IActionResult> DoctorLogin([FromBody] DoctorLoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(loginDto.username) || string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return BadRequest(new { message = "Username and Password are required" });
                }
                var doctor = await _context.Doctors
                             .Include(u=>u.ClinicalDepartment)
                             .Include(u=>u.Users)
                             .ThenInclude(u=>u.UserRole)
                             .ThenInclude(u=>u.Role)
                             .FirstOrDefaultAsync(u => u.Users.Username == loginDto.username);
                    // .Include(u => u.UserRole)

                    // .ThenInclude(u => u.Role)
                    // .FirstOrDefaultAsync(u => u.Username == loginDto.username);
                    if (doctor == null)
                        {
                            return NotFound(new { message = "User Not Found" });
                        }
                    if(doctor.Users.UserRole.All(r => r.Role.RoleName != "Doctor"))

                    {
                        return Unauthorized(new { message = "User is not a doctor" });
                    }
                    
                    bool IsPass = BCrypt.Net.BCrypt.Verify(loginDto.Password, doctor.Users.HashPassword);
                    if (!IsPass)
                    {
                        return Unauthorized(new { message = "Incorrect Password" });
                    }

                    string token = GenerateAuthToken(new DoctorCookieDto
                    {

                        username = doctor.Users.Username,
                        FullName = doctor.Users.FirstName + " " + doctor.Users.FatherName,
                        RoleName = doctor.Users.UserRole.Select(r => r.Role.RoleName).ToList(),
                        DepartmentID = doctor.ClinicalDepartmentID,
                        DoctorID = doctor.DoctorID,
                        DepartmentName = doctor.ClinicalDepartment.DepartmentName
                         
                    });
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,          
                        Secure = true,            
                        SameSite = SameSiteMode.Lax, 
                        Expires = DateTime.UtcNow.AddHours(2),
                        Path = "/",
                        Domain = "localhost"  
                    };

                    Response.Cookies.Append("jwt", token, cookieOptions);

                

                return Ok(new { message = "Login successful" });
            }
            catch (System.Exception)
            {
                
                throw;
            }
        }

         public string GenerateAuthToken(DoctorCookieDto  user)
        {
           var claims = new[]
            {
                new Claim(ClaimTypes.GivenName, user.username),
                new Claim(ClaimTypes.NameIdentifier, user.username),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, "Doctor"),
                new Claim("DepartmentID", user.DepartmentID.ToString()),
                new Claim("DoctorID",user.DoctorID.ToString()),
                new Claim("DepartmentName",user.DepartmentName)
                };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk"));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var han = new JwtSecurityTokenHandler();
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