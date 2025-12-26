import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Image as ImageIcon, Video, ArrowLeft } from "lucide-react";
import { crearGaleria } from "../../api/galeria.api";
import "../../styles/Galeria.css";

export default function CrearGaleria() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setArchivos([...archivos, ...newFiles]);
      
      // Generar previews
      newFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviews((prev) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith("video/")) {
          setPreviews((prev) => [...prev, "video"]);
        }
      });
    }
  };

  const removerArchivo = (index: number) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    const nuevosPreviews = previews.filter((_, i) => i !== index);
    setArchivos(nuevosArchivos);
    setPreviews(nuevosPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !descripcion.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (archivos.length === 0) {
      alert("Debes subir al menos un archivo");
      return;
    }

    try {
      setUploading(true);
      await crearGaleria(titulo, descripcion, archivos);
      alert("Álbum creado exitosamente");
      navigate("/galeria");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al crear álbum:", error);
      alert(error.response?.data?.error || "Error al crear el álbum");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="galeria-page">
      <section className="card galeria-header-card">
        <div className="card-head">
          <button className="btn-back" onClick={() => navigate("/galeria")}>
            <ArrowLeft size={20} />
            Volver
          </button>
          <h2>Crear Nuevo Álbum</h2>
        </div>
      </section>

      <section className="card">
        <form onSubmit={handleSubmit} className="galeria-form">
          <div className="form-group">
            <label htmlFor="titulo">Título del Álbum *</label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Evento de fin de año 2025"
              required
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe brevemente el contenido del álbum..."
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Archivos (Imágenes y Videos) *</label>
            <div className="upload-area">
              <input
                type="file"
                id="archivos"
                onChange={handleFileChange}
                accept="image/*,video/*"
                multiple
                style={{ display: "none" }}
              />
              <label htmlFor="archivos" className="upload-label">
                <Upload size={32} />
                <span>Click para seleccionar archivos</span>
                <small>Imágenes: JPG, PNG, GIF, WEBP | Videos: MP4, MOV, AVI, WEBM</small>
                <small>Máximo 50MB por archivo | Hasta 20 archivos</small>
              </label>
            </div>
          </div>

          {archivos.length > 0 && (
            <div className="form-group">
              <label>Archivos seleccionados ({archivos.length})</label>
              <div className="preview-grid">
                {archivos.map((archivo, index) => (
                  <div key={index} className="preview-item">
                    <button
                      type="button"
                      className="remove-preview"
                      onClick={() => removerArchivo(index)}
                    >
                      <X size={16} />
                    </button>
                    {previews[index] === "video" ? (
                      <div className="preview-video-placeholder">
                        <Video size={32} />
                        <span>{archivo.name}</span>
                      </div>
                    ) : previews[index] ? (
                      <img
                        src={previews[index]}
                        alt={`Preview ${index + 1}`}
                        className="preview-image"
                      />
                    ) : (
                      <div className="preview-placeholder">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <p className="preview-name">{archivo.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/galeria")}
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || archivos.length === 0}
            >
              {uploading ? "Creando..." : "Crear Álbum"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
