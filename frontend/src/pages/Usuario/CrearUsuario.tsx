// src/pages/Usuario/CrearUsuario.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

const API_BASE_URL = import.meta.env.VITE_API_URL_Images || "http://localhost:3000";

type Rol = {
  ID_Rol: number;
  Nombre_Rol: string;
};

type Empleado = {
  ID_Empleado: number;
  Nombre: string;
  Apellido: string;
  Estado?: string;
};

export default function CrearUsuario() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [roles, setRoles] = useState<Rol[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [cargandoDatos, setCargandoDatos] = useState<boolean>(true);
  const [msg, setMsg] = useState<string | null>(null);

  // Form state (mantenemos *exactamente* los nombres esperados por el backend)
  const [Nombre_Usuario, setNombre_Usuario] = useState("");
  const [Correo, setCorreo] = useState("");
  const [Contraseña, setContraseña] = useState("");
  const [Foto_Perfil, setFoto_Perfil] = useState<string>("");
  const [ID_Empleado, setID_Empleado] = useState<number | "">("");
  const [ID_Rol, setID_Rol] = useState<number | "">("");
  const [Estado, setEstado] = useState<"Activo" | "Inactivo">("Activo");

  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para la carga de archivos
  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [previsualizacion, setPrevisualizacion] = useState<string>("");
  const [cargandoFoto, setCargandoFoto] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const cargarListas = async () => {
      try {
        // Roles
        const r = await api.get("/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(r.data || []);

        // Empleados (opcional asociar)
        const e = await api.get("/empleados", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmpleados(e.data || []);
      } catch (err: any) {
        setMsg(err?.response?.data?.message || "Error al cargar catálogos");
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarListas();
  }, [token, navigate]);

  // Función para manejar la selección de archivo
  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!tiposPermitidos.includes(file.type)) {
      setMsg("Solo se permiten imágenes (jpeg, jpg, png, gif, webp)");
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMsg("La imagen no debe superar 5MB");
      return;
    }

    setArchivoFoto(file);

    // Crear previsualización
    const reader = new FileReader();
    reader.onloadend = () => {
      setPrevisualizacion(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Función para eliminar la foto seleccionada
  const eliminarFoto = () => {
    setArchivoFoto(null);
    setPrevisualizacion("");
    setFoto_Perfil("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!Nombre_Usuario.trim() || !Correo.trim() || !Contraseña.trim() || !ID_Rol) {
      setMsg("Completa al menos: Usuario, Correo, Contraseña y Rol.");
      return;
    }

    setCargando(true);
    try {
      let rutaFoto = Foto_Perfil;

      // Si hay un archivo seleccionado, subirlo primero
      if (archivoFoto) {
        setCargandoFoto(true);
        const formData = new FormData();
        formData.append("foto", archivoFoto);

        const uploadResponse = await api.post("/usuarios/upload-foto", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        rutaFoto = uploadResponse.data.rutaFoto;
        setCargandoFoto(false);
      }

      // Crear el usuario con la ruta de la foto
      await api.post(
        "/usuarios",
        {
          Nombre_Usuario,
          Correo,
          Contraseña,
          Foto_Perfil: rutaFoto || null,
          ID_Empleado: ID_Empleado === "" ? null : Number(ID_Empleado),
          ID_Rol: Number(ID_Rol),
          Estado,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/usuarios");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Error al crear usuario");
      setCargandoFoto(false);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="hdr">
        <div>
          <h2 className="title">Crear usuario</h2>
          <p className="subtitle">Registra una nueva cuenta para la intranet</p>
        </div>
        <div className="hdr-actions">
          <Link to="/usuarios" className="btn-outline">Volver</Link>
        </div>
      </div>

      {cargandoDatos ? (
        <div className="state">
          <span className="spinner" />
          <span>Cargando datos...</span>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="form">
          {msg && (
            <div className="state error" style={{ marginBottom: 16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
              </svg>
              {msg}
            </div>
          )}

          <div className="grid">
            <div className="field">
              <label className="label">Nombre de usuario</label>
              <input
                className="input"
                value={Nombre_Usuario}
                onChange={(e) => setNombre_Usuario(e.target.value)}
                placeholder="Ej. Jordy Castillo"
                required
              />
            </div>

            <div className="field">
              <label className="label">Correo</label>
              <input
                className="input"
                type="email"
                value={Correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@dominio.com"
                required
              />
            </div>

            <div className="field">
              <label className="label">Contraseña</label>
              <div className="input-pass">
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={Contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="label">Rol</label>
              <select
                className="input"
                value={ID_Rol}
                onChange={(e) => setID_Rol(e.target.value ? Number(e.target.value) : "")}
                required
              >
                <option value="">Selecciona un rol</option>
                {roles.map((r) => (
                  <option key={r.ID_Rol} value={r.ID_Rol}>
                    {r.Nombre_Rol}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label">Empleado</label>
              <select
                className="input"
                value={ID_Empleado}
                onChange={(e) => setID_Empleado(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">No asociar</option>
                {empleados.map((emp) => (
                  <option key={emp.ID_Empleado} value={emp.ID_Empleado}>
                    {emp.Nombre} {emp.Apellido} (#{emp.ID_Empleado})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label">Estado</label>
              <select
                className="input"
                value={Estado}
                onChange={(e) => setEstado(e.target.value as "Activo" | "Inactivo")}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="field col-span-2">
              <label className="label">Foto de perfil</label>
              
              {!previsualizacion && !Foto_Perfil && (
                <div className="upload-area">
                  <input
                    type="file"
                    id="fotoInput"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFotoChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="fotoInput" className="upload-label">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="upload-text">Haz clic para seleccionar una imagen</span>
                    <span className="upload-hint">JPG, PNG, GIF, WEBP (máx. 5MB)</span>
                  </label>
                </div>
              )}

              {(previsualizacion || Foto_Perfil) && (
                <div className="preview-container">
                  <img 
                    src={
                      previsualizacion 
                        ? previsualizacion 
                        : Foto_Perfil?.startsWith('http') 
                          ? Foto_Perfil 
                          : `${API_BASE_URL}${Foto_Perfil}`
                    } 
                    alt="Vista previa" 
                    className="preview-image"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      console.error('Error al cargar imagen:', Foto_Perfil);
                    }}
                  />
                  <button
                    type="button"
                    onClick={eliminarFoto}
                    className="btn-delete-preview"
                    aria-label="Eliminar foto"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}

              <div style={{ marginTop: "10px" }}>
                <label className="label" style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  O ingresa una URL de imagen
                </label>
                <input
                  className="input"
                  value={Foto_Perfil}
                  onChange={(e) => setFoto_Perfil(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  disabled={!!archivoFoto}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">{cargandoFoto && (
              <div style={{ color: "#6b7280", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="spinner" style={{ width: "16px", height: "16px" }} />
                <span style={{ fontSize: "14px" }}>Subiendo foto...</span>
              </div>
            )}
            <button type="button" className="btn-outline" onClick={() => navigate("/usuarios")}>
              Cancelar
            </button>
            <button type="submit" className="btn" disabled={cargando}>
              {cargando ? (
                <>
                  <span className="spinner" /> Guardando...
                </>
              ) : (
                "Guardar usuario"
              )}
            </button>
          </div>
        </form>
      )}

      <style>{cssLocal}</style>
    </div>
  );
}

const cssLocal = `
:root{
  --primary:#cc0000;
  --primary-600:#a30000;
  --card:#ffffff;
  --border:#e5e7eb;
  --border-light:#f3f4f6;
  --muted:#6b7280;
  --bg:#f9fafb;
}
.card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:14px;
  box-shadow:0 1px 3px rgba(0,0,0,.08);
}
.hdr{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.title{font-size:20px;letter-spacing:-.2px}
.subtitle{font-size:13px;color:var(--muted)}
.btn{
  appearance:none;border:1px solid transparent;background:var(--primary);color:#fff;
  padding:.6rem .9rem;border-radius:10px;font-weight:700;cursor:pointer;
  display:inline-flex;align-items:center;gap:8px;text-decoration:none;
}
.btn:hover{background:var(--primary-600)}
.btn-outline{
  background:#fff;border:1px solid var(--border);color:#111827;
  padding:.55rem .85rem;border-radius:10px;font-weight:600;cursor:pointer;text-decoration:none;
}
.state{
  padding:40px 16px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--muted)
}
.state.error{color:#991b1b}
.spinner{
  width:18px;height:18px;border:3px solid rgba(0,0,0,.1);border-top-color:var(--primary);
  border-radius:50%;animation:spin .8s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}

.form{display:flex;flex-direction:column;gap:18px}
.grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap:16px;
}
.field{display:flex;flex-direction:column;gap:6px}
.field.col-span-2{grid-column: span 2 / span 2}
.label{font-size:.85rem;font-weight:700;color:#111827}
.input{
  width:100%;background:#fff;border:1.5px solid var(--border);border-radius:10px;
  padding:.7rem .9rem;font-size:15px;outline:none;transition:border .15s, box-shadow .15s;
}
.input:focus{
  border-color:var(--primary);
  box-shadow:0 0 0 4px rgba(204,0,0,.08);
}
.input-pass{position:relative}
.pass-toggle{
  position:absolute;right:10px;top:50%;transform:translateY(-50%);
  background:transparent;border:none;cursor:pointer;color:#6b7280;padding:4px;border-radius:8px;
}
.pass-toggle:hover{color:#111827}

.upload-area{
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 32px 16px;
  text-align: center;
  background: var(--bg);
  transition: all .2s;
  cursor: pointer;
}
.upload-area:hover{
  border-color: var(--primary);
  background: rgba(204, 0, 0, 0.02);
}
.upload-label{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: var(--muted);
}
.upload-text{
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.upload-hint{
  font-size: 13px;
  color: var(--muted);
}

.preview-container{
  position: relative;
  display: inline-block;
  border: 2px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg);
}
.preview-image{
  max-height: 200px;
  display: block;
  border-radius: 10px;
}
.btn-delete-preview{
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: white;
  transition: background .2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-delete-preview:hover{
  background: rgba(0, 0, 0, 0.9);
}

.preview{
  margin-top:10px;border:1px dashed var(--border);border-radius:10px;padding:8px;background:var(--bg)
}
.preview img{max-height:140px;border-radius:8px;display:block}

.form-actions{
  margin-top:4px;display:flex;align-items:center;justify-content:flex-end;gap:10px
}

@media (max-width: 768px){
  .grid{grid-template-columns: 1fr}
  .field.col-span-2{grid-column:auto}
}
`;
