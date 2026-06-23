using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/[Controller]")]
    public class AdminController :ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost("CreateAd")]
        public async Task<IActionResult> Create(AdminDto admin_dt)
        {
            if(string.IsNullOrWhiteSpace(admin_dt.username) || string.IsNullOrEmpty(admin_dt.Password) || admin_dt.AdminRole == null)
            {
                return BadRequest("Fields Are Empty");
            }
            var IsAdminFound = await _context.SuperAdmin.AnyAsync(u=>u.Username == admin_dt.username);
            if (IsAdminFound)
            {
                return BadRequest("Regsterd Admin Try Again");
            }
            string HashPass = BCrypt.Net.BCrypt.HashPassword(admin_dt.Password); 
            var admin = new SuperAdmins{
                Username = admin_dt.username,
                AdminRole = admin_dt.AdminRole,
                HashPassword = HashPass
            };
           await _context.SuperAdmin.AddAsync(admin);
           await _context.SaveChangesAsync();
            return Ok(new
            {
                Message = admin.Username + "created Successfuly",
                Role = "Admin"
            });
        }
        
    }
}