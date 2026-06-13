using Microsoft.EntityFrameworkCore;
using HospitalSys.Models;
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

            modelBuilder.Entity<Users>()
            .Property(u => u.UserRole)
            .HasConversion<string>();

            modelBuilder.Entity<SuperAdmins>()
            .Property(u=>u.AdminRole)
            .HasConversion<string>();
        }
        public DbSet<Users> Users {get;set;}
        public DbSet<SuperAdmins> SuperAdmin {get;set;}
        
    }
}