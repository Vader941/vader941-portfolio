// projects.js — project card modal behavior
(function () {
  const body = document.body;
  const cards = document.querySelectorAll(".project-card[data-modal-target]");
  const modals = document.querySelectorAll(".project-modal");
  const overlayClass = "project-modal--open";

  if (!cards.length || !modals.length) return;

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    // Close any open modal first
    modals.forEach((m) => m.classList.remove(overlayClass));
    modal.classList.add(overlayClass);
    body.classList.add("no-scroll");

    const closeBtn = modal.querySelector("[data-modal-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeAnyModal() {
    modals.forEach((m) => m.classList.remove(overlayClass));
    body.classList.remove("no-scroll");
  }

  
  window.closeAnyModal = closeAnyModal;

  // Open modal when a card is clicked
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const targetId = card.getAttribute("data-modal-target");
      if (targetId) openModal(targetId);
    });
  });

  // Close when clicking outside the inner content or on the close button
  modals.forEach((modal) => {
    const inner = modal.querySelector(".project-modal-inner");

    modal.addEventListener("click", (e) => {
      if (!inner.contains(e.target)) {
        closeAnyModal();
      }
    });

    const closeBtn = modal.querySelector("[data-modal-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAnyModal();
      });
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAnyModal();
    }
  });
})();
