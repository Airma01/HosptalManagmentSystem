using Microsoft.AspNetCore.Mvc;
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models;
namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> CreateAdmin(AdminDto Admin)
        {
            if (string.IsNullOrWhiteSpace(Admin.username) || string.IsNullOrWhiteSpace(Admin.HashPassword) || string.IsNullOrWhiteSpace(Admin.AdminRole.ToString()))
            {
                return BadRequest("Required Input Fields");
            }
            var Adm = new SuperAdmins
            {
                username = Admin.username,
                AdminRole = Admin.AdminRole,
                HashPassword = Admin.HashPassword
            };
           await _context.SuperAdmin.AddAsync(Adm);
           await _context.SaveChangesAsync();
           return Ok(new
           {
             ID = Adm.ID + " "+Adm.username+"Register Successfilly As " + Adm.AdminRole  
           });
        }
    }
}