using HospitalSys.Data;
using HospitalSys.Enums;
using HospitalSys.Models.HospitalStruct;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Services
{
    /// <summary>
    /// Central authorization service for department-module permissions.
    /// Always resolves against the database using DoctorID + ClinicalDepartmentID.
    /// Never trusts department or permission data sent by the client.
    ///
    /// Effective permissions are evaluated against a SPECIFIC department
    /// (typically the doctor's active department from JWT, or the department
    /// associated with the current clinical visit/triage). Permissions are
    /// NOT unioned across all departments a doctor belongs to.
    /// </summary>
    public class DepartmentPermissionService
    {
        private readonly AppDbContext _context;

        public DepartmentPermissionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CanReadAsync(int clinicalDepartmentId, DepartmentModule module)
        {
            return await HasPermissionAsync(clinicalDepartmentId, module, p => p.CanRead);
        }

        public async Task<bool> CanCreateAsync(int clinicalDepartmentId, DepartmentModule module)
        {
            return await HasPermissionAsync(clinicalDepartmentId, module, p => p.CanCreate);
        }

        public async Task<bool> CanUpdateAsync(int clinicalDepartmentId, DepartmentModule module)
        {
            return await HasPermissionAsync(clinicalDepartmentId, module, p => p.CanUpdate);
        }

        public async Task<bool> CanDeleteAsync(int clinicalDepartmentId, DepartmentModule module)
        {
            return await HasPermissionAsync(clinicalDepartmentId, module, p => p.CanDelete);
        }

        /// <summary>
        /// Returns true if the doctor is assigned to the department AND the department
        /// has the requested permission for the module.
        /// </summary>
        public async Task<bool> DoctorCanAsync(
            int doctorId,
            int clinicalDepartmentId,
            DepartmentModule module,
            Func<DepartmentPermission, bool> permissionSelector)
        {
            if (doctorId <= 0 || clinicalDepartmentId <= 0)
                return false;

            // Verify assignment via DoctorDepartment (authoritative)
            bool assigned = await _context.DoctorDepartments
                .AsNoTracking()
                .AnyAsync(dd => dd.DoctorID == doctorId && dd.ClinicalDepartmentID == clinicalDepartmentId);

            if (!assigned)
            {
                // Legacy fallback: single ClinicalDepartmentID on Doctor
                var doctor = await _context.Doctors.AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DoctorID == doctorId);
                if (doctor == null || doctor.ClinicalDepartmentID != clinicalDepartmentId)
                    return false;
            }

            return await HasPermissionAsync(clinicalDepartmentId, module, permissionSelector);
        }

        public async Task<bool> DoctorCanReadAsync(int doctorId, int clinicalDepartmentId, DepartmentModule module)
            => await DoctorCanAsync(doctorId, clinicalDepartmentId, module, p => p.CanRead);

        public async Task<bool> DoctorCanCreateAsync(int doctorId, int clinicalDepartmentId, DepartmentModule module)
            => await DoctorCanAsync(doctorId, clinicalDepartmentId, module, p => p.CanCreate);

        public async Task<bool> DoctorCanUpdateAsync(int doctorId, int clinicalDepartmentId, DepartmentModule module)
            => await DoctorCanAsync(doctorId, clinicalDepartmentId, module, p => p.CanUpdate);

        public async Task<bool> DoctorCanDeleteAsync(int doctorId, int clinicalDepartmentId, DepartmentModule module)
            => await DoctorCanAsync(doctorId, clinicalDepartmentId, module, p => p.CanDelete);

        /// <summary>
        /// Returns the full permission map for a department (all modules).
        /// Modules with no row are returned as all-false.
        /// </summary>
        public async Task<Dictionary<string, ModulePermissionDto>> GetDepartmentPermissionsMapAsync(int clinicalDepartmentId)
        {
            var rows = await _context.DepartmentPermissions
                .AsNoTracking()
                .Where(p => p.ClinicalDepartmentID == clinicalDepartmentId)
                .ToListAsync();

            var map = new Dictionary<string, ModulePermissionDto>(StringComparer.OrdinalIgnoreCase);

            foreach (DepartmentModule mod in Enum.GetValues(typeof(DepartmentModule)))
            {
                var key = ToCamelCaseKey(mod);
                var row = rows.FirstOrDefault(r => r.Module == mod);
                map[key] = row == null
                    ? new ModulePermissionDto()
                    : new ModulePermissionDto
                    {
                        Read = row.CanRead,
                        Create = row.CanCreate,
                        Update = row.CanUpdate,
                        Delete = row.CanDelete
                    };
            }

            return map;
        }

        /// <summary>
        /// List all permission rows for a department (for admin UI).
        /// </summary>
        public async Task<List<DepartmentPermission>> GetPermissionsForDepartmentAsync(int clinicalDepartmentId)
        {
            return await _context.DepartmentPermissions
                .AsNoTracking()
                .Where(p => p.ClinicalDepartmentID == clinicalDepartmentId)
                .OrderBy(p => p.Module)
                .ToListAsync();
        }

        /// <summary>
        /// Replace all permissions for a department with the provided set.
        /// Missing modules are treated as all-false (row removed or never inserted).
        /// </summary>
        public async Task SetPermissionsAsync(int clinicalDepartmentId, IEnumerable<PermissionUpsertDto> permissions)
        {
            var existing = await _context.DepartmentPermissions
                .Where(p => p.ClinicalDepartmentID == clinicalDepartmentId)
                .ToListAsync();

            _context.DepartmentPermissions.RemoveRange(existing);

            foreach (var dto in permissions)
            {
                if (!Enum.TryParse<DepartmentModule>(dto.Module, ignoreCase: true, out var module))
                    continue;

                // Only insert if at least one flag is true, or always insert for clarity
                _context.DepartmentPermissions.Add(new DepartmentPermission
                {
                    ClinicalDepartmentID = clinicalDepartmentId,
                    Module = module,
                    CanRead = dto.CanRead,
                    CanCreate = dto.CanCreate,
                    CanUpdate = dto.CanUpdate,
                    CanDelete = dto.CanDelete
                });
            }

            await _context.SaveChangesAsync();
        }

        private async Task<bool> HasPermissionAsync(
            int clinicalDepartmentId,
            DepartmentModule module,
            Func<DepartmentPermission, bool> selector)
        {
            if (clinicalDepartmentId <= 0)
                return false;

            var row = await _context.DepartmentPermissions
                .AsNoTracking()
                .FirstOrDefaultAsync(p =>
                    p.ClinicalDepartmentID == clinicalDepartmentId &&
                    p.Module == module);

            return row != null && selector(row);
        }

        private static string ToCamelCaseKey(DepartmentModule module)
        {
            var name = module.ToString();
            if (string.IsNullOrEmpty(name)) return name;
            return char.ToLowerInvariant(name[0]) + name.Substring(1);
        }
    }

    public class ModulePermissionDto
    {
        public bool Read { get; set; }
        public bool Create { get; set; }
        public bool Update { get; set; }
        public bool Delete { get; set; }
    }

    public class PermissionUpsertDto
    {
        public string Module { get; set; } = "";
        public bool CanRead { get; set; }
        public bool CanCreate { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }
    }
}
