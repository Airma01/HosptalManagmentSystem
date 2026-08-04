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
    [Route("Hospital/nurse/[Controller]")]
    public class NurseAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public NurseAuthController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("auth_me")]
        [Authorize(Roles = "Nurse")]
        public IActionResult AuthMe()
        {
            var token = Request.Cookies["jwt"];
            if(token == null)
            {
                return Unauthorized(new { message = "No authentication token found" });
            }
            var validationParameter = new TokenValidationParameters
            {
              ValidateSignatureLast = true,
              IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk")),
              ValidateIssuer = false,
              ValidateAudience = false,
              ClockSkew = TimeSpan.Zero
            };

            var princple = new JwtSecurityTokenHandler().ValidateToken(token,validationParameter,out _);
            var fullName =  princple.FindFirst(ClaimTypes.GivenName)?.Value;
            var UserID = princple.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = princple.FindFirst(ClaimTypes.Role)?.Value;
            var NurseID = princple.FindFirst("NurseID")?.Value;

            return Ok(new {
                fullName = fullName,
                UserID=UserID,
                NurseID = NurseID,
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
                var nurse = await _context.Nurses
                    .Include(u => u.Users)
                    .ThenInclude(u => u.UserRole)
                    .ThenInclude(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Users.Username == loginDto.username);
                    if (nurse == null)
                        {
                            return NotFound(new { message = "User Not Found" });
                        }
                    if(nurse.Users.UserRole.All(r => r.Role.RoleName != "Nurse"))
                    {
                        return Unauthorized(new { message = "User is not a nurse" });
                    }
                    bool IsPass = BCrypt.Net.BCrypt.Verify(loginDto.Password, nurse.Users.HashPassword);
                    if (!IsPass)
                    {
                        return Unauthorized(new { message = "Incorrect Password" });
                    }

                    string token = GenerateAuthToken(new NurseCookieDto
                    {
                        username = nurse.Users.Username,
                        NurseID = nurse.NurseID,
                        UserID = nurse.Users.UserID,
                        FullName = nurse.Users.FirstName + " " + nurse.Users.FatherName,
                        RoleName = nurse.Users.UserRole.Select(r => r.Role.RoleName).ToList() 
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

         public string GenerateAuthToken(NurseCookieDto  user)
        {
           var claims = new[]
            {
                new Claim(ClaimTypes.GivenName, user.username),
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim("NurseID",user.NurseID.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, "Nurse")};

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