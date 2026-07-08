# Usar la imagen oficial de .NET SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar todo el contenido del repo
COPY . .

# Restaurar y publicar específicamente el proyecto de tu API
RUN dotnet restore "backend/GestorComprobantes.API/GestorComprobantes.API.csproj"
RUN dotnet publish "backend/GestorComprobantes.API/GestorComprobantes.API.csproj" -c Release -o /app/publish

# Imagen final ligera
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "GestorComprobantes.API.dll"]