using System;

namespace HospitalSys.Dto.MLT
{
    /// <summary>
    /// Dashboard statistics for Laboratory Technician.
    /// Counts are derived from LaboratoryTest (Status, RequestDate) only.
    /// </summary>
    public class MLTDashboardDto
    {
        public int PendingTestsCount { get; set; }
        public int ProcessingTestsCount { get; set; }
        public int CompletedTestsCount { get; set; }
        public int TodayTestsCount { get; set; }
        public int TotalTestsCount { get; set; }
        public int TestsWithResultsCount { get; set; }
        public int TestsWithoutResultsCount { get; set; }
    }
}