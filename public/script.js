
    // API base (ajusta si tu backend está en otra URL)
    const API = 'http://localhost:3001';


if ("servirwoker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
        .register("/service-worker.js")
        .then(registration => {
            console.log("servicio registrado:", registration.scope);
        } )
        .catch(error => {
            console.error("Error en registrar:", error);
        });
    });
}


    // LOGIN
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = document.getElementById("identifier").value.trim();
      const password   = document.getElementById("password").value;
      if (!identifier || !password) return alert("Completa todos los campos");

      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrPhone: identifier, password })
        });
        const data = await res.json();
        if (!res.ok) return alert(data.error || 'Credenciales inválidas');

        localStorage.setItem('token', data.token);
        alert('Inicio de sesión exitoso');
        window.location.href = './panel.html';
      } catch (err) {
        console.error(err);
        alert('No se pudo conectar con el servidor');
      }
    });

    // REGISTRO (prompt simple)
    document.getElementById("openRegister").addEventListener("click", async (e) => {
      e.preventDefault();
      const email = prompt('Correo:'); if (!email) return alert('Registro cancelado');
      const password = prompt('Contraseña:'); if (!password) return alert('Registro cancelado');
      const full_name = prompt('Nombre (opcional):') || '';

      try {
        const res = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name })
        });
        const data = await res.json();
        if (!res.ok) return alert(data.error || 'No se pudo registrar');
        alert('Usuario creado. Ahora inicia sesión.');
      } catch (err) {
        console.error(err);
        alert('Error al registrar usuario');
      }
    });

    // RECUPERAR CONTRASEÑA (prompt simple)
    document.getElementById("forgotPass").addEventListener("click", async (e) => {
      e.preventDefault();
      const email = prompt("Introduce tu correo para recuperar la contraseña:");
      if (!email) return alert('Operación cancelada');
      // Aquí podrías llamar a tu API para enviar email de recuperación
      try {
        // ejemplo: await fetch(`${API}/auth/forgot`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email }) });
        alert(`Si el correo ${email} existe en nuestro sistema, recibirás un enlace para restablecer la contraseña.`);
      } catch (err) {
        console.error(err);
        alert('No se pudo procesar la solicitud');
      }
    });

    // BOTONES "Ver más" en proyectos y noticias (ejemplo: muestran alerta o pueden abrir modal/página)
    document.querySelectorAll('.project-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.currentTarget.dataset.title || 'Proyecto';
        alert(`${title} — Aquí puedes abrir más información (modal o página dedicada).`);
      });
    });

    document.querySelectorAll('.news-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.currentTarget.dataset.title || 'Noticia';
        alert(`${title} — Aquí puedes mostrar la noticia completa (modal o página).`);
      });
    });

    // CONTACTO - ejemplo de envío local (simulado)
    document.getElementById('contactForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const msg = document.getElementById('contact-msg').value.trim();
      if (!name || !email || !msg) return alert('Completa todos los campos');

      try {
        // aquí podrías enviar a tu API: await fetch(`${API}/contact`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, msg }) })
        alert('Mensaje enviado. Gracias por contactarnos.');
        document.getElementById('contactForm').reset();
      } catch (err) {
        console.error(err);
        alert('No se pudo enviar el mensaje');
      }
    });

    // Registrar Service Worker (opcional)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker?.register('/service-worker.js')
          .then(() => console.log('Service Worker registrado'))
          .catch(err => console.error('Error al registrar SW:', err));
      });
    }
