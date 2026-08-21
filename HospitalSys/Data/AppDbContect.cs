using Microsoft.EntityFrameworkCore;
using HospitalSys.Models;
using HospitalSys.Models.HospitalStruct;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.BillingAndPayment;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.Inpatient;
using HospitalSys.Models.Pharmacy.AidStore;
using HospitalSys.Models.Pharmacy.Branch;
using HospitalSys.Models.Pharmacy.CentralStore;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Laboratory;
using HospitalSys.Models.Radiology;
using HospitalSys.Models.AdultMedicalCare;
using HospitalSys.Models.ChildHealth;
using HospitalSys.Models.CommunityHealth;
using HospitalSys.Models.MaternalChildHealth;
using HospitalSys.Models.ReferralManagement;
using HospitalSys.Models.Family;

namespace HospitalSys.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==============================================
            // 1. UNIQUE INDEXES & BASIC CONFIGURATIONS
            // ==============================================
            modelBuilder.Entity<Users>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.MRN)
                .IsUnique();

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.FaydaFIN)
                .IsUnique();

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.Phone);

            modelBuilder.Entity<PatientVisit>()
                .HasIndex(p => p.VisitDate);

            modelBuilder.Entity<Appointment>()
                .HasIndex(a => a.AppointmentDate);

            // Prevent duplicate role assignments
            modelBuilder.Entity<UserRole>()
                .HasIndex(ur => new { ur.UserID, ur.RoleID })
                .IsUnique();

            // ==============================================
            // 2. ENUM CONVERSIONS (Store as strings)
            // ==============================================
            modelBuilder.Entity<Users>()
                .Property(u => u.Gender)
                .HasConversion<string>();

            modelBuilder.Entity<Patient>()
                .Property(u => u.Gender)
                .HasConversion<string>();

            modelBuilder.Entity<SuperAdmins>()
                .Property(u => u.AdminRole)
                .HasConversion<string>();

            modelBuilder.Entity<CentralStoreRequest>()
                .Property(u => u.Status)
                .HasConversion<string>();

            // Additional enums from your models
            modelBuilder.Entity<DiabetesManagement>()
                .Property(d => d.DiabetesType)
                .HasConversion<string>();

            modelBuilder.Entity<Delivery>()
                .Property(d => d.DeliveryMode)
                .HasConversion<string>();

            modelBuilder.Entity<Pregnancy>()
                .Property(p => p.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Referral>()
                .Property(r => r.Status)
                .HasConversion<string>();

            modelBuilder.Entity<AmbulanceRequest>()
                .Property(a => a.Status)
                .HasConversion<string>();

            // ==============================================
            // 3. STAFF -> USERS RELATIONSHIPS (Restrict Delete)
            // ==============================================
            // Doctor
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasKey(d => d.DoctorID);
                entity.HasOne(d => d.Users)
                    .WithMany(u => u.Doctor)
                    .HasForeignKey(d => d.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Nurse
            modelBuilder.Entity<Nurse>(entity =>
            {
                entity.HasKey(n => n.NurseID);
                entity.HasOne(n => n.Users)
                    .WithMany(u => u.Nurse)
                    .HasForeignKey(n => n.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Pharmacist
            modelBuilder.Entity<Pharmacist>(entity =>
            {
                entity.HasKey(p => p.PharmacistID);
                entity.HasOne(p => p.Users)
                    .WithMany(u => u.Pharmacist)
                    .HasForeignKey(p => p.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // LaboratoryTechnician
            modelBuilder.Entity<LaboratoryTechnician>(entity =>
            {
                entity.HasKey(l => l.TechnicianID);
                entity.HasOne(l => l.Users)
                    .WithMany(u => u.LaboratoryTechnician)
                    .HasForeignKey(l => l.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // RadiologyTechnician
            modelBuilder.Entity<RadiologyTechnician>(entity =>
            {
                entity.HasKey(r => r.RadiologyTechnicianID);
                entity.HasOne(r => r.Users)
                    .WithMany(u => u.RadiologyTechnician)
                    .HasForeignKey(r => r.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Cashier
            modelBuilder.Entity<Cashier>(entity =>
            {
                entity.HasKey(c => c.CashierID);
                entity.HasOne(c => c.Users)
                    .WithMany(u => u.Cashier)
                    .HasForeignKey(c => c.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // PharmacyCashier
            modelBuilder.Entity<PharmacyCashier>(entity =>
            {
                entity.HasKey(p => p.PharmacyCashierID);
                entity.HasOne(p => p.Users)
                    .WithMany(u => u.PharmacyCashier)
                    .HasForeignKey(p => p.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // LaboratoryCashier
            modelBuilder.Entity<LaboratoryCashier>(entity =>
            {
                entity.HasKey(l => l.LaboratoryCashierID);
                entity.HasOne(l => l.Users)
                    .WithMany(u => u.LaboratoryCashier)
                    .HasForeignKey(l => l.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // RadiologyCashier
            modelBuilder.Entity<RadiologyCashier>(entity =>
            {
                entity.HasKey(r => r.RadiologyCashierID);
                entity.HasOne(r => r.Users)
                    .WithMany(u => u.RadiologyCashier)
                    .HasForeignKey(r => r.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MainPharmacyManager
            modelBuilder.Entity<MainPharmacyManager>(entity =>
            {
                entity.HasKey(m => m.ManagerID);
                entity.HasOne(m => m.Users)
                    .WithMany(u => u.MainPharmacyManager)
                    .HasForeignKey(m => m.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Receptionist (if you have navigation in Users)
            modelBuilder.Entity<Receptionist>(entity =>
            {
                entity.HasKey(r => r.ReceptionistID);
                entity.HasOne(r => r.Users)
                    .WithMany(u => u.Receptionist)
                    .HasForeignKey(r => r.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==============================================
            // 4. PERFORMANCE INDEXES (Foreign Keys)
            // ==============================================
            modelBuilder.Entity<PatientVisit>().HasIndex(pv => pv.PatientID);
            modelBuilder.Entity<Consultation>().HasIndex(c => c.VisitID);
            modelBuilder.Entity<Consultation>().HasIndex(c => c.DoctorID);
            modelBuilder.Entity<Prescription>().HasIndex(p => p.PatientID);
            modelBuilder.Entity<Prescription>().HasIndex(p => p.ConsultationID);
            modelBuilder.Entity<Admission>().HasIndex(a => a.PatientID);
            modelBuilder.Entity<Admission>().HasIndex(a => a.BedID);
            modelBuilder.Entity<Appointment>().HasIndex(a => a.PatientID);
            modelBuilder.Entity<Appointment>().HasIndex(a => a.DoctorID);
            modelBuilder.Entity<LaboratoryTest>().HasIndex(l => l.PatientID);
            modelBuilder.Entity<LaboratoryTest>().HasIndex(l => l.ConsultationID);
            modelBuilder.Entity<RadiologyRequest>().HasIndex(r => r.PatientID);
            modelBuilder.Entity<RadiologyRequest>().HasIndex(r => r.ConsultationID);
            modelBuilder.Entity<Bill>().HasIndex(b => b.PatientID);
            modelBuilder.Entity<Bill>().HasIndex(b => b.VisitID);
            modelBuilder.Entity<Referral>().HasIndex(r => r.PatientID);
            modelBuilder.Entity<Referral>().HasIndex(r => r.PatientVisitID);
        }

        // ==============================================
        // 5. DbSet PROPERTIES (Complete List)
        // ==============================================

        // ---- Core / Users ----
        public DbSet<Users> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<SuperAdmins> SuperAdmin { get; set; }  // Fixed naming (was SuperAdmin)

        // ---- Staff ----
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Nurse> Nurses { get; set; }
        public DbSet<Receptionist> Receptionists { get; set; }
        public DbSet<Pharmacist> Pharmacists { get; set; }
        public DbSet<LaboratoryTechnician> LaboratoryTechnicians { get; set; }
        public DbSet<RadiologyTechnician> RadiologyTechnicians { get; set; }
        public DbSet<Cashier> Cashiers { get; set; }
        public DbSet<PharmacyCashier> PharmacyCashiers { get; set; }
        public DbSet<LaboratoryCashier> LaboratoryCashiers { get; set; }
        public DbSet<RadiologyCashier> RadiologyCashiers { get; set; }
        public DbSet<MainPharmacyManager> MainPharmacyManagers { get; set; }

        // ---- Hospital Structure ----
        public DbSet<ClinicalDepartment> ClinicalDepartments { get; set; }
        public DbSet<TriageDepartment> TriageDepartments { get; set; }
        public DbSet<Ward> Wards { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Bed> Beds { get; set; }

        // ---- Patient Management ----
        public DbSet<Patient> Patients { get; set; }
        public DbSet<PatientVisit> PatientVisits { get; set; }  // Fixed typo (was PatientVists)
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Triage> Triages { get; set; }

        // ---- Consultation & Clinical Records ----
        public DbSet<Consultation> Consultations { get; set; }
        public DbSet<Diagnosis> Diagnoses { get; set; }
        public DbSet<PhysicalExamination> PhysicalExaminations { get; set; }
        public DbSet<MedicalHistory> MedicalHistories { get; set; }
        public DbSet<FamilyMedicalHistory> FamilyMedicalHistories { get; set; }
        public DbSet<SocialHistory> SocialHistories { get; set; }
        public DbSet<Allergy> Allergies { get; set; }
        public DbSet<ProblemList> ProblemLists { get; set; }

        // ---- Family ----
        public DbSet<Family> Families { get; set; }
        public DbSet<FamilyMember> FamilyMembers { get; set; }

        // ---- Adult Medical Care ----
        public DbSet<AsthmaManagement> AsthmaManagements { get; set; }
        public DbSet<DiabetesManagement> DiabetesManagements { get; set; }
        public DbSet<HypertensionManagement> HypertensionManagements { get; set; }
        public DbSet<HIVCare> HIVCares { get; set; }
        public DbSet<TuberculosisManagement> TuberculosisManagements { get; set; }
        public DbSet<HepatitisManagement> HepatitisManagements { get; set; }
        public DbSet<MentalHealthCare> MentalHealthCares { get; set; }

        // ---- Child Health ----
        public DbSet<DevelopmentAssessment> DevelopmentAssessments { get; set; }
        public DbSet<GrowthMonitoring> GrowthMonitorings { get; set; }
        public DbSet<Immunization> Immunizations { get; set; }
        public DbSet<IMNCIEncounter> IMNCIEncounters { get; set; }
        public DbSet<NeonatalCare> NeonatalCares { get; set; }
        public DbSet<NutritionAssessment> NutritionAssessments { get; set; }

        // ---- Maternal & Child Health ----
        public DbSet<Pregnancy> Pregnancies { get; set; }
        public DbSet<PregnancyRegistration> PregnancyRegistrations { get; set; }
        public DbSet<ANCVisit> ANCVisits { get; set; }
        public DbSet<PregnancyRiskAssessment> PregnancyRiskAssessments { get; set; }
        public DbSet<PregnancyLaboratoryOrder> PregnancyLaboratoryOrders { get; set; }
        public DbSet<PregnancyUltrasound> PregnancyUltrasounds { get; set; }
        public DbSet<PregnancyMedication> PregnancyMedications { get; set; }
        public DbSet<BirthPreparedness> BirthPreparednessPlans { get; set; }
        public DbSet<LaborRecord> LaborRecords { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<DeliveryComplication> DeliveryComplications { get; set; }
        public DbSet<ChildBirth> ChildBirths { get; set; }
        public DbSet<PNCVisit> PNCVisits { get; set; }
        public DbSet<FamilyPlanning> FamilyPlannings { get; set; }
        public DbSet<HighRiskPregnancy> HighRiskPregnancies { get; set; }

        // ---- Community Health ----
        public DbSet<Household> Households { get; set; }
        public DbSet<HouseholdMember> HouseholdMembers { get; set; }
        public DbSet<HomeVisit> HomeVisits { get; set; }
        public DbSet<CommunityScreening> CommunityScreenings { get; set; }
        public DbSet<DefaulterTracing> DefaulterTracings { get; set; }
        public DbSet<OutreachActivity> OutreachActivities { get; set; }

        // ---- Referral Management ----
        public DbSet<Referral> Referrals { get; set; }
        public DbSet<ReferralService> ReferralServices { get; set; }
        public DbSet<ReferralFeedback> ReferralFeedbacks { get; set; }
        public DbSet<CounterReferral> CounterReferrals { get; set; }
        public DbSet<AmbulanceRequest> AmbulanceRequests { get; set; }

        // ---- Inpatient ----
        public DbSet<Admission> Admissions { get; set; }

        // ---- Pharmacy ----
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<PrescriptionDetail> PrescriptionDetails { get; set; }
        public DbSet<DispenseMedicine> DispenseMedicines { get; set; }
        public DbSet<DispenseMedicineDetail> DispenseMedicineDetails { get; set; }

        public DbSet<BranchPharmacy> BranchPharmacies { get; set; }
        public DbSet<BranchInventory> BranchInventories { get; set; }

        public DbSet<CentralStorePharmacy> CentralStorePharmacies { get; set; }
        public DbSet<CentralStoreInventory> CentralStoreInventories { get; set; }
        public DbSet<CentralStoreManager> CentralStoreManagers { get; set; }
        public DbSet<CentralStoreRequest> CentralStoreRequests { get; set; }
        public DbSet<CentralStoreRequestDetail> CentralStoreRequestDetails { get; set; }
        public DbSet<CentralStoreTransfer> CentralStoreTransfers { get; set; }
        public DbSet<CentralStoreTransferDetail> CentralStoreTransferDetails { get; set; }

        public DbSet<AidStorePharmacy> AidStorePharmacies { get; set; }
        public DbSet<AidStoreInventory> AidStoreInventories { get; set; }
        public DbSet<AidStoreManager> AidStoreManagers { get; set; }
        public DbSet<AidStoreRequest> AidStoreRequests { get; set; }
        public DbSet<AidStoreRequestDetail> AidStoreRequestDetails { get; set; }
        public DbSet<AidStoreTransfer> AidStoreTransfers { get; set; }
        public DbSet<AidStoreTransferDetail> AidStoreTransferDetails { get; set; }

        // ---- Laboratory ----
        public DbSet<LaboratorySection> LaboratorySections { get; set; }
        public DbSet<LaboratoryTestType> LaboratoryTestTypes { get; set; }
        public DbSet<LaboratoryTest> LaboratoryTests { get; set; }
        public DbSet<LaboratoryResult> LaboratoryResults { get; set; }

        // ---- Radiology ----
        public DbSet<RadiologyDepartment> RadiologyDepartments { get; set; }
        public DbSet<RadiologyTestType> RadiologyTestTypes { get; set; }
        public DbSet<RadiologyRequest> RadiologyRequests { get; set; }
        public DbSet<RadiologyResult> RadiologyResults { get; set; }

        // ---- Billing & Payment ----
        public DbSet<Bill> Bills { get; set; }
        public DbSet<BillItem> BillItems { get; set; }
        public DbSet<PaymentHospital> PaymentHospitals { get; set; }
        public DbSet<PharmacyPayment> PharmacyPayments { get; set; }
        public DbSet<LaboratoryPayment> LaboratoryPayments { get; set; }
        public DbSet<RadiologyPayment> RadiologyPayments { get; set; } // Added missing DbSet
    }
}