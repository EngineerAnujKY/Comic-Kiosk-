/* ==========================================================
   about.js - contact form on about.html
   ========================================================== */

const contactForm = document.getElementById("contact-form");
const contactMessage = document.getElementById("contact-message");

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("c-name").value.trim();

  contactMessage.className = "message success";
  contactMessage.textContent = "Thank you, " + name + ". Your message has been recorded.";
  contactForm.reset();
});
