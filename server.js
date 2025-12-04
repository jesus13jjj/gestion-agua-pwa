// ------------------------------
// 📦 DEPENDENCIAS
// ------------------------------
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routers/auth.js";
import sensorsRouter from "./routers/sensors.js";
import dashboardRouter from "./routers/dashboard.js";
import lecturasRouter from "./routers/lecturas.js";   // <<📌 NUEVO

// ------------------------------
// ⚙️ CONFIGURACIÓN INICIAL
// ------------------------------
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// __dirname fix para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------
// 📂 ARCHIVOS ESTÁTICOS DEL FRONTEND
// ------------------------------
const PUBLIC_DIR = path.join(__dirname, "public");
app.use(express.static(PUBLIC_DIR));

// ------------------------------
// 🧠 RUTAS DE LA API
// ------------------------------
app.use("/auth", authRouter);
app.use("/api/sensors", sensorsRouter);
app.use("/api", dashboardRouter);
app.use("/api", lecturasRouter); // <<📌 AGREGA LAS LECTURAS FALSAS

// ------------------------------
// 🧭 RUTA POR DEFECTO
// ------------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "panel.html"));
});

// ------------------------------
// 🚀 INICIO DEL SERVIDOR
// ------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});



