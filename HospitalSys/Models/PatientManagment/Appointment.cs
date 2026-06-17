using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.PatientManagment
{
    public class Appointment
    {
        [Key]
        public int AppointmentID {get;set;}
        public int PatientID {get;set;}
        public Patient? Patient {get;set;}
        public int DoctorID {get;set;}
        public Doctor? Doctor {get;set;}
        public DateTime AppointmentDate {get;set;} 
        [MaxLength(100)]
        public string Status {get;set;} = "";
        public string Reason {get;set;} = "";
    }
}