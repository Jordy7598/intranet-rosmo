import React from "react";
import { Link } from "react-router-dom";

const GuiaIntranet: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <div className="guiadash-page">
        <style>{styles}</style>
      <header className="guiadash-header card">
        <div>
          <h1 className="title">Guía de uso — Intranet ROSMO</h1>
          <p className="subtitle">
            Un vistazo rápido a lo que puedes hacer en cada módulo. Todo en un solo lugar,
            con la misma experiencia del Dashboard.
          </p>
        </div>
      </header>

      <main className="guiadash-grid">
        {/* DASHBOARD */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Inicio</span>
            <h2>📊 Dashboard</h2>
          </div>
          <p>
            Vista principal con lo más importante del mes: <strong>noticias populares</strong>,
            <strong>cumpleaños</strong>, <strong>aniversarios</strong>, reglamentos y encuestas recientes.
          </p>
          <ul className="bullets">
            <li>Ve lo nuevo de un vistazo y entra con un clic.</li>
            <li>Accesos directos a reglamentos y encuestas activas.</li>
          </ul>
        </section>

        {/* NOTICIAS */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Comunicados</span>
            <h2>📰 Noticias</h2>
          </div>
          <p>
            Comunicados oficiales con interacción. Da <strong>like</strong>, comenta y revisa
            publicaciones por <em>área</em> (Producción, Administración, Comercial, etc.).
          </p>
          <ul className="bullets">
            <li>Explora anuncios, eventos y avisos internos.</li>
            <li>Recibe información segmentada según tu área.</li>
          </ul>
        </section>

        {/* GALERÍA */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Cultura</span>
            <h2>📷 Galería</h2>
          </div>
          <p>
            Álbumes de fotos y videos sobre actividades, eventos y logros. Mercadeo y RRHH los mantienen
            al día; tú puedes reaccionar y comentar.
          </p>
          <ul className="bullets">
            <li>Revive eventos y comparte impresiones.</li>
          </ul>
        </section>

        {/* CENTRO DE REQUERIMIENTO */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Trámites</span>
            <h2>📄 Centro de Requerimiento</h2>
          </div>
          <p>Solicitudes digitales sin papeles ni correos. Recibirás notificaciones de respuesta.</p>
          <ul className="bullets">
            <li><strong>Carta de Ingresos</strong> (con aprobación).</li>
            <li><strong>Boletas de Pago</strong> (sin aprobación, elige quincena/mes/año).</li>
            <li><strong>Salida Anticipada</strong> (con aprobación: almuerzo, fuera de oficina, HomeOffice).</li>
          </ul>
        </section>

        {/* ARCHIVOS CORPORATIVOS */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Documentos</span>
            <h2>📚 Archivos Corporativos</h2>
          </div>
          <p>
            Políticas y reglamentos de la empresa, segmentados por área o de acceso general. Descárgalos cuando los necesites.
          </p>
          <ul className="bullets">
            <li>Información oficial mantenida por RRHH.</li>
          </ul>
        </section>

        {/* ENCUESTAS */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Participa</span>
            <h2>📝 Encuestas</h2>
          </div>
          <p>
            Participa en encuestas internas (clima laboral, iniciativas, etc.). Se muestran como enlaces
            a formularios externos y tienen fechas de disponibilidad.
          </p>
          <ul className="bullets">
            <li>Responde dentro del período indicado.</li>
          </ul>
        </section>

        {/* INFORMACIÓN */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Conoce</span>
            <h2>ℹ️ Información</h2>
          </div>
          <p>
            Contenido informativo: procesos internos, beneficios, normas de uso de salas e historias.
            No requiere interacción; es para que tengas todo claro y a mano.
          </p>
        </section>

        {/* MIS PAGOS */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Mi cuenta</span>
            <h2>💰 Mis Pagos</h2>
          </div>
          <p>
            Consulta tus <strong>boletas de pago</strong> desde las cargas periódicas de RRHH
            (se gestionan desde el Centro de Requerimiento).
          </p>
          <ul className="bullets">
            <li>Historial accesible y ordenado.</li>
          </ul>
        </section>

        {/* VACACIONES */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Tiempo libre</span>
            <h2>🏖️ Vacaciones</h2>
          </div>
          <p>Solicita y da seguimiento a tus vacaciones:</p>
          <ul className="bullets">
            <li><strong>Solicitudes:</strong> todas tus solicitudes y estados.</li>
            <li><strong>Crear Solicitud:</strong> indica fechas y motivo.</li>
            <li><strong>Historial:</strong> vacaciones gozadas.</li>
          </ul>
        </section>

        {/* CALENDARIO */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Agenda</span>
            <h2>📆 Calendario</h2>
          </div>
          <p>
            Vista mensual con cumpleaños, aniversarios, eventos y vacaciones aprobadas. Ayuda a planificar
            contigo y tu equipo.
          </p>
        </section>

        {/* DIRECTORIO */}
        <section className="card guiadash-card">
          <div className="card-head">
            <span className="badge">Personas</span>
            <h2>👥 Directorio de Usuarios</h2>
          </div>
          <p>
            Encuentra a tus compañeros: puesto, correo, extensión, claves de radio y una breve descripción
            del perfil para colaborar mejor.
          </p>
        </section>
      </main>

      <footer className="guiadash-footer card">
        <div className="footer-inner">
          <p>© {year} <strong>ROSMO</strong> — Intranet Corporativa</p>
          <Link to="/dashboard" className="btn-primary">Ir al Dashboard</Link>
        </div>
      </footer>
    </div>
  );
};

export default GuiaIntranet;

const styles = `
:root {
  --bg: #f6f7fb;
  --bg-card: #ffffff;
  --text: #1f2937;
  --muted: #6b7280;
  --primary: #2b62f0;
  --primary-weak: #e7efff;
  --ring: rgba(43, 98, 240, 0.25);
  --shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
  --radius: 16px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0e14;
    --bg-card: #121723;
    --text: #e5e7eb;
    --muted: #9aa3b2;
    --primary: #5a7bff;
    --primary-weak: #1a2240;
    --ring: rgba(90, 123, 255, 0.35);
    --shadow: 0 8px 24px rgba(0,0,0,0.35);
  }
}
body { background: var(--bg); }

.guiadash-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  color: var(--text);
}

.tittle { font-size: 1.8rem; margin: 0; }
.subtitle { color: var(--muted); margin-top: 8px; }

.card {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid rgba(0,0,0,0.04);
}

.guiadash-header { padding: 20px 22px; margin-bottom: 16px; }

.guiadash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.guiadash-card {
  padding: 18px;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
  border: 1px solid transparent;
}
.guiadash-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(16, 24, 40, 0.08);
  border-color: rgba(43, 98, 240, 0.10);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.card-head h2 {
  font-size: 1.1rem;
  margin: 0;
}

.badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--primary-weak);
  color: var(--primary);
  border: 1px solid rgba(43, 98, 240, 0.18);
}

.bullets {
  margin: 10px 0 0;
  padding-left: 18px;
  color: var(--muted);
}
.bullets li { margin: 6px 0; }

.guiadash-footer { margin-top: 16px; padding: 16px; }
.footer-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.btn-primary {
  display: inline-block;
  padding: 10px 14px;
  background: #EF4444;
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  border: 1px solid transparent;
  box-shadow: 0 4px 12px var(--ring);
}
.btn-primary:hover { filter: brightness(0.97); }
`;

// Si prefieres CSS modular, crea "GuiaIntranet.css" y pega el bloque de estilos.
// Asegúrate de importar el CSS donde montes este componente.
