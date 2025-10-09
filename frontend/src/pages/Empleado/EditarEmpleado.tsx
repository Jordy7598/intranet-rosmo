// src/pages/Empleado/EditarEmpleado.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/axios";

export default function EditarEmpleado() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  // === Form (nombres originales) ===
  const [form, setForm] = useState({
    Nombre: "",
    Apellido: "",
    Correo: "",
    Fecha_Contratacion: "",
    Dias_Vacaciones_Anuales: 0 as number | string,
    Dias_Vacaciones_Tomados: 0 as number | string,
    ID_Departamento: "" as number | string,
    ID_Puesto: "" as number | string,
    ID_Jefe_Inmediato: "" as number | string,
    Estado: "Activo",
  });

  // === Catálogos ===
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [puestos, setPuestos] = useState<any[]>([]);
  const [jefes, setJefes] = useState<any[]>([]);

  // === UI ===
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const cargarTodo = async () => {
      try {
        // Cargar catálogos
        const [depRes, pueRes, jefRes] = await Promise.all([
          api.get("/departamentos", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/puestos", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/empleados", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setDepartamentos(depRes.data || []);
        setPuestos(pueRes.data || []);
        setJefes(jefRes.data || []);

        // Cargar empleado
        const empRes = await api.get(`/empleados/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const e = empRes.data;

        setForm({
          Nombre: e?.Nombre ?? "",
          Apellido: e?.Apellido ?? "",
          Correo: e?.Correo ?? "",
          Fecha_Contratacion: (e?.Fecha_Contratacion ?? "").slice(0, 10), // yyyy-mm-dd
          Dias_Vacaciones_Anuales: e?.Dias_Vacaciones_Anuales ?? 0,
          Dias_Vacaciones_Tomados: e?.Dias_Vacaciones_Tomados ?? 0,
          ID_Departamento: e?.ID_Departamento ?? "",
          ID_Puesto: e?.ID_Puesto ?? "",
          ID_Jefe_Inmediato: e?.ID_Jefe_Inmediato ?? "",
          Estado: e?.Estado ?? "Activo",
        });
      } catch (err) {
        console.error(err);
        setMensaje("No fue posible cargar la información del empleado.");
        setTipoMensaje("error");
      } finally {
        setCargando(false);
      }
    };
    cargarTodo();
  }, [token, id, navigate]);

  const parseMaybeNumber = (name: string, value: string) => {
    const numeric = [
      "ID_Departamento",
      "ID_Puesto",
      "ID_Jefe_Inmediato",
      "Dias_Vacaciones_Anuales",
      "Dias_Vacaciones_Tomados",
    ];
    if (numeric.includes(name)) {
      if (value === "" || value === undefined) return "";
      const n = Number(value);
      return Number.isNaN(n) ? "" : n;
    }
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseMaybeNumber(name, value) as never }));
  };

  const validar = (): string | null => {
    if (!form.Nombre.trim()) return "El nombre es obligatorio.";
    if (!form.Apellido.trim()) return "El apellido es obligatorio.";
    if (!form.Correo.trim()) return "El correo es obligatorio.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Correo);
    if (!emailOk) return "El correo no tiene un formato válido.";
    if (!form.Fecha_Contratacion) return "La fecha de contratación es obligatoria.";
    if (form.ID_Departamento === "") return "Selecciona un departamento.";
    if (form.ID_Puesto === "") return "Selecciona un puesto.";
    return null;
  };

  const actualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validar();
    if (err) {
      setMensaje(err);
      setTipoMensaje("error");
      return;
    }
    setGuardando(true);
    setMensaje("");

    try {
      await api.put(
        `/empleados/${id}`,
        {
          Nombre: String(form.Nombre).trim(),
          Apellido: String(form.Apellido).trim(),
          Correo: String(form.Correo).trim().toLowerCase(),
          Fecha_Contratacion: form.Fecha_Contratacion,
          Dias_Vacaciones_Anuales:
            form.Dias_Vacaciones_Anuales === "" ? 0 : Number(form.Dias_Vacaciones_Anuales),
          Dias_Vacaciones_Tomados:
            form.Dias_Vacaciones_Tomados === "" ? 0 : Number(form.Dias_Vacaciones_Tomados),
          ID_Departamento: Number(form.ID_Departamento),
          ID_Puesto: Number(form.ID_Puesto),
          ID_Jefe_Inmediato: form.ID_Jefe_Inmediato === "" ? null : Number(form.ID_Jefe_Inmediato),
          Estado: form.Estado,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTipoMensaje("success");
      setMensaje("✓ Cambios guardados correctamente.");
      navigate("/empleados");
    } catch (error) {
      console.error(error);
      setTipoMensaje("error");
      setMensaje("No fue posible actualizar el empleado.");
    } finally {
      setGuardando(false);
    }
  };

  if (!token) return null;

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="header-content">
            <Link to="/empleados" className="back-button">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver
            </Link>
            <div className="header-text">
              <h1 className="page-title">Editar Empleado</h1>
              <p className="page-subtitle">Actualiza la información del colaborador</p>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="loading-state">
            <span className="spinner" />
            Cargando datos...
          </div>
        ) : (
          <div className="form-container">
            <form onSubmit={actualizar} className="employee-form">
              {/* Información Personal */}
              <div className="form-section">
                <div className="section-header">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <h2 className="section-title">Información Personal</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="Nombre" className="form-label">
                      Nombre <span className="required">*</span>
                    </label>
                    <input
                      id="Nombre"
                      name="Nombre"
                      type="text"
                      value={form.Nombre}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Apellido" className="form-label">
                      Apellido <span className="required">*</span>
                    </label>
                    <input
                      id="Apellido"
                      name="Apellido"
                      type="text"
                      value={form.Apellido}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="Correo" className="form-label">
                      Correo Electrónico <span className="required">*</span>
                    </label>
                    <input
                      id="Correo"
                      name="Correo"
                      type="email"
                      value={form.Correo}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información Laboral */}
              <div className="form-section">
                <div className="section-header">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <h2 className="section-title">Información Laboral</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="Fecha_Contratacion" className="form-label">
                      Fecha de Contratación <span className="required">*</span>
                    </label>
                    <input
                      id="Fecha_Contratacion"
                      name="Fecha_Contratacion"
                      type="date"
                      value={form.Fecha_Contratacion}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Estado" className="form-label">
                      Estado
                    </label>
                    <select
                      id="Estado"
                      name="Estado"
                      value={form.Estado}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="ID_Departamento" className="form-label">
                      Departamento <span className="required">*</span>
                    </label>
                    <select
                      id="ID_Departamento"
                      name="ID_Departamento"
                      value={form.ID_Departamento}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">-- Seleccione un departamento --</option>
                      {departamentos.map((dep) => (
                        <option key={dep.ID_Departamento} value={dep.ID_Departamento}>
                          {dep.Nombre_Departamento}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="ID_Puesto" className="form-label">
                      Puesto <span className="required">*</span>
                    </label>
                    <select
                      id="ID_Puesto"
                      name="ID_Puesto"
                      value={form.ID_Puesto}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">-- Seleccione un puesto --</option>
                      {puestos.map((p) => (
                        <option key={p.ID_Puesto} value={p.ID_Puesto}>
                          {p.Nombre_Puesto}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="ID_Jefe_Inmediato" className="form-label">
                      Jefe Inmediato
                    </label>
                    <select
                      id="ID_Jefe_Inmediato"
                      name="ID_Jefe_Inmediato"
                      value={form.ID_Jefe_Inmediato}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">-- Sin jefe inmediato --</option>
                      {jefes.map((j) => (
                        <option key={j.ID_Empleado} value={j.ID_Empleado}>
                          {j.Nombre} {j.Apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Vacaciones */}
              <div className="form-section">
                <div className="section-header">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <h2 className="section-title">Gestión de Vacaciones</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="Dias_Vacaciones_Anuales" className="form-label">
                      Días de Vacaciones Anuales
                    </label>
                    <input
                      id="Dias_Vacaciones_Anuales"
                      name="Dias_Vacaciones_Anuales"
                      type="number"
                      min="0"
                      value={form.Dias_Vacaciones_Anuales}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Dias_Vacaciones_Tomados" className="form-label">
                      Días de Vacaciones Tomados
                    </label>
                    <input
                      id="Dias_Vacaciones_Tomados"
                      name="Dias_Vacaciones_Tomados"
                      type="number"
                      min="0"
                      value={form.Dias_Vacaciones_Tomados}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Mensaje */}
              {mensaje && (
                <div className={`message ${tipoMensaje}`}>
                  {tipoMensaje === "success" ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                  {mensaje}
                </div>
              )}

              {/* Botones */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate("/empleados")}
                  className="btn btn-secondary"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? (
                    <>
                      <span className="spinner"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <style>{`
        :root{
          --primary:#cc0000;
          --primary-dark:#a30000;
          --primary-light:#fee2e2;
          --text-primary:#111827;
          --text-secondary:#6b7280;
          --text-muted:#9ca3af;
          --border:#e5e7eb;
          --bg-page:#f9fafb;
          --bg-white:#ffffff;
          --shadow:0 1px 3px rgba(0,0,0,.08);
          --shadow-md:0 4px 12px rgba(0,0,0,.1);
          --radius:12px;
        }
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg-page)}
        .page-container{max-width:900px;margin:0 auto;padding:24px}
        .page-header{margin-bottom:24px}
        .header-content{display:flex;flex-direction:column;gap:16px}
        .back-button{display:inline-flex;align-items:center;gap:8px;color:var(--text-secondary);text-decoration:none;font-size:14px;font-weight:600;transition:color .2s;width:fit-content}
        .back-button:hover{color:var(--primary)}
        .header-text{display:flex;flex-direction:column;gap:4px}
        .page-title{font-size:28px;font-weight:700;color:var(--text-primary);letter-spacing:-.5px}
        .page-subtitle{font-size:16px;color:var(--text-secondary)}

        .loading-state{display:flex;align-items:center;gap:10px;justify-content:center;color:var(--text-secondary);padding:60px 0}

        .form-container{background:var(--bg-white);border-radius:16px;box-shadow:var(--shadow);padding:32px}
        .employee-form{display:flex;flex-direction:column;gap:32px}
        .form-section{display:flex;flex-direction:column;gap:20px}
        .section-header{display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:2px solid var(--border);color:var(--text-primary)}
        .section-title{font-size:18px;font-weight:700}
        .form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
        .form-group{display:flex;flex-direction:column;gap:8px}
        .form-group.full-width{grid-column:1 / -1}
        .form-label{font-size:14px;font-weight:600;color:var(--text-primary)}
        .required{color:var(--primary)}
        .form-input{width:100%;padding:12px 16px;font-size:15px;color:var(--text-primary);background:var(--bg-page);border:2px solid var(--border);border-radius:var(--radius);outline:none;transition:all .2s}
        .form-input:focus{background:var(--bg-white);border-color:var(--primary);box-shadow:0 0 0 4px var(--primary-light)}
        .form-input::placeholder{color:var(--text-muted)}
        select.form-input{cursor:pointer}

        .message{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:var(--radius);font-size:15px;font-weight:500}
        .message.success{background:#f0fdf4;border:1px solid #86efac;color:#15803d}
        .message.error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c}

        .form-actions{display:flex;justify-content:flex-end;gap:12px;padding-top:20px;border-top:2px solid var(--border)}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;font-size:15px;font-weight:600;border:none;border-radius:var(--radius);cursor:pointer;transition:all .2s;text-decoration:none}
        .btn:disabled{opacity:.6;cursor:not-allowed}
        .btn-primary{background:var(--primary);color:#fff;box-shadow:var(--shadow)}
        .btn-primary:hover:not(:disabled){background:var(--primary-dark);transform:translateY(-2px);box-shadow:var(--shadow-md)}
        .btn-secondary{background:var(--bg-page);color:var(--text-secondary);border:2px solid var(--border)}
        .btn-secondary:hover:not(:disabled){background:#e5e7eb;color:var(--text-primary)}
        .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        @media (max-width:768px){
          .page-container{padding:16px}
          .form-container{padding:20px}
          .form-grid{grid-template-columns:1fr}
          .form-group.full-width{grid-column:1}
          .page-title{font-size:24px}
          .form-actions{flex-direction:column-reverse}
          .btn{width:100%}
        }
      `}</style>
    </>
  );
}
