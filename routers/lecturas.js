import express from "express";
import pool from "../db.js";

const router = express.Router();

/* ---------------------------------------------------
   📌 INSERTAR DATOS FALSOS (100 registros)
--------------------------------------------------- */
router.get("/fake-data", async (req, res) => {
  try {
    let inserts = [];

    for (let i = 0; i < 100; i++) {
      const distancia = Math.random() * 100;     // 0 a 100 cm
      const agua_raw = Math.random() * 4095;     // simulación de sensor analógico
      const porcentaje = Math.floor(Math.random() * 100); // 0–100%

      let nivel = "normal";
      if (porcentaje < 30) nivel = "bajo";
      if (porcentaje < 15) nivel = "critico";

      inserts.push([
        distancia,
        agua_raw,
        porcentaje,
        nivel,
        new Date()
      ]);
    }

    await pool.query(
      `INSERT INTO sensor_readings (distancia, agua_raw, porcentaje, nivel, timestamp) VALUES ?`,
      [inserts]
    );

    return res.json({
      ok: true,
      message: "100 datos falsos insertados correctamente 🚀"
    });

  } catch (error) {
    console.error("❌ Error al insertar datos falsos:", error);
    return res.status(500).json({ ok: false, message: "Error al insertar datos" });
  }
});

export default router;

