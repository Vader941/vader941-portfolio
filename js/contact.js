"use strict";

// Contact form data
function getContactFormData() {
  var nameEl = document.getElementById("name");
  var emailEl = document.getElementById("email");
  var topicEl = document.getElementById("topic");
  var messageEl = document.getElementById("message");

  var name = nameEl ? nameEl.value.trim() : "";
  var email = emailEl ? emailEl.value.trim() : "";
  var topic = topicEl ? topicEl.value.trim() : "";
  var message = messageEl ? messageEl.value.trim() : "";

  return { name: name, email: email, topic: topic, message: message };
}

// Contact form submit
function handleContactSubmit(event) {
  var form = document.getElementById("contact-form");
  if (!form) return;

  event.preventDefault();

  var data = getContactFormData();
  var feedback = document.getElementById("contact-feedback");

  if (!data.name || !data.email || !data.topic || !data.message) {
    if (feedback) {
      feedback.textContent = "Please fill out all fields before submitting.";
    }
    return;
  }

  if (feedback) {
    var topicLabel = "your message";

    if (data.topic === "portfolio") {
      topicLabel = "your portfolio or project question";
    } else if (data.topic === "networking") {
      topicLabel = "your networking or career question";
    } else if (data.topic === "coursework") {
      topicLabel = "your coursework or class-related question";
    } else if (data.topic === "other") {
      topicLabel = "your request";
    }

    feedback.textContent =
      "Thanks, " +
      data.name +
      ". I will review " +
      topicLabel +
      " at " +
      data.email +
      ". This demo does not actually send email, but your details were received.";
  }

  form.reset();
}

// Init contact form
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", handleContactSubmit);
  }
});
