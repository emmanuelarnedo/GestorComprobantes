import { useState } from 'react';

export default function App() {
  // Estados para los datos generales
  const [tipoComprobante, setTipoComprobante] = useState('Cotización');
  const [cliente, setCliente] = useState('');
  const [direccion, setDireccion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Estados para la carga del ítem individual
  const [servicio, setServicio] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState('');

  // Estado para la tabla de ítems acumulados
  const [items, setItems] = useState([]);

  // Función para agregar un servicio a la tabla
  const handleAgregarItem = (e) => {
    e.preventDefault();
    if (!servicio.trim()) return alert("Escribe la descripción del servicio.");
    if (cantidad <= 0) return alert("La cantidad debe ser mayor a 0.");
    const precio = parseFloat(precioUnitario);
    if (isNaN(precio) || precio <= 0) return alert("Ingresa un precio unitario válido.");

    const nuevoItem = {
      id: crypto.randomUUID(),
      servicio,
      cantidad,
      precioUnitario: precio,
      total: cantidad * precio
    };

    setItems([...items, nuevoItem]);

    // Limpiamos solo los campos de carga del servicio
    setServicio('');
    setCantidad(1);
    setPrecioUnitario('');
  };

  // Función para quitar un ítem de la tabla
  const handleQuitarItem = (id) => {
    if (window.confirm("¿Seguro que deseas quitar este servicio?")) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Función para limpiar todo el formulario
  const handleLimpiarFormulario = () => {
    if (window.confirm("¿Deseas vaciar todo el formulario y empezar de nuevo?")) {
      setCliente('');
      setDireccion('');
      setObservaciones('');
      setServicio('');
      setCantidad(1);
      setPrecioUnitario('');
      setItems([]);
    }
  };

  // Calcular el precio total general sumando la columna 'total' de la tabla
  const totalGeneral = items.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800 border-b pb-4">
          Gestor de Comprobantes - Transportes Don Cristino
        </h1>

        {/* SECCIÓN 1: Datos Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo de documento:</label>
            <select 
              value={tipoComprobante} 
              onChange={(e) => setTipoComprobante(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 font-medium"
            >
              <option value="Cotización">Cotización</option>
              <option value="Factura">Factura (Próximamente)</option>
              <option value="Recibo">Recibo de Pago (Próximamente)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Cliente:</label>
            <input 
              type="text" 
              value={cliente} 
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nombre del cliente" 
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Dirección:</label>
            <input 
              type="text" 
              value={direccion} 
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: San Luis 400" 
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* ENFOQUE DINÁMICO: Solo muestra si es Cotización */}
        {tipoComprobante === 'Cotización' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Formulario de carga (Izquierda) */}
            <form onSubmit={handleAgregarItem} className="lg:col-span-5 bg-gray-50 p-4 rounded border space-y-4">
              <h2 className="font-bold text-lg text-gray-700 border-b pb-1">Cargar Servicio</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descripción del Servicio:</label>
                <input 
                  type="text" 
                  value={servicio} 
                  onChange={(e) => setServicio(e.target.value)}
                  placeholder="Ej: Viaje de escombro camión 6m³" 
                  className="w-full p-2 border rounded bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad:</label>
                  <input 
                    type="number" 
                    value={cantidad} 
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                    min="1" 
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Unitario ($):</label>
                  <input 
                    type="text" 
                    value={precioUnitario} 
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    placeholder="0.00" 
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observaciones / Condiciones:</label>
                <textarea 
                  value={observaciones} 
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Validez de la cotización, estado del terreno, etc." 
                  rows="2"
                  className="w-full p-2 border rounded bg-white text-sm"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded transition-colors"
              >
                + Agregar ítem a la tabla
              </button>
            </form>

            {/* Tabla e Historial en ejecución (Derecha) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="border rounded overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white text-sm">
                      <th className="p-2 pl-4">Descripción</th>
                      <th className="p-2 text-center">Cant.</th>
                      <th className="p-2 text-right">P. Unit</th>
                      <th className="p-2 text-right">Total</th>
                      <th className="p-2 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                          No hay servicios cargados en esta cotización.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-2 pl-4 max-w-[200px] truncate font-medium">{item.servicio}</td>
                          <td className="p-2 text-center">{item.cantidad}</td>
                          <td className="p-2 text-right">${item.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2 text-right font-semibold text-blue-900">${item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2 text-center">
                            <button 
                              onClick={() => handleQuitarItem(item.id)}
                              className="text-red-600 hover:text-red-800 font-bold px-2 py-1"
                              title="Quitar ítem"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bloque Inferior de Totales y Acciones Colectivas */}
              <div className="mt-4 bg-gray-50 p-4 rounded border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-sm text-gray-500 block">PRECIO TOTAL GENERAL:</span>
                  <span className="text-3xl font-black text-blue-900">
                    ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleLimpiarFormulario}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold px-4 py-2 rounded transition-colors"
                  >
                    Limpiar Todo
                  </button>
                  <button 
                    onClick={() => alert("¡Próximamente conectaremos esto al backend de C# para generar el PDF!")}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded shadow transition-colors"
                  >
                    Generar y Enviar PDF
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}