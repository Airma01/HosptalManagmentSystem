using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HospitalSys.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DepartmentPermissions",
                columns: table => new
                {
                    DepartmentPermissionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClinicalDepartmentID = table.Column<int>(type: "integer", nullable: false),
                    Module = table.Column<int>(type: "integer", nullable: false),
                    CanRead = table.Column<bool>(type: "boolean", nullable: false),
                    CanCreate = table.Column<bool>(type: "boolean", nullable: false),
                    CanUpdate = table.Column<bool>(type: "boolean", nullable: false),
                    CanDelete = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepartmentPermissions", x => x.DepartmentPermissionID);
                    table.ForeignKey(
                        name: "FK_DepartmentPermissions_ClinicalDepartments_ClinicalDepartmen~",
                        column: x => x.ClinicalDepartmentID,
                        principalTable: "ClinicalDepartments",
                        principalColumn: "ClinicalDepartmentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentPermissions_ClinicalDepartmentID_Module",
                table: "DepartmentPermissions",
                columns: new[] { "ClinicalDepartmentID", "Module" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DepartmentPermissions");
        }
    }
}
