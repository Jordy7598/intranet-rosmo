// src/pages/Usuario/Usuarios.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getFotoUrl, getImageErrorHandler } from "../../utils/imageHelper";

type Usuario = {
  ID_Usuario: number;
  Nombre_Usuario: string;
  Correo: string;
  Nombre_Rol?: string;
  Estado: "Activo" | "Inactivo" | string;
  ID_Empleado?: number | null;
  Foto_Perfil?: string | null;
};

export default function Usuarios() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const cargar = async () => {
      setLoading(true);
      setMsg(null);
      try {
        const res = await api.get("/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data || []);
      } catch (e: any) {
        setMsg(e?.response?.data?.message || "Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [token, navigate]);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="hdr">
        <div>
          <h2 className="title">Usuarios</h2>
          <p className="subtitle">Administración de cuentas y permisos</p>
        </div>
        <Link to="/crear-usuario" className="btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Crear usuario
        </Link>
      </div>

      {loading ? (
        <div className="state">
          <span className="spinner" />
          <span>Cargando usuarios...</span>
        </div>
      ) : msg ? (
        <div className="state error">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
          {msg}
        </div>
      ) : (
        <div className="overflow">
          <table className="table" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#6b7280" }}>
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                data.map((u) => (
                  <tr key={u.ID_Usuario}>
                    <td className="mono">{u.ID_Usuario}</td>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">
                          <img
                            src={getFotoUrl(u.Foto_Perfil, u.Nombre_Usuario)}
                            alt={u.Nombre_Usuario}
                            onError={getImageErrorHandler(u.Nombre_Usuario)}
                          />
                        </div>
                        <div className="user-meta">
                          <div className="user-name">{u.Nombre_Usuario}</div>
                          <div className="user-sub">
                            {u.ID_Empleado ? `Emp. #${u.ID_Empleado}` : <span className="muted">Sin empleado</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${u.Correo}`} className="link-mail">
                        {u.Correo}
                      </a>
                    </td>
                    <td>{u.Nombre_Rol || "—"}</td>
                    <td>
                      <span className={`badge ${u.Estado === "Activo" ? "badge-ok" : "badge-err"}`}>
                        {u.Estado}
                      </span>
                    </td>
                    <td className="actions">
                      <Link to={`/editar-usuario/${u.ID_Usuario}`} className="btn-outline">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
}
.card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:14px;
  box-shadow:0 1px 3px rgba(0,0,0,.08);
}
.hdr{
  display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;
}
.title{font-size:20px;letter-spacing:-.2px}
.subtitle{font-size:13px;color:var(--muted)}
.btn{
  appearance:none;border:1px solid transparent;background:var(--primary);color:#fff;
  padding:.55rem .8rem;border-radius:10px;font-weight:700;cursor:pointer;
  display:inline-flex;align-items:center;gap:8px;text-decoration:none;
}
.btn:hover{background:var(--primary-600)}
.btn-outline{
  background:#fff;border:1px solid var(--border);color:#111827;
  padding:.45rem .65rem;border-radius:10px;font-weight:600;cursor:pointer;text-decoration:none;
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
.overflow{width:100%;overflow:auto}
.table{width:100%;border-collapse:collapse}
.table th,.table td{border-bottom:1px solid var(--border);padding:.6rem;text-align:left}
.table thead th{background:#f9fafb;font-weight:700}
.table tbody tr:hover{background:#fcfcfc}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.user-cell{display:flex;align-items:center;gap:12px}
.avatar{width:32px;height:32px;border-radius:50%;background:#eef2ff;color:#1f2937;display:flex;align-items:center;justify-content:center;font-weight:800;overflow:hidden}
.avatar img{width:100%;height:100%;object-fit:cover;display:block}
.user-meta{display:flex;flex-direction:column;gap:2px}
.user-name{font-weight:700;color:#111827}
.user-sub{font-size:12px;color:#6b7280}
.user-sub .muted{opacity:.7}
.link-mail{color:#111827;text-decoration:none;border-bottom:1px dotted #d1d5db}
.link-mail:hover{color:var(--primary)}
.badge{display:inline-block;padding:.2rem .55rem;border-radius:999px;font-size:.75rem;font-weight:700}
.badge-ok{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}
.badge-err{background:#fef2f2;color:#991b1b;border:1px solid #fecaca}
.actions{white-space:nowrap}
@media (max-width:768px){
  .title{font-size:18px}
  .table th,.table td{padding:.5rem}
}
`;
