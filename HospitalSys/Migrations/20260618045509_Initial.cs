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
            migrationBuilder.DropColumn(
                name: "UserRole",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "Users",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Users",
                newName: "UserID");

            migrationBuilder.AlterColumn<string>(
                name: "HashPassword",
                table: "Users",
                type: "character varying(250)",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<DateTime>(
                name: "Created_at",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "RoleID",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AidStorePharmacies",
                columns: table => new
                {
                    AidPharmacyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    ManagerPharmacistID = table.Column<int>(type: "integer", nullable: false),
                    UsersUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStorePharmacies", x => x.AidPharmacyID);
                    table.ForeignKey(
                        name: "FK_AidStorePharmacies_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

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
                name: "Cashiers",
                columns: table => new
                {
                    CashierID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    UsersUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cashiers", x => x.CashierID);
                    table.ForeignKey(
                        name: "FK_Cashiers_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "CentralStorePharmacies",
                columns: table => new
                {
                    CentralPharmacyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    ManagerPharmacistID = table.Column<int>(type: "integer", nullable: false),
                    UsersUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStorePharmacies", x => x.CentralPharmacyID);
                    table.ForeignKey(
                        name: "FK_CentralStorePharmacies_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "ClinicalDepartment",
                columns: table => new
                {
                    ClinicalDepartmentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DepartmentName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicalDepartment", x => x.ClinicalDepartmentID);
                });

            migrationBuilder.CreateTable(
                name: "LaboratoryTechnicians",
                columns: table => new
                {
                    TechnicianID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    UsersUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoryTechnicians", x => x.TechnicianID);
                    table.ForeignKey(
                        name: "FK_LaboratoryTechnicians_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Medicines",
                columns: table => new
                {
                    MedicineID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MedicineName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    GenericName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UnitPrice = table.Column<double>(type: "double precision", nullable: false),
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
                name: "Receptionists",
                columns: table => new
                {
                    ReceptionistID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    UsersUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Receptionists", x => x.ReceptionistID);
                    table.ForeignKey(
                        name: "FK_Receptionists_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
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
                name: "TriageDepartment",
                columns: table => new
                {
                    TriageDepartmentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DepartmentName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TriageDepartment", x => x.TriageDepartmentID);
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
                name: "Pharmacists",
                columns: table => new
                {
                    PharmacistID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    UsersUserID = table.Column<int>(type: "integer", nullable: true),
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
                        name: "FK_Pharmacists_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "PharmacyCashiers",
                columns: table => new
                {
                    PharmacyCashierID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    UsersUserID = table.Column<int>(type: "integer", nullable: true),
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
                        name: "FK_PharmacyCashiers_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
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
                        name: "FK_Doctors_ClinicalDepartment_ClinicalDepartmentID",
                        column: x => x.ClinicalDepartmentID,
                        principalTable: "ClinicalDepartment",
                        principalColumn: "ClinicalDepartmentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Doctors_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Nurses",
                columns: table => new
                {
                    NurseID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    UsersUserID = table.Column<int>(type: "integer", nullable: true),
                    ClinicalDepartmentID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nurses", x => x.NurseID);
                    table.ForeignKey(
                        name: "FK_Nurses_ClinicalDepartment_ClinicalDepartmentID",
                        column: x => x.ClinicalDepartmentID,
                        principalTable: "ClinicalDepartment",
                        principalColumn: "ClinicalDepartmentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Nurses_Users_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "AidStoreInventories",
                columns: table => new
                {
                    AidInventoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AidPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    AidStorePharmacyAidPharmacyID = table.Column<int>(type: "integer", nullable: true),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityAvailable = table.Column<float>(type: "real", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BatchNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreInventories", x => x.AidInventoryID);
                    table.ForeignKey(
                        name: "FK_AidStoreInventories_AidStorePharmacies_AidStorePharmacyAidP~",
                        column: x => x.AidStorePharmacyAidPharmacyID,
                        principalTable: "AidStorePharmacies",
                        principalColumn: "AidPharmacyID");
                    table.ForeignKey(
                        name: "FK_AidStoreInventories_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
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
                name: "CentralStoreInventories",
                columns: table => new
                {
                    CentralInventoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CentralPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    CentralStorePharmacyCentralPharmacyID = table.Column<int>(type: "integer", nullable: true),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityAvailable = table.Column<float>(type: "real", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BatchNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStoreInventories", x => x.CentralInventoryID);
                    table.ForeignKey(
                        name: "FK_CentralStoreInventories_CentralStorePharmacies_CentralStore~",
                        column: x => x.CentralStorePharmacyCentralPharmacyID,
                        principalTable: "CentralStorePharmacies",
                        principalColumn: "CentralPharmacyID");
                    table.ForeignKey(
                        name: "FK_CentralStoreInventories_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PatientVists",
                columns: table => new
                {
                    VistID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    VisitDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VistType = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientVists", x => x.VistID);
                    table.ForeignKey(
                        name: "FK_PatientVists_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
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
                name: "AidStoreRequests",
                columns: table => new
                {
                    AidRequestID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    RequestedByPharmacistID = table.Column<int>(type: "integer", nullable: false),
                    PharmacistID = table.Column<int>(type: "integer", nullable: true),
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
                        name: "FK_AidStoreRequests_Pharmacists_PharmacistID",
                        column: x => x.PharmacistID,
                        principalTable: "Pharmacists",
                        principalColumn: "PharmacistID");
                });

            migrationBuilder.CreateTable(
                name: "CentralStoreRequests",
                columns: table => new
                {
                    CentralRequestID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    RequestedByPharmacistID = table.Column<int>(type: "integer", nullable: false),
                    PharmacistID = table.Column<int>(type: "integer", nullable: true),
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
                        name: "FK_CentralStoreRequests_Pharmacists_PharmacistID",
                        column: x => x.PharmacistID,
                        principalTable: "Pharmacists",
                        principalColumn: "PharmacistID");
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
                name: "Bills",
                columns: table => new
                {
                    BillID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    VisitID = table.Column<int>(type: "integer", nullable: false),
                    PatientVistVistID = table.Column<int>(type: "integer", nullable: true),
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
                        name: "FK_Bills_PatientVists_PatientVistVistID",
                        column: x => x.PatientVistVistID,
                        principalTable: "PatientVists",
                        principalColumn: "VistID");
                    table.ForeignKey(
                        name: "FK_Bills_Patients_PatientID",
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
                    PatientVistVistID = table.Column<int>(type: "integer", nullable: true),
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
                        name: "FK_Consultations_PatientVists_PatientVistVistID",
                        column: x => x.PatientVistVistID,
                        principalTable: "PatientVists",
                        principalColumn: "VistID");
                });

            migrationBuilder.CreateTable(
                name: "Triages",
                columns: table => new
                {
                    TriageId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VistID = table.Column<int>(type: "integer", nullable: false),
                    PatientVistVistID = table.Column<int>(type: "integer", nullable: true),
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
                        name: "FK_Triages_ClinicalDepartment_ClinicalDepartmentID",
                        column: x => x.ClinicalDepartmentID,
                        principalTable: "ClinicalDepartment",
                        principalColumn: "ClinicalDepartmentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Triages_Nurses_NurseID",
                        column: x => x.NurseID,
                        principalTable: "Nurses",
                        principalColumn: "NurseID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Triages_PatientVists_PatientVistVistID",
                        column: x => x.PatientVistVistID,
                        principalTable: "PatientVists",
                        principalColumn: "VistID");
                    table.ForeignKey(
                        name: "FK_Triages_TriageDepartment_TriageDepartmentID",
                        column: x => x.TriageDepartmentID,
                        principalTable: "TriageDepartment",
                        principalColumn: "TriageDepartmentID",
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
                name: "AidStoreRequestDetails",
                columns: table => new
                {
                    AidRequestDetailID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AidRequestID = table.Column<int>(type: "integer", nullable: false),
                    AidStoreRequestAidRequestID = table.Column<int>(type: "integer", nullable: true),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    RequestedQuantity = table.Column<int>(type: "integer", nullable: false),
                    ApprovedQuantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreRequestDetails", x => x.AidRequestDetailID);
                    table.ForeignKey(
                        name: "FK_AidStoreRequestDetails_AidStoreRequests_AidStoreRequestAidR~",
                        column: x => x.AidStoreRequestAidRequestID,
                        principalTable: "AidStoreRequests",
                        principalColumn: "AidRequestID");
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
                    AidStoreRequestAidRequestID = table.Column<int>(type: "integer", nullable: true),
                    AidPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    AidStorePharmacyAidPharmacyID = table.Column<int>(type: "integer", nullable: true),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    TransferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreTransfers", x => x.AidTransferID);
                    table.ForeignKey(
                        name: "FK_AidStoreTransfers_AidStorePharmacies_AidStorePharmacyAidPha~",
                        column: x => x.AidStorePharmacyAidPharmacyID,
                        principalTable: "AidStorePharmacies",
                        principalColumn: "AidPharmacyID");
                    table.ForeignKey(
                        name: "FK_AidStoreTransfers_AidStoreRequests_AidStoreRequestAidReques~",
                        column: x => x.AidStoreRequestAidRequestID,
                        principalTable: "AidStoreRequests",
                        principalColumn: "AidRequestID");
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
                    CentralStoreRequestCentralRequestID = table.Column<int>(type: "integer", nullable: true),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    RequestedQuantity = table.Column<int>(type: "integer", nullable: false),
                    ApprovedQuantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStoreRequestDetails", x => x.CentralRequestDetailID);
                    table.ForeignKey(
                        name: "FK_CentralStoreRequestDetails_CentralStoreRequests_CentralStor~",
                        column: x => x.CentralStoreRequestCentralRequestID,
                        principalTable: "CentralStoreRequests",
                        principalColumn: "CentralRequestID");
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
                    CentralStoreRequestCentralRequestID = table.Column<int>(type: "integer", nullable: true),
                    CentralPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    CentralStorePharmacyCentralPharmacyID = table.Column<int>(type: "integer", nullable: true),
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
                        name: "FK_CentralStoreTransfers_CentralStorePharmacies_CentralStorePh~",
                        column: x => x.CentralStorePharmacyCentralPharmacyID,
                        principalTable: "CentralStorePharmacies",
                        principalColumn: "CentralPharmacyID");
                    table.ForeignKey(
                        name: "FK_CentralStoreTransfers_CentralStoreRequests_CentralStoreRequ~",
                        column: x => x.CentralStoreRequestCentralRequestID,
                        principalTable: "CentralStoreRequests",
                        principalColumn: "CentralRequestID");
                    table.ForeignKey(
                        name: "FK_CentralStoreTransfers_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID");
                });

            migrationBuilder.CreateTable(
                name: "BillItems",
                columns: table => new
                {
                    BillItemID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BillID = table.Column<int>(type: "integer", nullable: false),
                    ServiceName = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<double>(type: "double precision", nullable: false),
                    TotalPrice = table.Column<double>(type: "double precision", nullable: false)
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
                    AmountPaid = table.Column<double>(type: "double precision", nullable: false),
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
                name: "AidStoreTransferDetails",
                columns: table => new
                {
                    AidTransferDetailID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AidTransferID = table.Column<int>(type: "integer", nullable: false),
                    AidStoreTransferAidTransferID = table.Column<int>(type: "integer", nullable: true),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityTransferred = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreTransferDetails", x => x.AidTransferDetailID);
                    table.ForeignKey(
                        name: "FK_AidStoreTransferDetails_AidStoreTransfers_AidStoreTransferA~",
                        column: x => x.AidStoreTransferAidTransferID,
                        principalTable: "AidStoreTransfers",
                        principalColumn: "AidTransferID");
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
                    CentralStoreTransferCentralTransferID = table.Column<int>(type: "integer", nullable: true),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityTransferred = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStoreTransferDetails", x => x.CentralTransferDetailID);
                    table.ForeignKey(
                        name: "FK_CentralStoreTransferDetails_CentralStoreTransfers_CentralSt~",
                        column: x => x.CentralStoreTransferCentralTransferID,
                        principalTable: "CentralStoreTransfers",
                        principalColumn: "CentralTransferID");
                    table.ForeignKey(
                        name: "FK_CentralStoreTransferDetails_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
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
                    AmountPaid = table.Column<double>(type: "double precision", nullable: false),
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
                    Frequency = table.Column<float>(type: "real", nullable: false),
                    Duration = table.Column<float>(type: "real", nullable: false),
                    Quantity = table.Column<float>(type: "real", nullable: false)
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
                name: "DispenseMedicineDetails",
                columns: table => new
                {
                    DispenseDetailID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DispenseID = table.Column<int>(type: "integer", nullable: false),
                    DispenseMedicineDispenseID = table.Column<int>(type: "integer", nullable: true),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityDispenced = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DispenseMedicineDetails", x => x.DispenseDetailID);
                    table.ForeignKey(
                        name: "FK_DispenseMedicineDetails_DispenseMedicines_DispenseMedicineD~",
                        column: x => x.DispenseMedicineDispenseID,
                        principalTable: "DispenseMedicines",
                        principalColumn: "DispenseID");
                    table.ForeignKey(
                        name: "FK_DispenseMedicineDetails_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleID",
                table: "Users",
                column: "RoleID");

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
                name: "IX_AidStoreInventories_AidStorePharmacyAidPharmacyID",
                table: "AidStoreInventories",
                column: "AidStorePharmacyAidPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreInventories_MedicineID",
                table: "AidStoreInventories",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStorePharmacies_UsersUserID",
                table: "AidStorePharmacies",
                column: "UsersUserID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreRequestDetails_AidStoreRequestAidRequestID",
                table: "AidStoreRequestDetails",
                column: "AidStoreRequestAidRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreRequestDetails_MedicineID",
                table: "AidStoreRequestDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreRequests_BranchPharmacyID",
                table: "AidStoreRequests",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreRequests_PharmacistID",
                table: "AidStoreRequests",
                column: "PharmacistID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransferDetails_AidStoreTransferAidTransferID",
                table: "AidStoreTransferDetails",
                column: "AidStoreTransferAidTransferID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransferDetails_MedicineID",
                table: "AidStoreTransferDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransfers_AidStorePharmacyAidPharmacyID",
                table: "AidStoreTransfers",
                column: "AidStorePharmacyAidPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransfers_AidStoreRequestAidRequestID",
                table: "AidStoreTransfers",
                column: "AidStoreRequestAidRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransfers_BranchPharmacyID",
                table: "AidStoreTransfers",
                column: "BranchPharmacyID");

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
                name: "IX_Bills_PatientVistVistID",
                table: "Bills",
                column: "PatientVistVistID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchInventories_BranchPharmacyID",
                table: "BranchInventories",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_BranchInventories_MedicineID",
                table: "BranchInventories",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_Cashiers_UsersUserID",
                table: "Cashiers",
                column: "UsersUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreInventories_CentralStorePharmacyCentralPharmacy~",
                table: "CentralStoreInventories",
                column: "CentralStorePharmacyCentralPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreInventories_MedicineID",
                table: "CentralStoreInventories",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStorePharmacies_UsersUserID",
                table: "CentralStorePharmacies",
                column: "UsersUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreRequestDetails_CentralStoreRequestCentralReques~",
                table: "CentralStoreRequestDetails",
                column: "CentralStoreRequestCentralRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreRequestDetails_MedicineID",
                table: "CentralStoreRequestDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreRequests_BranchPharmacyID",
                table: "CentralStoreRequests",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreRequests_PharmacistID",
                table: "CentralStoreRequests",
                column: "PharmacistID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransferDetails_CentralStoreTransferCentralTran~",
                table: "CentralStoreTransferDetails",
                column: "CentralStoreTransferCentralTransferID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransferDetails_MedicineID",
                table: "CentralStoreTransferDetails",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransfers_BranchPharmacyID",
                table: "CentralStoreTransfers",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransfers_CentralStorePharmacyCentralPharmacyID",
                table: "CentralStoreTransfers",
                column: "CentralStorePharmacyCentralPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransfers_CentralStoreRequestCentralRequestID",
                table: "CentralStoreTransfers",
                column: "CentralStoreRequestCentralRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransfers_MedicineID",
                table: "CentralStoreTransfers",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_DoctorID",
                table: "Consultations",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_PatientVistVistID",
                table: "Consultations",
                column: "PatientVistVistID");

            migrationBuilder.CreateIndex(
                name: "IX_DispenseMedicineDetails_DispenseMedicineDispenseID",
                table: "DispenseMedicineDetails",
                column: "DispenseMedicineDispenseID");

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
                name: "IX_LaboratoryTechnicians_UsersUserID",
                table: "LaboratoryTechnicians",
                column: "UsersUserID");

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
                name: "IX_Nurses_UsersUserID",
                table: "Nurses",
                column: "UsersUserID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientVists_PatientID",
                table: "PatientVists",
                column: "PatientID");

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
                name: "IX_Pharmacists_UsersUserID",
                table: "Pharmacists",
                column: "UsersUserID");

            migrationBuilder.CreateIndex(
                name: "IX_PharmacyCashiers_BranchPharmacyID",
                table: "PharmacyCashiers",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_PharmacyCashiers_UsersUserID",
                table: "PharmacyCashiers",
                column: "UsersUserID");

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
                name: "IX_Receptionists_UsersUserID",
                table: "Receptionists",
                column: "UsersUserID");

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
                name: "IX_Triages_PatientVistVistID",
                table: "Triages",
                column: "PatientVistVistID");

            migrationBuilder.CreateIndex(
                name: "IX_Triages_TriageDepartmentID",
                table: "Triages",
                column: "TriageDepartmentID");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_RoleID",
                table: "Users",
                column: "RoleID",
                principalTable: "Roles",
                principalColumn: "RoleID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_RoleID",
                table: "Users");

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
                name: "LaboratoryTechnicians");

            migrationBuilder.DropTable(
                name: "MedicalRecords");

            migrationBuilder.DropTable(
                name: "PaymentHospitals");

            migrationBuilder.DropTable(
                name: "PharmacyPayments");

            migrationBuilder.DropTable(
                name: "PrescriptionDetails");

            migrationBuilder.DropTable(
                name: "Receptionists");

            migrationBuilder.DropTable(
                name: "Roles");

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
                name: "Bills");

            migrationBuilder.DropTable(
                name: "PharmacyCashiers");

            migrationBuilder.DropTable(
                name: "Nurses");

            migrationBuilder.DropTable(
                name: "TriageDepartment");

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
                name: "Cashiers");

            migrationBuilder.DropTable(
                name: "Wards");

            migrationBuilder.DropTable(
                name: "Pharmacists");

            migrationBuilder.DropTable(
                name: "Consultations");

            migrationBuilder.DropTable(
                name: "BranchPharmacies");

            migrationBuilder.DropTable(
                name: "Doctors");

            migrationBuilder.DropTable(
                name: "PatientVists");

            migrationBuilder.DropTable(
                name: "ClinicalDepartment");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Users_RoleID",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Created_at",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RoleID",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Users",
                newName: "PhoneNumber");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "Users",
                newName: "ID");

            migrationBuilder.AlterColumn<string>(
                name: "HashPassword",
                table: "Users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(250)",
                oldMaxLength: 250);

            migrationBuilder.AddColumn<string>(
                name: "UserRole",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
