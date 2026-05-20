import { useState, useEffect } from 'react';

// 1. Diccionario de provincias y localidades en orden alfabético
const UBICACIONES = {
  Tucumán: ['Aguilares', 'Alberdi', 'Concepción', 'El Mollar', 'Monteros', 'Rio Seco', 'San Miguel de Tucumán', 'Tafí del Valle', 'Villa Quinteros'],
  Catamarca: ['Andalgalá', 'Belén', 'San Fernando del Valle', 'Santa María', 'Tinogasta'],
  'Santiago del Estero': ['Frías', 'La Banda', 'Las Termas de Río Hondo', 'Santiago del Estero Capital']
};

export default function App() {
  // --- ESTADOS ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tipoComprobante, setTipoComprobante] = useState(''); 
  const [cliente, setCliente] = useState('');
  const [direccion, setDireccion] = useState('');
  const [provincia, setProvincia] = useState('Tucumán');
  const [localidad, setLocalidad] = useState('Concepción')


  // Estados para la carga del ítem individual
  const [servicio, setServicio] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState('');

  // Estado para la tabla de ítems acumulados y modal
  const [items, setItems] = useState([]);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  // --- EFECTOS ---
// Sincroniza el modo oscuro con el HTML
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Resetea la localidad seleccionada al cambiar la provincia
  useEffect(() => {
    // Si la provincia nueva es Tucumán, forzamos Concepción por defecto, sino la primera de la lista
    if (provincia === 'Tucumán') {
      setLocalidad('Concepción');
    } else {
      setLocalidad(UBICACIONES[provincia][0]);
    }
  }, [provincia]);

  // --- FUNCIONES ---
  const handleAgregarItem = (e) => {
    e.preventDefault();
    if (!servicio.trim() || !precioUnitario || parseFloat(precioUnitario) <= 0) {
      return alert("Por favor, escribe un precio válido.");
    }
    
    const precio = parseFloat(precioUnitario);
    const nuevoItem = {
      id: crypto.randomUUID(),
      servicio,
      cantidad,
      precioUnitario: precio,
      total: cantidad * precio
    };
    
    setItems([...items, nuevoItem]);
    handleLimpiarCamposCarga();
  };

  const handleLimpiarCamposCarga = () => {
    setServicio(''); setCantidad(1); setPrecioUnitario('');
  };

  const handleLimpiarTodo = () => {
    if (window.confirm("¿Deseas vaciar todo el formulario y empezar de nuevo?")) {
      setTipoComprobante(''); 
      setCliente(''); setDireccion(''); setLocalidad('Concepción'); setProvincia('Tucumán');
      setServicio(''); setCantidad(1); setPrecioUnitario('');
      setItems([]); setVistaPrevia(false);
    }
  };

  const totalGeneral = items.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* SWITCH MODO OSCURO */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:scale-110 transition-transform flex items-center gap-2 border border-gray-200 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-200"
        >
          {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        
        {/* ENCABEZADO PRINCIPAL */}
        <div className="flex flex-col items-center justify-center mb-8 border border-gray-200 dark:border-gray-700 pb-8 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-md transition-colors duration-300">
          <h1 className="text-3xl md:text-4xl font-black text-center text-blue-800 dark:text-blue-400 uppercase tracking-tighter">
            Transportes Don Cristino
          </h1>
          <h2 className="text-lg font-bold text-gray-400 dark:text-gray-400 mb-4">Gestor de Comprobantes Digitales</h2>
          
          {/* CAJA DEL SELECTOR: Blanca en modo claro, oscura en modo oscuro */}
          <div className="w-full max-w-sm text-center bg-white dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <label className="block text-xs font-extrabold mb-2 uppercase tracking-wider text-gray-600 dark:text-gray-300">Tipo de Documento:</label>
            <select 
              value={tipoComprobante} 
              onChange={(e) => setTipoComprobante(e.target.value)}
              className="w-full p-3.5 pl-8 border-2 rounded-xl text-center font-black text-base bg-white dark:bg-gray-800 border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all cursor-pointer shadow-inner text-gray-800 dark:text-gray-100 flex justify-center items-center"
            >
              <option value="" className="text-gray-500 dark:text-gray-400"> Seleccionar </option>
              <option value="Cotización" className="text-gray-800 dark:text-gray-100">📄 Cotización</option>
              <option value="Recibo" className="text-gray-800 dark:text-gray-100">💰 Recibo de Pago</option>
            </select>
          </div>
        </div>

        {/* COMPONENTE EN BLANCO HASTA SELECCIONAR. LÓGICA DE PANTALLA DINÁMICA SEGÚN SELECCIÓN */}
        {!tipoComprobante ? (
          // Estado 1: Ninguno seleccionado
          <div className="text-center py-20 opacity-60">
            <p className="text-xl font-semibold italic text-gray-500 dark:text-gray-400">Selecciona un tipo de documento arriba para iniciar...</p>
          </div>
        ) : tipoComprobante === 'Recibo' ? (
          // Estado 2: Recibo de Pago (Próximamente)
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-md border border-gray-200 dark:border-gray-700 animate-in fade-in duration-300">
            <span className="text-5xl block mb-4">🚧</span>
            <h3 className="text-xl font-black text-blue-800 dark:text-blue-400 uppercase tracking-tight">Módulo en Desarrollo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              La generación automática de Recibos de Pago para Transportes Don Cristino estará disponible próximamente en la siguiente fase del sistema.
            </p>
          </div>
        ) : (
          // Estado 3: Cotización (Formulario activo)
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

            {/* DATOS DEL ENTORNO GEOGRÁFICO Y CLIENTE */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-4 transition-colors duration-300">
              <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Información del Destinatario y Destino</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Cliente:</label>
                  <input type="text" name="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre completo o Razón Social" className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Dirección de Entrega/Origen:</label>
                  <input type="text" name="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej: San Martín 500" className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                </div>
                {/* 1. SELECCIÓN DE PROVINCIA (AHORA PRIMERO) */}
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Provincia:</label>
                  <select 
                    value={provincia} 
                    onChange={(e) => setProvincia(e.target.value)} 
                    className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                  >
                    {Object.keys(UBICACIONES).map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                {/* 2. SELECCIÓN DE LOCALIDAD DINÁMICA (AHORA SEGUNDO) */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Localidad:</label>
                    <select 
                      value={localidad} 
                      onChange={(e) => setLocalidad(e.target.value)} 
                      className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                    >
                      {UBICACIONES[provincia].map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
              </div>
            </div>

            {/* SECCIÓN INTERACTIVA DE DOS COLUMNAS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* CARGA INDIVIDUAL DE VIAJES (Izquierda) */}
              <div className="lg:col-span-5">
                <form onSubmit={handleAgregarItem} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-t-4 border-blue-600 border border-gray-200 dark:border-gray-700 space-y-4 transition-colors duration-300">
                  <h2 className="font-black uppercase text-sm text-blue-700 dark:text-blue-400 tracking-wider">Cargar Línea de Servicio</h2>
                  
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Detalle del Servicio:</label>
                    <input type="text" value={servicio} onChange={(e) => setServicio(e.target.value)} placeholder="Ej: Viaje de ripio / Flete de materiales" className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Cantidad:</label>
                      <input type="number" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 1)} min="1" className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Precio Unitario ($):</label>
                      <input type="text" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} placeholder="0.00" className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white font-black p-3 rounded-xl hover:bg-blue-700 shadow-md transition-colors uppercase text-xs tracking-wider">
                      + Agregar
                    </button>
                    <button type="button" title="Limpiar campos de carga" onClick={handleLimpiarCamposCarga} className="bg-gray-200 dark:bg-gray-600 p-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-gray-700 dark:text-gray-100">
                      自由
                    </button>
                  </div>
                </form>
              </div>

              {/* GRILLA DE ITEMS Y TOTAL (Derecha) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-800 dark:bg-gray-700 text-white text-xs uppercase tracking-widest">
                        <th className="p-3 pl-4 md:p-4 md:pl-6">Servicio</th>
                        <th className="p-3 text-center md:p-4 w-12">Cant.</th>
                        <th className="p-3 text-right md:p-4 w-20">P. Unit</th>
                        <th className="p-3 text-right md:p-4 w-24">Total</th>
                        <th className="p-3 text-center md:p-4 w-12">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-12 text-center text-gray-400 italic text-sm">No hay servicios cargados en la grilla.</td>
                        </tr>
                      ) : (
                        items.map(item => (
                          <tr key={item.id} className="text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-gray-800 dark:text-gray-200">
                            <td className="p-2 pl-4 md:p-4 md:pl-6 font-medium break-words max-w-[120px] md:max-w-none">{item.servicio}</td>
                            <td className="p-2 text-center md:p-4">{item.cantidad}</td>
                            <td className="p-2 text-right md:p-4">${item.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-2 text-right md:p-4 font-bold text-blue-900 dark:text-blue-300">${item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                            {/* Botón de eliminación optimizado para celular */}
                            <td className="p-2 text-center md:p-4">
                              <button 
                                onClick={() => setItems(items.filter(i => i.id !== item.id))} 
                                className="w-7 h-7 md:w-8 md:h-8 inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-black text-lg hover:bg-red-200 transition-colors"
                                title="Eliminar ítem"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  <div className="p-5 bg-blue-50 dark:bg-gray-900 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <span className="font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wide text-xs">Total General Acumulado</span>
                    <span className="text-3xl font-black text-blue-900 dark:text-blue-300">
                      ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* ACCIONES DEL FORMULARIO */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleLimpiarTodo} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-100 font-bold p-3.5 rounded-2xl hover:bg-gray-400 transition-colors uppercase tracking-widest text-xs">
                    Limpiar Todo
                  </button>
                  <button onClick={() => setVistaPrevia(true)} className="flex-[2] bg-green-600 text-white font-black p-3.5 rounded-2xl hover:bg-green-700 shadow-xl transition-all uppercase tracking-widest text-sm">
                    Generar Presupuesto y Ver PDF
                  </button>
                </div>
              </div>

            </div>

            {/* MODAL: REPLICA EXACTA DEL PAPEL PDF FINAL */}
            {vistaPrevia && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  
                  {/* Barra superior modal */}
                  {/* Barra superior modal fija para celulares */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 z-30">
                    <h2 className="text-sm md:text-lg font-black text-blue-800 dark:text-blue-400 uppercase tracking-tight">Estructura del PDF de Salida</h2>
                    <button 
                      onClick={() => setVistaPrevia(false)} 
                      className="text-3xl font-bold text-red-500 hover:text-red-700 p-2 bg-gray-100 dark:bg-gray-700 rounded-full leading-none w-10 h-10 flex items-center justify-center shadow-sm"
                    >
                      &times;
                    </button>
                  </div>
                  
                  {/* DOCUMENTO DINÁMICO (Formato Hoja A4) */}
                  <div className="relative bg-white text-gray-900 border border-gray-300 p-10 rounded-md min-h-[500px] font-mono text-xs shadow-inner overflow-hidden">
                    
                    {/* ESPACIO MARCA DE AGUA / TARJETA ASIGNADO */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none z-0">
                      <div className="border-4 border-dashed border-gray-400 p-8 rounded-2xl text-center">
                        <span className="text-4xl block mb-2">📸</span>
                        <span className="text-sm font-black uppercase">[ MARCA DE AGUA: TARJETA DON CRISTINO ]</span>
                      </div>
                    </div>

                    {/* Contenido Real del PDF por encima de la marca de agua */}
                    <div className="relative z-10 space-y-6">
                      
                      {/* Encabezado Bilateral */}
                      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4">
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tighter text-blue-900">Transportes Don Cristino</h3>
                          <p className="text-[10px] mt-1 text-gray-600">De: Arnedo Eduardo Augusto</p>
                          <p className="text-[10px] text-gray-600">CUIT: 20-16175883-4</p>
                          <p className="text-[10px] text-gray-600">Responsable Inscripto</p>
                        </div>
                        <div className="text-right">
                          <h4 className="text-sm font-black uppercase tracking-wide bg-gray-100 p-1 px-3 rounded text-gray-800">{tipoComprobante}</h4>
                          <p className="mt-1">N° 0000-0001</p>
                          <p>Fecha: {new Date().toLocaleDateString('es-AR')}</p>
                        </div>
                      </div>
                      
                      {/* Bloque Datos Cliente */}
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded border text-[11px] text-gray-800">
                        <p><strong>Señor(es):</strong> {cliente.toUpperCase() || '----------------------------------------'}</p>
                        <p><strong>Lugar de Destino:</strong> {direccion || '----------------------------------------'}</p>
                        <p><strong>Localidad:</strong> {localidad}</p>
                        <p><strong>Provincia:</strong> {provincia}</p>
                      </div>

                      {/* Tabla del PDF Exacta con deslizamiento horizontal en celulares */}
                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-gray-400 text-[11px] text-gray-800 min-w-[500px]">
                          <thead>
                            <tr className="bg-gray-100 border-b border-gray-400">
                              <th className="p-2 border-r border-gray-400">Servicio</th>
                              <th className="p-2 text-center border-r border-gray-400 w-16">Cantidad</th>
                              <th className="p-2 text-right border-r border-gray-400 w-24">Precio unitario</th>
                              <th className="p-2 text-right w-24">Precio total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-300">
                            {items.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="p-4 text-center italic text-gray-400">Sin líneas de servicios cargadas.</td>
                              </tr>
                            ) : (
                              items.map(i => (
                                <tr key={i.id}>
                                  <td className="p-2 border-r border-gray-400 font-sans">{i.servicio}</td>
                                  <td className="p-2 text-center border-r border-gray-400">{i.cantidad}</td>
                                  <td className="p-2 text-right border-r border-gray-400">${i.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                  <td className="p-2 text-right font-bold">${i.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Bloque de Cierre, Métodos y Cláusulas Automáticas */}
                      <div className="flex justify-between items-end pt-4">
                        <div className="w-2/3 text-[10px] space-y-1.5 text-gray-600 italic font-sans">
                          <p className="font-bold text-gray-900 not-italic">Método de pago: Efectivo</p>
                          <p className="leading-tight">
                            * Observaciones: El presupuesto contempla la logística integral hacia la ubicación especificada en <strong>{direccion || '[Dirección]'}</strong>, localidad de <strong>{localidad}</strong>, <strong>{provincia}</strong>. Toda cotización cuenta con una validez formal de 20 días hábiles a partir de la fecha de emisión.
                          </p>
                        </div>
                        <div className="text-right w-1/3">
                          <span className="text-[10px] text-gray-400 block font-sans">TOTAL NETO A PAGAR</span>
                          <span className="text-2xl font-black text-blue-900">
                            ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ACCIONES FINALES ASOCIADAS AL PDF */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <button onClick={() => alert("Guardando archivo localmente...")} className="bg-blue-600 text-white font-black p-3 rounded-xl shadow hover:bg-blue-700 flex items-center justify-center gap-2 uppercase tracking-wide text-xs">
                      💾 Guardar PDF
                    </button>
                    <button onClick={() => alert("Enviando comprobante adjunto por correo...")} className="bg-green-600 text-white font-black p-3 rounded-xl shadow hover:bg-green-700 flex items-center justify-center gap-2 uppercase tracking-wide text-xs">
                      📧 Enviar PDF por Correo
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}