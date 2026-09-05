namespace HospitalSys.DTO.ReferralManagement
{
    /// <summary>
    /// Triage information associated with the patient's visit.
    /// Vital signs are part of Triage (no separate VitalSigns entity).
    /// Property names match the existing Triage model (including spelling of Temprature / RespiratotyRate).
    /// </summary>
    public class ReferralTriageDto
    {
        public int TriageId { get; set; }

        public int VisitID { get; set; }

        public int? NurseID { get; set; }

        public int TriageDepartmentID { get; set; }

        public int ClinicalDepartmentID { get; set; }

        public string? ClinicalDepartmentName { get; set; }

        public double Temprature { get; set; }

        public double BloodPressure { get; set; }

        public double HeartRate { get; set; }

        public double RespiratotyRate { get; set; }

        public double Weight { get; set; }

        public string Notes { get; set; } = "";
    }
}
