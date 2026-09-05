using HospitalSys.Models.PatientManagment;

namespace HospitalSys.DTO.ReferralManagement
{
    /// <summary>
    /// Patient information needed on the Referral Detail page.
    /// Based on the existing Patient model.
    /// </summary>
    public class ReferralPatientDto
    {
        public int PatientID { get; set; }

        public string MRN { get; set; } = "";

        public string FirstName { get; set; } = "";

        public string LastName { get; set; } = "";

        public string PatientName { get; set; } = "";

        public Gender Gender { get; set; }

        public DateTime DateOfBirth { get; set; }

        /// <summary>
        /// Calculated age in years from DateOfBirth (not stored on the model).
        /// </summary>
        public int Age { get; set; }

        public string Phone { get; set; } = "";

        public string Address { get; set; } = "";

        public string EmergencyContact { get; set; } = "";
    }
}
