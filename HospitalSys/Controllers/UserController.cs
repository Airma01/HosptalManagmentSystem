using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models;
using Microsoft.AspNetCore.Mvc;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost] 
        public IActionResult CreateUser([FromBody] UsersDto user)
        {
            
            string HashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);
            var us = new Users
            {
                FirstName = user.FirstName,
                FatherName = user.FatherName,
                Gender = user.Gender,
                PhoneNumber = user.PhoneNumber,
                Username = user.Username,
                HashPassword = HashedPassword ,
                UserRole = UserRole.Doctor
            };
            bool isPass = BCrypt.Net.BCrypt.Verify(user.Password,HashedPassword);
            Console.WriteLine(isPass);
            _context.Users.Add(us);
            _context.SaveChanges();

            return Ok(new
            {
                message = "User created successfully",
                us.ID,
                us.Username
            });
        }

        public async Task<IActionResult> CreateAdmin(UsersDto admin)
        {
            return Ok("");
        }
    }
}