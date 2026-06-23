using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HospitalSys.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BranchPharmacies",
                columns: table => new
                {
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BranchName = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BranchPharmacies", x => x.BranchPharmacyID);
                });

            migrationBuilder.CreateTable(
                name: "ClinicalDepartments",
                columns: table => new
                {
                    ClinicalDepartmentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DepartmentName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicalDepartments", x => x.ClinicalDepartmentID);
                });

            migrationBuilder.CreateTable(
                name: "LaboratorySections",
                columns: table => new
                {
                    LaboratorySectionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SectionName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratorySections", x => x.LaboratorySectionID);
                });

            migrationBuilder.CreateTable(
                name: "Medicines",
                columns: table => new
                {
                    MedicineID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MedicineName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    GenericName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    UnitOfMeasure = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicines", x => x.MedicineID);
                });

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    PatientID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Gender = table.Column<string>(type: "text", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EmergencyContact = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.PatientID);
                });

            migrationBuilder.CreateTable(
                name: "RadiologyDepartments",
                columns: table => new
                {
                    RadiologyDepartmentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DepartmentName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadiologyDepartments", x => x.RadiologyDepartmentID);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "SuperAdmin",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HashPassword = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AdminRole = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuperAdmin", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "TriageDepartments",
                columns: table => new
                {
                    TriageDepartmentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DepartmentName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TriageDepartments", x => x.TriageDepartmentID);
                });

            migrationBuilder.CreateTable(
                name: "Wards",
                columns: table => new
                {
                    WardID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WardName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wards", x => x.WardID);
                });

            migrationBuilder.CreateTable(
                name: "LaboratoryTestTypes",
                columns: table => new
                {
                    LaboratoryTestTypeID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LaboratorySectionID = table.Column<int>(type: "integer", nullable: false),
                    TestName = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    NormalRange = table.Column<double>(type: "double precision", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoryTestTypes", x => x.LaboratoryTestTypeID);
                    table.ForeignKey(
                        name: "FK_LaboratoryTestTypes_LaboratorySections_LaboratorySectionID",
                        column: x => x.LaboratorySectionID,
                        principalTable: "LaboratorySections",
                        principalColumn: "LaboratorySectionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BranchInventories",
                columns: table => new
                {
                    BranchInventoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityAvailable = table.Column<int>(type: "integer", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BatchNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BranchInventories", x => x.BranchInventoryID);
                    table.ForeignKey(
                        name: "FK_BranchInventories_BranchPharmacies_BranchPharmacyID",
                        column: x => x.BranchPharmacyID,
                        principalTable: "BranchPharmacies",
                        principalColumn: "BranchPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BranchInventories_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PatientVists",
                columns: table => new
                {
                    VisitID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    VisitDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VisitType = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientVists", x => x.VisitID);
                    table.ForeignKey(
                        name: "FK_PatientVists_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RadiologyTestTypes",
                columns: table => new
                {
                    RadiologyTestTypeID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RadiologyDepartmentID = table.Column<int>(type: "integer", nullable: false),
                    TestName = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadiologyTestTypes", x => x.RadiologyTestTypeID);
                    table.ForeignKey(
                        name: "FK_RadiologyTestTypes_RadiologyDepartments_RadiologyDepartment~",
                        column: x => x.RadiologyDepartmentID,
                        principalTable: "RadiologyDepartments",
                        principalColumn: "RadiologyDepartmentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FatherName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Gender = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HashPassword = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    RoleID = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Roles",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    RoomID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WardID = table.Column<int>(type: "integer", nullable: false),
                    RoomNumber = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RoomType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rooms", x => x.RoomID);
                    table.ForeignKey(
                        name: "FK_Rooms_Wards_WardID",
                        column: x => x.WardID,
                        principalTable: "Wards",
                        principalColumn: "WardID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AidStorePharmacies",
                columns: table => new
                {
                    AidPharmacyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    ManagerPharmacistID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStorePharmacies", x => x.AidPharmacyID);
                    table.ForeignKey(
                        name: "FK_AidStorePharmacies_Users_ManagerPharmacistID",
                        column: x => x.ManagerPharmacistID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cashiers",
                columns: table => new
                {
                    CashierID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cashiers", x => x.CashierID);
                    table.ForeignKey(
                        name: "FK_Cashiers_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CentralStorePharmacies",
                columns: table => new
                {
                    CentralPharmacyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    ManagerPharmacistID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStorePharmacies", x => x.CentralPharmacyID);
                    table.ForeignKey(
                        name: "FK_CentralStorePharmacies_Users_ManagerPharmacistID",
                        column: x => x.ManagerPharmacistID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Doctors",
                columns: table => new
                {
                    DoctorID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    UsersUserID = table.Column<int>(type: "integer", nullable: true),
                    ClinicalDepartmentID = table.Column<int>(type: "integer", maxLength: 200, nullable: false),
                    LicenseNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Doctors", x => x.DoctorID);
                    table.ForeignKey(
                        name: "FK_Doctors_ClinicalDepartments_ClinicalDepartmentID",
                        column: x => x.ClinicalDepartmentID,
                        principalTable: "ClinicalDepartments",
                        principalColumn: "ClinicalDepartmentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Doctors_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "LaboratoryCashiers",
                columns: table => new
                {
                    LaboratoryCashierID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoryCashiers", x => x.LaboratoryCashierID);
                    table.ForeignKey(
                        name: "FK_LaboratoryCashiers_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LaboratoryTechnicians",
                columns: table => new
                {
                    TechnicianID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoryTechnicians", x => x.TechnicianID);
                    table.ForeignKey(
                        name: "FK_LaboratoryTechnicians_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Nurses",
                columns: table => new
                {
                    NurseID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    ClinicalDepartmentID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nurses", x => x.NurseID);
                    table.ForeignKey(
                        name: "FK_Nurses_ClinicalDepartments_ClinicalDepartmentID",
                        column: x => x.ClinicalDepartmentID,
                        principalTable: "ClinicalDepartments",
                        principalColumn: "ClinicalDepartmentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Nurses_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pharmacists",
                columns: table => new
                {
                    PharmacistID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pharmacists", x => x.PharmacistID);
                    table.ForeignKey(
                        name: "FK_Pharmacists_BranchPharmacies_BranchPharmacyID",
                        column: x => x.BranchPharmacyID,
                        principalTable: "BranchPharmacies",
                        principalColumn: "BranchPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Pharmacists_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PharmacyCashiers",
                columns: table => new
                {
                    PharmacyCashierID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PharmacyCashiers", x => x.PharmacyCashierID);
                    table.ForeignKey(
                        name: "FK_PharmacyCashiers_BranchPharmacies_BranchPharmacyID",
                        column: x => x.BranchPharmacyID,
                        principalTable: "BranchPharmacies",
                        principalColumn: "BranchPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PharmacyCashiers_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RadiologyCashiers",
                columns: table => new
                {
                    RadiologyCashierID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadiologyCashiers", x => x.RadiologyCashierID);
                    table.ForeignKey(
                        name: "FK_RadiologyCashiers_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RadiologyTechnicians",
                columns: table => new
                {
                    RadiologyTechnicianID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadiologyTechnicians", x => x.RadiologyTechnicianID);
                    table.ForeignKey(
                        name: "FK_RadiologyTechnicians_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Receptionists",
                columns: table => new
                {
                    ReceptionistID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Receptionists", x => x.ReceptionistID);
                    table.ForeignKey(
                        name: "FK_Receptionists_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Beds",
                columns: table => new
                {
                    BedID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoomID = table.Column<int>(type: "integer", nullable: false),
                    BedNumber = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Beds", x => x.BedID);
                    table.ForeignKey(
                        name: "FK_Beds_Rooms_RoomID",
                        column: x => x.RoomID,
                        principalTable: "Rooms",
                        principalColumn: "RoomID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AidStoreInventories",
                columns: table => new
                {
                    AidInventoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AidPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityAvailable = table.Column<float>(type: "real", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BatchNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreInventories", x => x.AidInventoryID);
                    table.ForeignKey(
                        name: "FK_AidStoreInventories_AidStorePharmacies_AidPharmacyID",
                        column: x => x.AidPharmacyID,
                        principalTable: "AidStorePharmacies",
                        principalColumn: "AidPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AidStoreInventories_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bills",
                columns: table => new
                {
                    BillID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    VisitID = table.Column<int>(type: "integer", nullable: false),
                    CashierID = table.Column<int>(type: "integer", nullable: false),
                    TotalAmount = table.Column<double>(type: "double precision", nullable: false),
                    BillDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bills", x => x.BillID);
                    table.ForeignKey(
                        name: "FK_Bills_Cashiers_CashierID",
                        column: x => x.CashierID,
                        principalTable: "Cashiers",
                        principalColumn: "CashierID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bills_PatientVists_VisitID",
                        column: x => x.VisitID,
                        principalTable: "PatientVists",
                        principalColumn: "VisitID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bills_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CentralStoreInventories",
                columns: table => new
                {
                    CentralInventoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CentralPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityAvailable = table.Column<float>(type: "real", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BatchNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStoreInventories", x => x.CentralInventoryID);
                    table.ForeignKey(
                        name: "FK_CentralStoreInventories_CentralStorePharmacies_CentralPharm~",
                        column: x => x.CentralPharmacyID,
                        principalTable: "CentralStorePharmacies",
                        principalColumn: "CentralPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CentralStoreInventories_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    AppointmentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    DoctorID = table.Column<int>(type: "integer", nullable: false),
                    AppointmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.AppointmentID);
                    table.ForeignKey(
                        name: "FK_Appointments_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Appointments_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Consultations",
                columns: table => new
                {
                    ConsultationID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VisitID = table.Column<int>(type: "integer", nullable: false),
                    DoctorID = table.Column<int>(type: "integer", nullable: false),
                    ConsultationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ChiefComplaint = table.Column<string>(type: "text", nullable: false),
                    Diagnosis = table.Column<string>(type: "text", nullable: false),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Consultations", x => x.ConsultationID);
                    table.ForeignKey(
                        name: "FK_Consultations_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Consultations_PatientVists_VisitID",
                        column: x => x.VisitID,
                        principalTable: "PatientVists",
                        principalColumn: "VisitID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Triages",
                columns: table => new
                {
                    TriageId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VisitID = table.Column<int>(type: "integer", nullable: false),
                    NurseID = table.Column<int>(type: "integer", nullable: false),
                    TriageDepartmentID = table.Column<int>(type: "integer", nullable: false),
                    ClinicalDepartmentID = table.Column<int>(type: "integer", nullable: false),
                    Temprature = table.Column<double>(type: "double precision", nullable: false),
                    BloodPressure = table.Column<double>(type: "double precision", nullable: false),
                    HeartRate = table.Column<double>(type: "double precision", nullable: false),
                    RespiratotyRate = table.Column<double>(type: "double precision", nullable: false),
                    Weight = table.Column<double>(type: "double precision", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Triages", x => x.TriageId);
                    table.ForeignKey(
                        name: "FK_Triages_ClinicalDepartments_ClinicalDepartmentID",
                        column: x => x.ClinicalDepartmentID,
                        principalTable: "ClinicalDepartments",
                        principalColumn: "ClinicalDepartmentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Triages_Nurses_NurseID",
                        column: x => x.NurseID,
                        principalTable: "Nurses",
                        principalColumn: "NurseID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Triages_PatientVists_VisitID",
                        column: x => x.VisitID,
                        principalTable: "PatientVists",
                        principalColumn: "VisitID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Triages_TriageDepartments_TriageDepartmentID",
                        column: x => x.TriageDepartmentID,
                        principalTable: "TriageDepartments",
                        principalColumn: "TriageDepartmentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AidStoreRequests",
                columns: table => new
                {
                    AidRequestID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    RequestedByPharmacistID = table.Column<int>(type: "integer", nullable: false),
                    RequestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreRequests", x => x.AidRequestID);
                    table.ForeignKey(
                        name: "FK_AidStoreRequests_BranchPharmacies_BranchPharmacyID",
                        column: x => x.BranchPharmacyID,
                        principalTable: "BranchPharmacies",
                        principalColumn: "BranchPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AidStoreRequests_Pharmacists_RequestedByPharmacistID",
                        column: x => x.RequestedByPharmacistID,
                        principalTable: "Pharmacists",
                        principalColumn: "PharmacistID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CentralStoreRequests",
                columns: table => new
                {
                    CentralRequestID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    RequestedByPharmacistID = table.Column<int>(type: "integer", nullable: false),
                    RequestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStoreRequests", x => x.CentralRequestID);
                    table.ForeignKey(
                        name: "FK_CentralStoreRequests_BranchPharmacies_BranchPharmacyID",
                        column: x => x.BranchPharmacyID,
                        principalTable: "BranchPharmacies",
                        principalColumn: "BranchPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CentralStoreRequests_Pharmacists_RequestedByPharmacistID",
                        column: x => x.RequestedByPharmacistID,
                        principalTable: "Pharmacists",
                        principalColumn: "PharmacistID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Admissions",
                columns: table => new
                {
                    AdmissionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    BedID = table.Column<int>(type: "integer", nullable: false),
                    DoctorID = table.Column<int>(type: "integer", nullable: false),
                    AdmissionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DischargeDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admissions", x => x.AdmissionID);
                    table.ForeignKey(
                        name: "FK_Admissions_Beds_BedID",
                        column: x => x.BedID,
                        principalTable: "Beds",
                        principalColumn: "BedID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Admissions_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Admissions_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BillItems",
                columns: table => new
                {
                    BillItemID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BillID = table.Column<int>(type: "integer", nullable: false),
                    ServiceName = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillItems", x => x.BillItemID);
                    table.ForeignKey(
                        name: "FK_BillItems_Bills_BillID",
                        column: x => x.BillID,
                        principalTable: "Bills",
                        principalColumn: "BillID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaymentHospitals",
                columns: table => new
                {
                    PaymentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BillID = table.Column<int>(type: "integer", nullable: false),
                    CashierID = table.Column<int>(type: "integer", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentHospitals", x => x.PaymentID);
                    table.ForeignKey(
                        name: "FK_PaymentHospitals_Bills_BillID",
                        column: x => x.BillID,
                        principalTable: "Bills",
                        principalColumn: "BillID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PaymentHospitals_Cashiers_CashierID",
                        column: x => x.CashierID,
                        principalTable: "Cashiers",
                        principalColumn: "CashierID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LaboratoryTests",
                columns: table => new
                {
                    TestID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultationID = table.Column<int>(type: "integer", nullable: false),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    DoctorID = table.Column<int>(type: "integer", nullable: false),
                    LaboratoryTestTypeID = table.Column<int>(type: "integer", nullable: false),
                    RequestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoryTests", x => x.TestID);
                    table.ForeignKey(
                        name: "FK_LaboratoryTests_Consultations_ConsultationID",
                        column: x => x.ConsultationID,
                        principalTable: "Consultations",
                        principalColumn: "ConsultationID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LaboratoryTests_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LaboratoryTests_LaboratoryTestTypes_LaboratoryTestTypeID",
                        column: x => x.LaboratoryTestTypeID,
                        principalTable: "LaboratoryTestTypes",
                        principalColumn: "LaboratoryTestTypeID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LaboratoryTests_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalRecords",
                columns: table => new
                {
                    MedicalRecordID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultationID = table.Column<int>(type: "integer", nullable: false),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    DoctorID = table.Column<int>(type: "integer", nullable: false),
                    RecordTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalRecords", x => x.MedicalRecordID);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Consultations_ConsultationID",
                        column: x => x.ConsultationID,
                        principalTable: "Consultations",
                        principalColumn: "ConsultationID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Prescriptions",
                columns: table => new
                {
                    PrescriptionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultationID = table.Column<int>(type: "integer", nullable: false),
                    DoctorID = table.Column<int>(type: "integer", nullable: false),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    PrescriptionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prescriptions", x => x.PrescriptionID);
                    table.ForeignKey(
                        name: "FK_Prescriptions_BranchPharmacies_BranchPharmacyID",
                        column: x => x.BranchPharmacyID,
                        principalTable: "BranchPharmacies",
                        principalColumn: "BranchPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Consultations_ConsultationID",
                        column: x => x.ConsultationID,
                        principalTable: "Consultations",
                        principalColumn: "ConsultationID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RadiologyRequests",
                columns: table => new
                {
                    RadiologyRequestID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultationID = table.Column<int>(type: "integer", nullable: false),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    DoctorID = table.Column<int>(type: "integer", nullable: false),
                    RadiologyTestTypeID = table.Column<int>(type: "integer", nullable: false),
                    RequestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadiologyRequests", x => x.RadiologyRequestID);
                    table.ForeignKey(
                        name: "FK_RadiologyRequests_Consultations_ConsultationID",
                        column: x => x.ConsultationID,
                        principalTable: "Consultations",
                        principalColumn: "ConsultationID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadiologyRequests_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadiologyRequests_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadiologyRequests_RadiologyTestTypes_RadiologyTestTypeID",
                        column: x => x.RadiologyTestTypeID,
                        principalTable: "RadiologyTestTypes",
                        principalColumn: "RadiologyTestTypeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AidStoreRequestDetails",
                columns: table => new
                {
                    AidRequestDetailID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AidRequestID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    RequestedQuantity = table.Column<int>(type: "integer", nullable: false),
                    ApprovedQuantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreRequestDetails", x => x.AidRequestDetailID);
                    table.ForeignKey(
                        name: "FK_AidStoreRequestDetails_AidStoreRequests_AidRequestID",
                        column: x => x.AidRequestID,
                        principalTable: "AidStoreRequests",
                        principalColumn: "AidRequestID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AidStoreRequestDetails_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AidStoreTransfers",
                columns: table => new
                {
                    AidTransferID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AidRequestID = table.Column<int>(type: "integer", nullable: false),
                    AidPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    TransferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreTransfers", x => x.AidTransferID);
                    table.ForeignKey(
                        name: "FK_AidStoreTransfers_AidStorePharmacies_AidPharmacyID",
                        column: x => x.AidPharmacyID,
                        principalTable: "AidStorePharmacies",
                        principalColumn: "AidPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AidStoreTransfers_AidStoreRequests_AidRequestID",
                        column: x => x.AidRequestID,
                        principalTable: "AidStoreRequests",
                        principalColumn: "AidRequestID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AidStoreTransfers_BranchPharmacies_BranchPharmacyID",
                        column: x => x.BranchPharmacyID,
                        principalTable: "BranchPharmacies",
                        principalColumn: "BranchPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CentralStoreRequestDetails",
                columns: table => new
                {
                    CentralRequestDetailID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CentralRequestID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    RequestedQuantity = table.Column<int>(type: "integer", nullable: false),
                    ApprovedQuantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStoreRequestDetails", x => x.CentralRequestDetailID);
                    table.ForeignKey(
                        name: "FK_CentralStoreRequestDetails_CentralStoreRequests_CentralRequ~",
                        column: x => x.CentralRequestID,
                        principalTable: "CentralStoreRequests",
                        principalColumn: "CentralRequestID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CentralStoreRequestDetails_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CentralStoreTransfers",
                columns: table => new
                {
                    CentralTransferID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CentralRequestID = table.Column<int>(type: "integer", nullable: false),
                    CentralPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    TransferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStoreTransfers", x => x.CentralTransferID);
                    table.ForeignKey(
                        name: "FK_CentralStoreTransfers_BranchPharmacies_BranchPharmacyID",
                        column: x => x.BranchPharmacyID,
                        principalTable: "BranchPharmacies",
                        principalColumn: "BranchPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CentralStoreTransfers_CentralStorePharmacies_CentralPharmac~",
                        column: x => x.CentralPharmacyID,
                        principalTable: "CentralStorePharmacies",
                        principalColumn: "CentralPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CentralStoreTransfers_CentralStoreRequests_CentralRequestID",
                        column: x => x.CentralRequestID,
                        principalTable: "CentralStoreRequests",
                        principalColumn: "CentralRequestID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CentralStoreTransfers_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID");
                });

            migrationBuilder.CreateTable(
                name: "LaboratoryPayments",
                columns: table => new
                {
                    LaboratoryPaymentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TestID = table.Column<int>(type: "integer", nullable: false),
                    LaboratoryCashierID = table.Column<int>(type: "integer", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoryPayments", x => x.LaboratoryPaymentID);
                    table.ForeignKey(
                        name: "FK_LaboratoryPayments_LaboratoryCashiers_LaboratoryCashierID",
                        column: x => x.LaboratoryCashierID,
                        principalTable: "LaboratoryCashiers",
                        principalColumn: "LaboratoryCashierID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LaboratoryPayments_LaboratoryTests_TestID",
                        column: x => x.TestID,
                        principalTable: "LaboratoryTests",
                        principalColumn: "TestID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LaboratoryResults",
                columns: table => new
                {
                    ResultID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TestID = table.Column<int>(type: "integer", nullable: false),
                    TechnicianID = table.Column<int>(type: "integer", nullable: false),
                    ResultDescription = table.Column<string>(type: "text", nullable: false),
                    ResultDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoryResults", x => x.ResultID);
                    table.ForeignKey(
                        name: "FK_LaboratoryResults_LaboratoryTechnicians_TechnicianID",
                        column: x => x.TechnicianID,
                        principalTable: "LaboratoryTechnicians",
                        principalColumn: "TechnicianID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LaboratoryResults_LaboratoryTests_TestID",
                        column: x => x.TestID,
                        principalTable: "LaboratoryTests",
                        principalColumn: "TestID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DispenseMedicines",
                columns: table => new
                {
                    DispenseID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PrescriptionID = table.Column<int>(type: "integer", nullable: false),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    PharmacistID = table.Column<int>(type: "integer", nullable: false),
                    DispenceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DispenseMedicines", x => x.DispenseID);
                    table.ForeignKey(
                        name: "FK_DispenseMedicines_BranchPharmacies_BranchPharmacyID",
                        column: x => x.BranchPharmacyID,
                        principalTable: "BranchPharmacies",
                        principalColumn: "BranchPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DispenseMedicines_Pharmacists_PharmacistID",
                        column: x => x.PharmacistID,
                        principalTable: "Pharmacists",
                        principalColumn: "PharmacistID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DispenseMedicines_Prescriptions_PrescriptionID",
                        column: x => x.PrescriptionID,
                        principalTable: "Prescriptions",
                        principalColumn: "PrescriptionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PharmacyPayments",
                columns: table => new
                {
                    PharmacyPaymentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PrescriptionID = table.Column<int>(type: "integer", nullable: false),
                    PharmacyCashierID = table.Column<int>(type: "integer", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PharmacyPayments", x => x.PharmacyPaymentID);
                    table.ForeignKey(
                        name: "FK_PharmacyPayments_PharmacyCashiers_PharmacyCashierID",
                        column: x => x.PharmacyCashierID,
                        principalTable: "PharmacyCashiers",
                        principalColumn: "PharmacyCashierID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PharmacyPayments_Prescriptions_PrescriptionID",
                        column: x => x.PrescriptionID,
                        principalTable: "Prescriptions",
                        principalColumn: "PrescriptionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrescriptionDetails",
                columns: table => new
                {
                    PrescriptionDetailID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PrescriptionID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    Dosage = table.Column<string>(type: "text", nullable: false),
                    Frequency = table.Column<decimal>(type: "numeric", nullable: false),
                    Duration = table.Column<decimal>(type: "numeric", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrescriptionDetails", x => x.PrescriptionDetailID);
                    table.ForeignKey(
                        name: "FK_PrescriptionDetails_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PrescriptionDetails_Prescriptions_PrescriptionID",
                        column: x => x.PrescriptionID,
                        principalTable: "Prescriptions",
                        principalColumn: "PrescriptionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RadiologyPayment",
                columns: table => new
                {
                    RadiologyPaymentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RadiologyRequestID = table.Column<int>(type: "integer", nullable: false),
                    RadiologyCashierID = table.Column<int>(type: "integer", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadiologyPayment", x => x.RadiologyPaymentID);
                    table.ForeignKey(
                        name: "FK_RadiologyPayment_RadiologyCashiers_RadiologyCashierID",
                        column: x => x.RadiologyCashierID,
                        principalTable: "RadiologyCashiers",
                        principalColumn: "RadiologyCashierID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadiologyPayment_RadiologyRequests_RadiologyRequestID",
                        column: x => x.RadiologyRequestID,
                        principalTable: "RadiologyRequests",
                        principalColumn: "RadiologyRequestID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RadiologyResults",
                columns: table => new
                {
                    RadiologyResultID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RadiologyRequestID = table.Column<int>(type: "integer", nullable: false),
                    RadiologyTechnicianID = table.Column<int>(type: "integer", nullable: false),
                    ResultDescription = table.Column<string>(type: "text", nullable: false),
                    ResultDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadiologyResults", x => x.RadiologyResultID);
                    table.ForeignKey(
                        name: "FK_RadiologyResults_RadiologyRequests_RadiologyRequestID",
                        column: x => x.RadiologyRequestID,
                        principalTable: "RadiologyRequests",
                        principalColumn: "RadiologyRequestID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadiologyResults_RadiologyTechnicians_RadiologyTechnicianID",
                        column: x => x.RadiologyTechnicianID,
                        principalTable: "RadiologyTechnicians",
                        principalColumn: "RadiologyTechnicianID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AidStoreTransferDetails",
                columns: table => new
                {
                    AidTransferDetailID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AidTransferID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityTransferred = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreTransferDetails", x => x.AidTransferDetailID);
                    table.ForeignKey(
                        name: "FK_AidStoreTransferDetails_AidStoreTransfers_AidTransferID",
                        column: x => x.AidTransferID,
                        principalTable: "AidStoreTransfers",
                        principalColumn: "AidTransferID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AidStoreTransferDetails_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CentralStoreTransferDetails",
                columns: table => new
                {
                    CentralTransferDetailID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CentralTransferID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityTransferred = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStoreTransferDetails", x => x.CentralTransferDetailID);
                    table.ForeignKey(
                        name: "FK_CentralStoreTransferDetails_CentralStoreTransfers_CentralTr~",
                        column: x => x.CentralTransferID,
                        principalTable: "CentralStoreTransfers",
                        principalColumn: "CentralTransferID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CentralStoreTransferDetails_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DispenseMedicineDetails",
                columns: table => new
                {
                    DispenseDetailID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DispenseID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityDispenced = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DispenseMedicineDetails", x => x.DispenseDetailID);
                    table.ForeignKey(
                        name: "FK_DispenseMedicineDetails_DispenseMedicines_DispenseID",
                        column: x => x.DispenseID,
                        principalTable: "DispenseMedicines",
                        principalColumn: "DispenseID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DispenseMedicineDetails_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Admissions_BedID",
                table: "Admissions",
                column: "BedID");

            migrationBuilder.CreateIndex(
                name: "IX_Admissions_DoctorID",
                table: "Admissions",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_Admissions_PatientID",
                table: "Admissions",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreInventories_AidPharmacyID",
                table: "AidStoreInventories",
                column: "AidPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreInventories_MedicineID",
                table: "AidStoreInventories",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStorePharmacies_ManagerPharmacistID",
                table: "AidStorePharmacies",
                column: "ManagerPharmacistID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreRequestDetails_AidRequestID",
                table: "AidStoreRequestDetails",
                column: "AidRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreRequestDetails_MedicineID",
                table: "AidStoreRequestDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreRequests_BranchPharmacyID",
                table: "AidStoreRequests",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreRequests_RequestedByPharmacistID",
                table: "AidStoreRequests",
                column: "RequestedByPharmacistID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransferDetails_AidTransferID",
                table: "AidStoreTransferDetails",
                column: "AidTransferID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransferDetails_MedicineID",
                table: "AidStoreTransferDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransfers_AidPharmacyID",
                table: "AidStoreTransfers",
                column: "AidPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransfers_AidRequestID",
                table: "AidStoreTransfers",
                column: "AidRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransfers_BranchPharmacyID",
                table: "AidStoreTransfers",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_AppointmentDate",
                table: "Appointments",
                column: "AppointmentDate");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_DoctorID",
                table: "Appointments",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_PatientID",
                table: "Appointments",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_Beds_RoomID",
                table: "Beds",
                column: "RoomID");

            migrationBuilder.CreateIndex(
                name: "IX_BillItems_BillID",
                table: "BillItems",
                column: "BillID");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_CashierID",
                table: "Bills",
                column: "CashierID");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_PatientID",
                table: "Bills",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_VisitID",
                table: "Bills",
                column: "VisitID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchInventories_BranchPharmacyID",
                table: "BranchInventories",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchInventories_MedicineID",
                table: "BranchInventories",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_Cashiers_UserID",
                table: "Cashiers",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreInventories_CentralPharmacyID",
                table: "CentralStoreInventories",
                column: "CentralPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreInventories_MedicineID",
                table: "CentralStoreInventories",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStorePharmacies_ManagerPharmacistID",
                table: "CentralStorePharmacies",
                column: "ManagerPharmacistID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreRequestDetails_CentralRequestID",
                table: "CentralStoreRequestDetails",
                column: "CentralRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreRequestDetails_MedicineID",
                table: "CentralStoreRequestDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreRequests_BranchPharmacyID",
                table: "CentralStoreRequests",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreRequests_RequestedByPharmacistID",
                table: "CentralStoreRequests",
                column: "RequestedByPharmacistID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransferDetails_CentralTransferID",
                table: "CentralStoreTransferDetails",
                column: "CentralTransferID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransferDetails_MedicineID",
                table: "CentralStoreTransferDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransfers_BranchPharmacyID",
                table: "CentralStoreTransfers",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransfers_CentralPharmacyID",
                table: "CentralStoreTransfers",
                column: "CentralPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransfers_CentralRequestID",
                table: "CentralStoreTransfers",
                column: "CentralRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransfers_MedicineID",
                table: "CentralStoreTransfers",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_DoctorID",
                table: "Consultations",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_VisitID",
                table: "Consultations",
                column: "VisitID");

            migrationBuilder.CreateIndex(
                name: "IX_DispenseMedicineDetails_DispenseID",
                table: "DispenseMedicineDetails",
                column: "DispenseID");

            migrationBuilder.CreateIndex(
                name: "IX_DispenseMedicineDetails_MedicineID",
                table: "DispenseMedicineDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_DispenseMedicines_BranchPharmacyID",
                table: "DispenseMedicines",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_DispenseMedicines_PharmacistID",
                table: "DispenseMedicines",
                column: "PharmacistID");

            migrationBuilder.CreateIndex(
                name: "IX_DispenseMedicines_PrescriptionID",
                table: "DispenseMedicines",
                column: "PrescriptionID");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_ClinicalDepartmentID",
                table: "Doctors",
                column: "ClinicalDepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_UsersUserID",
                table: "Doctors",
                column: "UsersUserID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryCashiers_UserID",
                table: "LaboratoryCashiers",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryPayments_LaboratoryCashierID",
                table: "LaboratoryPayments",
                column: "LaboratoryCashierID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryPayments_TestID",
                table: "LaboratoryPayments",
                column: "TestID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryResults_TechnicianID",
                table: "LaboratoryResults",
                column: "TechnicianID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryResults_TestID",
                table: "LaboratoryResults",
                column: "TestID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryTechnicians_UserID",
                table: "LaboratoryTechnicians",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryTests_ConsultationID",
                table: "LaboratoryTests",
                column: "ConsultationID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryTests_DoctorID",
                table: "LaboratoryTests",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryTests_LaboratoryTestTypeID",
                table: "LaboratoryTests",
                column: "LaboratoryTestTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryTests_PatientID",
                table: "LaboratoryTests",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryTestTypes_LaboratorySectionID",
                table: "LaboratoryTestTypes",
                column: "LaboratorySectionID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_ConsultationID",
                table: "MedicalRecords",
                column: "ConsultationID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_DoctorID",
                table: "MedicalRecords",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_PatientID",
                table: "MedicalRecords",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_Nurses_ClinicalDepartmentID",
                table: "Nurses",
                column: "ClinicalDepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Nurses_UserID",
                table: "Nurses",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_Phone",
                table: "Patients",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_PatientVists_PatientID",
                table: "PatientVists",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientVists_VisitDate",
                table: "PatientVists",
                column: "VisitDate");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentHospitals_BillID",
                table: "PaymentHospitals",
                column: "BillID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentHospitals_CashierID",
                table: "PaymentHospitals",
                column: "CashierID");

            migrationBuilder.CreateIndex(
                name: "IX_Pharmacists_BranchPharmacyID",
                table: "Pharmacists",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_Pharmacists_UserID",
                table: "Pharmacists",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_PharmacyCashiers_BranchPharmacyID",
                table: "PharmacyCashiers",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_PharmacyCashiers_UserID",
                table: "PharmacyCashiers",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_PharmacyPayments_PharmacyCashierID",
                table: "PharmacyPayments",
                column: "PharmacyCashierID");

            migrationBuilder.CreateIndex(
                name: "IX_PharmacyPayments_PrescriptionID",
                table: "PharmacyPayments",
                column: "PrescriptionID");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionDetails_MedicineID",
                table: "PrescriptionDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionDetails_PrescriptionID",
                table: "PrescriptionDetails",
                column: "PrescriptionID");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_BranchPharmacyID",
                table: "Prescriptions",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_ConsultationID",
                table: "Prescriptions",
                column: "ConsultationID");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_DoctorID",
                table: "Prescriptions",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_PatientID",
                table: "Prescriptions",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyCashiers_UserID",
                table: "RadiologyCashiers",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyPayment_RadiologyCashierID",
                table: "RadiologyPayment",
                column: "RadiologyCashierID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyPayment_RadiologyRequestID",
                table: "RadiologyPayment",
                column: "RadiologyRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyRequests_ConsultationID",
                table: "RadiologyRequests",
                column: "ConsultationID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyRequests_DoctorID",
                table: "RadiologyRequests",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyRequests_PatientID",
                table: "RadiologyRequests",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyRequests_RadiologyTestTypeID",
                table: "RadiologyRequests",
                column: "RadiologyTestTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyResults_RadiologyRequestID",
                table: "RadiologyResults",
                column: "RadiologyRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyResults_RadiologyTechnicianID",
                table: "RadiologyResults",
                column: "RadiologyTechnicianID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyTechnicians_UserID",
                table: "RadiologyTechnicians",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyTestTypes_RadiologyDepartmentID",
                table: "RadiologyTestTypes",
                column: "RadiologyDepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Receptionists_UserID",
                table: "Receptionists",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_WardID",
                table: "Rooms",
                column: "WardID");

            migrationBuilder.CreateIndex(
                name: "IX_Triages_ClinicalDepartmentID",
                table: "Triages",
                column: "ClinicalDepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Triages_NurseID",
                table: "Triages",
                column: "NurseID");

            migrationBuilder.CreateIndex(
                name: "IX_Triages_TriageDepartmentID",
                table: "Triages",
                column: "TriageDepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Triages_VisitID",
                table: "Triages",
                column: "VisitID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleID",
                table: "Users",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Admissions");

            migrationBuilder.DropTable(
                name: "AidStoreInventories");

            migrationBuilder.DropTable(
                name: "AidStoreRequestDetails");

            migrationBuilder.DropTable(
                name: "AidStoreTransferDetails");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "BillItems");

            migrationBuilder.DropTable(
                name: "BranchInventories");

            migrationBuilder.DropTable(
                name: "CentralStoreInventories");

            migrationBuilder.DropTable(
                name: "CentralStoreRequestDetails");

            migrationBuilder.DropTable(
                name: "CentralStoreTransferDetails");

            migrationBuilder.DropTable(
                name: "DispenseMedicineDetails");

            migrationBuilder.DropTable(
                name: "LaboratoryPayments");

            migrationBuilder.DropTable(
                name: "LaboratoryResults");

            migrationBuilder.DropTable(
                name: "MedicalRecords");

            migrationBuilder.DropTable(
                name: "PaymentHospitals");

            migrationBuilder.DropTable(
                name: "PharmacyPayments");

            migrationBuilder.DropTable(
                name: "PrescriptionDetails");

            migrationBuilder.DropTable(
                name: "RadiologyPayment");

            migrationBuilder.DropTable(
                name: "RadiologyResults");

            migrationBuilder.DropTable(
                name: "Receptionists");

            migrationBuilder.DropTable(
                name: "SuperAdmin");

            migrationBuilder.DropTable(
                name: "Triages");

            migrationBuilder.DropTable(
                name: "Beds");

            migrationBuilder.DropTable(
                name: "AidStoreTransfers");

            migrationBuilder.DropTable(
                name: "CentralStoreTransfers");

            migrationBuilder.DropTable(
                name: "DispenseMedicines");

            migrationBuilder.DropTable(
                name: "LaboratoryCashiers");

            migrationBuilder.DropTable(
                name: "LaboratoryTechnicians");

            migrationBuilder.DropTable(
                name: "LaboratoryTests");

            migrationBuilder.DropTable(
                name: "Bills");

            migrationBuilder.DropTable(
                name: "PharmacyCashiers");

            migrationBuilder.DropTable(
                name: "RadiologyCashiers");

            migrationBuilder.DropTable(
                name: "RadiologyRequests");

            migrationBuilder.DropTable(
                name: "RadiologyTechnicians");

            migrationBuilder.DropTable(
                name: "Nurses");

            migrationBuilder.DropTable(
                name: "TriageDepartments");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropTable(
                name: "AidStorePharmacies");

            migrationBuilder.DropTable(
                name: "AidStoreRequests");

            migrationBuilder.DropTable(
                name: "CentralStorePharmacies");

            migrationBuilder.DropTable(
                name: "CentralStoreRequests");

            migrationBuilder.DropTable(
                name: "Medicines");

            migrationBuilder.DropTable(
                name: "Prescriptions");

            migrationBuilder.DropTable(
                name: "LaboratoryTestTypes");

            migrationBuilder.DropTable(
                name: "Cashiers");

            migrationBuilder.DropTable(
                name: "RadiologyTestTypes");

            migrationBuilder.DropTable(
                name: "Wards");

            migrationBuilder.DropTable(
                name: "Pharmacists");

            migrationBuilder.DropTable(
                name: "Consultations");

            migrationBuilder.DropTable(
                name: "LaboratorySections");

            migrationBuilder.DropTable(
                name: "RadiologyDepartments");

            migrationBuilder.DropTable(
                name: "BranchPharmacies");

            migrationBuilder.DropTable(
                name: "Doctors");

            migrationBuilder.DropTable(
                name: "PatientVists");

            migrationBuilder.DropTable(
                name: "ClinicalDepartments");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
