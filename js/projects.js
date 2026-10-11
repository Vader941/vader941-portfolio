// projects.js - native project controls and accessible modal behavior
(function () {
  const body = document.body;
  const root = document.documentElement;
  const cards = document.querySelectorAll(".project-card[data-modal-target]");
  const modals = document.querySelectorAll(".project-modal");
  const overlayClass = "project-modal--open";
  const focusSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let activeModal = null;
  let trigger = null;
  let backgroundState = [];
  let scrollLocks = [];
  let scrollPosition = null;

  if (!cards.length || !modals.length) return;

  function focusableControls() {
    return [...activeModal.querySelectorAll(focusSelector)].filter(el =>
      !el.closest('[hidden], [inert]') && el.getClientRects().length
    );
  }

  function closeAnyModal(restoreFocus = true) {
    if (!activeModal) return;
    const previousTrigger = trigger;
    activeModal.classList.remove(overlayClass);
    activeModal.hidden = true;
    activeModal.inert = true;
    activeModal = null;
    trigger = null;
    backgroundState.forEach(([el, inert]) => { el.inert = inert; });
    backgroundState = [];
    scrollLocks.forEach(([el, locked]) => { el.classList.toggle("no-scroll", locked); });
    scrollLocks = [];
    if (scrollPosition) {
      window.scrollTo({left: scrollPosition.x, top: scrollPosition.y, behavior: "instant"});
      scrollPosition = null;
    }
    if (restoreFocus && previousTrigger && previousTrigger.isConnected) {
      previousTrigger.focus({preventScroll: true});
    }
  }

  function openModal(id, button) {
    const modal = document.getElementById(id);
    if (!modal || !modal.classList.contains("project-modal")) return;
    closeAnyModal(false);
    activeModal = modal;
    trigger = button;
    scrollPosition = {x: window.scrollX, y: window.scrollY};
    scrollLocks = [body, root].map(el => [el, el.classList.contains("no-scroll")]);
    scrollLocks.forEach(([el]) => el.classList.add("no-scroll"));
    // Make siblings along the dialog's ancestor path inert, never the dialog itself.
    let branch = modal;
    while (branch.parentElement) {
      [...branch.parentElement.children].forEach(el => {
        if (el !== branch && !["SCRIPT", "STYLE", "LINK"].includes(el.tagName)) {
          backgroundState.push([el, el.inert]);
          el.inert = true;
        }
      });
      branch = branch.parentElement;
      if (branch === body) break;
    }
    modal.hidden = false;
    modal.inert = false;
    modal.classList.add(overlayClass);
    modal.querySelector(".project-modal-scroll").scrollTop = 0;
    modal.querySelector("[data-modal-close]").focus({preventScroll: true});
  }

  modals.forEach(modal => {
    modal.hidden = true;
    modal.inert = true;
    modal.addEventListener("click", event => {
      if (event.target === modal || event.target.closest("[data-modal-close]")) {
        closeAnyModal();
      }
    });
  });

  cards.forEach(card => {
    const button = card.querySelector(".project-view");
    // One delegated handler covers whole-card clicks and native Enter/Space clicks.
    card.addEventListener("click", event => {
      if (event.target.closest("a, input, select, textarea")) return;
      openModal(card.getAttribute("data-modal-target"), button);
    });
  });

  document.addEventListener("keydown", event => {
    if (!activeModal) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeAnyModal();
    } else if (event.key === "Tab") {
      const controls = focusableControls();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
        activeModal.querySelector("[data-modal-close]").focus();
      } else if (event.shiftKey && (document.activeElement === first || !activeModal.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !activeModal.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener("focusin", event => {
    if (activeModal && !activeModal.contains(event.target)) {
      activeModal.querySelector("[data-modal-close]").focus({preventScroll: true});
    }
  });

  window.closeAnyModal = closeAnyModal;
})();
