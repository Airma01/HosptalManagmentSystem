using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.HospitalStruct;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Inpatient
{
    public class Admission
    {
        [Key]
        public int AdmissionID {get;set;}
        public int PatientID {get;set;}
        [ForeignKey(nameof(PatientID))]
        public Patient? Patient {get;set;}
        public int BedID {get;set;}
        [ForeignKey(nameof(BedID))]
        public Bed? Bed {get;set;}
        public int DoctorID {get;set;}
        [ForeignKey(nameof(DoctorID))]
        public Doctor? Doctor {get;set;}
        public DateTime AdmissionDate {get;set;} = DateTime.UtcNow;
        public DateTime DischargeDate {get;set;}
        public string Status {get;set;} = "";
    }
}