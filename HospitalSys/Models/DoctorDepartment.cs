using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.HospitalStruct;

namespace HospitalSys.Models
{
    /// <summary>
    /// Join entity for many-to-many relationship between Doctor and ClinicalDepartment.
    /// Composite primary key (DoctorID, ClinicalDepartmentID) prevents duplicates.
    /// This is the authoritative source of department assignments for doctors.
    /// </summary>
    public class DoctorDepartment
    {
        [Required]
        public int DoctorID { get; set; }

        [ForeignKey(nameof(DoctorID))]
        public Doctor? Doctor { get; set; }

        [Required]
        public int ClinicalDepartmentID { get; set; }

        [ForeignKey(nameof(ClinicalDepartmentID))]
        public ClinicalDepartment? ClinicalDepartment { get; set; }
    }
}
