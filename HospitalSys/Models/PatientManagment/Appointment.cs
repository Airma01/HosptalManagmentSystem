using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.HospitalStruct;

namespace HospitalSys.Models.PatientManagment
{
    public class Appointment
    {
        [Key]
        public int AppointmentID { get; set; }

        public int PatientID { get; set; }
        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int DoctorID { get; set; }
        [ForeignKey(nameof(DoctorID))]
        public Doctor? Doctor { get; set; }

        /// <summary>
        /// Clinical department for which this appointment was created.
        /// Nullable for backward compatibility with existing rows (pre multi-dept).
        /// When null, UI/API fall back to the doctor's legacy ClinicalDepartmentID.
        /// </summary>
        public int? ClinicalDepartmentID { get; set; }
        [ForeignKey(nameof(ClinicalDepartmentID))]
        public ClinicalDepartment? ClinicalDepartment { get; set; }

        public DateTime AppointmentDate { get; set; }

        [MaxLength(100)]
        public string Status { get; set; } = "";

        public string Reason { get; set; } = "";
    }
}
