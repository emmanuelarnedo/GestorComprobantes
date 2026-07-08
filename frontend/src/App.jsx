import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

// --- DICCIONARIO DE UBICACIONES ---
const UBICACIONES = {
  Tucumán: [
    'Aguilares', 'Alberdi', 'Concepción', 'El Mollar', 'Famaillá', 
    'La Cocha', 'León Rouges', 'Monteros', 'Río Seco', 
    'San Miguel de Tucumán', 'Santa Ana', 'Tafí del Valle', 'Villa Quinteros'
  ],
  Catamarca: [
    'Andalgalá', 'Belén', 'Recreo', 'San Fernando del Valle', 
    'Santa María', 'Tinogasta'
  ],
  'Santiago del Estero': [
    'Frías', 'La Banda', 'Las Termas de Río Hondo', 'Loreto', 
    'Santiago del Estero Capital'
  ]
};

export default function App() {
  // --- ESTADOS PRINCIPALES ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tipoComprobante, setTipoComprobante] = useState(''); 
  const [cliente, setCliente] = useState('');
  
  // Estados de Cotización
  const [direccion, setDireccion] = useState('');
  const [provincia, setProvincia] = useState('Tucumán');
  const [localidad, setLocalidad] = useState('Concepción');
  const [otraProvincia, setOtraProvincia] = useState('');
  const [otraLocalidad, setOtraLocalidad] = useState('');
  const [servicio, setServicio] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [items, setItems] = useState([]);

  // Estados de Recibo
  const [montoRecibo, setMontoRecibo] = useState('');
  const [conceptoRecibo, setConceptoRecibo] = useState('');
  const [metodoPagoRecibo, setMetodoPagoRecibo] = useState('Efectivo');

  // Estados UI y Base de Datos
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [documentosEmitidos, setDocumentosEmitidos] = useState([]);
  const [idComprobante, setIdComprobante] = useState(null);

  // --- EFECTOS ---
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (provincia === 'Otra') {
      setOtraProvincia('');
      setOtraLocalidad('');
    } else if (provincia === 'Tucumán') {
      setLocalidad('Concepción');
    } else if (UBICACIONES[provincia]) {
      setLocalidad(UBICACIONES[provincia][0]);
    }
  }, [provincia]);

  // Carga inicial del historial desde la API
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const API_URL = 'https://backend-gestorcomprobantes.onrender.com';
      
      const resCot = await fetch(`${API_URL}/cotizaciones`);
      const resRec = await fetch(`${API_URL}/recibos`);

      if (resCot.ok && resRec.ok) {
        const dataCot = await resCot.json();
        const dataRec = await resRec.json();
        
        const cotizacionesMapeadas = dataCot.map(c => ({
          id: c.id, 
          tipo: 'Cotización',
          cliente: c.cliente,
          fecha: new Date(c.fechaEmision).toLocaleDateString('es-AR'),
          total: c.totalGeneral,
          direccion: c.direccion,
          provincia: c.provincia,
          localidad: c.localidad,
          items: c.items || []
        }));

        const recibosMapeados = dataRec.map(r => ({
          id: r.id,
          tipo: 'Recibo',
          cliente: r.cliente,
          fecha: new Date(r.fechaEmision).toLocaleDateString('es-AR'),
          total: r.monto,
          conceptoRecibo: r.concepto,
          metodoPagoRecibo: r.metodoPago
        }));

        setDocumentosEmitidos([...cotizacionesMapeadas, ...recibosMapeados]);
      }
    } catch (e) {
      console.error("Error al conectar con la API para cargar el historial:", e);
    }
  };

  // --- FUNCIONES DE FORMULARIO ---
  const handleAgregarItem = (e) => {
    e.preventDefault();
    if (!servicio.trim() || !precioUnitario || parseFloat(precioUnitario) <= 0) {
      return alert("Por favor, escribe una descripción y un precio válido.");
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
    setServicio(''); setCantidad(1); setPrecioUnitario('');
  };

  const handleLimpiarTodo = () => {
    if (window.confirm("¿Deseas vaciar todo el formulario y empezar de nuevo?")) {
      setTipoComprobante(''); 
      setCliente(''); setDireccion(''); 
      setProvincia('Tucumán'); setLocalidad('Concepción'); 
      setOtraProvincia(''); setOtraLocalidad('');
      setServicio(''); setCantidad(1); setPrecioUnitario('');
      setItems([]); 
      setMontoRecibo(''); setConceptoRecibo(''); setMetodoPagoRecibo('Efectivo');
      setVistaPrevia(false);
      setIdComprobante(null);
    }
  };

  const totalGeneral = items.reduce((acc, item) => acc + item.total, 0);

  // Calcular ID correlativo para la vista previa en tiempo real
  const obtenerIdPreview = () => {
    if (idComprobante) return idComprobante;
    const ids = documentosEmitidos
      .filter(d => d.tipo === tipoComprobante)
      .map(d => d.id)
      .filter(Boolean);
    
    let candidate = 1;
    while (ids.includes(candidate)) {
      candidate++;
    }
    return candidate;
  };

  // --- FUNCIONES DE PDF Y CORREO ---
  const procesarPDF = () => {
    const elemento = document.getElementById('area-pdf-imprimible');
    const fechaStr = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    const idFormateado = String(obtenerIdPreview()).padStart(5, '0');
    const nombreArchivo = `${tipoComprobante}_N${idFormateado}_${cliente.replace(/\s+/g, '_')}_${fechaStr}.pdf`;

    const opt = {
      margin: 0,
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(elemento).save();
  };

  const handleEnviarCorreo = () => {
    const asunto = encodeURIComponent(`Envío de ${tipoComprobante} - Transportes Don Cristino`);
    const cuerpo = encodeURIComponent(
      `Hola,\n\nTe escribo para hacerte llegar la ${tipoComprobante.toLowerCase()} correspondiente.\n\nPor favor, adjuntá manualmente el PDF antes de enviar este correo.\n\nSaludos cordiales,\nTransportes Don Cristino.`
    );
    window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
  };

  // --- INTEGRACIÓN CON BACKEND ---
  const handleGuardarDocumento = async () => {
    const endpoint = tipoComprobante === 'Cotización' ? 'cotizaciones' : 'recibos';
    
    let payloadBackend = {};
    if (tipoComprobante === 'Cotización') {
      payloadBackend = {
        Cliente: cliente || 'Consumidor Final',
        Direccion: direccion || '',
        Localidad: provincia === 'Otra' ? otraLocalidad : localidad,
        Provincia: provincia === 'Otra' ? otraProvincia : provincia,
        TotalGeneral: totalGeneral,
        Items: items.map(i => ({
          Servicio: i.servicio,
          Cantidad: i.cantidad,
          PrecioUnitario: i.precioUnitario,
          Total: i.total
        }))
      };
    } else {
      payloadBackend = {
        Cliente: cliente || 'Consumidor Final',
        Monto: parseFloat(montoRecibo || 0),
        Concepto: conceptoRecibo || '',
        MetodoPago: metodoPagoRecibo || 'Efectivo'
      };
    }

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBackend)
      });

      if (response.ok) {
        procesarPDF();
        alert("Documento descargado con éxito");
        setVistaPrevia(false);
        setIdComprobante(null);
        await cargarHistorial(); 
      } else {
        alert("Hubo un error al guardar en el servidor. Revisá la consola del Backend.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el backend. Asegúrate de que la API esté corriendo.");
    }
  };

  // --- FUNCIONES DEL HISTORIAL ---
  const cargarDatosAlFormulario = (doc) => {
    setTipoComprobante(doc.tipo);
    setCliente(doc.cliente);
    setIdComprobante(doc.id);
    
    if (doc.tipo === 'Cotización') {
      setDireccion(doc.direccion);
      if (!UBICACIONES[doc.provincia] && doc.provincia) {
        setProvincia('Otra');
        setOtraProvincia(doc.provincia);
        setOtraLocalidad(doc.localidad);
      } else {
        setProvincia(doc.provincia || 'Tucumán');
        setLocalidad(doc.localidad || 'Concepción');
      }
      setItems(doc.items || []);
    } else {
      setMontoRecibo(doc.total);
      setConceptoRecibo(doc.conceptoRecibo);
      setMetodoPagoRecibo(doc.metodoPagoRecibo);
    }
  };

  const handleVerDocumento = (doc) => {
    cargarDatosAlFormulario(doc);
    setVistaPrevia(true);
  };

  const handleDescargarDesdeHistorial = (doc) => {
    cargarDatosAlFormulario(doc);
    setVistaPrevia(true);
    setTimeout(() => {
      procesarPDF();
    }, 500);
  };

  const handleBorrarDocumento = (id) => {
    if(window.confirm("¿Seguro que quieres borrar este comprobante del historial visual?")) {
      setDocumentosEmitidos(documentosEmitidos.filter(doc => doc.id !== id));
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:scale-110 transition-transform flex items-center gap-2 border border-gray-200 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-200"
        >
          {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        
        {/* ENCABEZADO UI */}
        <div className="flex flex-col items-center justify-center mb-8 border border-gray-200 dark:border-gray-700 pb-8 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-md transition-colors duration-300">
          <h1 className="text-3xl md:text-4xl font-black text-center text-blue-800 dark:text-blue-400 uppercase tracking-tighter">
            Transportes Don Cristino
          </h1>
          <h2 className="text-lg font-bold text-gray-400 dark:text-gray-400 mb-4">Gestor de Comprobantes Digitales</h2>
          
          <div className="w-full max-w-sm text-center bg-white dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <label className="block text-xs font-extrabold mb-2 uppercase tracking-wider text-gray-600 dark:text-gray-300">Tipo de Documento:</label>
            <select 
              value={tipoComprobante} 
              onChange={(e) => { setTipoComprobante(e.target.value); setIdComprobante(null); }}
              className="w-full p-3.5 pl-8 border-2 rounded-xl text-center font-black text-base bg-white dark:bg-gray-800 border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all cursor-pointer shadow-inner text-gray-800 dark:text-gray-100"
            >
              <option value="" className="text-gray-500 dark:text-gray-400"> -- Seleccionar -- </option>
              <option value="Cotización" className="text-gray-800 dark:text-gray-100">📄 Cotización</option>
              <option value="Recibo" className="text-gray-800 dark:text-gray-100">💰 Recibo de Pago</option>
            </select>
          </div>
        </div>

        {/* PANTALLAS DE CARGA */}
        {!tipoComprobante ? (
          <div className="text-center py-20 opacity-60">
            <p className="text-xl font-semibold italic text-gray-500 dark:text-gray-400">Selecciona un tipo de documento arriba para iniciar...</p>
          </div>
        ) : tipoComprobante === 'Recibo' ? (
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-t-4 border-green-600 border border-gray-200 dark:border-gray-700 space-y-4 transition-colors duration-300">
              <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Datos del Recibo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Recibí de (Señor/es):</label>
                  <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre del cliente o empresa" className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">La suma de ($):</label>
                  <input type="number" value={montoRecibo} onChange={(e) => setMontoRecibo(e.target.value)} placeholder="0.00" min="0" className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Forma de Pago:</label>
                  <select value={metodoPagoRecibo} onChange={(e) => setMetodoPagoRecibo(e.target.value)} className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">En concepto de:</label>
                  <input type="text" value={conceptoRecibo} onChange={(e) => setConceptoRecibo(e.target.value)} placeholder="Ej: Cancelación total de flete, Pago a cuenta..." className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleLimpiarTodo} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-100 font-bold p-3.5 rounded-2xl hover:bg-gray-400 transition-colors uppercase tracking-widest text-xs">
                Limpiar Todo
              </button>
              <button onClick={() => setVistaPrevia(true)} className="flex-[2] bg-green-600 text-white font-black p-3.5 rounded-2xl hover:bg-green-700 shadow-xl transition-all uppercase tracking-widest text-sm">
                Generar Recibo y Ver PDF
              </button>
            </div>
          </div>
        ) : (
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
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
                    <option value="Otra">Otra (Especificar)</option>
                  </select>
                </div>
                {provincia === 'Otra' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Especificar Provincia:</label>
                    <input 
                      type="text" 
                      value={otraProvincia} 
                      onChange={(e) => setOtraProvincia(e.target.value)} 
                      placeholder="Escribí la provincia" 
                      className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Localidad:</label>
                  {provincia === 'Otra' ? (
                    <input 
                      type="text" 
                      value={otraLocalidad} 
                      onChange={(e) => setOtraLocalidad(e.target.value)} 
                      placeholder="Escribí la localidad" 
                      className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                    />
                  ) : (
                    <select 
                      value={localidad} 
                      onChange={(e) => setLocalidad(e.target.value)} 
                      className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                    >
                      {UBICACIONES[provincia]?.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <form onSubmit={handleAgregarItem} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-t-4 border-blue-600 border border-gray-200 dark:border-gray-700 space-y-4 transition-colors duration-300">
                  <h2 className="font-black uppercase text-sm text-blue-700 dark:text-blue-400 tracking-wider">Cargar Línea de Servicio</h2>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-600 dark:text-gray-300">Detalle del Servicio:</label>
                    <input type="text" value={servicio} onChange={(e) => setServicio(e.target.value)} placeholder="Ej: Viaje de ripio" className="w-full p-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
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
                    <button type="button" onClick={() => {setServicio(''); setCantidad(1); setPrecioUnitario('');}} className="bg-gray-200 dark:bg-gray-600 p-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-gray-700 dark:text-gray-100">
                      Borrar campos
                    </button>
                  </div>
                </form>
              </div>

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
                          <td colSpan="5" className="p-12 text-center text-gray-400 italic text-sm">No hay servicios cargados.</td>
                        </tr>
                      ) : (
                        items.map(item => (
                          <tr key={item.id} className="text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-gray-800 dark:text-gray-200">
                            <td className="p-2 pl-4 md:p-4 md:pl-6 font-medium break-words">{item.servicio}</td>
                            <td className="p-2 text-center md:p-4">{item.cantidad}</td>
                            <td className="p-2 text-right md:p-4">${item.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-2 text-right md:p-4 font-bold text-blue-900 dark:text-blue-300">${item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-2 text-center md:p-4">
                              <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-black text-lg">×</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  <div className="p-5 bg-blue-50 dark:bg-gray-900 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-gray-500 uppercase tracking-wide text-xs">Total General</span>
                    <span className="text-3xl font-black text-blue-900 dark:text-blue-300">
                      ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleLimpiarTodo} className="flex-1 bg-gray-300 text-gray-700 font-bold p-3.5 rounded-2xl hover:bg-gray-400 uppercase tracking-widest text-xs">
                    Limpiar Todo
                  </button>
                  <button onClick={() => setVistaPrevia(true)} className="flex-[2] bg-blue-600 text-white font-black p-3.5 rounded-2xl hover:bg-blue-700 uppercase tracking-widest text-sm">
                    Generar Presupuesto y Ver PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- EXPLORADOR DE EMITIDOS --- */}
        {tipoComprobante && (
          <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-xl font-black mb-4 text-blue-800 dark:text-blue-400 uppercase tracking-wide">
              Historial de {tipoComprobante === 'Cotización' ? 'Cotizaciones' : 'Recibos'}
            </h3>
            
            <div className="space-y-3">
              {documentosEmitidos.filter(d => d.tipo === tipoComprobante).length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                  <p className="text-gray-500 italic">No hay documentos emitidos aún en esta sesión o base de datos.</p>
                </div>
              ) : (
                documentosEmitidos.filter(d => d.tipo === tipoComprobante).map(doc => (
                  <div key={doc.id || Math.random()} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
                    <div>
                      <p className="font-bold uppercase text-sm">
                        N° {doc.id ? String(doc.id).padStart(5, '0') : '00000'} - {doc.cliente || 'Sin Cliente'}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        Emisión: {doc.fecha || 'N/A'} | Total: ${doc.total ? doc.total.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0,00'}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                      <button onClick={() => handleVerDocumento(doc)} className="flex-1 sm:flex-none text-xs font-bold bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-1">
                        <span className="text-base">👁️</span> Ver
                      </button>
                      <button onClick={() => handleDescargarDesdeHistorial(doc)} className="flex-1 sm:flex-none text-xs font-bold bg-green-100 text-green-700 py-2.5 px-4 rounded-lg hover:bg-green-200 flex items-center justify-center gap-1">
                        <span className="text-base">📥</span> PDF
                      </button>
                      <button onClick={() => handleBorrarDocumento(doc.id)} className="flex-1 sm:flex-none text-xs font-bold bg-red-100 text-red-700 py-2.5 px-4 rounded-lg hover:bg-red-200 flex items-center justify-center gap-1">
                        <span className="text-base">🗑️</span> Borrar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- MODAL GLOBAL DEL PDF A4 --- */}
        {vistaPrevia && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            
            <div className="bg-white rounded-md shadow-2xl my-10 overflow-hidden w-[210mm] min-w-[210mm] relative flex flex-col">
              
              <button onClick={() => setVistaPrevia(false)} className="absolute top-2 right-2 text-3xl font-bold text-red-500 hover:text-red-700 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full z-40">
                &times;
              </button>

              {/* ÁREA DEL PDF (Formato estricto A4) */}
              <div id="area-pdf-imprimible" className="bg-white text-gray-900 p-[15mm] w-[210mm] h-[296mm] max-h-[296mm] overflow-hidden font-sans text-[12px] flex flex-col box-border relative">
                
                {/* MARCA DE AGUA CENTRAL CON FILTRO COHERENTE */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none z-0">
                  <img src="/marca de agua.png" alt="Marca de Agua" className="w-[250mm] object-contain grayscale" />
                </div>

                <div className="relative z-10 flex flex-col h-full w-full">
                  {/* ENCABEZADO FIJO */}
                  <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-black uppercase text-blue-900 leading-tight">Transportes Don Cristino</h3>
                      <p className="text-[10px] mt-0.5 text-gray-600">De: Arnedo Eduardo Augusto</p>
                      <p className="text-[10px] text-gray-600">CUIT: 20-16175883-4</p>
                    </div>
                    
                    <div className="w-[30%] flex justify-center">
                      <img src="/logo_tarjeta.jpg" alt="Logo" className="w-full max-w-[180px] h-auto object-contain mix-blend-multiply" />
                    </div>

                    <div className="flex-1 text-right">
                      <h4 className="text-sm font-black uppercase bg-gray-100 p-1 px-3 border border-gray-300 inline-block">{tipoComprobante}</h4>
                      <p className="text-xs font-bold mt-1.5">N° {String(obtenerIdPreview()).padStart(5, '0')}</p>
                      <p className="text-[10px] text-gray-600">Fecha: {new Date().toLocaleDateString('es-AR')}</p>
                    </div>
                  </div>
                  
                  {/* CUERPO DINÁMICO */}
                  <div className="flex-grow flex flex-col">
                    {tipoComprobante === 'Cotización' ? (
                      <div className="flex-grow flex flex-col">
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 border border-gray-300 text-[11px] text-gray-800">
                          <p><strong>Señor(es):</strong> {cliente.toUpperCase() || '----------------------------------------'}</p>
                          <p><strong>Lugar de Destino:</strong> {direccion || '----------------------------------------'}</p>
                          <p><strong>Localidad:</strong> {provincia === 'Otra' ? otraLocalidad : localidad}</p>
                          <p><strong>Provincia:</strong> {provincia === 'Otra' ? otraProvincia : provincia}</p>
                        </div>

                        <div className="w-full">
                          <table className="w-full text-left border-collapse border border-gray-400 text-[11px] text-gray-800">
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
                                    <td className="p-2 border-r border-gray-400">{i.servicio}</td>
                                    <td className="p-2 text-center border-r border-gray-400">{i.cantidad}</td>
                                    <td className="p-2 text-right border-r border-gray-400">${i.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                    <td className="p-2 text-right font-bold">${i.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* TOTALES DE COTIZACIÓN AL FONDO */}
                        <div className="mt-auto flex justify-between items-end pt-4 border-t-2 border-gray-800">
                          <div className="w-2/3 text-[10px] space-y-1.5 text-gray-600 italic">
                            <p className="font-bold text-gray-900 not-italic">Método de pago: Efectivo</p>
                            <p className="leading-tight">
                              * Observaciones: El presupuesto contempla la logística hacia <strong>{direccion || '[Dirección]'}</strong>, localidad de <strong>{provincia === 'Otra' ? otraLocalidad : localidad}</strong>, <strong>{provincia === 'Otra' ? otraProvincia : provincia}</strong>. Validez de 20 días hábiles.
                            </p>
                          </div>
                          <div className="text-right w-1/3">
                            <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Neto a Pagar</span>
                            <span className="text-xl font-black text-blue-900">
                              ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col pt-6">
                        <div className="space-y-8">
                          <div className="flex items-end">
                            <span className="font-bold text-gray-600 w-40 uppercase text-[11px]">Recibí de (Señor/es):</span> 
                            <span className="flex-1 border-b border-gray-400 pb-1 px-2 font-bold text-[14px] text-blue-900">{cliente.toUpperCase() || ' '}</span>
                          </div>
                          <div className="flex items-end">
                            <span className="font-bold text-gray-600 w-40 uppercase text-[11px]">La suma de pesos:</span> 
                            <span className="flex-1 border-b border-gray-400 pb-1 px-2 font-bold text-[14px] text-blue-900">
                              ${montoRecibo ? parseFloat(montoRecibo).toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0,00'}
                            </span>
                          </div>
                          <div className="flex items-end">
                            <span className="font-bold text-gray-600 w-40 uppercase text-[11px]">En concepto de:</span> 
                            <span className="flex-1 border-b border-gray-400 pb-1 px-2 text-[14px]">{conceptoRecibo || ' '}</span>
                          </div>
                          <div className="flex items-end">
                            <span className="font-bold text-gray-600 w-40 uppercase text-[11px]">Forma de pago:</span> 
                            <span className="flex-1 border-b border-gray-400 pb-1 px-2 text-[14px]">{metodoPagoRecibo || ' '}</span>
                          </div>
                        </div>

                        {/* FIRMAS DE RECIBO AL FONDO */}
                        <div className="mt-auto flex justify-between px-10 pb-4">
                          <div className="text-center w-48 border-t-2 border-gray-800 pt-2">
                            <p className="font-bold text-[10px]">Firma / Aclaración</p>
                            <p className="text-[9px] text-gray-600 uppercase mt-1">Señor/es</p>
                          </div>
                          <div className="text-center w-48 border-t-2 border-gray-800 pt-2">
                            <p className="font-bold text-[10px]">Transportes Don Cristino</p>
                            <p className="text-[9px] text-gray-600 uppercase mt-1">Recibí Conforme</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* ZONA DE BOTONES DEL MODAL */}
              <div className="bg-gray-100 p-4 flex gap-3 border-t">
                <button onClick={handleGuardarDocumento} className="flex-1 bg-blue-600 text-white font-black p-3 rounded shadow hover:bg-blue-700 flex items-center justify-center gap-2 uppercase text-xs">
                  💾 Guardar y Descargar PDF
                </button>
                <button onClick={handleEnviarCorreo} className="flex-1 bg-green-600 text-white font-black p-3 rounded shadow hover:bg-green-700 flex items-center justify-center gap-2 uppercase text-xs">
                  📧 Enviar Documento por Correo
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}