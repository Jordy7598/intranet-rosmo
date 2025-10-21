const Encuestas: React.FC = () => {
  return (
    <div className="encuestas-page">

      <section className="card guiadash-card">
          <div className="card-head">
            <strong>PRÓXIMAMENTE</strong>
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
    </div>
  );
};

export default Encuestas;