using Microsoft.EntityFrameworkCore;
using HospitalSys.Models;
using HospitalSys.Models.HospitalStruct;
using HospitalSys.Models.PatientManagment;
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
        public DbSet<SuperAdmins> SuperAdmin {get;set;}
        
    }
}