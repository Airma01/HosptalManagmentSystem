using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalSys.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointmentClinicalDepartment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClinicalDepartmentID",
                table: "Appointments",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ClinicalDepartmentID",
                table: "Appointments",
                column: "ClinicalDepartmentID");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_ClinicalDepartments_ClinicalDepartmentID",
                table: "Appointments",
                column: "ClinicalDepartmentID",
                principalTable: "ClinicalDepartments",
                principalColumn: "ClinicalDepartmentID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_ClinicalDepartments_ClinicalDepartmentID",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_ClinicalDepartmentID",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "ClinicalDepartmentID",
                table: "Appointments");
        }
    }
}
