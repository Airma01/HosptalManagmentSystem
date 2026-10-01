using HospitalSys.Configuration;
using HospitalSys.Data;
using HospitalSys.Middleware;
using HospitalSys.RateLimiting;
using HospitalSys.Services;
using HospitalSys.Services.AI;
using HospitalSys.Services.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// --- Google Gemini AI Clinical Assistant ---
// Prefer env GEMINI_API_KEY or user-secrets; never commit the key.
builder.Services.Configure<GeminiAIOptions>(options =>
{
    builder.Configuration.GetSection(GeminiAIOptions.SectionName).Bind(options);
    var envKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
    if (!string.IsNullOrWhiteSpace(envKey))
        options.ApiKey = envKey;
});
builder.Services.AddHttpClient<IGeminiAIService, GeminiAIService>();
builder.Services.AddScoped<IClinicalContextService, ClinicalContextService>();

// --- Security monitoring ---
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<ISecurityEventService, SecurityEventService>();
builder.Services.AddScoped<DoctorDepartmentAuthorizationService>();
builder.Services.AddHospitalRateLimiting();

// Forwarded headers (enable UseForwardedHeaders only behind a trusted reverse proxy)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

// JWT from cookie "jwt"
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "HospitalSys",
            ValidAudience = "HospitalSysClient",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("hkfjhdkfjhddkjfhsdkjfhkjfjliieorieh.lalaklewkewikk"))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Cookies["jwt"];
                if (!string.IsNullOrEmpty(token))
                    context.Token = token;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Jwt-Policy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Radiology image uploads (multipart)
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 20 * 1024 * 1024; // 20 MB
    options.ValueLengthLimit = int.MaxValue;
    options.MemoryBufferThreshold = int.MaxValue;
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 20 * 1024 * 1024;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

var app = builder.Build();

// Ensure folders exist for uploads
var wwwroot = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(wwwroot);
Directory.CreateDirectory(Path.Combine(wwwroot, "uploads", "radiology"));

// If deployed behind a trusted reverse proxy, uncomment:
// app.UseForwardedHeaders();

// Pipeline order matters
app.UseCors("Jwt-Policy");
app.UseStaticFiles();          // serves /uploads/radiology/...

// Security pipeline
app.UseMiddleware<IpBlockMiddleware>();           // 1. Blocked IP → 403
app.UseHospitalRateLimiting();                    // 2. Rate limiter → 429
app.UseMiddleware<ApiRequestLoggingMiddleware>(); // 3. Log after response

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();