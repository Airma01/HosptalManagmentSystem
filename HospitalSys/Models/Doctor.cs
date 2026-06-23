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
        public Users? Users {get;set;}
         [Required]
        [MaxLength(200)]
        public int ClinicalDepartmentID {get;set;}
        public ClinicalDepartment? ClinicalDepartment {get;set;}
        public string LicenseNumber {get;set;} = "";

        public List<Appointment> Appointment {get;set;} = new();
        public List<Consultation> Consultation {get;set;} = new();
        public List<MedicalRecord> MedicalRecord {get;set;} = new();
        public List<Prescription> Prescription {get;set;} = new();
        public List<Admission> Admission {get;set;} = new();
        public List<LaboratoryTest> LaboratoryTest {get;set;} = new();
        public List<RadiologyRequest> RadiologyRequest {get;set;} = new();

    }
}