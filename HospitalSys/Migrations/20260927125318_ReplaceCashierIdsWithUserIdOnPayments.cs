using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalSys.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceCashierIdsWithUserIdOnPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LaboratoryPayments_LaboratoryCashiers_LaboratoryCashierID",
                table: "LaboratoryPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentHospitals_Cashiers_CashierID",
                table: "PaymentHospitals");

            migrationBuilder.DropForeignKey(
                name: "FK_PharmacyPayments_PharmacyCashiers_PharmacyCashierID",
                table: "PharmacyPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_RadiologyPayments_RadiologyCashiers_RadiologyCashierID",
                table: "RadiologyPayments");

            migrationBuilder.AlterColumn<int>(
                name: "RadiologyCashierID",
                table: "RadiologyPayments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "UserID",
                table: "RadiologyPayments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "PharmacyCashierID",
                table: "PharmacyPayments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "UserID",
                table: "PharmacyPayments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "CashierID",
                table: "PaymentHospitals",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "UserID",
                table: "PaymentHospitals",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "LaboratoryCashierID",
                table: "LaboratoryPayments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "UserID",
                table: "LaboratoryPayments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyPayments_UserID",
                table: "RadiologyPayments",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_PharmacyPayments_UserID",
                table: "PharmacyPayments",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentHospitals_UserID",
                table: "PaymentHospitals",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoryPayments_UserID",
                table: "LaboratoryPayments",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_LaboratoryPayments_LaboratoryCashiers_LaboratoryCashierID",
                table: "LaboratoryPayments",
                column: "LaboratoryCashierID",
                principalTable: "LaboratoryCashiers",
                principalColumn: "LaboratoryCashierID");

            migrationBuilder.AddForeignKey(
                name: "FK_LaboratoryPayments_Users_UserID",
                table: "LaboratoryPayments",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentHospitals_Cashiers_CashierID",
                table: "PaymentHospitals",
                column: "CashierID",
                principalTable: "Cashiers",
                principalColumn: "CashierID");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentHospitals_Users_UserID",
                table: "PaymentHospitals",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PharmacyPayments_PharmacyCashiers_PharmacyCashierID",
                table: "PharmacyPayments",
                column: "PharmacyCashierID",
                principalTable: "PharmacyCashiers",
                principalColumn: "PharmacyCashierID");

            migrationBuilder.AddForeignKey(
                name: "FK_PharmacyPayments_Users_UserID",
                table: "PharmacyPayments",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RadiologyPayments_RadiologyCashiers_RadiologyCashierID",
                table: "RadiologyPayments",
                column: "RadiologyCashierID",
                principalTable: "RadiologyCashiers",
                principalColumn: "RadiologyCashierID");

            migrationBuilder.AddForeignKey(
                name: "FK_RadiologyPayments_Users_UserID",
                table: "RadiologyPayments",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LaboratoryPayments_LaboratoryCashiers_LaboratoryCashierID",
                table: "LaboratoryPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_LaboratoryPayments_Users_UserID",
                table: "LaboratoryPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentHospitals_Cashiers_CashierID",
                table: "PaymentHospitals");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentHospitals_Users_UserID",
                table: "PaymentHospitals");

            migrationBuilder.DropForeignKey(
                name: "FK_PharmacyPayments_PharmacyCashiers_PharmacyCashierID",
                table: "PharmacyPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_PharmacyPayments_Users_UserID",
                table: "PharmacyPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_RadiologyPayments_RadiologyCashiers_RadiologyCashierID",
                table: "RadiologyPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_RadiologyPayments_Users_UserID",
                table: "RadiologyPayments");

            migrationBuilder.DropIndex(
                name: "IX_RadiologyPayments_UserID",
                table: "RadiologyPayments");

            migrationBuilder.DropIndex(
                name: "IX_PharmacyPayments_UserID",
                table: "PharmacyPayments");

            migrationBuilder.DropIndex(
                name: "IX_PaymentHospitals_UserID",
                table: "PaymentHospitals");

            migrationBuilder.DropIndex(
                name: "IX_LaboratoryPayments_UserID",
                table: "LaboratoryPayments");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "RadiologyPayments");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "PharmacyPayments");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "PaymentHospitals");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "LaboratoryPayments");

            migrationBuilder.AlterColumn<int>(
                name: "RadiologyCashierID",
                table: "RadiologyPayments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PharmacyCashierID",
                table: "PharmacyPayments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CashierID",
                table: "PaymentHospitals",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "LaboratoryCashierID",
                table: "LaboratoryPayments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LaboratoryPayments_LaboratoryCashiers_LaboratoryCashierID",
                table: "LaboratoryPayments",
                column: "LaboratoryCashierID",
                principalTable: "LaboratoryCashiers",
                principalColumn: "LaboratoryCashierID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentHospitals_Cashiers_CashierID",
                table: "PaymentHospitals",
                column: "CashierID",
                principalTable: "Cashiers",
                principalColumn: "CashierID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PharmacyPayments_PharmacyCashiers_PharmacyCashierID",
                table: "PharmacyPayments",
                column: "PharmacyCashierID",
                principalTable: "PharmacyCashiers",
                principalColumn: "PharmacyCashierID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RadiologyPayments_RadiologyCashiers_RadiologyCashierID",
                table: "RadiologyPayments",
                column: "RadiologyCashierID",
                principalTable: "RadiologyCashiers",
                principalColumn: "RadiologyCashierID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
