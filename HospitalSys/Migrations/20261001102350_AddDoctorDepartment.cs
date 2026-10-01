using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalSys.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorDepartment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DoctorDepartments",
                columns: table => new
                {
                    DoctorID = table.Column<int>(type: "integer", nullable: false),
                    ClinicalDepartmentID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorDepartments", x => new { x.DoctorID, x.ClinicalDepartmentID });
                    table.ForeignKey(
                        name: "FK_DoctorDepartments_ClinicalDepartments_ClinicalDepartmentID",
                        column: x => x.ClinicalDepartmentID,
                        principalTable: "ClinicalDepartments",
                        principalColumn: "ClinicalDepartmentID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DoctorDepartments_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DoctorDepartments_ClinicalDepartmentID",
                table: "DoctorDepartments",
                column: "ClinicalDepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorDepartments_DoctorID",
                table: "DoctorDepartments",
                column: "DoctorID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DoctorDepartments");
        }
    }
}
