using HospitalSys.Attributes;
using HospitalSys.Data;
using HospitalSys.DTO;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.ReferralManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/[controller]")]
    [AuthorizeRole("Admin")]
    public class AdminOverviewController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminOverviewController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /Hospital/AdminOverview/overview
        /// Returns the complete AdminOverviewDto for the React admin analytical dashboard.
        /// </summary>
        [HttpGet("overview")]
        public async Task<ActionResult<AdminOverviewDto>> GetOverview(CancellationToken cancellationToken)
        {
            try
            {
                var now = DateTime.UtcNow;
                var todayStart = now.Date;
                var todayEnd = todayStart.AddDays(1);
                var yearStart = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);

                var dto = new AdminOverviewDto();

                // =====================================================
                // 1. KPI / NUMBER STATISTICS
                // =====================================================

                // Patients
                dto.TotalPatients = await _context.Patients
                    .AsNoTracking()
                    .CountAsync(cancellationToken);

                dto.TodaysPatients = await _context.Patients
                    .AsNoTracking()
                    .CountAsync(p => p.Created_at >= todayStart && p.Created_at < todayEnd, cancellationToken);

                // Visits
                dto.TotalVisits = await _context.PatientVisits
                    .AsNoTracking()
                    .CountAsync(cancellationToken);

                dto.TodaysVisits = await _context.PatientVisits
                    .AsNoTracking()
                    .CountAsync(v => v.VisitDate >= todayStart && v.VisitDate < todayEnd, cancellationToken);

                // Staff
                dto.TotalDoctors = await _context.Doctors
                    .AsNoTracking()
                    .CountAsync(cancellationToken);

                dto.TotalNurses = await _context.Nurses
                    .AsNoTracking()
                    .CountAsync(cancellationToken);

                // Total staff = Doctors + Nurses + Receptionists + Pharmacists + Lab Techs + Radiology Techs + Cashiers + PharmacyCashiers + LabCashiers + RadiologyCashiers + MainPharmacyManagers
                var doctorsCount = dto.TotalDoctors;
                var nursesCount = dto.TotalNurses;
                var receptionists = await _context.Receptionists.AsNoTracking().CountAsync(cancellationToken);
                var pharmacists = await _context.Pharmacists.AsNoTracking().CountAsync(cancellationToken);
                var labTechs = await _context.LaboratoryTechnicians.AsNoTracking().CountAsync(cancellationToken);
                var radTechs = await _context.RadiologyTechnicians.AsNoTracking().CountAsync(cancellationToken);
                var cashiers = await _context.Cashiers.AsNoTracking().CountAsync(cancellationToken);
                var pharmacyCashiers = await _context.PharmacyCashiers.AsNoTracking().CountAsync(cancellationToken);
                var labCashiers = await _context.LaboratoryCashiers.AsNoTracking().CountAsync(cancellationToken);
                var radCashiers = await _context.RadiologyCashiers.AsNoTracking().CountAsync(cancellationToken);
                var mainManagers = await _context.MainPharmacyManagers.AsNoTracking().CountAsync(cancellationToken);

                dto.TotalStaff = doctorsCount + nursesCount + receptionists + pharmacists
                               + labTechs + radTechs + cashiers + pharmacyCashiers
                               + labCashiers + radCashiers + mainManagers;

                // Appointments
                dto.TotalAppointments = await _context.Appointments
                    .AsNoTracking()
                    .CountAsync(cancellationToken);

                dto.TodaysAppointments = await _context.Appointments
                    .AsNoTracking()
                    .CountAsync(a => a.AppointmentDate >= todayStart && a.AppointmentDate < todayEnd, cancellationToken);

                // Appointment status counts (Status is a free string on the model)
                var appointmentStatusGroups = await _context.Appointments
                    .AsNoTracking()
                    .GroupBy(a => a.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                dto.PendingAppointments = appointmentStatusGroups
                    .Where(x => string.Equals(x.Status, "Pending", StringComparison.OrdinalIgnoreCase)
                             || string.Equals(x.Status, "Scheduled", StringComparison.OrdinalIgnoreCase))
                    .Sum(x => x.Count);

                dto.CompletedAppointments = appointmentStatusGroups
                    .Where(x => string.Equals(x.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                    .Sum(x => x.Count);

                dto.CancelledAppointments = appointmentStatusGroups
                    .Where(x => string.Equals(x.Status, "Cancelled", StringComparison.OrdinalIgnoreCase)
                             || string.Equals(x.Status, "Canceled", StringComparison.OrdinalIgnoreCase))
                    .Sum(x => x.Count);

                // Referrals (Status is ReferralStatus enum)
                dto.TotalReferrals = await _context.Referrals
                    .AsNoTracking()
                    .CountAsync(cancellationToken);

                dto.PendingReferrals = await _context.Referrals
                    .AsNoTracking()
                    .CountAsync(r => r.Status == ReferralStatus.Pending, cancellationToken);

                dto.AcceptedReferrals = await _context.Referrals
                    .AsNoTracking()
                    .CountAsync(r => r.Status == ReferralStatus.Accepted, cancellationToken);

                dto.CompletedReferrals = await _context.Referrals
                    .AsNoTracking()
                    .CountAsync(r => r.Status == ReferralStatus.Completed, cancellationToken);

                dto.RejectedReferrals = await _context.Referrals
                    .AsNoTracking()
                    .CountAsync(r => r.Status == ReferralStatus.Rejected, cancellationToken);

                dto.CancelledReferrals = await _context.Referrals
                    .AsNoTracking()
                    .CountAsync(r => r.Status == ReferralStatus.Cancelled, cancellationToken);

                // Laboratory
                dto.TotalLaboratoryRequests = await _context.LaboratoryTests
                    .AsNoTracking()
                    .CountAsync(cancellationToken);

                var labStatusGroups = await _context.LaboratoryTests
                    .AsNoTracking()
                    .GroupBy(t => t.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                dto.PendingLaboratoryRequests = labStatusGroups
                    .Where(x => string.Equals(x.Status, "Pending", StringComparison.OrdinalIgnoreCase)
                             || string.Equals(x.Status, "Requested", StringComparison.OrdinalIgnoreCase)
                             || string.Equals(x.Status, "InProgress", StringComparison.OrdinalIgnoreCase))
                    .Sum(x => x.Count);

                dto.CompletedLaboratoryRequests = labStatusGroups
                    .Where(x => string.Equals(x.Status, "Completed", StringComparison.OrdinalIgnoreCase)
                             || string.Equals(x.Status, "Done", StringComparison.OrdinalIgnoreCase)
                             || string.Equals(x.Status, "Resulted", StringComparison.OrdinalIgnoreCase))
                    .Sum(x => x.Count);

                // Pharmacy / Prescriptions
                dto.TotalPrescriptions = await _context.Prescriptions
                    .AsNoTracking()
                    .CountAsync(cancellationToken);

                // Paid = prescriptions that have at least one PharmacyPayment
                var paidPrescriptionIds = await _context.PharmacyPayments
                    .AsNoTracking()
                    .Select(p => p.PrescriptionID)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                dto.PaidPrescriptions = paidPrescriptionIds.Count;
                dto.PendingPrescriptions = dto.TotalPrescriptions - dto.PaidPrescriptions; // unpaid treated as pending

                // Maternal & Child KPIs
                dto.TotalANCVisits = await _context.ANCVisits.AsNoTracking().CountAsync(cancellationToken);
                dto.TotalPNCVisits = await _context.PNCVisits.AsNoTracking().CountAsync(cancellationToken);
                dto.TotalDeliveries = await _context.Deliveries.AsNoTracking().CountAsync(cancellationToken);
                dto.TotalFamilyPlanning = await _context.FamilyPlannings.AsNoTracking().CountAsync(cancellationToken);
                dto.TotalHighRiskPregnancies = await _context.HighRiskPregnancies.AsNoTracking().CountAsync(cancellationToken);
                dto.TotalGrowthMonitorings = await _context.GrowthMonitorings.AsNoTracking().CountAsync(cancellationToken);
                dto.TotalImmunizations = await _context.Immunizations.AsNoTracking().CountAsync(cancellationToken);
                dto.TotalNutritionAssessments = await _context.NutritionAssessments.AsNoTracking().CountAsync(cancellationToken);

                // =====================================================
                // 2. LINE CHART – Monthly trends (current year)
                // =====================================================

                var patientMonthly = await _context.Patients
                    .AsNoTracking()
                    .Where(p => p.Created_at >= yearStart)
                    .GroupBy(p => new { p.Created_at.Year, p.Created_at.Month })
                    .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                var visitMonthly = await _context.PatientVisits
                    .AsNoTracking()
                    .Where(v => v.VisitDate >= yearStart)
                    .GroupBy(v => new { v.VisitDate.Year, v.VisitDate.Month })
                    .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                var appointmentMonthly = await _context.Appointments
                    .AsNoTracking()
                    .Where(a => a.AppointmentDate >= yearStart)
                    .GroupBy(a => new { a.AppointmentDate.Year, a.AppointmentDate.Month })
                    .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                for (int m = 1; m <= 12; m++)
                {
                    var monthLabel = new DateTime(now.Year, m, 1).ToString("MMM yyyy");

                    dto.PatientRegistrationTrend.Add(new MonthlyTrendDto
                    {
                        Month = monthLabel,
                        Count = patientMonthly.FirstOrDefault(x => x.Month == m)?.Count ?? 0
                    });

                    dto.VisitTrend.Add(new MonthlyTrendDto
                    {
                        Month = monthLabel,
                        Count = visitMonthly.FirstOrDefault(x => x.Month == m)?.Count ?? 0
                    });

                    dto.AppointmentTrend.Add(new MonthlyTrendDto
                    {
                        Month = monthLabel,
                        Count = appointmentMonthly.FirstOrDefault(x => x.Month == m)?.Count ?? 0
                    });
                }

                // =====================================================
                // 3. BAR CHART – Department workload
                // =====================================================

                var departments = await _context.ClinicalDepartments
                    .AsNoTracking()
                    .Select(d => new
                    {
                        d.ClinicalDepartmentID,
                        d.DepartmentName
                    })
                    .ToListAsync(cancellationToken);

                var doctorCountsByDept = await _context.Doctors
                    .AsNoTracking()
                    .GroupBy(d => d.ClinicalDepartmentID)
                    .Select(g => new { DeptId = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                var nurseCountsByDept = await _context.Nurses
                    .AsNoTracking()
                    .GroupBy(n => n.ClinicalDepartmentID)
                    .Select(g => new { DeptId = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                // Appointments linked through Doctor → ClinicalDepartment
                var appointmentCountsByDept = await _context.Appointments
                    .AsNoTracking()
                    .Join(_context.Doctors.AsNoTracking(),
                          a => a.DoctorID,
                          d => d.DoctorID,
                          (a, d) => d.ClinicalDepartmentID)
                    .GroupBy(deptId => deptId)
                    .Select(g => new { DeptId = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                // Referrals by ReferringDepartmentID / ReceivingDepartmentID
                var referringCounts = await _context.Referrals
                    .AsNoTracking()
                    .Where(r => r.ReferringDepartmentID != null)
                    .GroupBy(r => r.ReferringDepartmentID!.Value)
                    .Select(g => new { DeptId = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                var receivingCounts = await _context.Referrals
                    .AsNoTracking()
                    .Where(r => r.ReceivingDepartmentID != null)
                    .GroupBy(r => r.ReceivingDepartmentID!.Value)
                    .Select(g => new { DeptId = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                foreach (var dept in departments)
                {
                    var docCount = doctorCountsByDept.FirstOrDefault(x => x.DeptId == dept.ClinicalDepartmentID)?.Count ?? 0;
                    var nurseCount = nurseCountsByDept.FirstOrDefault(x => x.DeptId == dept.ClinicalDepartmentID)?.Count ?? 0;
                    var apptCount = appointmentCountsByDept.FirstOrDefault(x => x.DeptId == dept.ClinicalDepartmentID)?.Count ?? 0;
                    var refCount = (referringCounts.FirstOrDefault(x => x.DeptId == dept.ClinicalDepartmentID)?.Count ?? 0)
                                 + (receivingCounts.FirstOrDefault(x => x.DeptId == dept.ClinicalDepartmentID)?.Count ?? 0);

                    dto.DepartmentWorkload.Add(new DepartmentWorkloadDto
                    {
                        ClinicalDepartmentID = dept.ClinicalDepartmentID,
                        DepartmentName = dept.DepartmentName,
                        DoctorCount = docCount,
                        NurseCount = nurseCount,
                        AppointmentCount = apptCount,
                        ReferralCount = refCount
                    });
                }

                // =====================================================
                // 4. PIE / CIRCLE – Distributions
                // =====================================================

                // Gender (Patient.Gender enum: Male, Female)
                var genderGroups = await _context.Patients
                    .AsNoTracking()
                    .GroupBy(p => p.Gender)
                    .Select(g => new { Gender = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                foreach (var g in genderGroups)
                {
                    dto.GenderDistribution.Add(new GenderDistributionDto
                    {
                        Gender = g.Gender.ToString(),
                        Count = g.Count
                    });
                }

                // Visit status (PatientVisit.Status is string)
                var visitStatusGroups = await _context.PatientVisits
                    .AsNoTracking()
                    .GroupBy(v => v.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                foreach (var s in visitStatusGroups)
                {
                    dto.VisitStatusDistribution.Add(new StatusCountDto
                    {
                        Status = string.IsNullOrWhiteSpace(s.Status) ? "Unknown" : s.Status,
                        Count = s.Count
                    });
                }

                // Appointment status distribution
                foreach (var s in appointmentStatusGroups)
                {
                    dto.AppointmentStatusDistribution.Add(new StatusCountDto
                    {
                        Status = string.IsNullOrWhiteSpace(s.Status) ? "Unknown" : s.Status,
                        Count = s.Count
                    });
                }

                // Referral status distribution (enum)
                var referralStatusGroups = await _context.Referrals
                    .AsNoTracking()
                    .GroupBy(r => r.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                foreach (var s in referralStatusGroups)
                {
                    dto.ReferralStatusDistribution.Add(new StatusCountDto
                    {
                        Status = s.Status.ToString(),
                        Count = s.Count
                    });
                }

                // =====================================================
                // 5. LABORATORY ANALYTICS
                // =====================================================

                dto.Laboratory = new LaboratoryAnalyticsDto
                {
                    TotalRequests = dto.TotalLaboratoryRequests,
                    PendingRequests = dto.PendingLaboratoryRequests,
                    CompletedRequests = dto.CompletedLaboratoryRequests,
                    StatusDistribution = labStatusGroups.Select(x => new StatusCountDto
                    {
                        Status = string.IsNullOrWhiteSpace(x.Status) ? "Unknown" : x.Status,
                        Count = x.Count
                    }).ToList()
                };

                // Tests by LaboratorySection (via LaboratoryTestType)
                var testsBySection = await _context.LaboratoryTests
                    .AsNoTracking()
                    .Join(_context.LaboratoryTestTypes.AsNoTracking(),
                          t => t.LaboratoryTestTypeID,
                          tt => tt.LaboratoryTestTypeID,
                          (t, tt) => tt)
                    .Join(_context.LaboratorySections.AsNoTracking(),
                          tt => tt.LaboratorySectionID,
                          sec => sec.LaboratorySectionID,
                          (tt, sec) => new { sec.LaboratorySectionID, sec.SectionName })
                    .GroupBy(x => new { x.LaboratorySectionID, x.SectionName })
                    .Select(g => new LabSectionCountDto
                    {
                        LaboratorySectionID = g.Key.LaboratorySectionID,
                        SectionName = g.Key.SectionName,
                        TestCount = g.Count()
                    })
                    .ToListAsync(cancellationToken);

                dto.Laboratory.TestsBySection = testsBySection;

                // =====================================================
                // 6. PHARMACY ANALYTICS
                // =====================================================

                dto.Pharmacy = new PharmacyAnalyticsDto
                {
                    TotalPrescriptions = dto.TotalPrescriptions,
                    PaidPrescriptions = dto.PaidPrescriptions,
                    UnpaidPrescriptions = dto.TotalPrescriptions - dto.PaidPrescriptions,
                    TotalDispenseMedicines = await _context.DispenseMedicines.AsNoTracking().CountAsync(cancellationToken),
                    CentralStoreRequests = await _context.CentralStoreRequests.AsNoTracking().CountAsync(cancellationToken),
                    AidStoreRequests = await _context.AidStoreRequests.AsNoTracking().CountAsync(cancellationToken),
                    CentralStoreTransfers = await _context.CentralStoreTransfers.AsNoTracking().CountAsync(cancellationToken),
                    AidStoreTransfers = await _context.AidStoreTransfers.AsNoTracking().CountAsync(cancellationToken)
                };

                // =====================================================
                // 7. REFERRAL BY DEPARTMENT
                // =====================================================

                foreach (var dept in departments)
                {
                    var referring = referringCounts.FirstOrDefault(x => x.DeptId == dept.ClinicalDepartmentID)?.Count ?? 0;
                    var receiving = receivingCounts.FirstOrDefault(x => x.DeptId == dept.ClinicalDepartmentID)?.Count ?? 0;

                    dto.ReferralsByDepartment.Add(new ReferralByDepartmentDto
                    {
                        DepartmentID = dept.ClinicalDepartmentID,
                        DepartmentName = dept.DepartmentName,
                        ReferringCount = referring,
                        ReceivingCount = receiving,
                        TotalCount = referring + receiving
                    });
                }

                // =====================================================
                // 8. MATERNAL & CHILD ANALYTICS
                // =====================================================

                dto.MaternalChild = new MaternalChildAnalyticsDto
                {
                    TotalPregnancies = await _context.Pregnancies.AsNoTracking().CountAsync(cancellationToken),
                    TotalANCVisits = dto.TotalANCVisits,
                    TotalPNCVisits = dto.TotalPNCVisits,
                    TotalDeliveries = dto.TotalDeliveries,
                    TotalFamilyPlanning = dto.TotalFamilyPlanning,
                    TotalHighRiskPregnancies = dto.TotalHighRiskPregnancies,
                    TotalGrowthMonitorings = dto.TotalGrowthMonitorings,
                    TotalImmunizations = dto.TotalImmunizations,
                    TotalNutritionAssessments = dto.TotalNutritionAssessments,
                    TotalNeonatalCares = await _context.NeonatalCares.AsNoTracking().CountAsync(cancellationToken),
                    TotalIMNCIEncounters = await _context.IMNCIEncounters.AsNoTracking().CountAsync(cancellationToken)
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error while building admin overview.", detail = ex.Message });
            }
        }
    }
}