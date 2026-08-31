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
                name: "AidStorePharmacies",
                columns: table => new
                {
                    AidPharmacyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStorePharmacies", x => x.AidPharmacyID);
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
                name: "CentralStorePharmacies",
                columns: table => new
                {
                    CentralPharmacyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStorePharmacies", x => x.CentralPharmacyID);
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
                name: "Families",
                columns: table => new
                {
                    FamilyId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FamilyNumber = table.Column<string>(type: "text", nullable: false),
                    FamilyName = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    HouseholdPhone = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Families", x => x.FamilyId);
                });

            migrationBuilder.CreateTable(
                name: "Households",
                columns: table => new
                {
                    HouseholdID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HouseholdNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HeadOfHousehold = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Region = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Zone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Woreda = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Kebele = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Village = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Latitude = table.Column<decimal>(type: "numeric", nullable: true),
                    Longitude = table.Column<decimal>(type: "numeric", nullable: true),
                    HouseholdType = table.Column<string>(type: "text", nullable: true),
                    NumberOfMembers = table.Column<int>(type: "integer", nullable: true),
                    WaterSource = table.Column<string>(type: "text", nullable: true),
                    ToiletFacility = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RegisteredDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Households", x => x.HouseholdID);
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
                name: "OutreachActivities",
                columns: table => new
                {
                    OutreachActivityID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ActivityName = table.Column<string>(type: "text", nullable: false),
                    ActivityType = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: true),
                    TargetPopulation = table.Column<string>(type: "text", nullable: true),
                    TargetPopulationCount = table.Column<int>(type: "integer", nullable: true),
                    PeopleReached = table.Column<int>(type: "integer", nullable: true),
                    PeopleScreened = table.Column<int>(type: "integer", nullable: true),
                    PeopleReferred = table.Column<int>(type: "integer", nullable: true),
                    ServicesProvided = table.Column<string>(type: "text", nullable: true),
                    Outcome = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    OrganizedByUserID = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutreachActivities", x => x.OutreachActivityID);
                });

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    PatientID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MRN = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    FaydaFIN = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: true),
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
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
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
                name: "CommunityScreenings",
                columns: table => new
                {
                    CommunityScreeningID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HouseholdID = table.Column<int>(type: "integer", nullable: true),
                    PatientID = table.Column<int>(type: "integer", nullable: true),
                    ScreeningDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ScreeningType = table.Column<string>(type: "text", nullable: false),
                    ScreeningLocation = table.Column<string>(type: "text", nullable: true),
                    ScreeningResult = table.Column<string>(type: "text", nullable: true),
                    RiskIdentified = table.Column<string>(type: "text", nullable: true),
                    Symptoms = table.Column<string>(type: "text", nullable: true),
                    ActionTaken = table.Column<string>(type: "text", nullable: true),
                    ReferralRequired = table.Column<string>(type: "text", nullable: true),
                    HealthWorkerID = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunityScreenings", x => x.CommunityScreeningID);
                    table.ForeignKey(
                        name: "FK_CommunityScreenings_Households_HouseholdID",
                        column: x => x.HouseholdID,
                        principalTable: "Households",
                        principalColumn: "HouseholdID");
                });

            migrationBuilder.CreateTable(
                name: "HomeVisits",
                columns: table => new
                {
                    HomeVisitID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HouseholdID = table.Column<int>(type: "integer", nullable: false),
                    HealthWorkerID = table.Column<int>(type: "integer", nullable: true),
                    VisitDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VisitPurpose = table.Column<string>(type: "text", nullable: true),
                    Observations = table.Column<string>(type: "text", nullable: true),
                    HealthEducationProvided = table.Column<string>(type: "text", nullable: true),
                    ServicesProvided = table.Column<string>(type: "text", nullable: true),
                    ProblemsIdentified = table.Column<string>(type: "text", nullable: true),
                    ReferralsMade = table.Column<string>(type: "text", nullable: true),
                    FollowUpRequired = table.Column<string>(type: "text", nullable: true),
                    NextVisitDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeVisits", x => x.HomeVisitID);
                    table.ForeignKey(
                        name: "FK_HomeVisits_Households_HouseholdID",
                        column: x => x.HouseholdID,
                        principalTable: "Households",
                        principalColumn: "HouseholdID",
                        onDelete: ReferentialAction.Cascade);
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
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    QuantityAvailable = table.Column<float>(type: "real", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BatchNumber = table.Column<string>(type: "text", nullable: false),
                    Source = table.Column<string>(type: "text", nullable: false)
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
                name: "Allergies",
                columns: table => new
                {
                    AllergyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    Allergen = table.Column<string>(type: "text", nullable: false),
                    Reaction = table.Column<string>(type: "text", nullable: true),
                    Severity = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    OnsetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Allergies", x => x.AllergyID);
                    table.ForeignKey(
                        name: "FK_Allergies_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AsthmaManagements",
                columns: table => new
                {
                    AsthmaManagementID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    DiagnosisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AsthmaSeverity = table.Column<string>(type: "text", nullable: true),
                    AsthmaControlStatus = table.Column<string>(type: "text", nullable: true),
                    Symptoms = table.Column<string>(type: "text", nullable: true),
                    Triggers = table.Column<string>(type: "text", nullable: true),
                    Allergies = table.Column<string>(type: "text", nullable: true),
                    ExacerbationHistory = table.Column<string>(type: "text", nullable: true),
                    HospitalizationHistory = table.Column<string>(type: "text", nullable: true),
                    ManagementPlan = table.Column<string>(type: "text", nullable: true),
                    InhalerTechniqueEducation = table.Column<string>(type: "text", nullable: true),
                    TreatmentStatus = table.Column<string>(type: "text", nullable: true),
                    LastFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AsthmaManagements", x => x.AsthmaManagementID);
                    table.ForeignKey(
                        name: "FK_AsthmaManagements_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DefaulterTracings",
                columns: table => new
                {
                    DefaulterTracingID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: true),
                    HouseholdID = table.Column<int>(type: "integer", nullable: true),
                    ServiceType = table.Column<string>(type: "text", nullable: false),
                    ExpectedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IdentificationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReasonForDefaulting = table.Column<string>(type: "text", nullable: true),
                    ContactMethod = table.Column<string>(type: "text", nullable: true),
                    ContactResult = table.Column<string>(type: "text", nullable: true),
                    TracingOutcome = table.Column<string>(type: "text", nullable: true),
                    ActionTaken = table.Column<string>(type: "text", nullable: true),
                    TracingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    HealthWorkerID = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaulterTracings", x => x.DefaulterTracingID);
                    table.ForeignKey(
                        name: "FK_DefaulterTracings_Households_HouseholdID",
                        column: x => x.HouseholdID,
                        principalTable: "Households",
                        principalColumn: "HouseholdID");
                    table.ForeignKey(
                        name: "FK_DefaulterTracings_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID");
                });

            migrationBuilder.CreateTable(
                name: "DiabetesManagements",
                columns: table => new
                {
                    DiabetesManagementID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    DiagnosisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DiabetesType = table.Column<string>(type: "text", nullable: false),
                    DiagnosisMethod = table.Column<string>(type: "text", nullable: true),
                    LastFastingBloodGlucose = table.Column<decimal>(type: "numeric", nullable: true),
                    LastRandomBloodGlucose = table.Column<decimal>(type: "numeric", nullable: true),
                    LastHbA1c = table.Column<decimal>(type: "numeric", nullable: true),
                    Symptoms = table.Column<string>(type: "text", nullable: true),
                    Complications = table.Column<string>(type: "text", nullable: true),
                    RiskFactors = table.Column<string>(type: "text", nullable: true),
                    ManagementPlan = table.Column<string>(type: "text", nullable: true),
                    LifestyleAdvice = table.Column<string>(type: "text", nullable: true),
                    TreatmentStatus = table.Column<string>(type: "text", nullable: true),
                    LastFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiabetesManagements", x => x.DiabetesManagementID);
                    table.ForeignKey(
                        name: "FK_DiabetesManagements_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FamilyMedicalHistories",
                columns: table => new
                {
                    FamilyMedicalHistoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    Relative = table.Column<string>(type: "text", nullable: false),
                    ConditionName = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyMedicalHistories", x => x.FamilyMedicalHistoryID);
                    table.ForeignKey(
                        name: "FK_FamilyMedicalHistories_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FamilyMembers",
                columns: table => new
                {
                    FamilyMemberId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FamilyId = table.Column<long>(type: "bigint", nullable: false),
                    PatientId = table.Column<int>(type: "integer", nullable: false),
                    Relationship = table.Column<string>(type: "text", nullable: false),
                    IsHeadOfHousehold = table.Column<bool>(type: "boolean", nullable: false),
                    JoinedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LeftDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyMembers", x => x.FamilyMemberId);
                    table.ForeignKey(
                        name: "FK_FamilyMembers_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "FamilyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyMembers_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HepatitisManagements",
                columns: table => new
                {
                    HepatitisManagementID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    DiagnosisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    HepatitisType = table.Column<string>(type: "text", nullable: true),
                    DiagnosticMethod = table.Column<string>(type: "text", nullable: true),
                    DiseaseStatus = table.Column<string>(type: "text", nullable: true),
                    Symptoms = table.Column<string>(type: "text", nullable: true),
                    LiverCondition = table.Column<string>(type: "text", nullable: true),
                    Complications = table.Column<string>(type: "text", nullable: true),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: true),
                    TreatmentStatus = table.Column<string>(type: "text", nullable: true),
                    LaboratoryMonitoringPlan = table.Column<string>(type: "text", nullable: true),
                    LastFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Outcome = table.Column<string>(type: "text", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ManagedByUserID = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HepatitisManagements", x => x.HepatitisManagementID);
                    table.ForeignKey(
                        name: "FK_HepatitisManagements_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HIVCares",
                columns: table => new
                {
                    HIVCareID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    EnrollmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DiagnosisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CareStatus = table.Column<string>(type: "text", nullable: true),
                    ClinicalStage = table.Column<string>(type: "text", nullable: true),
                    TreatmentStatus = table.Column<string>(type: "text", nullable: true),
                    TreatmentStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AdherenceStatus = table.Column<string>(type: "text", nullable: true),
                    TreatmentResponse = table.Column<string>(type: "text", nullable: true),
                    OpportunisticConditions = table.Column<string>(type: "text", nullable: true),
                    Complications = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    FollowUpPlan = table.Column<string>(type: "text", nullable: true),
                    LastFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Outcome = table.Column<string>(type: "text", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ManagedByUserID = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HIVCares", x => x.HIVCareID);
                    table.ForeignKey(
                        name: "FK_HIVCares_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HouseholdMembers",
                columns: table => new
                {
                    HouseholdMemberID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HouseholdID = table.Column<int>(type: "integer", nullable: false),
                    PatientID = table.Column<int>(type: "integer", nullable: true),
                    RelationshipToHead = table.Column<string>(type: "text", nullable: true),
                    IsHouseholdHead = table.Column<bool>(type: "boolean", nullable: false),
                    Occupation = table.Column<string>(type: "text", nullable: true),
                    EducationLevel = table.Column<string>(type: "text", nullable: true),
                    VulnerabilityStatus = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    JoinedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HouseholdMembers", x => x.HouseholdMemberID);
                    table.ForeignKey(
                        name: "FK_HouseholdMembers_Households_HouseholdID",
                        column: x => x.HouseholdID,
                        principalTable: "Households",
                        principalColumn: "HouseholdID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HouseholdMembers_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID");
                });

            migrationBuilder.CreateTable(
                name: "HypertensionManagements",
                columns: table => new
                {
                    HypertensionManagementID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    DiagnosisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    HypertensionType = table.Column<string>(type: "text", nullable: true),
                    DiagnosisMethod = table.Column<string>(type: "text", nullable: true),
                    RiskFactors = table.Column<string>(type: "text", nullable: true),
                    TargetBloodPressure = table.Column<string>(type: "text", nullable: true),
                    Complications = table.Column<string>(type: "text", nullable: true),
                    CardiovascularRisk = table.Column<string>(type: "text", nullable: true),
                    ManagementPlan = table.Column<string>(type: "text", nullable: true),
                    LifestyleAdvice = table.Column<string>(type: "text", nullable: true),
                    TreatmentStatus = table.Column<string>(type: "text", nullable: true),
                    LastFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HypertensionManagements", x => x.HypertensionManagementID);
                    table.ForeignKey(
                        name: "FK_HypertensionManagements_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MentalHealthCares",
                columns: table => new
                {
                    MentalHealthCareID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    AssessmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PresentingConcern = table.Column<string>(type: "text", nullable: true),
                    MentalHealthDiagnosis = table.Column<string>(type: "text", nullable: true),
                    Symptoms = table.Column<string>(type: "text", nullable: true),
                    MentalStatusExamination = table.Column<string>(type: "text", nullable: true),
                    PsychosocialFactors = table.Column<string>(type: "text", nullable: true),
                    RiskAssessment = table.Column<string>(type: "text", nullable: true),
                    SafetyPlan = table.Column<string>(type: "text", nullable: true),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    ReferralRequired = table.Column<string>(type: "text", nullable: true),
                    FollowUpPlan = table.Column<string>(type: "text", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    AssessedByUserID = table.Column<int>(type: "integer", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MentalHealthCares", x => x.MentalHealthCareID);
                    table.ForeignKey(
                        name: "FK_MentalHealthCares_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PatientVisits",
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
                    table.PrimaryKey("PK_PatientVisits", x => x.VisitID);
                    table.ForeignKey(
                        name: "FK_PatientVisits_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pregnancies",
                columns: table => new
                {
                    PregnancyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    LastMenstrualPeriod = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpectedDeliveryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Gravida = table.Column<int>(type: "integer", nullable: true),
                    Para = table.Column<int>(type: "integer", nullable: true),
                    Abortions = table.Column<int>(type: "integer", nullable: true),
                    LivingChildren = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pregnancies", x => x.PregnancyID);
                    table.ForeignKey(
                        name: "FK_Pregnancies_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProblemLists",
                columns: table => new
                {
                    ProblemListID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    ProblemName = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: true),
                    CodingSystem = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    OnsetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolvedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProblemLists", x => x.ProblemListID);
                    table.ForeignKey(
                        name: "FK_ProblemLists_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SocialHistories",
                columns: table => new
                {
                    SocialHistoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    SmokingStatus = table.Column<string>(type: "text", nullable: true),
                    AlcoholUse = table.Column<string>(type: "text", nullable: true),
                    Occupation = table.Column<string>(type: "text", nullable: true),
                    LivingSituation = table.Column<string>(type: "text", nullable: true),
                    PhysicalActivity = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialHistories", x => x.SocialHistoryID);
                    table.ForeignKey(
                        name: "FK_SocialHistories_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TuberculosisManagements",
                columns: table => new
                {
                    TuberculosisManagementID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    DiagnosisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TBType = table.Column<string>(type: "text", nullable: true),
                    SiteOfTB = table.Column<string>(type: "text", nullable: true),
                    DiagnosticMethod = table.Column<string>(type: "text", nullable: true),
                    Symptoms = table.Column<string>(type: "text", nullable: true),
                    DrugResistanceStatus = table.Column<string>(type: "text", nullable: true),
                    TreatmentStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpectedTreatmentEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualTreatmentEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TreatmentRegimen = table.Column<string>(type: "text", nullable: true),
                    TreatmentStatus = table.Column<string>(type: "text", nullable: true),
                    AdherenceStatus = table.Column<string>(type: "text", nullable: true),
                    TreatmentResponse = table.Column<string>(type: "text", nullable: true),
                    Complications = table.Column<string>(type: "text", nullable: true),
                    ContactTracingStatus = table.Column<string>(type: "text", nullable: true),
                    LastFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Outcome = table.Column<string>(type: "text", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ManagedByUserID = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TuberculosisManagements", x => x.TuberculosisManagementID);
                    table.ForeignKey(
                        name: "FK_TuberculosisManagements_Patients_PatientID",
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
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Doctors",
                columns: table => new
                {
                    DoctorID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
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
                        name: "FK_Doctors_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
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
                        onDelete: ReferentialAction.Restrict);
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
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MainPharmacyManagers",
                columns: table => new
                {
                    ManagerID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MainPharmacyManagers", x => x.ManagerID);
                    table.ForeignKey(
                        name: "FK_MainPharmacyManagers_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
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
                        onDelete: ReferentialAction.Restrict);
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
                        onDelete: ReferentialAction.Restrict);
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
                        onDelete: ReferentialAction.Restrict);
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
                        onDelete: ReferentialAction.Restrict);
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
                        onDelete: ReferentialAction.Restrict);
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
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserRoleID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    RoleID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.UserRoleID);
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Roles",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
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
                name: "DevelopmentAssessments",
                columns: table => new
                {
                    DevelopmentAssessmentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    PatientVisitID = table.Column<int>(type: "integer", nullable: true),
                    AssessmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AgeInMonths = table.Column<int>(type: "integer", nullable: true),
                    GrossMotor = table.Column<string>(type: "text", nullable: true),
                    FineMotor = table.Column<string>(type: "text", nullable: true),
                    Language = table.Column<string>(type: "text", nullable: true),
                    CognitiveDevelopment = table.Column<string>(type: "text", nullable: true),
                    SocialDevelopment = table.Column<string>(type: "text", nullable: true),
                    DevelopmentalMilestones = table.Column<string>(type: "text", nullable: true),
                    DevelopmentStatus = table.Column<string>(type: "text", nullable: true),
                    ConcernIdentified = table.Column<string>(type: "text", nullable: true),
                    ActionTaken = table.Column<string>(type: "text", nullable: true),
                    ReferralRequired = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    AssessedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DevelopmentAssessments", x => x.DevelopmentAssessmentID);
                    table.ForeignKey(
                        name: "FK_DevelopmentAssessments_PatientVisits_PatientVisitID",
                        column: x => x.PatientVisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID");
                    table.ForeignKey(
                        name: "FK_DevelopmentAssessments_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GrowthMonitorings",
                columns: table => new
                {
                    GrowthMonitoringID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    PatientVisitID = table.Column<int>(type: "integer", nullable: true),
                    MeasurementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AgeInMonths = table.Column<int>(type: "integer", nullable: true),
                    WeightKg = table.Column<decimal>(type: "numeric", nullable: true),
                    HeightCm = table.Column<decimal>(type: "numeric", nullable: true),
                    LengthCm = table.Column<decimal>(type: "numeric", nullable: true),
                    HeadCircumferenceCm = table.Column<decimal>(type: "numeric", nullable: true),
                    MUACCm = table.Column<decimal>(type: "numeric", nullable: true),
                    BMI = table.Column<decimal>(type: "numeric", nullable: true),
                    WeightForAge = table.Column<decimal>(type: "numeric", nullable: true),
                    HeightForAge = table.Column<decimal>(type: "numeric", nullable: true),
                    WeightForHeight = table.Column<decimal>(type: "numeric", nullable: true),
                    GrowthStatus = table.Column<string>(type: "text", nullable: true),
                    GrowthInterpretation = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    ActionTaken = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GrowthMonitorings", x => x.GrowthMonitoringID);
                    table.ForeignKey(
                        name: "FK_GrowthMonitorings_PatientVisits_PatientVisitID",
                        column: x => x.PatientVisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID");
                    table.ForeignKey(
                        name: "FK_GrowthMonitorings_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Immunizations",
                columns: table => new
                {
                    ImmunizationID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    PatientVisitID = table.Column<int>(type: "integer", nullable: true),
                    VaccinationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VaccineName = table.Column<string>(type: "text", nullable: false),
                    VaccineCode = table.Column<string>(type: "text", nullable: true),
                    Dose = table.Column<string>(type: "text", nullable: true),
                    DoseNumber = table.Column<string>(type: "text", nullable: true),
                    Route = table.Column<string>(type: "text", nullable: true),
                    AdministrationSite = table.Column<string>(type: "text", nullable: true),
                    BatchNumber = table.Column<string>(type: "text", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VaccinationReason = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AdverseEvent = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    AdministeredByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Immunizations", x => x.ImmunizationID);
                    table.ForeignKey(
                        name: "FK_Immunizations_PatientVisits_PatientVisitID",
                        column: x => x.PatientVisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID");
                    table.ForeignKey(
                        name: "FK_Immunizations_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IMNCIEncounters",
                columns: table => new
                {
                    IMNCIEncounterID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    PatientVisitID = table.Column<int>(type: "integer", nullable: false),
                    EncounterDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AgeInMonths = table.Column<int>(type: "integer", nullable: true),
                    MainSymptoms = table.Column<string>(type: "text", nullable: true),
                    GeneralDangerSigns = table.Column<string>(type: "text", nullable: true),
                    CoughClassification = table.Column<string>(type: "text", nullable: true),
                    DiarrheaClassification = table.Column<string>(type: "text", nullable: true),
                    FeverClassification = table.Column<string>(type: "text", nullable: true),
                    EarProblemClassification = table.Column<string>(type: "text", nullable: true),
                    MalnutritionClassification = table.Column<string>(type: "text", nullable: true),
                    AnemiaClassification = table.Column<string>(type: "text", nullable: true),
                    ImmunizationStatus = table.Column<string>(type: "text", nullable: true),
                    FeedingAssessment = table.Column<string>(type: "text", nullable: true),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    ReferralDecision = table.Column<string>(type: "text", nullable: true),
                    FollowUpPlan = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    AssessedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IMNCIEncounters", x => x.IMNCIEncounterID);
                    table.ForeignKey(
                        name: "FK_IMNCIEncounters_PatientVisits_PatientVisitID",
                        column: x => x.PatientVisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IMNCIEncounters_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NutritionAssessments",
                columns: table => new
                {
                    NutritionAssessmentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    PatientVisitID = table.Column<int>(type: "integer", nullable: true),
                    AssessmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    WeightKg = table.Column<decimal>(type: "numeric", nullable: true),
                    HeightCm = table.Column<decimal>(type: "numeric", nullable: true),
                    MUACCm = table.Column<decimal>(type: "numeric", nullable: true),
                    BMI = table.Column<decimal>(type: "numeric", nullable: true),
                    Appetite = table.Column<string>(type: "text", nullable: true),
                    FeedingHistory = table.Column<string>(type: "text", nullable: true),
                    BreastfeedingStatus = table.Column<string>(type: "text", nullable: true),
                    DietaryHistory = table.Column<string>(type: "text", nullable: true),
                    NutritionalStatus = table.Column<string>(type: "text", nullable: true),
                    MalnutritionClassification = table.Column<string>(type: "text", nullable: true),
                    Edema = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: true),
                    ReferralRequired = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    AssessedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionAssessments", x => x.NutritionAssessmentID);
                    table.ForeignKey(
                        name: "FK_NutritionAssessments_PatientVisits_PatientVisitID",
                        column: x => x.PatientVisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID");
                    table.ForeignKey(
                        name: "FK_NutritionAssessments_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Referrals",
                columns: table => new
                {
                    ReferralID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    PatientVisitID = table.Column<int>(type: "integer", nullable: false),
                    ReferringDoctorID = table.Column<int>(type: "integer", nullable: true),
                    ReceivingDoctorID = table.Column<int>(type: "integer", nullable: true),
                    ReferringDepartmentID = table.Column<int>(type: "integer", nullable: true),
                    ReceivingDepartmentID = table.Column<int>(type: "integer", nullable: true),
                    ReferralReason = table.Column<string>(type: "text", nullable: true),
                    ClinicalSummary = table.Column<string>(type: "text", nullable: true),
                    Diagnosis = table.Column<string>(type: "text", nullable: true),
                    Urgency = table.Column<string>(type: "text", nullable: true),
                    ReferralType = table.Column<string>(type: "text", nullable: true),
                    ReferralDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpectedArrivalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DestinationFacility = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserID = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Referrals", x => x.ReferralID);
                    table.ForeignKey(
                        name: "FK_Referrals_PatientVisits_PatientVisitID",
                        column: x => x.PatientVisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Referrals_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ANCVisits",
                columns: table => new
                {
                    ANCVisitID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    PatientVisitID = table.Column<int>(type: "integer", nullable: false),
                    VisitDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GestationalAgeWeeks = table.Column<int>(type: "integer", nullable: true),
                    ChiefComplaint = table.Column<string>(type: "text", nullable: true),
                    MaternalCondition = table.Column<string>(type: "text", nullable: true),
                    FetalCondition = table.Column<string>(type: "text", nullable: true),
                    FetalHeartRate = table.Column<string>(type: "text", nullable: true),
                    FundalHeight = table.Column<string>(type: "text", nullable: true),
                    Edema = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ANCVisits", x => x.ANCVisitID);
                    table.ForeignKey(
                        name: "FK_ANCVisits_PatientVisits_PatientVisitID",
                        column: x => x.PatientVisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ANCVisits_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BirthPreparednessPlans",
                columns: table => new
                {
                    BirthPreparednessID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    AssessmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeliveryFacilityIdentified = table.Column<bool>(type: "boolean", nullable: false),
                    DeliveryFacility = table.Column<string>(type: "text", nullable: true),
                    TransportArranged = table.Column<bool>(type: "boolean", nullable: false),
                    TransportPlan = table.Column<string>(type: "text", nullable: true),
                    BirthCompanionIdentified = table.Column<bool>(type: "boolean", nullable: false),
                    EmergencyContactIdentified = table.Column<bool>(type: "boolean", nullable: false),
                    FinancialPreparation = table.Column<bool>(type: "boolean", nullable: false),
                    BloodDonorIdentified = table.Column<bool>(type: "boolean", nullable: false),
                    EmergencyPlan = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    PreparedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BirthPreparednessPlans", x => x.BirthPreparednessID);
                    table.ForeignKey(
                        name: "FK_BirthPreparednessPlans_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FamilyPlannings",
                columns: table => new
                {
                    FamilyPlanningID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    PregnancyID = table.Column<int>(type: "integer", nullable: true),
                    VisitDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Method = table.Column<string>(type: "text", nullable: true),
                    MethodType = table.Column<string>(type: "text", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DiscontinuationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReasonForDiscontinuation = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    SideEffects = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ProvidedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyPlannings", x => x.FamilyPlanningID);
                    table.ForeignKey(
                        name: "FK_FamilyPlannings_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyPlannings_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID");
                });

            migrationBuilder.CreateTable(
                name: "HighRiskPregnancies",
                columns: table => new
                {
                    HighRiskPregnancyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    IdentificationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RiskLevel = table.Column<string>(type: "text", nullable: false),
                    RiskReason = table.Column<string>(type: "text", nullable: false),
                    ManagementPlan = table.Column<string>(type: "text", nullable: true),
                    SpecialistRequired = table.Column<string>(type: "text", nullable: true),
                    ReferralPlan = table.Column<string>(type: "text", nullable: true),
                    FollowUpFrequency = table.Column<string>(type: "text", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    ResolvedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Outcome = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ManagedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HighRiskPregnancies", x => x.HighRiskPregnancyID);
                    table.ForeignKey(
                        name: "FK_HighRiskPregnancies_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LaborRecords",
                columns: table => new
                {
                    LaborRecordID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    AdmissionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LaborStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MembraneRuptureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MembraneStatus = table.Column<string>(type: "text", nullable: true),
                    CervicalDilation = table.Column<string>(type: "text", nullable: true),
                    ContractionPattern = table.Column<string>(type: "text", nullable: true),
                    FetalHeartRate = table.Column<string>(type: "text", nullable: true),
                    LaborProgress = table.Column<string>(type: "text", nullable: true),
                    LaborManagement = table.Column<string>(type: "text", nullable: true),
                    DeliveryPlan = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaborRecords", x => x.LaborRecordID);
                    table.ForeignKey(
                        name: "FK_LaborRecords_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PregnancyMedications",
                columns: table => new
                {
                    PregnancyMedicationID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    MedicineID = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Dosage = table.Column<string>(type: "text", nullable: false),
                    Frequency = table.Column<string>(type: "text", nullable: false),
                    Route = table.Column<string>(type: "text", nullable: false),
                    Indication = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PrescribedByUserID = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PregnancyMedications", x => x.PregnancyMedicationID);
                    table.ForeignKey(
                        name: "FK_PregnancyMedications_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PregnancyMedications_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PregnancyRegistrations",
                columns: table => new
                {
                    PregnancyRegistrationID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GestationalAgeWeeks = table.Column<int>(type: "integer", nullable: true),
                    RegistrationReason = table.Column<string>(type: "text", nullable: true),
                    PreviousPregnancyHistory = table.Column<string>(type: "text", nullable: true),
                    CurrentPregnancyHistory = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PregnancyRegistrations", x => x.PregnancyRegistrationID);
                    table.ForeignKey(
                        name: "FK_PregnancyRegistrations_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PregnancyRegistrations_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
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
                        name: "FK_Bills_PatientVisits_VisitID",
                        column: x => x.VisitID,
                        principalTable: "PatientVisits",
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
                    HistoryOfPresentIllness = table.Column<string>(type: "text", nullable: false),
                    Assessment = table.Column<string>(type: "text", nullable: true),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: true),
                    ClinicalNotes = table.Column<string>(type: "text", nullable: true)
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
                        name: "FK_Consultations_PatientVisits_VisitID",
                        column: x => x.VisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalHistories",
                columns: table => new
                {
                    MedicalHistoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    ConditionName = table.Column<string>(type: "text", nullable: false),
                    DiagnosedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: true),
                    Treatment = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    DoctorID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalHistories", x => x.MedicalHistoryID);
                    table.ForeignKey(
                        name: "FK_MedicalHistories_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID");
                    table.ForeignKey(
                        name: "FK_MedicalHistories_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AidStoreManagers",
                columns: table => new
                {
                    AidStoreManagerID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AidPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    ManagerID = table.Column<int>(type: "integer", nullable: false),
                    IsCurrent = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreManagers", x => x.AidStoreManagerID);
                    table.ForeignKey(
                        name: "FK_AidStoreManagers_AidStorePharmacies_AidPharmacyID",
                        column: x => x.AidPharmacyID,
                        principalTable: "AidStorePharmacies",
                        principalColumn: "AidPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AidStoreManagers_MainPharmacyManagers_ManagerID",
                        column: x => x.ManagerID,
                        principalTable: "MainPharmacyManagers",
                        principalColumn: "ManagerID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CentralStoreManagers",
                columns: table => new
                {
                    CentralStoreManagerID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CentralPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    ManagerID = table.Column<int>(type: "integer", nullable: false),
                    IsCurrent = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CentralStoreManagers", x => x.CentralStoreManagerID);
                    table.ForeignKey(
                        name: "FK_CentralStoreManagers_CentralStorePharmacies_CentralPharmacy~",
                        column: x => x.CentralPharmacyID,
                        principalTable: "CentralStorePharmacies",
                        principalColumn: "CentralPharmacyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CentralStoreManagers_MainPharmacyManagers_ManagerID",
                        column: x => x.ManagerID,
                        principalTable: "MainPharmacyManagers",
                        principalColumn: "ManagerID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Triages",
                columns: table => new
                {
                    TriageId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VisitID = table.Column<int>(type: "integer", nullable: false),
                    NurseID = table.Column<int>(type: "integer", nullable: true),
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
                        principalColumn: "NurseID");
                    table.ForeignKey(
                        name: "FK_Triages_PatientVisits_VisitID",
                        column: x => x.VisitID,
                        principalTable: "PatientVisits",
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
                    Status = table.Column<string>(type: "text", nullable: false),
                    ApprovedByManagerID = table.Column<int>(type: "integer", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true)
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
                name: "AmbulanceRequests",
                columns: table => new
                {
                    AmbulanceRequestID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReferralID = table.Column<int>(type: "integer", nullable: false),
                    RequestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PickupLocation = table.Column<string>(type: "text", nullable: true),
                    Destination = table.Column<string>(type: "text", nullable: true),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    PatientCondition = table.Column<string>(type: "text", nullable: true),
                    RequiresOxygen = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresMedicalStaff = table.Column<bool>(type: "boolean", nullable: false),
                    SpecialRequirements = table.Column<string>(type: "text", nullable: true),
                    AmbulanceNumber = table.Column<string>(type: "text", nullable: true),
                    DriverName = table.Column<string>(type: "text", nullable: true),
                    StaffName = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DispatchTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PickupTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArrivalTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RequestedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AmbulanceRequests", x => x.AmbulanceRequestID);
                    table.ForeignKey(
                        name: "FK_AmbulanceRequests_Referrals_ReferralID",
                        column: x => x.ReferralID,
                        principalTable: "Referrals",
                        principalColumn: "ReferralID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CounterReferrals",
                columns: table => new
                {
                    CounterReferralID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReferralID = table.Column<int>(type: "integer", nullable: false),
                    CounterReferralDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    FinalDiagnosis = table.Column<string>(type: "text", nullable: true),
                    TreatmentProvided = table.Column<string>(type: "text", nullable: true),
                    ProceduresPerformed = table.Column<string>(type: "text", nullable: true),
                    CurrentCondition = table.Column<string>(type: "text", nullable: true),
                    MedicationInstructions = table.Column<string>(type: "text", nullable: true),
                    FollowUpInstructions = table.Column<string>(type: "text", nullable: true),
                    FollowUpFacility = table.Column<string>(type: "text", nullable: true),
                    Recommendations = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ReturnedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CounterReferrals", x => x.CounterReferralID);
                    table.ForeignKey(
                        name: "FK_CounterReferrals_Referrals_ReferralID",
                        column: x => x.ReferralID,
                        principalTable: "Referrals",
                        principalColumn: "ReferralID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReferralFeedbacks",
                columns: table => new
                {
                    ReferralFeedbackID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReferralID = table.Column<int>(type: "integer", nullable: false),
                    FeedbackDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PatientConditionOnArrival = table.Column<string>(type: "text", nullable: true),
                    Assessment = table.Column<string>(type: "text", nullable: true),
                    Diagnosis = table.Column<string>(type: "text", nullable: true),
                    TreatmentProvided = table.Column<string>(type: "text", nullable: true),
                    ProceduresPerformed = table.Column<string>(type: "text", nullable: true),
                    InvestigationResults = table.Column<string>(type: "text", nullable: true),
                    PatientOutcome = table.Column<string>(type: "text", nullable: true),
                    FollowUpRecommendation = table.Column<string>(type: "text", nullable: true),
                    FurtherCareRequired = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    SubmittedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReferralFeedbacks", x => x.ReferralFeedbackID);
                    table.ForeignKey(
                        name: "FK_ReferralFeedbacks_Referrals_ReferralID",
                        column: x => x.ReferralID,
                        principalTable: "Referrals",
                        principalColumn: "ReferralID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReferralServices",
                columns: table => new
                {
                    ReferralServiceID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReferralID = table.Column<int>(type: "integer", nullable: false),
                    ServiceName = table.Column<string>(type: "text", nullable: false),
                    ServiceDescription = table.Column<string>(type: "text", nullable: true),
                    DepartmentName = table.Column<string>(type: "text", nullable: true),
                    Priority = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReferralServices", x => x.ReferralServiceID);
                    table.ForeignKey(
                        name: "FK_ReferralServices_Referrals_ReferralID",
                        column: x => x.ReferralID,
                        principalTable: "Referrals",
                        principalColumn: "ReferralID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PregnancyLaboratoryOrders",
                columns: table => new
                {
                    PregnancyLaboratoryOrderID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    ANCVisitID = table.Column<int>(type: "integer", nullable: true),
                    LaboratoryTestTypeID = table.Column<int>(type: "integer", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClinicalReason = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    OrderedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PregnancyLaboratoryOrders", x => x.PregnancyLaboratoryOrderID);
                    table.ForeignKey(
                        name: "FK_PregnancyLaboratoryOrders_ANCVisits_ANCVisitID",
                        column: x => x.ANCVisitID,
                        principalTable: "ANCVisits",
                        principalColumn: "ANCVisitID");
                    table.ForeignKey(
                        name: "FK_PregnancyLaboratoryOrders_LaboratoryTestTypes_LaboratoryTes~",
                        column: x => x.LaboratoryTestTypeID,
                        principalTable: "LaboratoryTestTypes",
                        principalColumn: "LaboratoryTestTypeID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PregnancyLaboratoryOrders_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PregnancyRiskAssessments",
                columns: table => new
                {
                    PregnancyRiskAssessmentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    ANCVisitID = table.Column<int>(type: "integer", nullable: true),
                    AssessmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsHighRisk = table.Column<bool>(type: "boolean", nullable: false),
                    RiskCategory = table.Column<string>(type: "text", nullable: true),
                    RiskFactor = table.Column<string>(type: "text", nullable: true),
                    RiskDescription = table.Column<string>(type: "text", nullable: true),
                    ActionTaken = table.Column<string>(type: "text", nullable: true),
                    ReferralRequired = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    AssessedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PregnancyRiskAssessments", x => x.PregnancyRiskAssessmentID);
                    table.ForeignKey(
                        name: "FK_PregnancyRiskAssessments_ANCVisits_ANCVisitID",
                        column: x => x.ANCVisitID,
                        principalTable: "ANCVisits",
                        principalColumn: "ANCVisitID");
                    table.ForeignKey(
                        name: "FK_PregnancyRiskAssessments_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PregnancyUltrasounds",
                columns: table => new
                {
                    PregnancyUltrasoundID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    ANCVisitID = table.Column<int>(type: "integer", nullable: true),
                    ExaminationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GestationalAgeWeeks = table.Column<int>(type: "integer", nullable: true),
                    FetalNumber = table.Column<string>(type: "text", nullable: true),
                    FetalPresentation = table.Column<string>(type: "text", nullable: true),
                    PlacentaLocation = table.Column<string>(type: "text", nullable: true),
                    AmnioticFluid = table.Column<string>(type: "text", nullable: true),
                    FetalHeartRate = table.Column<string>(type: "text", nullable: true),
                    EstimatedFetalWeight = table.Column<string>(type: "text", nullable: true),
                    Findings = table.Column<string>(type: "text", nullable: true),
                    Impression = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RequestedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PregnancyUltrasounds", x => x.PregnancyUltrasoundID);
                    table.ForeignKey(
                        name: "FK_PregnancyUltrasounds_ANCVisits_ANCVisitID",
                        column: x => x.ANCVisitID,
                        principalTable: "ANCVisits",
                        principalColumn: "ANCVisitID");
                    table.ForeignKey(
                        name: "FK_PregnancyUltrasounds_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Deliveries",
                columns: table => new
                {
                    DeliveryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    LaborRecordID = table.Column<int>(type: "integer", nullable: true),
                    DeliveryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeliveryMode = table.Column<string>(type: "text", nullable: false),
                    DeliveryLocation = table.Column<string>(type: "text", nullable: true),
                    NumberOfBabies = table.Column<int>(type: "integer", nullable: true),
                    MaternalCondition = table.Column<string>(type: "text", nullable: true),
                    PlacentaCondition = table.Column<string>(type: "text", nullable: true),
                    BloodLoss = table.Column<string>(type: "text", nullable: true),
                    DeliveryNotes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliveries", x => x.DeliveryID);
                    table.ForeignKey(
                        name: "FK_Deliveries_LaborRecords_LaborRecordID",
                        column: x => x.LaborRecordID,
                        principalTable: "LaborRecords",
                        principalColumn: "LaborRecordID");
                    table.ForeignKey(
                        name: "FK_Deliveries_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
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
                name: "Diagnoses",
                columns: table => new
                {
                    DiagnosisID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultationID = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CodingSystem = table.Column<string>(type: "text", nullable: false),
                    DiagnosisType = table.Column<string>(type: "text", nullable: true),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Diagnoses", x => x.DiagnosisID);
                    table.ForeignKey(
                        name: "FK_Diagnoses_Consultations_ConsultationID",
                        column: x => x.ConsultationID,
                        principalTable: "Consultations",
                        principalColumn: "ConsultationID",
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
                name: "PhysicalExaminations",
                columns: table => new
                {
                    PhysicalExaminationID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultationID = table.Column<int>(type: "integer", nullable: false),
                    ExaminationArea = table.Column<string>(type: "text", nullable: false),
                    Findings = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhysicalExaminations", x => x.PhysicalExaminationID);
                    table.ForeignKey(
                        name: "FK_PhysicalExaminations_Consultations_ConsultationID",
                        column: x => x.ConsultationID,
                        principalTable: "Consultations",
                        principalColumn: "ConsultationID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Prescriptions",
                columns: table => new
                {
                    PrescriptionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultationID = table.Column<int>(type: "integer", nullable: true),
                    DoctorID = table.Column<int>(type: "integer", nullable: true),
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
                        principalColumn: "ConsultationID");
                    table.ForeignKey(
                        name: "FK_Prescriptions_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID");
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
                    AidStoreManagerID = table.Column<int>(type: "integer", nullable: false),
                    TransferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidStoreTransfers", x => x.AidTransferID);
                    table.ForeignKey(
                        name: "FK_AidStoreTransfers_AidStoreManagers_AidStoreManagerID",
                        column: x => x.AidStoreManagerID,
                        principalTable: "AidStoreManagers",
                        principalColumn: "AidStoreManagerID",
                        onDelete: ReferentialAction.Cascade);
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
                    CentralRequestID = table.Column<int>(type: "integer", nullable: true),
                    CentralPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    BranchPharmacyID = table.Column<int>(type: "integer", nullable: false),
                    CentralStoreManagerID = table.Column<int>(type: "integer", nullable: false),
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
                        name: "FK_CentralStoreTransfers_CentralStoreManagers_CentralStoreMana~",
                        column: x => x.CentralStoreManagerID,
                        principalTable: "CentralStoreManagers",
                        principalColumn: "CentralStoreManagerID",
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
                        principalColumn: "CentralRequestID");
                    table.ForeignKey(
                        name: "FK_CentralStoreTransfers_Medicines_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicines",
                        principalColumn: "MedicineID");
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
                name: "ChildBirths",
                columns: table => new
                {
                    ChildBirthID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeliveryID = table.Column<int>(type: "integer", nullable: false),
                    ChildPatientID = table.Column<int>(type: "integer", nullable: true),
                    Sex = table.Column<string>(type: "text", nullable: true),
                    BirthDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BirthWeight = table.Column<string>(type: "text", nullable: true),
                    BirthLength = table.Column<string>(type: "text", nullable: true),
                    HeadCircumference = table.Column<string>(type: "text", nullable: true),
                    ApgarScore = table.Column<string>(type: "text", nullable: true),
                    BirthCondition = table.Column<string>(type: "text", nullable: true),
                    ResuscitationRequired = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChildBirths", x => x.ChildBirthID);
                    table.ForeignKey(
                        name: "FK_ChildBirths_Deliveries_DeliveryID",
                        column: x => x.DeliveryID,
                        principalTable: "Deliveries",
                        principalColumn: "DeliveryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChildBirths_Patients_ChildPatientID",
                        column: x => x.ChildPatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID");
                });

            migrationBuilder.CreateTable(
                name: "DeliveryComplications",
                columns: table => new
                {
                    DeliveryComplicationID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeliveryID = table.Column<int>(type: "integer", nullable: false),
                    ComplicationType = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Severity = table.Column<string>(type: "text", nullable: true),
                    Management = table.Column<string>(type: "text", nullable: true),
                    ReferralRequired = table.Column<bool>(type: "boolean", nullable: false),
                    Outcome = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryComplications", x => x.DeliveryComplicationID);
                    table.ForeignKey(
                        name: "FK_DeliveryComplications_Deliveries_DeliveryID",
                        column: x => x.DeliveryID,
                        principalTable: "Deliveries",
                        principalColumn: "DeliveryID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PNCVisits",
                columns: table => new
                {
                    PNCVisitID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PregnancyID = table.Column<int>(type: "integer", nullable: false),
                    PatientVisitID = table.Column<int>(type: "integer", nullable: false),
                    DeliveryID = table.Column<int>(type: "integer", nullable: true),
                    VisitDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DaysAfterDelivery = table.Column<int>(type: "integer", nullable: true),
                    MaternalCondition = table.Column<string>(type: "text", nullable: true),
                    BleedingStatus = table.Column<string>(type: "text", nullable: true),
                    BreastfeedingStatus = table.Column<string>(type: "text", nullable: true),
                    UterusCondition = table.Column<string>(type: "text", nullable: true),
                    MentalHealthAssessment = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    FamilyPlanningCounseling = table.Column<string>(type: "text", nullable: true),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PNCVisits", x => x.PNCVisitID);
                    table.ForeignKey(
                        name: "FK_PNCVisits_Deliveries_DeliveryID",
                        column: x => x.DeliveryID,
                        principalTable: "Deliveries",
                        principalColumn: "DeliveryID");
                    table.ForeignKey(
                        name: "FK_PNCVisits_PatientVisits_PatientVisitID",
                        column: x => x.PatientVisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PNCVisits_Pregnancies_PregnancyID",
                        column: x => x.PregnancyID,
                        principalTable: "Pregnancies",
                        principalColumn: "PregnancyID",
                        onDelete: ReferentialAction.Cascade);
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
                    TechnicianName = table.Column<string>(type: "text", nullable: false),
                    ResultDescription = table.Column<string>(type: "text", nullable: false),
                    ResultDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoryResults", x => x.ResultID);
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
                name: "RadiologyPayments",
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
                    table.PrimaryKey("PK_RadiologyPayments", x => x.RadiologyPaymentID);
                    table.ForeignKey(
                        name: "FK_RadiologyPayments_RadiologyCashiers_RadiologyCashierID",
                        column: x => x.RadiologyCashierID,
                        principalTable: "RadiologyCashiers",
                        principalColumn: "RadiologyCashierID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadiologyPayments_RadiologyRequests_RadiologyRequestID",
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
                    RadiologyTechnicianName = table.Column<string>(type: "text", nullable: false),
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
                name: "NeonatalCares",
                columns: table => new
                {
                    NeonatalCareID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientID = table.Column<int>(type: "integer", nullable: false),
                    ChildBirthID = table.Column<int>(type: "integer", nullable: true),
                    PatientVisitID = table.Column<int>(type: "integer", nullable: true),
                    AssessmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AgeInDays = table.Column<int>(type: "integer", nullable: true),
                    GeneralCondition = table.Column<string>(type: "text", nullable: true),
                    FeedingStatus = table.Column<string>(type: "text", nullable: true),
                    BreastfeedingStatus = table.Column<string>(type: "text", nullable: true),
                    Temperature = table.Column<string>(type: "text", nullable: true),
                    RespiratoryRate = table.Column<string>(type: "text", nullable: true),
                    HeartRate = table.Column<string>(type: "text", nullable: true),
                    OxygenSaturation = table.Column<string>(type: "text", nullable: true),
                    JaundiceStatus = table.Column<string>(type: "text", nullable: true),
                    CordCondition = table.Column<string>(type: "text", nullable: true),
                    Weight = table.Column<string>(type: "text", nullable: true),
                    Length = table.Column<string>(type: "text", nullable: true),
                    HeadCircumference = table.Column<string>(type: "text", nullable: true),
                    ResuscitationRequired = table.Column<bool>(type: "boolean", nullable: false),
                    NeonatalProblems = table.Column<string>(type: "text", nullable: true),
                    Treatment = table.Column<string>(type: "text", nullable: true),
                    CounselingProvided = table.Column<string>(type: "text", nullable: true),
                    ReferralRequired = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RecordedByUserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NeonatalCares", x => x.NeonatalCareID);
                    table.ForeignKey(
                        name: "FK_NeonatalCares_ChildBirths_ChildBirthID",
                        column: x => x.ChildBirthID,
                        principalTable: "ChildBirths",
                        principalColumn: "ChildBirthID");
                    table.ForeignKey(
                        name: "FK_NeonatalCares_PatientVisits_PatientVisitID",
                        column: x => x.PatientVisitID,
                        principalTable: "PatientVisits",
                        principalColumn: "VisitID");
                    table.ForeignKey(
                        name: "FK_NeonatalCares_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "PatientID",
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
                name: "IX_AidStoreManagers_AidPharmacyID",
                table: "AidStoreManagers",
                column: "AidPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreManagers_ManagerID",
                table: "AidStoreManagers",
                column: "ManagerID");

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
                name: "IX_AidStoreTransfers_AidStoreManagerID",
                table: "AidStoreTransfers",
                column: "AidStoreManagerID");

            migrationBuilder.CreateIndex(
                name: "IX_AidStoreTransfers_BranchPharmacyID",
                table: "AidStoreTransfers",
                column: "BranchPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_Allergies_PatientID",
                table: "Allergies",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_AmbulanceRequests_ReferralID",
                table: "AmbulanceRequests",
                column: "ReferralID");

            migrationBuilder.CreateIndex(
                name: "IX_ANCVisits_PatientVisitID",
                table: "ANCVisits",
                column: "PatientVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_ANCVisits_PregnancyID",
                table: "ANCVisits",
                column: "PregnancyID");

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
                name: "IX_AsthmaManagements_PatientID",
                table: "AsthmaManagements",
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
                name: "IX_BirthPreparednessPlans_PregnancyID",
                table: "BirthPreparednessPlans",
                column: "PregnancyID");

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
                name: "IX_CentralStoreManagers_CentralPharmacyID",
                table: "CentralStoreManagers",
                column: "CentralPharmacyID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreManagers_ManagerID",
                table: "CentralStoreManagers",
                column: "ManagerID");

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
                name: "IX_CentralStoreTransfers_CentralStoreManagerID",
                table: "CentralStoreTransfers",
                column: "CentralStoreManagerID");

            migrationBuilder.CreateIndex(
                name: "IX_CentralStoreTransfers_MedicineID",
                table: "CentralStoreTransfers",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_ChildBirths_ChildPatientID",
                table: "ChildBirths",
                column: "ChildPatientID");

            migrationBuilder.CreateIndex(
                name: "IX_ChildBirths_DeliveryID",
                table: "ChildBirths",
                column: "DeliveryID");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityScreenings_HouseholdID",
                table: "CommunityScreenings",
                column: "HouseholdID");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_DoctorID",
                table: "Consultations",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_VisitID",
                table: "Consultations",
                column: "VisitID");

            migrationBuilder.CreateIndex(
                name: "IX_CounterReferrals_ReferralID",
                table: "CounterReferrals",
                column: "ReferralID");

            migrationBuilder.CreateIndex(
                name: "IX_DefaulterTracings_HouseholdID",
                table: "DefaulterTracings",
                column: "HouseholdID");

            migrationBuilder.CreateIndex(
                name: "IX_DefaulterTracings_PatientID",
                table: "DefaulterTracings",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_LaborRecordID",
                table: "Deliveries",
                column: "LaborRecordID");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_PregnancyID",
                table: "Deliveries",
                column: "PregnancyID");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryComplications_DeliveryID",
                table: "DeliveryComplications",
                column: "DeliveryID");

            migrationBuilder.CreateIndex(
                name: "IX_DevelopmentAssessments_PatientID",
                table: "DevelopmentAssessments",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_DevelopmentAssessments_PatientVisitID",
                table: "DevelopmentAssessments",
                column: "PatientVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_DiabetesManagements_PatientID",
                table: "DiabetesManagements",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_Diagnoses_ConsultationID",
                table: "Diagnoses",
                column: "ConsultationID");

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
                name: "IX_Doctors_UserID",
                table: "Doctors",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyMedicalHistories_PatientID",
                table: "FamilyMedicalHistories",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyMembers_FamilyId",
                table: "FamilyMembers",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyMembers_PatientId",
                table: "FamilyMembers",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyPlannings_PatientID",
                table: "FamilyPlannings",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyPlannings_PregnancyID",
                table: "FamilyPlannings",
                column: "PregnancyID");

            migrationBuilder.CreateIndex(
                name: "IX_GrowthMonitorings_PatientID",
                table: "GrowthMonitorings",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_GrowthMonitorings_PatientVisitID",
                table: "GrowthMonitorings",
                column: "PatientVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_HepatitisManagements_PatientID",
                table: "HepatitisManagements",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_HighRiskPregnancies_PregnancyID",
                table: "HighRiskPregnancies",
                column: "PregnancyID");

            migrationBuilder.CreateIndex(
                name: "IX_HIVCares_PatientID",
                table: "HIVCares",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_HomeVisits_HouseholdID",
                table: "HomeVisits",
                column: "HouseholdID");

            migrationBuilder.CreateIndex(
                name: "IX_HouseholdMembers_HouseholdID",
                table: "HouseholdMembers",
                column: "HouseholdID");

            migrationBuilder.CreateIndex(
                name: "IX_HouseholdMembers_PatientID",
                table: "HouseholdMembers",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_HypertensionManagements_PatientID",
                table: "HypertensionManagements",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_Immunizations_PatientID",
                table: "Immunizations",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_Immunizations_PatientVisitID",
                table: "Immunizations",
                column: "PatientVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_IMNCIEncounters_PatientID",
                table: "IMNCIEncounters",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_IMNCIEncounters_PatientVisitID",
                table: "IMNCIEncounters",
                column: "PatientVisitID");

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
                name: "IX_LaborRecords_PregnancyID",
                table: "LaborRecords",
                column: "PregnancyID");

            migrationBuilder.CreateIndex(
                name: "IX_MainPharmacyManagers_UserID",
                table: "MainPharmacyManagers",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalHistories_DoctorID",
                table: "MedicalHistories",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalHistories_PatientID",
                table: "MedicalHistories",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_MentalHealthCares_PatientID",
                table: "MentalHealthCares",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_NeonatalCares_ChildBirthID",
                table: "NeonatalCares",
                column: "ChildBirthID");

            migrationBuilder.CreateIndex(
                name: "IX_NeonatalCares_PatientID",
                table: "NeonatalCares",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_NeonatalCares_PatientVisitID",
                table: "NeonatalCares",
                column: "PatientVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_Nurses_ClinicalDepartmentID",
                table: "Nurses",
                column: "ClinicalDepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Nurses_UserID",
                table: "Nurses",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_NutritionAssessments_PatientID",
                table: "NutritionAssessments",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_NutritionAssessments_PatientVisitID",
                table: "NutritionAssessments",
                column: "PatientVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_FaydaFIN",
                table: "Patients",
                column: "FaydaFIN",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Patients_MRN",
                table: "Patients",
                column: "MRN",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Patients_Phone",
                table: "Patients",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_PatientVisits_PatientID",
                table: "PatientVisits",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientVisits_VisitDate",
                table: "PatientVisits",
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
                name: "IX_PhysicalExaminations_ConsultationID",
                table: "PhysicalExaminations",
                column: "ConsultationID");

            migrationBuilder.CreateIndex(
                name: "IX_PNCVisits_DeliveryID",
                table: "PNCVisits",
                column: "DeliveryID");

            migrationBuilder.CreateIndex(
                name: "IX_PNCVisits_PatientVisitID",
                table: "PNCVisits",
                column: "PatientVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_PNCVisits_PregnancyID",
                table: "PNCVisits",
                column: "PregnancyID");

            migrationBuilder.CreateIndex(
                name: "IX_Pregnancies_PatientID",
                table: "Pregnancies",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyLaboratoryOrders_ANCVisitID",
                table: "PregnancyLaboratoryOrders",
                column: "ANCVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyLaboratoryOrders_LaboratoryTestTypeID",
                table: "PregnancyLaboratoryOrders",
                column: "LaboratoryTestTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyLaboratoryOrders_PregnancyID",
                table: "PregnancyLaboratoryOrders",
                column: "PregnancyID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyMedications_MedicineID",
                table: "PregnancyMedications",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyMedications_PregnancyID",
                table: "PregnancyMedications",
                column: "PregnancyID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyRegistrations_PatientID",
                table: "PregnancyRegistrations",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyRegistrations_PregnancyID",
                table: "PregnancyRegistrations",
                column: "PregnancyID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyRiskAssessments_ANCVisitID",
                table: "PregnancyRiskAssessments",
                column: "ANCVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyRiskAssessments_PregnancyID",
                table: "PregnancyRiskAssessments",
                column: "PregnancyID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyUltrasounds_ANCVisitID",
                table: "PregnancyUltrasounds",
                column: "ANCVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_PregnancyUltrasounds_PregnancyID",
                table: "PregnancyUltrasounds",
                column: "PregnancyID");

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
                name: "IX_ProblemLists_PatientID",
                table: "ProblemLists",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyCashiers_UserID",
                table: "RadiologyCashiers",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyPayments_RadiologyCashierID",
                table: "RadiologyPayments",
                column: "RadiologyCashierID");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyPayments_RadiologyRequestID",
                table: "RadiologyPayments",
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
                name: "IX_ReferralFeedbacks_ReferralID",
                table: "ReferralFeedbacks",
                column: "ReferralID");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_PatientID",
                table: "Referrals",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_PatientVisitID",
                table: "Referrals",
                column: "PatientVisitID");

            migrationBuilder.CreateIndex(
                name: "IX_ReferralServices_ReferralID",
                table: "ReferralServices",
                column: "ReferralID");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_WardID",
                table: "Rooms",
                column: "WardID");

            migrationBuilder.CreateIndex(
                name: "IX_SocialHistories_PatientID",
                table: "SocialHistories",
                column: "PatientID");

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
                name: "IX_TuberculosisManagements_PatientID",
                table: "TuberculosisManagements",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleID",
                table: "UserRoles",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserID_RoleID",
                table: "UserRoles",
                columns: new[] { "UserID", "RoleID" },
                unique: true);

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
                name: "Allergies");

            migrationBuilder.DropTable(
                name: "AmbulanceRequests");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "AsthmaManagements");

            migrationBuilder.DropTable(
                name: "BillItems");

            migrationBuilder.DropTable(
                name: "BirthPreparednessPlans");

            migrationBuilder.DropTable(
                name: "BranchInventories");

            migrationBuilder.DropTable(
                name: "CentralStoreInventories");

            migrationBuilder.DropTable(
                name: "CentralStoreRequestDetails");

            migrationBuilder.DropTable(
                name: "CentralStoreTransferDetails");

            migrationBuilder.DropTable(
                name: "CommunityScreenings");

            migrationBuilder.DropTable(
                name: "CounterReferrals");

            migrationBuilder.DropTable(
                name: "DefaulterTracings");

            migrationBuilder.DropTable(
                name: "DeliveryComplications");

            migrationBuilder.DropTable(
                name: "DevelopmentAssessments");

            migrationBuilder.DropTable(
                name: "DiabetesManagements");

            migrationBuilder.DropTable(
                name: "Diagnoses");

            migrationBuilder.DropTable(
                name: "DispenseMedicineDetails");

            migrationBuilder.DropTable(
                name: "FamilyMedicalHistories");

            migrationBuilder.DropTable(
                name: "FamilyMembers");

            migrationBuilder.DropTable(
                name: "FamilyPlannings");

            migrationBuilder.DropTable(
                name: "GrowthMonitorings");

            migrationBuilder.DropTable(
                name: "HepatitisManagements");

            migrationBuilder.DropTable(
                name: "HighRiskPregnancies");

            migrationBuilder.DropTable(
                name: "HIVCares");

            migrationBuilder.DropTable(
                name: "HomeVisits");

            migrationBuilder.DropTable(
                name: "HouseholdMembers");

            migrationBuilder.DropTable(
                name: "HypertensionManagements");

            migrationBuilder.DropTable(
                name: "Immunizations");

            migrationBuilder.DropTable(
                name: "IMNCIEncounters");

            migrationBuilder.DropTable(
                name: "LaboratoryPayments");

            migrationBuilder.DropTable(
                name: "LaboratoryResults");

            migrationBuilder.DropTable(
                name: "LaboratoryTechnicians");

            migrationBuilder.DropTable(
                name: "MedicalHistories");

            migrationBuilder.DropTable(
                name: "MentalHealthCares");

            migrationBuilder.DropTable(
                name: "NeonatalCares");

            migrationBuilder.DropTable(
                name: "NutritionAssessments");

            migrationBuilder.DropTable(
                name: "OutreachActivities");

            migrationBuilder.DropTable(
                name: "PaymentHospitals");

            migrationBuilder.DropTable(
                name: "PharmacyPayments");

            migrationBuilder.DropTable(
                name: "PhysicalExaminations");

            migrationBuilder.DropTable(
                name: "PNCVisits");

            migrationBuilder.DropTable(
                name: "PregnancyLaboratoryOrders");

            migrationBuilder.DropTable(
                name: "PregnancyMedications");

            migrationBuilder.DropTable(
                name: "PregnancyRegistrations");

            migrationBuilder.DropTable(
                name: "PregnancyRiskAssessments");

            migrationBuilder.DropTable(
                name: "PregnancyUltrasounds");

            migrationBuilder.DropTable(
                name: "PrescriptionDetails");

            migrationBuilder.DropTable(
                name: "ProblemLists");

            migrationBuilder.DropTable(
                name: "RadiologyPayments");

            migrationBuilder.DropTable(
                name: "RadiologyResults");

            migrationBuilder.DropTable(
                name: "RadiologyTechnicians");

            migrationBuilder.DropTable(
                name: "Receptionists");

            migrationBuilder.DropTable(
                name: "ReferralFeedbacks");

            migrationBuilder.DropTable(
                name: "ReferralServices");

            migrationBuilder.DropTable(
                name: "SocialHistories");

            migrationBuilder.DropTable(
                name: "SuperAdmin");

            migrationBuilder.DropTable(
                name: "Triages");

            migrationBuilder.DropTable(
                name: "TuberculosisManagements");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Beds");

            migrationBuilder.DropTable(
                name: "AidStoreTransfers");

            migrationBuilder.DropTable(
                name: "CentralStoreTransfers");

            migrationBuilder.DropTable(
                name: "DispenseMedicines");

            migrationBuilder.DropTable(
                name: "Families");

            migrationBuilder.DropTable(
                name: "Households");

            migrationBuilder.DropTable(
                name: "LaboratoryCashiers");

            migrationBuilder.DropTable(
                name: "LaboratoryTests");

            migrationBuilder.DropTable(
                name: "ChildBirths");

            migrationBuilder.DropTable(
                name: "Bills");

            migrationBuilder.DropTable(
                name: "PharmacyCashiers");

            migrationBuilder.DropTable(
                name: "ANCVisits");

            migrationBuilder.DropTable(
                name: "RadiologyCashiers");

            migrationBuilder.DropTable(
                name: "RadiologyRequests");

            migrationBuilder.DropTable(
                name: "Referrals");

            migrationBuilder.DropTable(
                name: "Nurses");

            migrationBuilder.DropTable(
                name: "TriageDepartments");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropTable(
                name: "AidStoreManagers");

            migrationBuilder.DropTable(
                name: "AidStoreRequests");

            migrationBuilder.DropTable(
                name: "CentralStoreManagers");

            migrationBuilder.DropTable(
                name: "CentralStoreRequests");

            migrationBuilder.DropTable(
                name: "Medicines");

            migrationBuilder.DropTable(
                name: "Prescriptions");

            migrationBuilder.DropTable(
                name: "LaboratoryTestTypes");

            migrationBuilder.DropTable(
                name: "Deliveries");

            migrationBuilder.DropTable(
                name: "Cashiers");

            migrationBuilder.DropTable(
                name: "RadiologyTestTypes");

            migrationBuilder.DropTable(
                name: "Wards");

            migrationBuilder.DropTable(
                name: "AidStorePharmacies");

            migrationBuilder.DropTable(
                name: "CentralStorePharmacies");

            migrationBuilder.DropTable(
                name: "MainPharmacyManagers");

            migrationBuilder.DropTable(
                name: "Pharmacists");

            migrationBuilder.DropTable(
                name: "Consultations");

            migrationBuilder.DropTable(
                name: "LaboratorySections");

            migrationBuilder.DropTable(
                name: "LaborRecords");

            migrationBuilder.DropTable(
                name: "RadiologyDepartments");

            migrationBuilder.DropTable(
                name: "BranchPharmacies");

            migrationBuilder.DropTable(
                name: "Doctors");

            migrationBuilder.DropTable(
                name: "PatientVisits");

            migrationBuilder.DropTable(
                name: "Pregnancies");

            migrationBuilder.DropTable(
                name: "ClinicalDepartments");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Patients");
        }
    }
}
