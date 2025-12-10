"use strict";

// Lightweight enhancement only – let PHP handle validation & submission
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var submitButton = form.querySelector("button[type='submit']");

  form.addEventListener("submit", function () {
    // Do NOT call event.preventDefault() here – we want the form to POST to contact.php.

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    // When the server responds, the page reloads, so the button state resets naturally.
  });
});
