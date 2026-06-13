using Microsoft.AspNetCore.Mvc;
using HospitalSys.Data;
using HospitalSys.Dto;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Admin_authController:ControllerBase
    {
        private readonly AppDbContext _context;
        public Admin_authController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> AdminLogin(AdminLoginDto AdminLog)
        {
           var admin = await _context.SuperAdmin.FirstOrDefaultAsync(u=>u.username == AdminLog.username);
           if(admin == null)
            {
                return NotFound("Admin Not Found");
            }
            bool isPass = BCrypt.Net.BCrypt.Verify(AdminLog.Password,admin.HashPassword);
            if (!isPass)
            {
                return Unauthorized("Incorrect Password");
            }
            var token = GenrateJwtToken(admin);
            return Ok(new
            {
                Token = "Bearer "+token,
            });
        }

        public string GenrateJwtToken(SuperAdmins Admin)
        {
            var claims = new[]
            {
              new Claim(ClaimTypes.GivenName,Admin.username),
              new Claim(ClaimTypes.NameIdentifier,Admin.ID.ToString()),
              new Claim(ClaimTypes.Role,Admin.AdminRole.ToString())
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("jklkjlkjlkjlkjljjghguyuuuu"));
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