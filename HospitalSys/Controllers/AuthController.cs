using Microsoft.AspNetCore.Mvc;
using HospitalSys.Data;
using HospitalSys.Dto;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
      public async Task<IActionResult> UserLogin(LoginDto login)
        {
            if(string.IsNullOrWhiteSpace(login.Username) || string.IsNullOrWhiteSpace(login.Password))
            {
                return BadRequest("Fields Are Empity");
            }
            var user = await _context.Users.FirstOrDefaultAsync(u=>u.Username==login.Username);
            if(user == null)
            {
                return NotFound("User Not Found");
            }
            bool isPass = BCrypt.Net.BCrypt.Verify(login.Password,user.HashPassword);
            if (!isPass)
            {
                return Unauthorized("Incorrect Password");
            }
            var token = GenrateJwtToken(user);
            return Ok(new
            {
                Token = token,
                Message = "successfully log"
            });
        }
        public string GenrateJwtToken(Users user)
        {
         var claims = new []
         {
             new Claim(ClaimTypes.Name,user.FirstName+" "+user.FatherName),
             new Claim(ClaimTypes.NameIdentifier,user.ID.ToString()),
             new Claim(ClaimTypes.Role,user.UserRole.ToString())
         };

         var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk"));
         var cred = new SigningCredentials(key,SecurityAlgorithms.HmacSha256);
         var token = new JwtSecurityToken(
            claims:claims,
            expires:DateTime.UtcNow.AddHours(2),
            signingCredentials:cred
         );
         
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}