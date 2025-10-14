// src/pages/Calendario/Calendario.tsx
import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { EventInput } from "@fullcalendar/core";
import { getCal } from "../../api/calendario.api";

type ViewScope = "usuario" | "equipo" | "empresa";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

export default function Calendario() {
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth() + 1); // 1..12
  const [view, setView] = useState<ViewScope>("usuario");
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const initialDate = useMemo(
    () => `${year}-${String(month).padStart(2, "0")}-01`,
    [year, month]
  );

  useEffect(() => { 
    let alive = true;
    setLoading(true);
    setErr(null);
    getCal(year, month, view)
      .then((ev) => {
        if (!alive) return;
        const norm = ev.map((e) => ({ ...e, id: e.id != null ? String(e.id) : undefined }));
        setEvents(norm);
      })
      .catch((e) => {
        if (!alive) return;
        console.error(e);
        setErr("No se pudo cargar el calendario");
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [year, month, view]);


  return (
    <div className="cal-wrap">
      <style>{`
        .cal-wrap { padding: 12px; }
        .cal-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:8px; flex-wrap:wrap; }
        .cal-left { display:flex; gap:10px; align-items:center; }
        .cal-ym { font-weight:600; }
        .cal-select {
          padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; font-size:14px;
        }
        .cal-legend { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:10px; font-size:14px; }
        .cal-legend span { display:inline-flex; align-items:center; gap:6px; }
        .cal-legend i { width:12px; height:12px; display:inline-block; border-radius:3px; }
        .cal-alert { background:#fee2e2; color:#991b1b; padding:8px 10px; border-radius:8px; margin-bottom:8px; }
        .cal-load { font-size:14px; color:#555; margin-bottom:8px; }
      `}</style>

      {/* Barra superior */}
      <div className="cal-bar">
        <div className="cal-left">
          <div className="cal-ym">{MESES[month - 1]} {year}</div>
        </div>
        <div className="cal-right" style={{display:"flex", gap:8}}>
          <select
            value={view}
            onChange={(e) => setView(e.target.value as ViewScope)}
            className="cal-select"
            title="Alcance de visibilidad"
          >
            <option value="usuario">Mis vacaciones</option>
            <option value="equipo">Mi equipo</option>
            <option value="empresa">Toda la empresa</option>
          </select>
        </div>
      </div>

      {/* Leyenda */}
      <div className="cal-legend">
        <span><i style={{background:"#F59E0B"}}/> Cumpleaños</span>
        <span><i style={{background:"#10B981"}}/> Aniversarios</span>
        <span><i style={{background:"#3B82F6"}}/> Eventos</span>
        <span><i style={{background:"#22C55E"}}/> Vacaciones Aprobadas</span>
        <span><i style={{background:"#EAB308"}}/> Vacaciones Pendientes</span>
        <span><i style={{background:"#EF4444"}}/> Vacaciones Rechazadas</span>
      </div>

      {err && <div className="cal-alert">{err}</div>}
      {loading && <div className="cal-load">Cargando…</div>}

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        locales={[esLocale]}
        locale="es"
        initialView="dayGridMonth"
        initialDate={initialDate}
        events={events}
        height="auto"
        fixedWeekCount={false}
        firstDay={1}
        eventDisplay="block"
        dayMaxEvents={3}
        datesSet={(arg) => {
          const center = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
          const y = center.getFullYear();
          const m = center.getMonth() + 1;
          if (y !== year || m !== month) {
            setYear(y);
            setMonth(m);
          }
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: ""
        }}
      />
    </div>
  );
}
