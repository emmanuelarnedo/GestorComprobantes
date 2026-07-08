using Microsoft.AspNetCore.Mvc;
using GestorComprobantes.API.Models;
using GestorComprobantes.API.Services;
using System.Threading.Tasks;
using System.Collections.Generic;
using Google.Cloud.Firestore;

namespace GestorComprobantes.API.Controllers;

[ApiController]
// Forzamos la ruta en minúsculas
[Route("api/recibos")]
public class RecibosController : ControllerBase
{
    private readonly FirebaseService _firebaseService;
    private readonly FirestoreDb _db;

    public RecibosController(FirebaseService firebaseService, FirestoreDb db)
    {
        _firebaseService = firebaseService;
        _db = db;
    }

    // Obtener todos los recibos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Recibo>>> Get()
    {
        var snapshot = await _db.Collection("recibos").GetSnapshotAsync();
        var lista = new List<Recibo>();
        foreach (var doc in snapshot.Documents)
        {
            lista.Add(doc.ConvertTo<Recibo>());
        }
        return Ok(lista);
    }

    // Guardar un nuevo recibo
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Recibo nuevoRecibo)
    {
        if (nuevoRecibo == null) 
        {
            return BadRequest(new { status = "Error", message = "Datos vacíos o mal formateados" });
        }

        await _firebaseService.GuardarDocumento("recibos", nuevoRecibo);
        return Ok(new { status = "Éxito", message = "Recibo guardado en Firebase" });
    }
}