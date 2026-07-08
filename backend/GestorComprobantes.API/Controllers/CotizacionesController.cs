using Microsoft.AspNetCore.Mvc;
using GestorComprobantes.API.Models;
using GestorComprobantes.API.Services;
using System.Threading.Tasks;
using System.Collections.Generic;
using Google.Cloud.Firestore;

namespace GestorComprobantes.API.Controllers;

[ApiController]
// Forzamos la ruta en minúsculas para evitar problemas en servidores Linux (Render)
[Route("api/cotizaciones")] 
public class CotizacionesController : ControllerBase
{
    private readonly FirebaseService _firebaseService;
    private readonly FirestoreDb _db;

    public CotizacionesController(FirebaseService firebaseService, FirestoreDb db)
    {
        _firebaseService = firebaseService;
        _db = db;
    }

    // Obtener todas las cotizaciones
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cotizacion>>> Get()
    {
        var snapshot = await _db.Collection("cotizaciones").GetSnapshotAsync();
        var lista = new List<Cotizacion>();
        foreach (var doc in snapshot.Documents)
        {
            lista.Add(doc.ConvertTo<Cotizacion>());
        }
        return Ok(lista);
    }

    // Guardar una nueva cotización
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Cotizacion nuevaCotizacion)
    {
        if (nuevaCotizacion == null) 
        {
            return BadRequest(new { status = "Error", message = "Datos vacíos o mal formateados" });
        }

        await _firebaseService.GuardarDocumento("cotizaciones", nuevaCotizacion);
        return Ok(new { status = "Éxito", message = "Cotización guardada en Firebase" });
    }
}