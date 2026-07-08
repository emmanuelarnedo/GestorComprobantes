using Google.Cloud.Firestore;
using Google.Apis.Auth.OAuth2;
using System.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GestorComprobantes.API.Services;

public class FirebaseService
{
    private readonly FirestoreDb _db;
    
    // Propiedad pública que expone la instancia para Program.cs
    public FirestoreDb Db => _db;

    public FirebaseService()
    {
        string projectId = "gestorcomprobantes";
        string jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "credenciales", "gestorcomprobantes-firebase-adminsdk-fbsvc-d24d85abdb.json");

        GoogleCredential credential;
        
        if (File.Exists(jsonPath))
        {
            // Entorno Local: Lee el archivo JSON físico
            credential = GoogleCredential.FromFile(jsonPath);
        }
        else
        {
            // Entorno de Producción (Render): Obtiene la cadena estructurada de las variables de entorno
            string jsonContent = Environment.GetEnvironmentVariable("FIREBASE_CREDENTIALS_JSON");
            if (string.IsNullOrEmpty(jsonContent))
            {
                throw new InvalidOperationException("La variable de entorno FIREBASE_CREDENTIALS_JSON no está configurada.");
            }
            credential = GoogleCredential.FromJson(jsonContent);
        }
        
        var builder = new FirestoreDbBuilder
        {
            ProjectId = projectId,
            Credential = credential
        };
        
        _db = builder.Build();
    }

    // Calcula de forma secuencial y reutilizable el menor entero positivo disponible por colección
    public async Task<int> ObtenerProximoId(string tipo)
    {
        var snapshot = await _db.Collection(tipo).GetSnapshotAsync();
        var idsExistentes = snapshot.Documents.Select(d => {
            var data = d.ToDictionary();
            return data.ContainsKey("Id") ? Convert.ToInt32(data["Id"]) : 0;
        }).ToList();
        
        int id = 1;
        while (idsExistentes.Contains(id)) 
        {
            id++;
        }
        return id;
    }

    public async Task GuardarDocumento(string coleccion, dynamic data)
    {
        try
        {
            data.Id = await ObtenerProximoId(coleccion);
            CollectionReference col = _db.Collection(coleccion);
            await col.AddAsync(data);
        }
        catch (Exception ex)
        {
            Console.WriteLine("--- ERROR DETALLADO DE FIRESTORE ---");
            Console.WriteLine(ex.Message);
            if (ex.InnerException != null) 
                Console.WriteLine("Detalle: " + ex.InnerException.Message);
            throw;
        }
    }
}