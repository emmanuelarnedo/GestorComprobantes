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
    
    // EXPOSICIÓN DE LA PROPIEDAD PARA EL PROGRAM.CS
    public FirestoreDb Db => _db;

    public FirebaseService()
    {
        string projectId = "gestorcomprobantes";
        string jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "credenciales", "gestorcomprobantes-firebase-adminsdk-fbsvc-d24d85abdb.json");

        // Solución al warning CS0618: Usando GoogleCredential.FromFile
        // Es más seguro y evita el uso de FromJson directamente
        var credential = GoogleCredential.FromFile(jsonPath);
        
        var builder = new FirestoreDbBuilder
        {
            ProjectId = projectId,
            Credential = credential
        };
        
        _db = builder.Build();
    }

    public async Task<int> ObtenerProximoId(string tipo)
    {
        var snapshot = await _db.Collection(tipo).GetSnapshotAsync();
        var idsExistentes = snapshot.Documents.Select(d => {
            var data = d.ToDictionary();
            return data.ContainsKey("Id") ? Convert.ToInt32(data["Id"]) : 0;
        }).ToList();
        
        int id = 1;
        while (idsExistentes.Contains(id)) id++;
        return id;
    }

    public async Task GuardarDocumento(string coleccion, dynamic data)
    {
        data.Id = await ObtenerProximoId(coleccion);
        await _db.Collection(coleccion).AddAsync(data);
    }
}