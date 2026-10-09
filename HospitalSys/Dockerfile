# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore

RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /src

COPY --from=build /app/publish .

EXPOSE 5000

ENTRYPOINT ["dotnet", "HospitalSys.dll"]