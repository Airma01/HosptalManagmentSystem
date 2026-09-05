namespace HospitalSys.DTO.ReferralManagement
{
    /// <summary>
    /// Visit information associated with a referral.
    /// Exposes VisitID and PatientID required for frontend routes:
    /// /doctor/consultation/patient/{patientId}/{visitId}
    /// /doctor/maternal/patient/{patientId}/{visitId}
    /// /doctor/adult/patient/{patientId}/{visitId}
    /// </summary>
    public class ReferralVisitDto
    {
        public int VisitID { get; set; }

        public int PatientID { get; set; }

        public DateTime VisitDate { get; set; }

        public string VisitType { get; set; } = "";

        public string Status { get; set; } = "";

        public DateTime Created_at { get; set; }
    }
}
