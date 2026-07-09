using HospitalSys.Data;
using Microsoft.AspNetCore.Mvc;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/[Controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DoctorController(AppDbContext context)
        {
            _context = context;
        }
    }
}