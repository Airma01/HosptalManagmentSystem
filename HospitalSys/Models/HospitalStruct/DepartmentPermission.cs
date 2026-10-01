using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Enums;

namespace HospitalSys.Models.HospitalStruct
{
    /// <summary>
    /// Module-level CRUD permissions belonging to a ClinicalDepartment.
    /// Permissions are department-scoped, not user-scoped.
    /// A doctor inherits the permissions of the department(s) they are assigned to
    /// (evaluated against the active department / visit context).
    /// </summary>
    public class DepartmentPermission
    {
        [Key]
        public int DepartmentPermissionID { get; set; }

        [Required]
        public int ClinicalDepartmentID { get; set; }

        [ForeignKey(nameof(ClinicalDepartmentID))]
        public ClinicalDepartment? ClinicalDepartment { get; set; }

        /// <summary>
        /// Stored as int in the database.
        /// </summary>
        [Required]
        public DepartmentModule Module { get; set; }

        public bool CanRead { get; set; }
        public bool CanCreate { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }
    }
}
