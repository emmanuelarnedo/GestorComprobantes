using GestorComprobantes.API.Services;
using Google.Cloud.Firestore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración del Middleware de CORS (A prueba de balas para Vercel)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.AllowAnyOrigin() // Permite cualquier URL de Vercel temporal o final
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Registrar servicios del framework controlador
builder.Services.AddControllers();

// 2. Registro del FirebaseService central como Singleton
builder.Services.AddSingleton<FirebaseService>();

// 3. Resolución segura de la inyección para FirestoreDb vinculada al Singleton
builder.Services.AddSingleton(sp => 
{
    var firebaseService = sp.GetRequiredService<FirebaseService>();
    return firebaseService.Db; 
});

// OpenAPI (Swagger)
builder.Services.AddOpenApi();

var app = builder.Build();

// 4. Activación de la política CORS (ESTO DEBE IR AQUÍ, ANTES DE MAPCONTROLLERS)
app.UseCors("PermitirFrontend");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection(); // <-- Mantenemos esto comentado para que Render no falle

app.UseAuthorization();

app.MapControllers();

app.Run();