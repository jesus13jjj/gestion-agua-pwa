import pool from "./db.js";

try {
  const [rows] = await pool.query("SELECT NOW() AS time");
  console.log("Conexión exitosa:", rows[0]);
} catch (err) {
  console.error("Error:", err);
}
