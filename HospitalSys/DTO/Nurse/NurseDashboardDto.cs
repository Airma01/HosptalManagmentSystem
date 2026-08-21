using System;

namespace HospitalSys.Dto.Nurse
{
    public class NurseDashboardDto
    {
        public int NurseId { get; set; }
        public string? NurseName { get; set; }
        public string? DepartmentName { get; set; }
        public int TodayPatientCount { get; set; }
        public int TodayVisitCount { get; set; }
        public int PendingTriageCount { get; set; }
        public int CompletedTriageCount { get; set; }
        public int TodayPrescriptionCount { get; set; }
    }
}