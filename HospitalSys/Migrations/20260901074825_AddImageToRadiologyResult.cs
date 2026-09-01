using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalSys.Migrations
{
    /// <inheritdoc />
    public partial class AddImageToRadiologyResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageName",
                table: "RadiologyResults",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagePath",
                table: "RadiologyResults",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageName",
                table: "RadiologyResults");

            migrationBuilder.DropColumn(
                name: "ImagePath",
                table: "RadiologyResults");
        }
    }
}
