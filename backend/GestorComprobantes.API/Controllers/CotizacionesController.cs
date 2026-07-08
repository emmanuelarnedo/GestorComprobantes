using Microsoft.AspNetCore.Mvc;
using GestorComprobantes.API.Models;
using GestorComprobantes.API.Services; // ¡Importante!

namespace GestorComprobantes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CotizacionesController : ControllerBase
{
    private readonly FirebaseService _firebaseService;

    // Inyectamos el servicio aquí
    public CotizacionesController(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Cotizacion nuevaCotizacion)
    {
        if (nuevaCotizacion == null) return BadRequest("Datos vacíos");

        // Guardamos en la colección "cotizaciones" de Firestore
        await _firebaseService.GuardarDocumento("cotizaciones", nuevaCotizacion);

        return Ok(new { 
            status = "Éxito", 
            message = "Cotización guardada en Firebase" 
        });
    }

    [HttpGet]
    public IActionResult Get()
    {
        // Por ahora dejamos el GET simulado o vacío, 
        // ¡mañana si querés implementamos la lectura real desde Firestore!
        return Ok(new { message = "Endpoint listo para leer de Firebase" });
    }
}