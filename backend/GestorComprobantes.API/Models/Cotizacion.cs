using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;

namespace GestorComprobantes.API.Models;

[FirestoreData]
public class Cotizacion
{
    public Cotizacion() { } 

    [FirestoreProperty]
    public int Id { get; set; }

    [FirestoreProperty]
    public string Cliente { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Direccion { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Localidad { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Provincia { get; set; } = string.Empty;

    [FirestoreProperty]
    public List<ItemServicio> Items { get; set; } = new();

    [FirestoreProperty]
    public double TotalGeneral { get; set; }

    [FirestoreProperty]
    public DateTime FechaEmision { get; set; } = DateTime.UtcNow; // Corregido a UtcNow
}

[FirestoreData]
public class ItemServicio
{
    public ItemServicio() { }

    [FirestoreProperty]
    public string Servicio { get; set; } = string.Empty;

    [FirestoreProperty]
    public int Cantidad { get; set; }

    [FirestoreProperty]
    public double PrecioUnitario { get; set; }

    [FirestoreProperty]
    public double Total { get; set; }
}