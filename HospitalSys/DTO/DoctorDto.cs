using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto
{
    public class RegisterDoctorDto
    {
        public int UserID {get;set;}
        public int ClinicalDepartmentID {get;set;}
        public string LicenseNumber {get;set;} = "";
    }

    public class DoctorLoginDto
    {
        public string username {get;set;} = ""; 
        public string Password {get;set;} = "";    
    }

   public class DoctorCookieDto
    {
        public string username {get;set;} = ""; 
        public string FullName {get;set;} = "";    
        public List<string> RoleName {get;set;} = new List<string>();

        public int DepartmentID {get;set;}
        public int DoctorID {get;set;}
        public string DepartmentName {get;set;} = "";
    }

   public class ConsultationUpdateDto
    {
        public string Diagnosis {get;set;} = "";
        public string TreatmentPlan {get;set;} = "";
        public string ChiefComplaint {get;set;} = "";
    }
    public class ConsultationDto
    {
        public int VisitID {get;set;}
        public int DoctorID {get;set;}
        public string ChiefComplaint {get;set;} = "";
        public string Diagnosis {get;set;} = "";
        public string TreatmentPlan {get;set;} = "";

    }
    public class MedicalRecordDto
{
    [Required]
    public int ConsultationID { get; set; }
    [Required]
    public int PatientID { get; set; }
    [Required]
    public int DoctorID { get; set; }
}
    // DTO
public class DoctorDto
{
    public int Id { get; set; }
    public int doctorID { get; set; }
    public string Username { get; set; } = "";
    public string FullName { get; set; } = "";
    public List<string> Roles { get; set; } = new List<string>();
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    // Add any other fields you actually need
}
    public class SelectedDoctorsDto
    {
        public List<int> UserIDs { get; set; } = new List<int>();
    }
}