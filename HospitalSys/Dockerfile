# ============================================================
# HospitalSys API — multi-stage Dockerfile
# Targets: build | migrate | final
# ============================================================

# ---------- Build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY HospitalSys.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# ---------- Migrate (one-shot: applies all EF migrations) ----------
FROM build AS migrate
RUN dotnet tool install --global dotnet-ef --version 10.0.*
ENV PATH="${PATH}:/root/.dotnet/tools"
WORKDIR /src
# Default command: apply migrations (connection string from env)
ENTRYPOINT ["dotnet", "ef", "database", "update", "--project", "HospitalSys.csproj"]

# ---------- Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "HospitalSys.dll"]
