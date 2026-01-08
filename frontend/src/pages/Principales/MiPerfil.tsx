import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const API_BASE_URL = import.meta.env.VITE_API_URL_Images || "http://localhost:3000";

type Perfil = {
  // Usuario
  ID_Usuario: number;
  Nombre_Usuario: string;
  Correo_Usuario: string | null;
  Foto_Perfil: string | null;
  Fecha_Creacion: string;
  Estado_Usuario: "Activo" | "Inactivo";
  Nombre_Rol: string;

  // Empleado
  ID_Empleado: number | null;
  Nombre_Empleado: string | null;
  Apellido_Empleado: string | null;
  Correo_Empleado: string | null;
  Fecha_Contratacion: string | null;
  Dias_Vacaciones_Anuales: number | null;
  Dias_Vacaciones_Tomados: number | null;
  Estado_Empleado: "Activo" | "Inactivo" | null;

  // Dpto / Puesto
  ID_Departamento: number | null;
  Nombre_Departamento: string | null;
  ID_Puesto: number | null;
  Nombre_Puesto: string | null;

  // Jefe
  ID_Jefe_Inmediato: number | null;
  Nombre_Jefe_Inmediato: string | null;
};

type Saldo = {
  anios_laborando: number;
  anuales: number;
  acumulado: number;
  tomados: number;
  pendientes: number;
  disponibles: number;
};

const MiPerfil = () => {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, s] = await Promise.all([
          api.get("/usuarios/mi-perfil"),
          api.get("/vacaciones/saldo"),
        ]);
        setPerfil(p.data);
        setSaldo(s.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setMensaje("❌ Error al cargar datos.");
      }
    };
    fetchData();
  }, []);

  const antiguedad = useMemo(() => {
    if (!perfil?.Fecha_Contratacion) return null;
    const inicio = new Date(perfil.Fecha_Contratacion);
    const hoy = new Date();
    const diffMs = hoy.getTime() - inicio.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365.25);
    const months = Math.floor((diffDays % 365.25) / 30.44);
    return { years, months };
  }, [perfil?.Fecha_Contratacion]);

  if (mensaje) return <p style={{ padding: 20 }}>{mensaje}</p>;
  if (!perfil) return <p style={{ padding: 20 }}>Cargando perfil...</p>;

  const nombreEmpleado = perfil.Nombre_Empleado && perfil.Apellido_Empleado
    ? `${perfil.Nombre_Empleado} ${perfil.Apellido_Empleado}`
    : perfil.Nombre_Usuario;

  const correoMostrar = perfil.Correo_Empleado || perfil.Correo_Usuario;

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 20,
        alignItems: "start"
      }}>
        {/* Perfil básico */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ textAlign: "center" }}>
            <img
              src={
                perfil.Foto_Perfil
                  ? perfil.Foto_Perfil.startsWith('http')
                    ? perfil.Foto_Perfil
                    : `${API_BASE_URL}${perfil.Foto_Perfil}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreEmpleado || "U")}&background=cc0000&color=fff`
              }
              alt="Foto de perfil"
              style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreEmpleado || "U")}&background=cc0000&color=fff`;
              }}
            />
            <h2 style={{ marginTop: 12 }}>{nombreEmpleado}</h2>
            <p style={{ color: "#666", marginTop: 4 }}>{perfil.Nombre_Rol}</p>
            <p style={{ color: "#888", marginTop: 6 }}>{correoMostrar}</p>
            <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
              <b>Miembro desde:</b>{" "}
              {new Date(perfil.Fecha_Creacion).toLocaleDateString()}
              <br />
              <b>Estado usuario:</b> {perfil.Estado_Usuario}
            </div>
          </div>

          {/* Vacaciones (resumen) */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #eee" }}>
            <h4 style={{ marginBottom: 8 }}>Vacaciones</h4>
                {saldo ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                    <div style={{ ...cardMini }}>
                      <b>Años laborando</b>
                      <div>{saldo.anios_laborando}</div>
                    </div>
                    <div style={{ ...cardMini }}>
                      <b>Días por año</b>
                      <div>{saldo.anuales}</div>
                    </div>
                    <div style={{ ...cardMini }}>
                      <b>Acumulado</b>
                      <div>{saldo.acumulado}</div>
                    </div>
                    <div style={{ ...cardMini }}>
                      <b>Gozados</b>
                      <div>{saldo.tomados}</div>
                    </div>
                    <div style={{ ...cardMini, background: "#e8f8ec", gridColumn: "span 2" }}>
                      <b>Disponibles</b>
                      <div style={{ fontSize: 22 }}>{saldo.disponibles}</div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "#888" }}>Sin datos de vacaciones.</p>
                )}
          </div>
        </div>

        {/* Información laboral */}
        <div style={{ display: "grid", gap: 20 }}>
          <div style={card}>
            <h3>Información del empleado</h3>
            <div style={grid2}>
              <Field label="Nombre" value={nombreEmpleado || "-"} />
              <Field label="Correo corporativo" value={correoMostrar || "-"} />
              <Field label="Departamento" value={perfil.Nombre_Departamento || "-"} />
              <Field label="Puesto" value={perfil.Nombre_Puesto || "-"} />
              <Field label="Jefe inmediato" value={perfil.Nombre_Jefe_Inmediato || "-"} />
              <Field label="Estado empleado" value={perfil.Estado_Empleado || "-"} />
            </div>
          </div>

          <div style={card}>
            <h3>Relación laboral</h3>
            <div style={grid2}>
              <Field
                label="Fecha de contratación"
                value={perfil.Fecha_Contratacion ? new Date(perfil.Fecha_Contratacion).toLocaleDateString() : "-"}
              />
              <Field
                label="Antigüedad"
                value={
                  antiguedad
                    ? `${antiguedad.years} año(s) ${antiguedad.months} mes(es)`
                    : "-"
                }
              />
              <Field
                label="Días anuales (registro)"
                value={
                  perfil.Dias_Vacaciones_Anuales != null
                    ? String(perfil.Dias_Vacaciones_Anuales)
                    : "-"
                }
              />
              <Field
                label="Tomados (registro)"
                value={
                  perfil.Dias_Vacaciones_Tomados != null
                    ? String(perfil.Dias_Vacaciones_Tomados)
                    : "-"
                }
              />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
};

const cardMini: React.CSSProperties = {
  background: "#f6f7f9",
  borderRadius: 10,
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 4
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginTop: 12
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div style={{ background: "#fafafa", borderRadius: 8, padding: "10px 12px" }}>
    <div style={{ fontSize: 12, color: "#777" }}>{label}</div>
    <div style={{ fontWeight: 600, marginTop: 4 }}>{value}</div>
  </div>
);

export default MiPerfil;
