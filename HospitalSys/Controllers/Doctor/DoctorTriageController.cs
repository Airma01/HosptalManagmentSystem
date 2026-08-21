using HospitalSys.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers
{
    
    [ApiController]
    [Route("Hospital/[Controller]/Doctor")]
    public class DoctorTriageController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DoctorTriageController(AppDbContext context)
        {
           _context = context; 
        }

        
        public async Task<IActionResult> GetTriageInMyDep()
        {
            try
            {
                var  getTriage = await _context.Triages
                                 .Include(u=>u.PatientVisit)
                                 .ThenInclude(u=>u.Patient)
                                 .Select(u => new
                                 {
                                     
                                 })
                                 .ToListAsync();
                    return Ok(getTriage);
            }
            catch (System.Exception)
            {
                
                throw;
            }
        }

        public async Task<IActionResult> GetTriageByPatientID(int id)
        {
            try
            {
                var get = await _context.Triages
                           .Include(u=>u.PatientVisit)
                           .ThenInclude(u=>u.Patient)
                           .Where(u=>u.ClinicalDepartmentID == id)
                          .ToListAsync();
                if(get == null){
                    return NotFound("Triage Not Found");
                }
                return Ok(get);
            }
            catch (System.Exception)
            {
                
                throw;
            }
        }
    }
}