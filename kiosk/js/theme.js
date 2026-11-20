/* ==========================================================
   theme.js - light / dark mode
   Loaded in <head> so the saved theme is applied before the
   page is drawn. The choice is remembered in localStorage.
   ========================================================== */

(function () {
  const THEME_KEY = "kiosk_theme";

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") {
        return saved;
      }
    } catch (error) {
      /* storage not available: fall through to device setting */
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  applyTheme(getInitialTheme());

  document.addEventListener("DOMContentLoaded", function () {
    const nav = document.querySelector(".nav-actions");
    const button = document.createElement("button");

    button.type = "button";
    button.className = "theme-toggle";

    function refreshButton() {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      button.textContent = isDark ? "\u2600" : "\u263E";
      button.title = isDark ? "Switch to light mode" : "Switch to dark mode";
      button.setAttribute("aria-label", button.title);
    }

    button.addEventListener("click", function () {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";

      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (error) {
        /* ignore: theme just will not be remembered */
      }
      refreshButton();
    });

    refreshButton();
    nav.appendChild(button);
  });
})();
