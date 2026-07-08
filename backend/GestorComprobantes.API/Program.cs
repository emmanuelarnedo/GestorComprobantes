using GestorComprobantes.API.Services;
using Google.Cloud.Firestore;

var builder = WebApplication.CreateBuilder(args);

// Registrar servicios
builder.Services.AddCors(); // Servicio básico
builder.Services.AddControllers();
builder.Services.AddSingleton<FirebaseService>();
builder.Services.AddSingleton(sp => sp.GetRequiredService<FirebaseService>().Db);
builder.Services.AddOpenApi();

var app = builder.Build();

// --- ORDEN CRÍTICO ---
// 1. CORS primero, permite todo origen, método y cabecera
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

// 2. Luego Routing, Auth, etc.
app.UseRouting(); 
app.UseAuthorization();
app.MapControllers();

app.Run();