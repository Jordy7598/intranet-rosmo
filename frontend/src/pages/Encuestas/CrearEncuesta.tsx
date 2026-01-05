import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearEncuesta, actualizarEncuesta, obtenerEncuesta } from "../../api/encuestas.api";
import type { CrearEncuestaData } from "../../api/encuestas.api";
import { ArrowLeft, Save, X } from "lucide-react";
import "../../styles/Encuestas.css";

const CrearEncuesta = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<CrearEncuestaData>({
    titulo: "",
    descripcion: "",
    link_externo: "",
    fecha_publicacion: "",
    fecha_cierre: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      cargarEncuesta(parseInt(id));
    }
  }, [id, isEditing]);

  const cargarEncuesta = async (encuestaId: number) => {
    try {
      const data = await obtenerEncuesta(encuestaId);
      setFormData({
        titulo: data.Titulo,
        descripcion: data.Descripcion || "",
        link_externo: data.Link_Externo,
        fecha_publicacion: data.Fecha_Publicacion.slice(0, 16), // formato datetime-local
        fecha_cierre: data.Fecha_Cierre.slice(0, 16),
      });
    } catch (error) {
      console.error("Error al cargar encuesta:", error);
      setError("Error al cargar la encuesta");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validar que la fecha de cierre sea posterior a la de publicación
      if (new Date(formData.fecha_cierre) <= new Date(formData.fecha_publicacion)) {
        setError("La fecha de cierre debe ser posterior a la fecha de publicación");
        setLoading(false);
        return;
      }

      if (isEditing && id) {
        await actualizarEncuesta(parseInt(id), formData);
      } else {
        await crearEncuesta(formData);
      }

      navigate("/encuestas");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al guardar encuesta:", error);
      setError(error?.response?.data?.error || "Error al guardar la encuesta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="encuestas-page">
      <section className="encuestas-page .card">
        <div className="form-header">
          <button className="btn-back" onClick={() => navigate("/encuestas")}>
            <ArrowLeft size={20} />
            Volver
          </button>
          <h2>{isEditing ? "Editar Encuesta" : "Nueva Encuesta"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="encuesta-form">
          {error && (
            <div className="error-message">
              <X size={18} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="titulo">
              Título de la encuesta <span className="required">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              placeholder="Ej: Encuesta de Satisfacción Laboral 2025"
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Describe el propósito de esta encuesta..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="link_externo">
              Link del Formulario (Google Forms, etc.) <span className="required">*</span>
            </label>
            <input
              type="url"
              id="link_externo"
              name="link_externo"
              value={formData.link_externo}
              onChange={handleChange}
              required
              placeholder="https://forms.google.com/..."
            />
            <small>Copia el link completo del formulario externo</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_publicacion">
                Fecha de inicio <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="fecha_publicacion"
                name="fecha_publicacion"
                value={formData.fecha_publicacion}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_cierre">
                Fecha de cierre <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="fecha_cierre"
                name="fecha_cierre"
                value={formData.fecha_cierre}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/encuestas")}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? "Actualizar" : "Crear"} Encuesta
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CrearEncuesta;
