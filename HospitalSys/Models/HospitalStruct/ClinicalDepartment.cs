using System.ComponentModel.DataAnnotations;
using HospitalSys.Models;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.HospitalStruct
{
    public class ClinicalDepartment
    {
        [Key]
        public int ClinicalDepartmentID { get; set; }
        [MaxLength(100)]
        public string DepartmentName { get; set; } = "";
        [MaxLength(250)]
        public string Description { get; set; } = "";

        // Legacy one-to-many (via Doctor.ClinicalDepartmentID). Prefer DoctorDepartments for multi-assignment.
        public List<Doctor> Doctor { get; set; } = new();

        /// <summary>
        /// Many-to-many via DoctorDepartment join entity.
        /// </summary>
        public List<DoctorDepartment> DoctorDepartments { get; set; } = new();

        /// <summary>
        /// Module-level CRUD permissions for this department (admin-configured).
        /// </summary>
        public List<DepartmentPermission> DepartmentPermissions { get; set; } = new();

        public List<Nurse> Nurse { get; set; } = new();
        public List<Triage> Triage { get; set; } = new();
    }
}
