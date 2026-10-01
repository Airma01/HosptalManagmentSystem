using HospitalSys.Data;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Services
{
    /// <summary>
    /// Centralized authorization for Doctor department access.
    /// Always verifies against DoctorDepartment (database source of truth).
    /// Never trust JWT DepartmentID alone for sensitive operations.
    /// </summary>
    public class DoctorDepartmentAuthorizationService
    {
        private readonly AppDbContext _context;

        public DoctorDepartmentAuthorizationService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Returns true if the doctor is currently assigned to the given department.
        /// </summary>
        public async Task<bool> HasDepartmentAccessAsync(int doctorId, int departmentId)
        {
            if (doctorId <= 0 || departmentId <= 0)
                return false;

            return await _context.DoctorDepartments
                .AsNoTracking()
                .AnyAsync(dd => dd.DoctorID == doctorId && dd.ClinicalDepartmentID == departmentId);
        }

        /// <summary>
        /// Returns all ClinicalDepartmentIDs currently assigned to the doctor.
        /// </summary>
        public async Task<List<int>> GetAssignedDepartmentIdsAsync(int doctorId)
        {
            return await _context.DoctorDepartments
                .AsNoTracking()
                .Where(dd => dd.DoctorID == doctorId)
                .Select(dd => dd.ClinicalDepartmentID)
                .ToListAsync();
        }

        /// <summary>
        /// Returns assigned departments with names.
        /// </summary>
        public async Task<List<(int DepartmentID, string DepartmentName)>> GetAssignedDepartmentsAsync(int doctorId)
        {
            return await _context.DoctorDepartments
                .AsNoTracking()
                .Where(dd => dd.DoctorID == doctorId)
                .Include(dd => dd.ClinicalDepartment)
                .Select(dd => new ValueTuple<int, string>(
                    dd.ClinicalDepartmentID,
                    dd.ClinicalDepartment != null ? dd.ClinicalDepartment.DepartmentName : ""))
                .ToListAsync();
        }
    }
}
