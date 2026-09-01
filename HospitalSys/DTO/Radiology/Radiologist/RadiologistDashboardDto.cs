using System.Collections.Generic;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Dashboard for Radiologist portal.
    /// Supports: requests ready for interpretation, patient info, examination,
    /// clinical indication, images, report status, completed reports.
    /// All fields are populatable from existing RadiologyRequest / RadiologyResult
    /// (and navigations to Patient, Consultation, TestType). No new models invented.
    /// </summary>
    public class RadiologistDashboardDto
    {
        public string? RadiologistName { get; set; }

        /// <summary>
        /// Requests that have an image / result but report (ResultDescription) may still need finalization.
        /// </summary>
        public int ReadyForInterpretationCount { get; set; }

        public int CompletedReportsCount { get; set; }

        public int TodayCompletedCount { get; set; }

        public int PendingRequestsCount { get; set; }

        public int TotalResultsCount { get; set; }

        /// <summary>
        /// Queue of results/requests awaiting interpretation (from existing models).
        /// </summary>
        public List<RadiologyResultResponseDto> ReadyForInterpretation { get; set; } = new();

        /// <summary>
        /// Recently finalized reports.
        /// </summary>
        public List<RadiologyResultDto> RecentCompletedReports { get; set; } = new();
    }
}
