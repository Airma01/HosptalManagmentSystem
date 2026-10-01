using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models;
using HospitalSys.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/doctor/[Controller]")]
    public class DoctorAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly DoctorDepartmentAuthorizationService _deptAuth;

        // Keep the same key used by the rest of the project for compatibility.
        private const string JwtSigningKey = "hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk";

        public DoctorAuthController(AppDbContext context, DoctorDepartmentAuthorizationService deptAuth)
        {
            _context = context;
            _deptAuth = deptAuth;
        }

        /// <summary>
        /// Returns identity + active department + all assigned departments (from DB).
        /// </summary>
        [HttpGet("auth_me")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> AuthMe()
        {
            var token = Request.Cookies["jwt"];
            if (token == null)
                return Unauthorized(new { message = "No authentication token found" });

            ClaimsPrincipal principal;
            try
            {
                principal = ValidateToken(token);
            }
            catch
            {
                return Unauthorized(new { message = "Invalid or expired token" });
            }

            var doctorIdClaim = principal.FindFirst("DoctorID")?.Value;
            if (string.IsNullOrEmpty(doctorIdClaim) || !int.TryParse(doctorIdClaim, out int doctorId))
                return Unauthorized(new { message = "DoctorID missing from token" });

            var fullName = principal.FindFirst(ClaimTypes.Name)?.Value;
            var username = principal.FindFirst(ClaimTypes.GivenName)?.Value;
            var role = principal.FindFirst(ClaimTypes.Role)?.Value;

            // Active department from JWT (context)
            var activeDeptIdStr = principal.FindFirst("DepartmentID")?.Value;
            int.TryParse(activeDeptIdStr, out int activeDeptId);
            var activeDeptName = principal.FindFirst("DepartmentName")?.Value ?? "";

            // Authoritative list from database
            var assignments = await _context.DoctorDepartments
                .AsNoTracking()
                .Where(dd => dd.DoctorID == doctorId)
                .Include(dd => dd.ClinicalDepartment)
                .Select(dd => new DepartmentInfoDto
                {
                    DepartmentID = dd.ClinicalDepartmentID,
                    DepartmentName = dd.ClinicalDepartment != null ? dd.ClinicalDepartment.DepartmentName : ""
                })
                .ToListAsync();

            // If the JWT active department is no longer assigned, clear it (frontend should force re-select)
            if (activeDeptId > 0 && !assignments.Any(a => a.DepartmentID == activeDeptId))
            {
                activeDeptId = 0;
                activeDeptName = "";
            }

            return Ok(new
            {
                doctorID = doctorId,
                fullName = fullName,
                username = username,
                role = role,
                departmentID = activeDeptId > 0 ? activeDeptId.ToString() : null,
                departmentName = activeDeptName,
                activeDepartment = activeDeptId > 0
                    ? new { departmentID = activeDeptId, departmentName = activeDeptName }
                    : null,
                departments = assignments
            });
        }

        [HttpPost("doctor_login")]
        public async Task<IActionResult> DoctorLogin([FromBody] DoctorLoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(loginDto.username) || string.IsNullOrWhiteSpace(loginDto.Password))
                    return BadRequest(new { message = "Username and Password are required" });

                var doctor = await _context.Doctors
                    .Include(d => d.ClinicalDepartment)
                    .Include(d => d.DepartmentAssignments)
                        .ThenInclude(dd => dd.ClinicalDepartment)
                    .Include(d => d.Users)
                        .ThenInclude(u => u.UserRole)
                        .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(d => d.Users!.Username == loginDto.username);

                if (doctor == null)
                    return NotFound(new { message = "User Not Found" });

                if (doctor.Users == null || doctor.Users.UserRole.All(r => r.Role!.RoleName != "Doctor"))
                    return Unauthorized(new { message = "User is not a doctor" });

                bool isPass = BCrypt.Net.BCrypt.Verify(loginDto.Password, doctor.Users.HashPassword);
                if (!isPass)
                    return Unauthorized(new { message = "Incorrect Password" });

                // Ensure at least the legacy ClinicalDepartmentID is present as an assignment
                // (covers cases before migration has been applied or when only legacy field is set)
                var assignedDepts = doctor.DepartmentAssignments?
                    .Where(dd => dd.ClinicalDepartment != null)
                    .Select(dd => dd.ClinicalDepartment!)
                    .ToList() ?? new List<Models.HospitalStruct.ClinicalDepartment>();

                if (assignedDepts.Count == 0 && doctor.ClinicalDepartmentID > 0 && doctor.ClinicalDepartment != null)
                {
                    // Temporary fallback: treat legacy FK as the only assignment
                    assignedDepts.Add(doctor.ClinicalDepartment);
                }

                if (assignedDepts.Count == 0)
                    return Unauthorized(new { message = "Doctor has no clinical department assigned. Contact Admin." });

                // Prefer the legacy ClinicalDepartmentID if it is still among the assignments
                var defaultDept = assignedDepts.FirstOrDefault(d => d.ClinicalDepartmentID == doctor.ClinicalDepartmentID)
                                  ?? assignedDepts.First();

                string token = GenerateAuthToken(new DoctorCookieDto
                {
                    username = doctor.Users.Username,
                    FullName = doctor.Users.FirstName + " " + doctor.Users.FatherName,
                    RoleName = doctor.Users.UserRole.Select(r => r.Role!.RoleName).ToList(),
                    DepartmentID = defaultDept.ClinicalDepartmentID,
                    DoctorID = doctor.DoctorID,
                    DepartmentName = defaultDept.DepartmentName
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
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Switch the doctor's active department.
        /// DoctorID is taken ONLY from the authenticated JWT.
        /// Backend validates that the requested department is assigned in DoctorDepartment.
        /// </summary>
        [HttpPost("switch_department")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> SwitchDepartment([FromBody] SwitchDepartmentDto dto)
        {
            if (dto == null || dto.DepartmentID <= 0)
                return BadRequest(new { message = "departmentID is required" });

            var doctorIdClaim = User.FindFirst("DoctorID")?.Value;
            if (string.IsNullOrEmpty(doctorIdClaim) || !int.TryParse(doctorIdClaim, out int doctorId))
                return Unauthorized(new { message = "DoctorID missing from token" });

            // Authoritative check against DoctorDepartment
            bool hasAccess = await _deptAuth.HasDepartmentAccessAsync(doctorId, dto.DepartmentID);
            if (!hasAccess)
            {
                // Also allow legacy ClinicalDepartmentID for transition
                var doctor = await _context.Doctors.AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DoctorID == doctorId);
                if (doctor == null || doctor.ClinicalDepartmentID != dto.DepartmentID)
                    return StatusCode(403, new { message = "You are not assigned to this department" });
            }

            var department = await _context.ClinicalDepartments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.ClinicalDepartmentID == dto.DepartmentID);

            if (department == null)
                return NotFound(new { message = "Department not found" });

            // Rebuild claims from current principal + new active department
            var username = User.FindFirst(ClaimTypes.GivenName)?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? "";
            var fullName = User.FindFirst(ClaimTypes.Name)?.Value ?? "";

            string newToken = GenerateAuthToken(new DoctorCookieDto
            {
                username = username,
                FullName = fullName,
                RoleName = new List<string> { "Doctor" },
                DepartmentID = department.ClinicalDepartmentID,
                DoctorID = doctorId,
                DepartmentName = department.DepartmentName
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

            Response.Cookies.Append("jwt", newToken, cookieOptions);

            return Ok(new
            {
                message = "Department switched successfully",
                departmentID = department.ClinicalDepartmentID,
                departmentName = department.DepartmentName,
                activeDepartment = new
                {
                    departmentID = department.ClinicalDepartmentID,
                    departmentName = department.DepartmentName
                }
            });
        }

        public string GenerateAuthToken(DoctorCookieDto user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.GivenName, user.username),
                new Claim(ClaimTypes.NameIdentifier, user.username),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, "Doctor"),
                new Claim("DepartmentID", user.DepartmentID.ToString()),
                new Claim("DoctorID", user.DoctorID.ToString()),
                new Claim("DepartmentName", user.DepartmentName)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSigningKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                signingCredentials: credentials,
                expires: DateTime.UtcNow.AddHours(2),
                issuer: "HospitalSys",
                audience: "HospitalSysClient"
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private ClaimsPrincipal ValidateToken(string token)
        {
            var validationParameter = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSigningKey)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };
            return new JwtSecurityTokenHandler().ValidateToken(token, validationParameter, out _);
        }
    }
}
