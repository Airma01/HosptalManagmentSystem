using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalSys.Migrations
{
    /// <inheritdoc />
    public partial class AddSourceColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        migrationBuilder.AddColumn<string>(
        name: "Source",
        table: "CentralStoreInventories",
        nullable: false,          // Matches your model (non-nullable)
        defaultValue: "");  
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
