using GestorComprobantes.API.Services;
using Google.Cloud.Firestore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Registrar controladores
builder.Services.AddControllers();

// 2. Registrar el servicio de Firebase como Singleton
// Esto permite que el servicio viva durante toda la ejecución de la app
builder.Services.AddSingleton<FirebaseService>();

// 3. Registrar FirestoreDb directamente para inyectarlo en los controladores
builder.Services.AddSingleton(sp => 
{
    var firebaseService = sp.GetRequiredService<FirebaseService>();
    // Aquí necesitamos acceder al _db que está dentro de FirebaseService
    // TIP: Para que esto funcione, asegúrate de haber hecho la propiedad pública en FirebaseService
    // O puedes recrear la lógica aquí. La opción más limpia es inyectar el servicio.
    return firebaseService.Db; 
});

// OpenAPI (Swagger)
builder.Services.AddOpenApi();

var app = builder.Build();

// 4. Activación de CORS
app.UseCors("PermitirFrontend");

// Configuración del pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();