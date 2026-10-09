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

// Load .env for local development (no-op if file is missing).
// Production / Docker should inject secrets via environment variables — do not bake .env into images.
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    DotNetEnv.Env.Load(envPath);
}
else
{
    // Fallback for some hosting / IDE scenarios
    var altPath = Path.Combine(AppContext.BaseDirectory, ".env");
    if (File.Exists(altPath))
        DotNetEnv.Env.Load(altPath);
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// --- Database connection (environment-driven) ---
// Prefer ConnectionStrings__Default, or construct from DB_* variables.
var connectionString = ResolveConnectionString(builder.Configuration);
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is not configured. " +
        "Set ConnectionStrings__Default or DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.");
}

// --- JWT settings (fail fast if secret is missing) ---
var jwtSettings = new JwtSettings();
builder.Configuration.GetSection(JwtSettings.SectionName).Bind(jwtSettings);

// Environment variable overrides (Docker / .env)
var envSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["Jwt:Secret"];
if (!string.IsNullOrWhiteSpace(envSecret))
    jwtSettings.Secret = envSecret;

var envIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
if (!string.IsNullOrWhiteSpace(envIssuer))
    jwtSettings.Issuer = envIssuer;

var envAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
if (!string.IsNullOrWhiteSpace(envAudience))
    jwtSettings.Audience = envAudience;

var envCookieName = Environment.GetEnvironmentVariable("JWT_COOKIE_NAME");
if (!string.IsNullOrWhiteSpace(envCookieName))
    jwtSettings.CookieName = envCookieName;

if (int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRATION_MINUTES"), out var expMinutes) && expMinutes > 0)
    jwtSettings.ExpirationMinutes = expMinutes;

var envCookieSecure = Environment.GetEnvironmentVariable("JWT_COOKIE_SECURE");
if (!string.IsNullOrWhiteSpace(envCookieSecure))
    jwtSettings.CookieSecure = envCookieSecure.Equals("true", StringComparison.OrdinalIgnoreCase)
        || envCookieSecure == "1";

var envCookieSameSite = Environment.GetEnvironmentVariable("JWT_COOKIE_SAMESITE");
if (!string.IsNullOrWhiteSpace(envCookieSameSite))
    jwtSettings.CookieSameSite = envCookieSameSite;

var envCookieDomain = Environment.GetEnvironmentVariable("JWT_COOKIE_DOMAIN");
if (envCookieDomain != null)
    jwtSettings.CookieDomain = string.IsNullOrWhiteSpace(envCookieDomain) ? null : envCookieDomain;

if (string.IsNullOrWhiteSpace(jwtSettings.Secret))
{
    throw new InvalidOperationException(
        "JWT Secret is not configured. Set JWT_SECRET (or Jwt:Secret) to a long random secret. " +
        "Do not use a default/hardcoded key.");
}

if (jwtSettings.Secret.Length < 32)
{
    throw new InvalidOperationException(
        "JWT Secret must be at least 32 characters for adequate HMAC-SHA256 strength.");
}

builder.Services.Configure<JwtSettings>(opts =>
{
    opts.Secret = jwtSettings.Secret;
    opts.Issuer = jwtSettings.Issuer;
    opts.Audience = jwtSettings.Audience;
    opts.ExpirationMinutes = jwtSettings.ExpirationMinutes;
    opts.CookieName = jwtSettings.CookieName;
    opts.CookieSecure = jwtSettings.CookieSecure;
    opts.CookieSameSite = jwtSettings.CookieSameSite;
    opts.CookieDomain = jwtSettings.CookieDomain;
});
builder.Services.AddSingleton<IJwtService, JwtService>();

// --- Google Gemini AI Clinical Assistant ---
// Prefer env GEMINI_API_KEY or user-secrets; never commit the key.
builder.Services.Configure<GeminiAIOptions>(options =>
{
    builder.Configuration.GetSection(GeminiAIOptions.SectionName).Bind(options);
    var envKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
    if (!string.IsNullOrWhiteSpace(envKey))
        options.ApiKey = envKey;
});

// Fail-fast configuration check (mirrors JWT secret handling)
var geminiCheck = new GeminiAIOptions();
builder.Configuration.GetSection(GeminiAIOptions.SectionName).Bind(geminiCheck);
var geminiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? geminiCheck.ApiKey;
if (string.IsNullOrWhiteSpace(geminiKey))
{
    throw new InvalidOperationException(
        "Gemini API key is not configured. " +
        "Set the environment variable GEMINI_API_KEY (or GeminiAI:ApiKey in user-secrets / appsettings). " +
        "Copy HospitalSys/.env.example to HospitalSys/.env and fill in the key for local development.");
}

builder.Services.AddHttpClient<IGeminiAIService, GeminiAIService>();
builder.Services.AddScoped<IClinicalContextService, ClinicalContextService>();

// --- Security monitoring ---
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<ISecurityEventService, SecurityEventService>();
builder.Services.AddScoped<DoctorDepartmentAuthorizationService>();
builder.Services.AddScoped<DepartmentPermissionService>();
builder.Services.AddHospitalRateLimiting();

// Forwarded headers (enable UseForwardedHeaders only behind a trusted reverse proxy)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

// JWT from cookie (name from configuration)
var cookieName = string.IsNullOrWhiteSpace(jwtSettings.CookieName) ? "jwt" : jwtSettings.CookieName;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Cookies[cookieName];
                if (!string.IsNullOrEmpty(token))
                    context.Token = token;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS — explicit origins only (required when using credentials)
var corsOrigins = ResolveCorsOrigins(builder.Configuration);
builder.Services.AddCors(options =>
{
    options.AddPolicy("Jwt-Policy", policy =>
    {
        policy.WithOrigins(corsOrigins)
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

/// <summary>
/// Resolves the PostgreSQL connection string from ConnectionStrings:Default
/// or from discrete DB_* environment variables (Docker-friendly).
/// </summary>
static string? ResolveConnectionString(IConfiguration configuration)
{
    var fromConfig = configuration.GetConnectionString("Default");
    if (!string.IsNullOrWhiteSpace(fromConfig))
        return fromConfig;

    var host = Environment.GetEnvironmentVariable("DB_HOST")
        ?? configuration["DB_HOST"];
    var port = Environment.GetEnvironmentVariable("DB_PORT")
        ?? configuration["DB_PORT"]
        ?? "5432";
    var name = Environment.GetEnvironmentVariable("DB_NAME")
        ?? configuration["DB_NAME"];
    var user = Environment.GetEnvironmentVariable("DB_USER")
        ?? configuration["DB_USER"];
    var password = Environment.GetEnvironmentVariable("DB_PASSWORD")
        ?? configuration["DB_PASSWORD"];

    if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(name)
        || string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(password))
        return null;

    return $"Host={host};Port={port};Database={name};Username={user};Password={password}";
}

/// <summary>
/// CORS origins from CORS_ORIGINS (comma-separated) or fallback to localhost Vite.
/// </summary>
static string[] ResolveCorsOrigins(IConfiguration configuration)
{
    var raw = Environment.GetEnvironmentVariable("CORS_ORIGINS")
        ?? configuration["CORS_ORIGINS"]
        ?? configuration["Cors:Origins"];

    if (!string.IsNullOrWhiteSpace(raw))
    {
        return raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(o => !string.IsNullOrWhiteSpace(o))
            .ToArray();
    }

    return new[] { "http://localhost:5173" };
}