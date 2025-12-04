// ===============================
// 🔗 API BASE - AUTOMÁTICA
// ===============================
// Usar siempre el mismo origen donde está corriendo la página (local o Render)
const API = window.location.origin;


// ===============================
// 🔐 LOGIN
// ===============================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("identifier").value.trim();
  const password = document.getElementById("password").value;

  if (!identifier || !password) {
    return alert("Completa todos los campos");
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone: identifier, password })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Credenciales inválidas");

    localStorage.setItem("token", data.token);
    alert("Inicio de sesión exitoso");
    window.location.href = "./panel.html";
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar con el servidor");
  }
});


// ===============================
// 🧾 REGISTRO
// ===============================
document.getElementById("openRegister").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = prompt("Correo:");
  if (!email) return alert("Registro cancelado");

  const password = prompt("Contraseña:");
  if (!password) return alert("Registro cancelado");

  const full_name = prompt("Nombre (opcional):") || "";

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "No se pudo registrar");

    alert("Usuario creado. Ahora inicia sesión.");
  } catch (err) {
    console.error(err);
    alert("Error al registrar usuario");
  }
});


// ===============================
// 🔄 RECUPERAR CONTRASEÑA
// ===============================
document.getElementById("forgotPass").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = prompt("Introduce tu correo para recuperar la contraseña:");
  if (!email) return alert("Operación cancelada");

  alert(
    `Si el correo ${email} existe en nuestro sistema, recibirás un enlace para restablecer la contraseña.`
  );
});


// ===============================
// 📰 BOTONES "VER MÁS"
// ===============================
document.querySelectorAll(".project-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const title = e.currentTarget.dataset.title || "Proyecto";
    alert(`${title} — Aquí puedes abrir más información.`);
  });
});

document.querySelectorAll(".news-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const title = e.currentTarget.dataset.title || "Noticia";
    alert(`${title} — Aquí puedes ver la noticia completa.`);
  });
});


// ===============================
// 📩 CONTACTO
// ===============================
document
  .getElementById("contactForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const msg = document.getElementById("contact-msg").value.trim();

    if (!name || !email || !msg)
      return alert("Completa todos los campos");

    alert("Mensaje enviado. Gracias por contactarnos.");
    document.getElementById("contactForm").reset();
  });


// ===============================
// 🛠️ SERVICE WORKER
// ===============================
// Registrar Service Worker (correcto)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      ?.register("/service-worker.js")
      .then(() => console.log("Service Worker registrado"))
      .catch((err) =>
        console.error("Error al registrar Service Worker:", err)
      );
  });
}


