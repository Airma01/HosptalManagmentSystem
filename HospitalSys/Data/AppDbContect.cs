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
namespace HospitalSys.Data
{
    public class AppDbContext:DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options):base(options)
        {  
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Users>()
            .HasIndex(u=>u.Username)
            .IsUnique();

            modelBuilder.Entity<Users>()
            .Property(u => u.Gender)
            .HasConversion<string>();

            modelBuilder.Entity<Patient>()
            .Property(u=>u.Gender)
            .HasConversion<string>();

            modelBuilder.Entity<SuperAdmins>()
            .Property(u=>u.AdminRole)
            .HasConversion<string>();

            modelBuilder.Entity<Patient>()
            .HasIndex(p => p.Phone);

            modelBuilder.Entity<PatientVisit>()
            .HasIndex(p => p.VisitDate);

            modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.AppointmentDate);
            
        }
        public DbSet<Users> Users {get;set;}
        public DbSet<Role> Roles {get;set;}
        public DbSet<Doctor> Doctors {get;set;}
        public DbSet<Nurse> Nurses {get;set;}
        public DbSet<Receptionist> Receptionists {get;set;}
        public DbSet<Pharmacist> Pharmacists {get;set;}
        public DbSet<LaboratoryTechnician> LaboratoryTechnicians {get;set;}
        public DbSet<Cashier> Cashiers {get;set;}
        public DbSet<ClinicalDepartment> ClinicalDepartments {get;set;}
        public DbSet<TriageDepartment> TriageDepartments {get;set;}
        public DbSet<Bill> Bills {get;set;}
        public DbSet<BillItem> BillItems {get;set;}
        public DbSet<PaymentHospital> PaymentHospitals {get;set;}
        public DbSet<PharmacyPayment> PharmacyPayments {get;set;}
        public DbSet<Consultation> Consultations {get;set;}
        public DbSet<MedicalRecord> MedicalRecords {get;set;}
        public DbSet<Bed> Beds {get;set;}
        public DbSet<Room> Rooms {get;set;}
        public DbSet<Ward> Wards {get;set;}
        public DbSet<Admission> Admissions {get;set;}
        public DbSet<Appointment> Appointments {get;set;}
        public DbSet<Patient> Patients {get;set;}
        public DbSet<PatientVisit> PatientVists {get;set;}
        public DbSet<Triage> Triages {get;set;}
        public DbSet<AidStorePharmacy> AidStorePharmacies {get;set;}
        public DbSet<AidStoreInventory> AidStoreInventories {get;set;}
        public DbSet<AidStoreRequest> AidStoreRequests {get;set;}
        public DbSet<AidStoreRequestDetail> AidStoreRequestDetails {get;set;}
        public DbSet<AidStoreTransfer> AidStoreTransfers {get;set;}
        public DbSet<AidStoreTransferDetail> AidStoreTransferDetails {get;set;}
        public DbSet<BranchInventory> BranchInventories {get;set;}
        public DbSet<BranchPharmacy> BranchPharmacies {get;set;}
        public DbSet<CentralStoreInventory> CentralStoreInventories {get;set;}
        public DbSet<CentralStorePharmacy> CentralStorePharmacies {get;set;}
        public DbSet<CentralStoreRequest> CentralStoreRequests {get;set;}
        public DbSet<CentralStoreRequestDetail> CentralStoreRequestDetails {get;set;}
        public DbSet<CentralStoreTransfer> CentralStoreTransfers {get;set;}
        public DbSet<CentralStoreTransferDetail> CentralStoreTransferDetails {get;set;}
        public DbSet<DispenseMedicine> DispenseMedicines {get;set;}
        public DbSet<DispenseMedicineDetail> DispenseMedicineDetails {get;set;}
        public DbSet<Medicine> Medicines {get;set;}
        public DbSet<Prescription> Prescriptions {get;set;}
        public DbSet<PrescriptionDetail> PrescriptionDetails {get;set;}
        public DbSet<PharmacyCashier> PharmacyCashiers {get;set;}
        public DbSet<SuperAdmins> SuperAdmin {get;set;}
        public DbSet<LaboratoryTest> LaboratoryTests {get;set;}
        public DbSet<LaboratoryTestType> LaboratoryTestTypes {get;set;}
        public DbSet<LaboratorySection> LaboratorySections {get;set;}
        public DbSet<LaboratoryResult> LaboratoryResults {get;set;}
        public DbSet<LaboratoryPayment> LaboratoryPayments {get;set;}
        public DbSet<LaboratoryCashier> LaboratoryCashiers {get;set;}
        public DbSet<RadiologyDepartment> RadiologyDepartments {get;set;}
        public DbSet<RadiologyRequest> RadiologyRequests {get;set;}
        public DbSet<RadiologyTestType> RadiologyTestTypes {get;set;}
        public DbSet<RadiologyResult> RadiologyResults {get;set;}
        public DbSet<RadiologyCashier> RadiologyCashiers {get;set;}
        public DbSet<RadiologyTechnician> RadiologyTechnicians {get;set;}
        
    }
}