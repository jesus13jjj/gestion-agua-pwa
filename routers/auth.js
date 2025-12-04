import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

const mapRole = (r) =>
  ({ miembro: 1, moderador: 2, administrador: 3, admin: 3 }[
    String(r || "miembro").toLowerCase()
  ]) || 1;

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, phone, password, full_name, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email y password son requeridos" });

    const [dupe] = await pool.query("SELECT id FROM users WHERE email=?", [
      email,
    ]);
    if (dupe.length)
      return res.status(409).json({ error: "El correo ya está registrado" });

    const hash = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS || "10", 10)
    );
    const role_id = mapRole(role);

    const [r] = await pool.query(
      "INSERT INTO users (email, phone, password_hash, full_name, role_id) VALUES (?,?,?,?,?)",
      [email, phone || null, hash, full_name || null, role_id]
    );
    res.status(201).json({ message: "Usuario creado", user_id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password)
      return res
        .status(400)
        .json({ error: "email/telefono y password son requeridos" });

    const [rows] = await pool.query(
      `SELECT u.*, r.name role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? OR u.phone = ?
       LIMIT 1`,
      [emailOrPhone, emailOrPhone]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });
    if (!u.is_active)
      return res.status(403).json({ error: "Cuenta deshabilitada" });

    const token = jwt.sign(
      { sub: u.id, role: u.role_name, email: u.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({
      token,
      user: {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role_name,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// GET /auth/me
router.get("/me", async (req, res) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Falta token" });
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role_id, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [decoded.sub]
    );
    if (!rows.length) return res.status(404).json({ error: "No encontrado" });
    res.json({ user: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: "Token inválido" });
  }
});

export default router;
