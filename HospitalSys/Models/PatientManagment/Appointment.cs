using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.PatientManagment
{
    public class Appointment
    {
        [Key]
        public int AppointmentID {get;set;}
        public int PatientID {get;set;}
        [ForeignKey(nameof(PatientID))]
        public Patient? Patient {get;set;}
        public int DoctorID {get;set;}
        [ForeignKey(nameof(DoctorID))]
        public Doctor? Doctor {get;set;}
        public DateTime AppointmentDate {get;set;} 
        [MaxLength(100)]
        public string Status {get;set;} = "";
        public string Reason {get;set;} = "";
    }
}