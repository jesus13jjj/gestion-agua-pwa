import express from "express";
import pool from "../db.js";

const router = express.Router();

/* -----------------------------------------
   📌 MÉTRICAS PARA EL PANEL
   Soporta ?range=day | week | month
------------------------------------------ */
router.get("/dashboard/metrics", async (req, res) => {
  const range = req.query.range || "day";

  let whereClause;
  let groupExpr; // para el historial

  if (range === "week") {
    // Últimos 7 días (hoy y 6 días atrás)
    whereClause = `DATE(timestamp) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`;
    groupExpr = `DATE(timestamp)`;   // agrupamos por día
  } else if (range === "month") {
    // Últimos 30 días
    whereClause = `DATE(timestamp) >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)`;
    groupExpr = `DATE(timestamp)`;   // agrupamos por día
  } else {
    // Hoy (por hora)
    whereClause = `DATE(timestamp) = CURDATE()`;
    groupExpr = `HOUR(timestamp)`;   // agrupamos por hora
  }

  try {
    // ➤ Total del periodo
    const [totalRows] = await pool.query(
      `SELECT SUM(porcentaje) AS litros
       FROM sensor_readings
       WHERE ${whereClause}`
    );

    // ➤ Promedio del periodo
    const [avgRows] = await pool.query(
      `SELECT AVG(porcentaje) AS promedio
       FROM sensor_readings
       WHERE ${whereClause}`
    );

    // ➤ Alertas activas en el periodo
    const [alertRows] = await pool.query(
      `SELECT id, nivel, porcentaje, timestamp
       FROM sensor_readings
       WHERE nivel IN ('bajo','critico')
         AND ${whereClause}
       ORDER BY timestamp DESC
       LIMIT 5`
    );

    // ➤ Historial para la gráfica
    let historySql;
    if (range === "day") {
      // Por hora
      historySql = `
        SELECT HOUR(timestamp) AS label, AVG(porcentaje) AS litros
        FROM sensor_readings
        WHERE ${whereClause}
        GROUP BY HOUR(timestamp)
        ORDER BY HOUR(timestamp)
      `;
    } else {
      // Por día
      historySql = `
        SELECT DATE(timestamp) AS label, AVG(porcentaje) AS litros
        FROM sensor_readings
        WHERE ${whereClause}
        GROUP BY DATE(timestamp)
        ORDER BY DATE(timestamp)
      `;
    }

    const [historyRows] = await pool.query(historySql);

    res.json({
      ok: true,
      range,
      today: {
        litros: totalRows[0]?.litros || 0,
      },
      week: {
        promedio: avgRows[0]?.promedio || 0,
      },
      alerts: {
        count: alertRows.length,
        items: alertRows,
      },
      // history: [{ label: 0..23 (day) o '2025-12-02' (week/month), litros }]
      history: historyRows,
    });
  } catch (error) {
    console.error("❌ Error en /dashboard/metrics:", error);
    // Para depurar rápido puedes ver el mensaje en el navegador
    res.status(500).json({
      ok: false,
      error: "Error al obtener métricas",
      detail: error.message,
    });
  }
});

/* -----------------------------------------
   📋 REPORTES (dummy para quitar 404)
------------------------------------------ */

// GET /api/reports?limit=10
router.get("/reports", async (req, res) => {
  const limit = parseInt(req.query.limit || "10", 10);

  const demo = [
    {
      date: new Date().toISOString().slice(0, 19).replace("T", " "),
      type: "Revisión diaria",
      detail: "Lectura normal de sensores.",
      status: "cerrado",
    },
    {
      date: new Date(Date.now() - 3600_000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
      type: "Alerta nivel bajo",
      detail: "Tanque 1 por debajo del 20%.",
      status: "abierto",
    },
  ];

  res.json(demo.slice(0, limit));
});

// POST /api/reports
router.post("/reports", async (req, res) => {
  const { type, detail } = req.body || {};
  if (!type || !detail) {
    return res
      .status(400)
      .json({ ok: false, error: "Faltan campos: type, detail" });
  }

  console.log("📌 Nuevo reporte recibido:", { type, detail });

  res.status(201).json({ ok: true, message: "Reporte recibido" });
});

export default router;
