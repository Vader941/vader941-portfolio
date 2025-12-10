// site.js — shared behavior for all pages
(function () {
  // ========== Footer year ==========
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ========== Mobile nav toggle ==========
  const nav = document.querySelector(".site-nav");
  const toggleBtn = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("nav-links");

  function setNavOpen(open) {
    if (!nav || !toggleBtn) return;
    nav.classList.toggle("nav-open", open);
    toggleBtn.setAttribute("aria-expanded", String(!!open));
  }

  if (!nav || !toggleBtn) {
    return; 
  }

  // Toggle on button click
  toggleBtn.addEventListener("click", () => {
    const isOpen = nav.classList.contains("nav-open");
    setNavOpen(!isOpen);
  });

  // Close with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setNavOpen(false);
    }
  });

  // Close when user clicks a nav link 
  if (navLinks) {
    navLinks.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.closest("a")) {
        setNavOpen(false);
      }
    });
  }

  // Reset nav when resizing back up to desktop
  const DESKTOP_MIN = 760;
  window.addEventListener("resize", () => {
    if (window.innerWidth >= DESKTOP_MIN) {
      setNavOpen(false);
    }
  });
})();
