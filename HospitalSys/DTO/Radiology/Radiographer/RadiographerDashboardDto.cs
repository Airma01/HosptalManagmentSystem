using System;
using System.Collections.Generic;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Dashboard for Radiographer portal.
    /// Counts and lists are derived only from existing RadiologyRequest / RadiologyResult
    /// (and related Patient / TestType) models. No invented fields.
    /// Supports workflow: pending requests → view patient/exam → perform → upload image → result.
    /// </summary>
    public class RadiographerDashboardDto
    {
        public string? RadiographerName { get; set; }

        public int PendingRequestsCount { get; set; }

        public int InProgressRequestsCount { get; set; }

        public int CompletedTodayCount { get; set; }

        public int TodayRequestsCount { get; set; }

        public int TotalRequestsCount { get; set; }

        public int RequestsWithResultsCount { get; set; }

        public int RequestsWithoutResultsCount { get; set; }

        /// <summary>
        /// Recent or priority queue items (populated from RadiologyRequest).
        /// </summary>
        public List<RadiologyRequestDto> RecentPendingRequests { get; set; } = new();
    }
}
