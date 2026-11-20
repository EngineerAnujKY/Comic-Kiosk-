/* ==========================================================
   auth.js - register and login forms
   Demo only: accounts are kept in the browser's localStorage.
   Passwords are stored as salted SHA-256 hashes, not plain text.
   ========================================================== */

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const formMessage = document.getElementById("form-message");

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = "message " + type;
}

/* ---------- Show / hide password buttons ---------- */
document.querySelectorAll(".pw-toggle").forEach(function (button) {
  button.addEventListener("click", function () {
    const input = document.getElementById(button.dataset.target);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    button.textContent = show ? "Hide" : "Show";
    button.setAttribute("aria-pressed", show);
  });
});

/* ---------- Register ---------- */
if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    const users = readStorage(USERS_KEY, []);

    if (name.length < 2) {
      showMessage("Enter your full name.", "error");
    } else if (password.length < 6) {
      showMessage("Password must be at least 6 characters.", "error");
    } else if (password !== confirm) {
      showMessage("Passwords do not match.", "error");
    } else if (users.some(function (user) { return user.email === email; })) {
      showMessage("This email is already registered. Please log in.", "error");
    } else {
      users.push({ name: name, email: email, password: await hashPassword(email, password) });
      writeStorage(USERS_KEY, users);
      showMessage("Account created. Redirecting to login...", "success");

      setTimeout(function () {
        window.location.href = "login.html";
      }, 1200);
    }
  });
}

/* ---------- Login ---------- */
if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const users = readStorage(USERS_KEY, []);
    const hashed = await hashPassword(email, password);

    /* Accounts made before hashing was added still log in (plain text match) */
    const user = users.find(function (entry) {
      return entry.email === email && (entry.password === hashed || entry.password === password);
    });

    if (!user) {
      showMessage("Email or password is incorrect. Check both and try again.", "error");
      return;
    }

    writeStorage(SESSION_KEY, { name: user.name, email: user.email });

    /* Return to the page that asked for login, e.g. the cart (local pages only) */
    window.location.href = safeNext(new URLSearchParams(window.location.search).get("next"));
  });
}
