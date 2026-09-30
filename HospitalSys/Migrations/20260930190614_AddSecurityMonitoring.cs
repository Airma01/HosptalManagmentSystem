using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HospitalSys.Migrations
{
    public partial class AddSecurityMonitoring : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApiRequestLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    Endpoint = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    HttpMethod = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    StatusCode = table.Column<int>(type: "integer", nullable: false),
                    ResponseTimeMs = table.Column<long>(type: "bigint", nullable: false),
                    WasRateLimited = table.Column<bool>(type: "boolean", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiRequestLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    AuditLogId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Module = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EntityName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EntityId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Endpoint = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    HttpMethod = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.AuditLogId);
                });

            migrationBuilder.CreateTable(
                name: "BlockedIpAddresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BlockedByUserId = table.Column<int>(type: "integer", nullable: true),
                    BlockedByUsername = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BlockedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    UnblockedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UnblockedByUserId = table.Column<int>(type: "integer", nullable: true),
                    UnblockedByUsername = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockedIpAddresses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SecurityEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventType = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    Endpoint = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityEvents", x => x.Id);
                });

            // Indexes
            migrationBuilder.CreateIndex(name: "IX_ApiRequestLogs_Endpoint", table: "ApiRequestLogs", column: "Endpoint");
            migrationBuilder.CreateIndex(name: "IX_ApiRequestLogs_IpAddress", table: "ApiRequestLogs", column: "IpAddress");
            migrationBuilder.CreateIndex(name: "IX_ApiRequestLogs_StatusCode", table: "ApiRequestLogs", column: "StatusCode");
            migrationBuilder.CreateIndex(name: "IX_ApiRequestLogs_Timestamp", table: "ApiRequestLogs", column: "Timestamp");
            migrationBuilder.CreateIndex(name: "IX_ApiRequestLogs_UserId", table: "ApiRequestLogs", column: "UserId");
            migrationBuilder.CreateIndex(name: "IX_ApiRequestLogs_WasRateLimited", table: "ApiRequestLogs", column: "WasRateLimited");

            migrationBuilder.CreateIndex(name: "IX_AuditLogs_Action", table: "AuditLogs", column: "Action");
            migrationBuilder.CreateIndex(name: "IX_AuditLogs_IpAddress", table: "AuditLogs", column: "IpAddress");
            migrationBuilder.CreateIndex(name: "IX_AuditLogs_Module", table: "AuditLogs", column: "Module");
            migrationBuilder.CreateIndex(name: "IX_AuditLogs_Status", table: "AuditLogs", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_AuditLogs_Timestamp", table: "AuditLogs", column: "Timestamp");
            migrationBuilder.CreateIndex(name: "IX_AuditLogs_UserId", table: "AuditLogs", column: "UserId");

            migrationBuilder.CreateIndex(name: "IX_BlockedIpAddresses_IpAddress", table: "BlockedIpAddresses", column: "IpAddress");
            migrationBuilder.CreateIndex(name: "IX_BlockedIpAddresses_IpAddress_IsActive", table: "BlockedIpAddresses", columns: new[] { "IpAddress", "IsActive" });
            migrationBuilder.CreateIndex(name: "IX_BlockedIpAddresses_IsActive", table: "BlockedIpAddresses", column: "IsActive");

            migrationBuilder.CreateIndex(name: "IX_SecurityEvents_EventType", table: "SecurityEvents", column: "EventType");
            migrationBuilder.CreateIndex(name: "IX_SecurityEvents_IpAddress", table: "SecurityEvents", column: "IpAddress");
            migrationBuilder.CreateIndex(name: "IX_SecurityEvents_Severity", table: "SecurityEvents", column: "Severity");
            migrationBuilder.CreateIndex(name: "IX_SecurityEvents_Timestamp", table: "SecurityEvents", column: "Timestamp");
            migrationBuilder.CreateIndex(name: "IX_SecurityEvents_UserId", table: "SecurityEvents", column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ApiRequestLogs");
            migrationBuilder.DropTable(name: "AuditLogs");
            migrationBuilder.DropTable(name: "BlockedIpAddresses");
            migrationBuilder.DropTable(name: "SecurityEvents");
        }
    }
}