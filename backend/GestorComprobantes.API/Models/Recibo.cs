using Google.Cloud.Firestore;
using System;

namespace GestorComprobantes.API.Models;

[FirestoreData]
public class Recibo
{
    public Recibo() { } 

    [FirestoreProperty]
    public int Id { get; set; }

    [FirestoreProperty]
    public string Cliente { get; set; } = string.Empty;

    [FirestoreProperty]
    public double Monto { get; set; }

    [FirestoreProperty]
    public string Concepto { get; set; } = string.Empty;

    [FirestoreProperty]
    public string MetodoPago { get; set; } = string.Empty;

    [FirestoreProperty]
    public DateTime FechaEmision { get; set; } = DateTime.UtcNow; // Corregido a UtcNow
}