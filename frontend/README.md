# Transportes Don Cristino - Gestor de Comprobantes

Sistema integral para la gestión, emisión y seguimiento de comprobantes digitales (Cotizaciones y Recibos) diseñado para la empresa "Transportes Don Cristino".

## 🚀 Características principales
- **Gestión Dual:** Emisión de Cotizaciones detalladas con cálculo automático de totales y Recibos de pago.
- **Persistencia en la Nube:** Integración total con Firebase Firestore para el almacenamiento de datos.
- **Generación PDF:** Conversión automática de documentos a formato A4 profesional con marca de agua y diseño personalizado.
- **Historial Dinámico:** Explorador de documentos emitidos con opciones de visualización, descarga y borrado con manejo de IDs correlativos.
- **Interfaz Moderna:** Soporte de Modo Oscuro/Claro y diseño responsive.

## 🛠️ Tecnologías utilizadas

### Frontend
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) (Estilos)
- [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (Generación de PDFs)

### Backend
- [.NET 10.0](https://dotnet.microsoft.com/)
- [Firebase Admin SDK](https://firebase.google.com/) (Firestore)

## ⚙️ Configuración del entorno

### Prerrequisitos
- .NET 10 SDK
- Node.js (LTS)
- Firebase Project (con `serviceAccountKey.json` configurado en `/credenciales`)

### Instalación
1. Clona el repositorio:
   ```bash
   git clone [https://github.com/emmanuelarnedo/GestorComprobantes.git]

2. Instala las dependencias del Frontend:
    cd frontend
        npm install

3. Ejecuta el Backend:
    cd backend/GestorComprobantes.API
    dotnet run