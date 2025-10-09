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
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <img src="/ROSMOR.png" alt="Logo" className="logo" />
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

        <div className="login-background" aria-hidden="true">
          <div className="bg-shape shape-1"></div>
          <div className="bg-shape shape-2"></div>
          <div className="bg-shape shape-3"></div>
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
          --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.12);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* CONTENEDOR: ocupa alto real del viewport y permite scroll si hay poco alto */
        .login-container {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: clamp(150px, 2.5vw, 12px);
          background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
          position: relative;
          overflow: auto; /* importante para pantallas bajas */
        }

        .login-background { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .bg-shape { position: absolute; border-radius: 50%; opacity: 0.08; }

        /* Shapes fluidas */
        .shape-1 {
          width: clamp(320px, 40vw, 560px);
          height: clamp(320px, 40vw, 560px);
          background: var(--primary);
          top: max(-12vh, -160px);
          right: max(-12vh, -160px);
          animation: float 20s infinite ease-in-out;
        }
        .shape-2 {
          width: clamp(260px, 28vw, 420px);
          height: clamp(260px, 28vw, 420px);
          background: var(--primary-dark);
          bottom: max(-10vh, -140px);
          left: max(-10vh, -140px);
          animation: float 15s infinite ease-in-out reverse;
        }
        .shape-3 {
          width: clamp(180px, 22vw, 320px);
          height: clamp(180px, 22vw, 320px);
          background: var(--primary);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 10s infinite ease-in-out;
        }

        @keyframes float { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(30px,30px) rotate(180deg); } }
        @keyframes pulse { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity: .08; } 50% { transform: translate(-50%,-50%) scale(1.08); opacity: .12; } }

        /* TARJETA responsive con clamp */
        .login-card {
          width: 100%;
          max-width: clamp(320px, 42vw, 520px);
          background: var(--bg-white);
          border-radius: 20px;
          box-shadow: var(--shadow-lg);
          padding: clamp(28px, 4vw, 48px) clamp(22px, 3.2vw, 40px);
          position: relative;
          z-index: 1;
          animation: slideUp .5s ease-out;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .login-header { text-align: center; margin-bottom: clamp(20px, 3vw, 40px); }
        .logo-container { margin-bottom: clamp(14px, 2vw, 24px); }
        .logo { height: clamp(48px, 9vw, 84px); width: auto; }

        .login-title {
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: -.5px;
        }
        .login-subtitle { font-size: clamp(14px, 2vw, 16px); color: var(--text-secondary); }

        .login-form { display: flex; flex-direction: column; gap: clamp(16px, 2.4vw, 24px); }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }

        .input-wrapper { position: relative; display: flex; align-items: center; }
        .form-input {
          width: 100%;
          padding: clamp(12px, 1.6vw, 14px) clamp(14px, 2vw, 16px) clamp(12px, 1.6vw, 14px) clamp(44px, 3.2vw, 52px);
          font-size: clamp(14px, 1.8vw, 16px);
          color: var(--text-primary);
          background: var(--bg-gray);
          border: 2px solid var(--border);
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-input:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
        .form-input::placeholder { color: #9ca3af; }

        .input-icon { position: absolute; left: clamp(12px, 1.8vw, 16px); display: flex; align-items: center; color: var(--text-secondary); pointer-events: none; }

        .toggle-password {
          position: absolute; right: clamp(12px, 1.8vw, 16px);
          background: none; border: none; color: var(--text-secondary);
          cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color .2s;
        }
        .toggle-password:hover { color: var(--text-primary); }

        .error-message {
          display: flex; align-items: center; gap: 10px; padding: 12px 16px;
          background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; color: #b91c1c; font-size: 14px;
          animation: shake .4s ease;
        }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }

        .submit-button {
          width: 100%;
          padding: clamp(12px, 1.8vw, 16px);
          font-size: clamp(14px, 1.8vw, 16px);
          font-weight: 600; color: #fff; background: var(--primary);
          border: none; border-radius: 12px; cursor: pointer; transition: all .2s ease;
          display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 8px;
        }
        .submit-button:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(204,0,0,.3); }
        .submit-button:active:not(:disabled) { transform: translateY(0); }
        .submit-button:disabled { opacity: .7; cursor: not-allowed; }

        .spinner { width: 18px; height: 18px; border: 3px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer { margin-top: clamp(18px, 2.2vw, 32px); text-align: center; }
        .footer-link { color: var(--primary); text-decoration: none; font-size: 14px; font-weight: 600; transition: color .2s; }
        .footer-link:hover { color: var(--primary-dark); text-decoration: underline; }

        /* Alturas bajas: compactar */
        @media (max-height: 700px) {
          .login-card { padding: clamp(18px, 3vh, 28px) clamp(16px, 2.4vh, 24px); }
          .login-header { margin-bottom: clamp(12px, 2vh, 20px); }
          .login-form { gap: clamp(10px, 1.6vh, 16px); }
          .logo { height: clamp(40px, 8vh, 64px); }
        }

        /* Móviles estrechos */
        @media (max-width: 420px) {
          .login-card { border-radius: 16px; }
        }
      `}</style>
    </>
  );
};

export default Login;
