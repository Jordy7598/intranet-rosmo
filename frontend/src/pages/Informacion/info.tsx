import React from "react";
import { Link } from "react-router-dom";

const Informacion: React.FC = () => {
  return (
    <div className="info-page">
      <style>{styles}</style>

      <section className="info-hero">
        <h1>Información Corporativa</h1>
        <p>Encuentra procesos internos, beneficios, normas de uso de salas e historias de ROSMO.</p>
        <div className="info-actions">
          <Link to="/info/guia" className="btn-primary">Ver Guía de la Intranet</Link>
        </div>
      </section>

      <section className="info-grid">
        <article className="card">
          <h3>Beneficios</h3>
          <p>Conoce prestaciones y programas disponibles para colaboradores.</p>
        </article>
        <article className="card">
          <h3>Procesos Internos</h3>
          <p>Pasos y responsables de los procesos más frecuentes.</p>
        </article>
        <article className="card">
          <h3>Uso de Salas</h3>
          <p>Modalidades, normas de uso y buenas prácticas.</p>
        </article>
      </section>
    </div>
  );
};
const styles = `
.info-page { max-width: 1000px; margin: 0 auto; padding: 24px; color: var(--text, #1f2937); }
.info-hero { background: var(--bg-card, #fff); border-radius: 16px; box-shadow: 0 6px 18px rgba(16,24,40,0.06); border: 1px solid rgba(0,0,0,0.04); padding: 24px; }
.info-hero h1 { margin: 0 0 8px; font-size: 1.8rem; }
.info-hero p { color: var(--muted, #6b7280); margin: 0; }
.info-actions { margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap; }
.btn-primary { display: inline-block; padding: 10px 14px; background: #EF4444; color: #fff; border-radius: 12px; text-decoration: none; border: 1px solid transparent; box-shadow: 0 4px 12px rgba(43,98,240,0.25); }
.btn-primary:hover { filter: brightness(0.97); }
.info-grid { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 14px; }
.card { background: var(--bg-card, #fff); border-radius: 16px; box-shadow: 0 6px 18px rgba(16,24,40,0.06); border: 1px solid rgba(0,0,0,0.04); padding: 18px; }
.card h3 { margin: 0 0 6px; font-size: 1.1rem; }
.card p { margin: 0; color: var(--muted, #6b7280); }
`;

export default Informacion;
