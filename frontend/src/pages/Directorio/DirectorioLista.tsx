import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { getFotoUrl, getImageErrorHandler } from "../../utils/imageHelper";

type Emp = {
  id: number;
  nombre: string;
  correo?: string;
  telefono?: string;
  puesto?: string;
  area?: string;
  foto?: string;
};

type Resp = { data: Emp[]; page: number; limit: number; total: number; hasMore: boolean; };

export default function DirectorioLista() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState<Emp[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const q = searchParams.get("q") || "";
  const area = searchParams.get("area") || "";
  const page = Number(searchParams.get("page") || "1");
  const limit = 20;

  useEffect(() => {
    api.get<Resp>("/directorio", { params: { q, area: area || undefined, page, limit } })
      .then(({ data }) => {
        setRows(data.data || []);
        setTotal(data.total || 0);
        setHasMore(!!data.hasMore);
      })
      .catch(() => {});
  }, [q, area, page]);

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value); else next.delete(name);
    next.set("page", "1");
    setSearchParams(next);
  }

  return (
    <div className="dir-container">
      <div className="dir-toolbar">
        <input
          className="dir-input"
          placeholder="Buscar por nombre, correo, puesto o área..."
          value={q}
          onChange={(e) => setParam("q", e.target.value)}
        />
        <input
          className="dir-input"
          placeholder="Filtrar por área (opcional)"
          value={area}
          onChange={(e) => setParam("area", e.target.value)}
        />
      </div>

      <div className="dir-grid">
        {rows.map((p) => (
          <Link to={`/directorio/${p.id}`} key={p.id} className="dir-card" title={p.nombre}>
            <img
              className="dir-avatar"
              src={getFotoUrl(p.foto, p.nombre)}
              alt={p.nombre}
              loading="lazy"
              onError={getImageErrorHandler(p.nombre)}
            />
            <div className="dir-info">
              <div className="dir-name">{p.nombre}</div>
              {p.puesto && <div className="dir-sub">{p.puesto}</div>}
              <div className="dir-meta">
                {p.area && <span>🏷 {p.area}</span>}
                {p.correo && <span> • ✉️ {p.correo}</span>}
              </div>
            </div>
          </Link>
        ))}
        {rows.length === 0 && <div className="dir-empty">No se encontraron usuarios.</div>}
      </div>

      <div className="dir-pager">
        <button
          disabled={page <= 1}
          onClick={() => setSearchParams(p => { const n=new URLSearchParams(p); n.set("page", String(page-1)); return n; })}
        >
          ← Anterior
        </button>
        <span>Página {page} · {total} resultados</span>
        <button
          disabled={!hasMore}
          onClick={() => setSearchParams(p => { const n=new URLSearchParams(p); n.set("page", String(page+1)); return n; })}
        >
          Siguiente →
        </button>
      </div>

      <style>{`
        .dir-container { display: flex; flex-direction: column; gap: 16px; }
        .dir-toolbar { display: flex; gap: 8px; }
        .dir-input { flex: 1; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px; }
        .dir-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .dir-card { display: flex; gap: 12px; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; text-decoration: none; color: #111827; }
        .dir-card:hover { background: #f9fafb; }
        .dir-avatar { width: 56px; height: 56px; border-radius: 9999px; object-fit: cover; border: 1px solid #e5e7eb; }
        .dir-info { display: flex; flex-direction: column; }
        .dir-name { font-weight: 600; }
        .dir-sub { font-size: 13px; color: #6b7280; }
        .dir-meta { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .dir-empty { padding: 32px; text-align: center; color: #6b7280; }
        .dir-pager { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 8px; }
        .dir-pager button { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; cursor: pointer; }
        .dir-pager button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
