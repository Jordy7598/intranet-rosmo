import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pingRoutes from "./routes/ping.routes";
import { pool } from './config/db';
import rolRoutes from "./routes/rol.routes";
import authRoutes from './routes/auth.routes';
import usuarioRoutes from "./routes/usuario.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import empleadosRoutes from "./routes/empleado.routes";
import puestoRoutes from "./routes/puesto.routes";
import departamentoRoutes from "./routes/departamento.routes";
import noticiaRoutes from "./routes/noticia.routes";
import interactionRoutes from "./routes/interaccionnoticia.routes";
import notificationRoutes from "./routes/notificacion.routes";
import vacacionesRoutes from "./routes/vacaciones.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());


app.use("/api", pingRoutes);
//app.use("/api", rolRoutes);
app.use("/api/roles", rolRoutes);
app.use('/api', authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use('/api/puestos', puestoRoutes);
app.use("/api/departamentos", departamentoRoutes);
app.use("/api/noticias", noticiaRoutes);
app.use('/api/interactions', interactionRoutes);
app .use("/api/notificaciones", notificationRoutes);
app.use("/api/vacaciones", vacacionesRoutes);


app.get("/", (_req, res) => {
  res.send("¡Servidor Express + TypeScript funcionando!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Test de conexión
async function testDBConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Conexión a MySQL exitosa:', rows);
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
  }
}

testDBConnection();
