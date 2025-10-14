// src/pages/Principales/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const payload = { correo: correo.trim().toLowerCase(), contrasena };
      const res = await api.post("/login", payload);
      const { token, usuario } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("usuario_nombre", usuario?.nombre ?? "");
      localStorage.setItem("usuario_rol", String(usuario?.rol ?? ""));
      if (usuario?.foto) localStorage.setItem("usuario_foto", usuario.foto);

      navigate("/dashboard");
    } catch (err: unknown) {
      const status =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response?.status === "number"
          ? (err as { response: { status: number } }).response.status
          : undefined;

      if (status === 401) setError("Correo o contraseña incorrectos.");
      else setError("Error al iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-root">
        <div className="login-grid">
          {/* Izquierda: Card */}
          <section className="login-left">
            <div className="login-card">
              <div className="login-header">
                <div className="logo-container">
                  <img src="/ROSMOR.png" alt="ROSMO" className="logo" />
                </div>
                <h1 className="login-title">Bienvenido</h1>
                <p className="login-subtitle">Inicia sesión en tu cuenta</p>
              </div>

              <form onSubmit={handleLogin} className="login-form" noValidate>
                <div className="form-group">
                  <label htmlFor="correo" className="form-label">Correo electrónico</label>
                  <div className="input-wrapper">
                    <input
                      id="correo"
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                      className="form-input"
                      placeholder="micorreo@rosmo.com"
                      autoComplete="email"
                      autoFocus
                    />
                    <span className="input-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contrasena" className="form-label">Contraseña</label>
                  <div className="input-wrapper">
                    <input
                      id="contrasena"
                      type={showPassword ? "text" : "password"}
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      required
                      className="form-input"
                      placeholder="********"
                      autoComplete="current-password"
                    />
                    <span className="input-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="toggle-password"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-message" role="alert" aria-live="assertive">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </button>
              </form>

              <div className="login-footer">
                <a href="#" className="footer-link">¿Olvidaste tu contraseña?</a>
              </div>
            </div>
          </section>

          {/* Derecha: Imagen (desde /public/imagenLogin.png) */}
          <aside className="login-right" aria-hidden="true">
            <div className="image-pane">
              <div className="image-overlay" />
              <div className="image-caption">
                <img src="/ROSMOR.png" alt="ROSMO" className="brand" />
                <p>Intranet Corporativa</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        :root {
          --primary: #cc0000;
          --primary-dark: #a30000;
          --primary-light: #fee2e2;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --border: #e5e7eb;
          --bg-white: #ffffff;
          --bg-gray: #f9fafb;
          --shadow-lg: 0 10px 40px rgba(0,0,0,.12);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f3f4f6; }

        /* ===== Fullscreen wrapper fijo para evitar márgenes externos ===== */
        .login-root{
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
          overflow: hidden;
        }

        /* Grid de dos columnas: izquierda fija, derecha flexible */
        .login-grid{
          height: 100%;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(360px, 480px) 1fr;
        }

        /* Izquierda */
        .login-left{
          display: grid;
          place-items: center;
          padding: clamp(16px, 3vw, 32px);
        }
        .login-card{
          width: 100%;
          max-width: 440px;
          background: var(--bg-white);
          border-radius: 20px;
          box-shadow: var(--shadow-lg);
          padding: clamp(24px, 4vw, 48px) clamp(20px, 3vw, 40px);
          animation: slideUp .45s ease-out;
        }
        @keyframes slideUp { from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:translateY(0);} }

        .login-header{ text-align:center; margin-bottom: clamp(16px, 3vw, 32px); }
        .logo-container{ margin-bottom: clamp(12px, 2vw, 24px); }
        .logo{ height: clamp(56px, 9vw, 84px); width: auto; }
        .login-title{ font-size: clamp(22px, 3vw, 28px); font-weight: 700; color: var(--text-primary); margin-bottom: 6px; letter-spacing: -.4px; }
        .login-subtitle{ font-size: clamp(13px, 2vw, 16px); color: var(--text-secondary); }

        .login-form{ display:flex; flex-direction:column; gap: clamp(14px, 2vw, 22px); }
        .form-group{ display:flex; flex-direction:column; gap:8px; }
        .form-label{ font-size: 14px; font-weight: 600; color: var(--text-primary); }

        .input-wrapper{ position:relative; display:flex; align-items:center; }
        .form-input{
          width:100%;
          padding: clamp(12px, 1.6vw, 14px) clamp(14px, 2vw, 16px) clamp(12px, 1.6vw, 14px) clamp(44px, 3vw, 52px);
          font-size: clamp(14px, 1.8vw, 16px);
          color: var(--text-primary);
          background: var(--bg-gray);
          border: 2px solid var(--border);
          border-radius: 12px;
          outline:none;
          transition: all .2s ease;
        }
        .form-input:focus{ background:#fff; border-color:var(--primary); box-shadow:0 0 0 4px var(--primary-light); }
        .form-input::placeholder{ color:#9ca3af; }
        .input-icon{ position:absolute; left: clamp(12px, 1.8vw, 16px); color: var(--text-secondary); display:flex; align-items:center; pointer-events:none; }

        .toggle-password{
          position:absolute; right: clamp(12px,1.8vw,16px);
          background:none; border:none; color:var(--text-secondary);
          cursor:pointer; padding:4px; display:flex; align-items:center; justify-content:center; transition: color .2s;
        }
        .toggle-password:hover{ color: var(--text-primary); }

        .error-message{
          display:flex; align-items:center; gap:10px; padding:12px 16px;
          background:#fef2f2; border:1px solid #fecaca; border-radius:10px; color:#b91c1c; font-size:14px;
        }

        .submit-button{
          width:100%; padding: clamp(12px,1.8vw,16px); font-size: clamp(14px,1.8vw,16px);
          font-weight:600; color:#fff; background:var(--primary); border:none; border-radius:12px;
          cursor:pointer; transition:all .2s ease; display:flex; align-items:center; justify-content:center; gap:10px; margin-top:8px;
        }
        .submit-button:hover:not(:disabled){ background:var(--primary-dark); transform:translateY(-2px); box-shadow:0 8px 20px rgba(204,0,0,.3); }
        .submit-button:disabled{ opacity:.7; cursor:not-allowed; }
        .spinner{ width:18px; height:18px; border:3px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer{ margin-top: clamp(16px, 2vw, 28px); text-align:center; }
        .footer-link{ color:var(--primary); text-decoration:none; font-size:14px; font-weight:600; }
        .footer-link:hover{ color:var(--primary-dark); text-decoration:underline; }

        /* Derecha: imagen */
        .login-right{ position: relative; overflow: hidden; }
        .image-pane{
          position:absolute; inset:0;
          background-image: url('/imagenLogin.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .image-overlay{ position:absolute; inset:0; background: linear-gradient(120deg, rgba(12,12,14,.35), rgba(12,12,14,.2)); }
        .image-caption{
          position:absolute; left:40px; bottom:40px; color:#fff; text-shadow:0 2px 12px rgba(0,0,0,.35);
          display:flex; flex-direction:column; gap:8px; align-items:flex-start;
        }
        .image-caption .brand{ height:44px; width:auto; filter: drop-shadow(0 2px 10px rgba(0,0,0,.25)); }
        .image-caption p{ margin:0; font-weight:700; letter-spacing:.4px; opacity:.95; }

        /* Responsive: móvil apila y oculta imagen */
        @media (max-width: 900px){
          .login-grid{ grid-template-columns: 1fr; }
          .login-right{ display:none; }
          .login-left{ padding: 20px; }
        }
      `}</style>
    </>
  );
};

export default Login;
