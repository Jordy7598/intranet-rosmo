/* eslint-disable @typescript-eslint/no-explicit-any */


import React, { useState, useEffect } from "react";
import {
  obtenerArchivos,
  subirArchivo,
  eliminarArchivo,
} from "../../api/archivoCorporativo.api";
import type { ArchivoCorporativo } from "../../api/archivoCorporativo.api";
import { FileText, Upload, Trash2, X, ArrowDownToLine } from "lucide-react";
import "../../styles/ArchivosCorporativos.css";

const ArchivosCorporativos: React.FC = () => {
  const [archivos, setArchivos] = useState<ArchivoCorporativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [categoria, setCategoria] = useState("General");
  const [uploading, setUploading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const rol = Number(localStorage.getItem("usuario_rol"));
  const esAdminORRHH = rol === 1 || rol === 2;

  useEffect(() => {
    cargarArchivos();
  }, []);

  const archivosFiltrados = archivos.filter((archivo) => {
    const searchLower = busqueda.toLowerCase();
    return (
      archivo.Nombre_Archivo.toLowerCase().includes(searchLower) ||
      archivo.Categoria.toLowerCase().includes(searchLower)
    );
  });

  const cargarArchivos = async () => {
    try {
      setLoading(true);
      const data = await obtenerArchivos();
      setArchivos(data);
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoSeleccionado(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoSeleccionado) return;

    try {
      setUploading(true);
      await subirArchivo(archivoSeleccionado, categoria);
      setMostrarFormulario(false);
      setArchivoSeleccionado(null);
      setCategoria("General");
      cargarArchivos();
    } catch (error: any) {
      console.error("Error al subir archivo:", error);
      alert(error.response?.data?.error || "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleEliminar = async (id: number, nombreArchivo: string) => {
    if (!confirm(`¿Estás seguro de eliminar el archivo "${nombreArchivo}"?`)) return;

    try {
      await eliminarArchivo(id);
      cargarArchivos();
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      alert("Error al eliminar el archivo");
    }
  };

  const handleDescargar = (ruta: string, nombre: string) => {
    const baseUrl = import.meta.env.VITE_API_URL_Images || "";
    const url = `${baseUrl}${ruta}`;
    
    const link = document.createElement("a");
    link.href = url;
    link.download = nombre;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getIconoPorTipo = () => {
    return <FileText size={24} />;
  };

  if (loading) {
    return (
      <div className="archivos-page">
        <div className="card">
          <p>Cargando archivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="archivos-page">
      <section className="card archivos-header-card">
        <div className="card-head">
          <h2>Archivos Corporativos</h2>
          {esAdminORRHH && (
            <button
              className="btn-primary"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              <Upload size={20} />
              {mostrarFormulario ? "Cancelar" : "Subir Archivo"}
            </button>
          )}
        </div>
        <p>
          Políticas y reglamentos de la empresa. Descarga los documentos cuando los
          necesites.
        </p>
      </section>

      {/* Buscador */}
      <section className="card buscador-card">
        <div className="search-container">
          <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button
              className="btn-clear-search"
              onClick={() => setBusqueda("")}
              title="Limpiar búsqueda"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </section>

      {mostrarFormulario && esAdminORRHH && (
        <section className="card formulario-archivo-card">
          <div className="card-head">
            <h3>Subir Nuevo Archivo</h3>
            <button
              className="btn-icon"
              onClick={() => setMostrarFormulario(false)}
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="form-archivo">
            <div className="form-group">
              <label htmlFor="archivo">Seleccionar archivo *</label>
              <input
                type="file"
                id="archivo"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                required
              />
              <small>Formatos permitidos: PDF, Word, Excel, PowerPoint (máx. 10MB)</small>
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Políticas">Políticas</option>
                <option value="Reglamentos">Reglamentos</option>
                <option value="Procedimientos">Procedimientos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !archivoSeleccionado}
            >
              {uploading ? "Subiendo..." : "Subir Archivo"}
            </button>
          </form>
        </section>
      )}

      <section className="card archivos-lista-card">
        <div className="card-head">
          <h3>Documentos Disponibles</h3>
          <span className="badge">{archivosFiltrados.length} archivos</span>
        </div>

        {busqueda && archivosFiltrados.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>No se encontraron archivos que coincidan con "{busqueda}"</p>
            <button className="btn-secondary" onClick={() => setBusqueda("")}>
              Limpiar búsqueda
            </button>
          </div>
        ) : archivosFiltrados.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>No hay archivos disponibles</p>
          </div>
        ) : (
          <div className="archivos-grid">
            {archivosFiltrados.map((archivo) => (
              <div key={archivo.ID_Archivo} className="archivo-card">
                <div className="archivo-icon">{getIconoPorTipo()}</div>
                <div className="archivo-info">
                  <h4>{archivo.Nombre_Archivo}</h4>
                  <div className="archivo-meta">
                    <span className="categoria-badge">{archivo.Categoria}</span>
                    <span className="fecha-text">
                      {formatearFecha(archivo.Fecha_Creacion)}
                    </span>
                  </div>
                  {archivo.Nombre_Creador && (
                    <small className="creador-text">
                      Subido por: {archivo.Nombre_Creador}
                    </small>
                  )}
                </div>
                <div className="archivo-acciones">
                  <button
                    className="btn-icon-success"
                    onClick={() =>
                      handleDescargar(archivo.Ruta, archivo.Nombre_Archivo)
                    }
                    title="Descargar"
                  >
                    <ArrowDownToLine size={32} className="icon-red" />
                  </button>
                  {esAdminORRHH && (
                    <button
                      className="btn-icon-danger"
                      onClick={() =>
                        handleEliminar(archivo.ID_Archivo, archivo.Nombre_Archivo)
                      }
                      title="Eliminar"
                    >
                      <Trash2 size={32} className="icon-red" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ArchivosCorporativos;
