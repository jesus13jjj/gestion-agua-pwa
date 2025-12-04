import express from "express";
import mysql from "mysql2/promise"; // npm install mysql2
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Configuración de conexión
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "13052004",
  database: process.env.DB_NAME || "agua_comunidad",
};

// POST /api/sensors/readings -> guardar lectura
router.post("/readings", async (req, res) => {
  const { distancia, aguaRaw, porcentaje, nivel } = req.body;

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      "INSERT INTO sensor_readings (distancia, agua_raw, porcentaje, nivel) VALUES (?, ?, ?, ?)",
      [distancia, aguaRaw, porcentaje, nivel]
    );
    await conn.end();
    res.json({ ok: true, message: "Lectura guardada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Error guardando lectura" });
  }
});

// GET /api/sensors/readings/latest -> obtener última lectura
router.get("/readings/latest", async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 1"
    );
    await conn.end();

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "No hay lecturas" });
    }

    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Error obteniendo lectura" });
  }
});

export default router;
