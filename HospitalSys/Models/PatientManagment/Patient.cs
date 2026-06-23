using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.BillingAndPayment;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.Inpatient;
using HospitalSys.Models.Laboratory;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Radiology;

namespace HospitalSys.Models.PatientManagment
{
    public enum Gender
    {
        Male,
        Female
    }
    public class Patient{
        [Key]
        public int PatientID {get;set;}
        [MaxLength(100)]
        public string FirstName {get;set;} = "";
        [MaxLength(100)]
        public string LastName {get;set;} = "";
        public Gender Gender {get;set;}
        public DateTime DateOfBirth {get;set;}
        [MaxLength(20)]
        public string Phone {get;set;} = "";
        [MaxLength(100)]
        public string Address {get;set;} = "";
        [MaxLength(100)]
        public string EmergencyContact {get;set;} = "";
        public DateTime Created_at {get;set;} = DateTime.UtcNow;
        public List<PatientVisit> PatientVisit {get;set;} = new();
        public List<Appointment> Appointment {get;set;} = new();
        public List<MedicalRecord> MedicalRecord {get;set;} = new();
        public List<Prescription> Prescription {get;set;} = new();
        public List<Bill> Bill {get;set;} = new();
        public List<Admission> Admission {get;set;} = new();
        public List<LaboratoryTest> LaboratoryTest {get;set;} = new();
        public List<RadiologyRequest> RadiologyRequest {get;set;} = new();
    }
}