using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.HospitalStruct;
using HospitalSys.Models.Inpatient;
using HospitalSys.Models.Laboratory;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Radiology;

namespace HospitalSys.Models
{
    public class Doctor
    {
        // public Doctor(){
        // Appointment = new List<Appointment>();
        // Consultation = new List<Consultation>();
        // MedicalRecord = new List<MedicalRecord>();
        // Prescription = new List<Prescription> ();
        // }
        [Key]
        [Required]
        public int DoctorID {get;set;}
        [Required]
        public int UserID {get;set;}
        [ForeignKey(nameof(UserID))]
        public Users? Users {get;set;}
         
         // LEGACY / COMPATIBILITY: single department FK kept temporarily so existing controllers continue to work.
        // Authoritative multi-department assignments live in DoctorDepartment (DepartmentAssignments).
        // Prefer reading/writing via DepartmentAssignments going forward.
        [Required]
        public int ClinicalDepartmentID { get; set; }
        [ForeignKey(nameof(ClinicalDepartmentID))]
        public ClinicalDepartment? ClinicalDepartment { get; set; }

        public string LicenseNumber { get; set; } = "";

        /// <summary>
        /// Many-to-many department assignments (authoritative source of truth).
        /// </summary>
        public List<DoctorDepartment> DepartmentAssignments { get; set; } = new();

        public List<Appointment> Appointment { get; set; } = new();
        public List<Consultation> Consultation { get; set; } = new();
        public List<MedicalHistory> MedicalHistory { get; set; } = new();
        public List<Prescription> Prescription { get; set; } = new();
        public List<Admission> Admission { get; set; } = new();
        public List<LaboratoryTest> LaboratoryTest { get; set; } = new();
        public List<RadiologyRequest> RadiologyRequest { get; set; } = new();
    }
}
