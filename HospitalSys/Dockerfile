# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# Migration stage: SDK and EF CLI
FROM build AS migrate

# Install EF Core CLI if it is not already available
RUN dotnet tool install --global dotnet-ef

ENV PATH="${PATH}:/root/.dotnet/tools"

WORKDIR /src

ENTRYPOINT ["dotnet", "ef"]

# Runtime stage: API only
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /src

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "HospitalSys.dll"]
ENTRYPOINT ["dotnet", "HospitalSys.dll"]
