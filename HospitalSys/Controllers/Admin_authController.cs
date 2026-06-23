using System.Security.Claims;
using System.Text;
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/[controller]")]
    public class AdminAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminAuthController(AppDbContext context)
        {
           _context = context; 
        }
        [HttpPost("login")]
        public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto admin)
        {
            if(string.IsNullOrWhiteSpace(admin.username) || string.IsNullOrWhiteSpace(admin.Password))
            {
                return BadRequest("Required Field");
            }
            var Admin = await _context.SuperAdmin.FirstOrDefaultAsync(u=>u.Username==admin.username);
            if(Admin == null)
            {
                return NotFound("User Not Found");
            }
            bool IsPass = BCrypt.Net.BCrypt.Verify(admin.Password,Admin.HashPassword);
            if (!IsPass)
            {
                return Unauthorized("Incorrect Password");
            }
            string token = GenrateAuthToken(Admin);
            return Ok(new
            {
                Token = token
            });
        }
        private string GenrateAuthToken(SuperAdmins admin)
        {
            var Claim = new[]
            {
                new Claim(ClaimTypes.GivenName,admin.Username),
                new Claim(ClaimTypes.NameIdentifier,admin.ID.ToString()),
                new Claim(ClaimTypes.Role,admin.AdminRole.ToString())
            };
            var Key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk"));
            var Cred = new SigningCredentials(Key,SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims:Claim,
                signingCredentials:Cred,
                expires:DateTime.UtcNow.AddHours(2)
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
            
        }
    }
}