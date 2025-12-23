import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Mantenimiento() {
  const token = localStorage.getItem("token");
  const rol = Number(localStorage.getItem("usuario_rol"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Verificar que sea administrador (rol 1)
  useEffect(() => {
    if (rol !== 1) {
      alert("No tienes permisos para acceder a esta página");
      navigate("/dashboard");
    }
  }, [rol, navigate]);

  const handleCleanupImages = async () => {
    if (!confirm("¿Estás seguro de ejecutar la limpieza de imágenes huérfanas? Esta acción eliminará imágenes no asociadas a noticias que tengan más de 24 horas.")) {
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await api.post("/uploads/cleanup", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResult({
        message: response.data.message || "Limpieza completada exitosamente",
        type: "success"
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al ejecutar limpieza:", error);
      setResult({
        message: error.response?.data?.error || "Error al ejecutar la limpieza",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="maintenance-page">
      <div className="maintenance-header">
        <h1 className="page-title">🔧 Mantenimiento del Sistema</h1>
        <p className="page-subtitle">
          Herramientas administrativas para mantener la aplicación
        </p>
      </div>

      <div className="maintenance-grid">
        {/* Card: Limpieza de imágenes */}
        <div className="maintenance-card">
          <div className="card-icon">🗑️</div>
          <h2 className="card-title">Limpieza de Imágenes Huérfanas</h2>
          <p className="card-description">
            Elimina imágenes subidas que no están asociadas a ninguna noticia y tienen más de 24 horas de antigüedad.
          </p>

          {result && (
            <div className={`alert alert-${result.type}`}>
              {result.type === "success" ? "✅" : "❌"} {result.message}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleCleanupImages}
            disabled={loading}
          >
            {loading ? "🔄 Ejecutando..." :  "Ejecutar Limpieza"}
          </button>

          <div className="card-info">
            <strong>ℹ️ Información:</strong>
            <ul>
              <li>Se eliminan imágenes no vinculadas a noticias</li>
              <li>Solo si tienen más de 24 horas</li>
              <li>Las imágenes en uso NO se eliminan</li>
            </ul>
          </div>
        </div>

        {/* Puedes agregar más tarjetas de mantenimiento aquí */}
      </div>

      <style>{`
        .maintenance-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .maintenance-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 15px;
          color: #6b7280;
        }

        .maintenance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .maintenance-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-icon {
          font-size: 48px;
          text-align: center;
        }

        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          text-align: center;
        }

        .card-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          text-align: center;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .alert-success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .alert-error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 10px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .btn-primary {
          background: #cc0000;
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .btn-primary:hover:not(:disabled) {
          background: #a30000;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(204, 0, 0, 0.2);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .card-info {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          font-size: 13px;
          color: #374151;
        }

        .card-info strong {
          display: block;
          margin-bottom: 8px;
          color: #111827;
        }

        .card-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .card-info li {
          margin-bottom: 4px;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .maintenance-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
