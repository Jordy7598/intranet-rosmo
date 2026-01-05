import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerEncuesta, type Encuesta } from "../../api/encuestas.api";
import "../../styles/Encuestas.css";

const EncuestaResponder = () => {
  const { id } = useParams();
  const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      cargarEncuesta(parseInt(id));
    }
  }, [id]);

  const cargarEncuesta = async (encuestaId: number) => {
    try {
      const data = await obtenerEncuesta(encuestaId);
      setEncuesta(data);
      
      // Redirigir inmediatamente a Google Forms
      if (data.Link_Externo) {
        window.location.href = data.Link_Externo;
      }
    } catch (error) {
      console.error("Error al cargar encuesta:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="encuesta-responder-loading">
        <div className="loading-spinner"></div>
        <h2>Redirigiendo a la encuesta...</h2>
        <p>Por favor espera un momento.</p>
      </div>
    );
  }

  if (!encuesta) {
    return (
      <div className="encuesta-responder-error">
        <h2>Encuesta no encontrada</h2>
        <p>Lo sentimos, no se pudo encontrar la encuesta solicitada.</p>
        <button onClick={() => window.close()}>Cerrar ventana</button>
      </div>
    );
  }

  return (
    <div className="encuesta-responder-loading">
      <div className="loading-spinner"></div>
      <h2>Redirigiendo a la encuesta...</h2>
      <p>Si no eres redirigido automáticamente, haz clic aquí:</p>
      <a href={encuesta.Link_Externo} target="_blank" rel="noopener noreferrer">
        Abrir encuesta
      </a>
    </div>
  );
};

export default EncuestaResponder;
