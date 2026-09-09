using System;
using System.Collections.Generic;

namespace HospitalSys.DTO
{
    /// <summary>
    /// Root DTO returned by GET /api/admin/overview.
    /// Contains KPI cards + all chart datasets needed by the React Admin Dashboard.
    /// </summary>
    public class AdminOverviewDto
    {
        // =====================================================
        // 1. KPI / NUMBER STATISTICS (cards)
        // =====================================================
        public int TotalPatients { get; set; }
        public int TodaysPatients { get; set; }               // Patients registered today (Created_at)

        public int TotalVisits { get; set; }
        public int TodaysVisits { get; set; }                 // PatientVisit.VisitDate == today

        public int TotalDoctors { get; set; }
        public int TotalNurses { get; set; }
        public int TotalStaff { get; set; }                   // Sum of all staff DbSets

        public int TotalAppointments { get; set; }
        public int TodaysAppointments { get; set; }
        public int PendingAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }

        public int TotalReferrals { get; set; }
        public int PendingReferrals { get; set; }
        public int AcceptedReferrals { get; set; }
        public int CompletedReferrals { get; set; }
        public int RejectedReferrals { get; set; }
        public int CancelledReferrals { get; set; }

        public int TotalLaboratoryRequests { get; set; }
        public int PendingLaboratoryRequests { get; set; }
        public int CompletedLaboratoryRequests { get; set; }

        public int TotalPrescriptions { get; set; }
        public int PendingPrescriptions { get; set; }         // Prescriptions without PharmacyPayment
        public int PaidPrescriptions { get; set; }            // Prescriptions that have PharmacyPayment

        // Maternal & Child KPIs (only entities that exist)
        public int TotalANCVisits { get; set; }
        public int TotalPNCVisits { get; set; }
        public int TotalDeliveries { get; set; }
        public int TotalFamilyPlanning { get; set; }
        public int TotalHighRiskPregnancies { get; set; }
        public int TotalGrowthMonitorings { get; set; }
        public int TotalImmunizations { get; set; }
        public int TotalNutritionAssessments { get; set; }

        // =====================================================
        // 2. LINE CHART – Monthly trends
        // =====================================================
        public List<MonthlyTrendDto> PatientRegistrationTrend { get; set; } = new();
        public List<MonthlyTrendDto> VisitTrend { get; set; } = new();
        public List<MonthlyTrendDto> AppointmentTrend { get; set; } = new();

        // =====================================================
        // 3. BAR CHART – Department workload
        // =====================================================
        public List<DepartmentWorkloadDto> DepartmentWorkload { get; set; } = new();

        // =====================================================
        // 4. PIE / CIRCLE CHARTS – Distributions
        // =====================================================
        public List<GenderDistributionDto> GenderDistribution { get; set; } = new();
        public List<StatusCountDto> VisitStatusDistribution { get; set; } = new();
        public List<StatusCountDto> AppointmentStatusDistribution { get; set; } = new();
        public List<StatusCountDto> ReferralStatusDistribution { get; set; } = new();

        // =====================================================
        // 5. LABORATORY ANALYTICS
        // =====================================================
        public LaboratoryAnalyticsDto Laboratory { get; set; } = new();

        // =====================================================
        // 6. PHARMACY ANALYTICS
        // =====================================================
        public PharmacyAnalyticsDto Pharmacy { get; set; } = new();

        // =====================================================
        // 7. REFERRAL ANALYTICS (by department)
        // =====================================================
        public List<ReferralByDepartmentDto> ReferralsByDepartment { get; set; } = new();

        // =====================================================
        // 8. MATERNAL & CHILD ANALYTICS
        // =====================================================
        public MaternalChildAnalyticsDto MaternalChild { get; set; } = new();
    }

    // -----------------------------------------------------
    // Supporting DTOs (all in the same file)
    // -----------------------------------------------------

    public class MonthlyTrendDto
    {
        public string Month { get; set; } = "";   // e.g. "2025-01" or "Jan 2025"
        public int Count { get; set; }
    }

    public class DepartmentWorkloadDto
    {
        public int ClinicalDepartmentID { get; set; }
        public string DepartmentName { get; set; } = "";
        public int DoctorCount { get; set; }
        public int NurseCount { get; set; }
        public int AppointmentCount { get; set; }
        public int ReferralCount { get; set; }     // Referrals where ReferringDepartmentID or ReceivingDepartmentID matches
    }

    public class GenderDistributionDto
    {
        public string Gender { get; set; } = "";   // "Male" | "Female" (from Patient.Gender enum)
        public int Count { get; set; }
    }

    public class StatusCountDto
    {
        public string Status { get; set; } = "";
        public int Count { get; set; }
    }

    public class LaboratoryAnalyticsDto
    {
        public int TotalRequests { get; set; }
        public int PendingRequests { get; set; }
        public int CompletedRequests { get; set; }
        public List<LabSectionCountDto> TestsBySection { get; set; } = new();
        public List<StatusCountDto> StatusDistribution { get; set; } = new();
    }

    public class LabSectionCountDto
    {
        public int LaboratorySectionID { get; set; }
        public string SectionName { get; set; } = "";
        public int TestCount { get; set; }
    }

    public class PharmacyAnalyticsDto
    {
        public int TotalPrescriptions { get; set; }
        public int PaidPrescriptions { get; set; }
        public int UnpaidPrescriptions { get; set; }
        public int TotalDispenseMedicines { get; set; }
        public int CentralStoreRequests { get; set; }
        public int AidStoreRequests { get; set; }
        public int CentralStoreTransfers { get; set; }
        public int AidStoreTransfers { get; set; }
    }

    public class ReferralByDepartmentDto
    {
        public int? DepartmentID { get; set; }
        public string DepartmentName { get; set; } = "";
        public int ReferringCount { get; set; }   // ReferringDepartmentID
        public int ReceivingCount { get; set; }   // ReceivingDepartmentID
        public int TotalCount { get; set; }
    }

    public class MaternalChildAnalyticsDto
    {
        public int TotalPregnancies { get; set; }
        public int TotalANCVisits { get; set; }
        public int TotalPNCVisits { get; set; }
        public int TotalDeliveries { get; set; }
        public int TotalFamilyPlanning { get; set; }
        public int TotalHighRiskPregnancies { get; set; }
        public int TotalGrowthMonitorings { get; set; }
        public int TotalImmunizations { get; set; }
        public int TotalNutritionAssessments { get; set; }
        public int TotalNeonatalCares { get; set; }
        public int TotalIMNCIEncounters { get; set; }
    }
}