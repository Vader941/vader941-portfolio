// home.js — interactivity for Home page
(function () {
  // ========== Utilities ==========
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // ========== Face compare slider ==========
  const faceCompare = document.querySelector(".face-compare");
  if (faceCompare) {
    const slider = faceCompare.querySelector(".slider");
    const topImg = faceCompare.querySelector(".img-top");
    const bottomImg = faceCompare.querySelector(".img-bottom");

    // Prevent image drag ghosting on desktop
    [topImg, bottomImg].forEach((img) => {
      if (img) {
        img.setAttribute("draggable", "false");
        img.addEventListener("dragstart", (e) => e.preventDefault());
      }
    });

    function setReveal(pct) {
      const clamped = clamp(Number(pct) || 0, 0, 100);
      faceCompare.style.setProperty("--reveal", clamped + "%");
      if (slider && slider.value !== String(clamped)) {
        slider.value = String(clamped);
      }
    }

    // Initialize to slider value or 50
    setReveal(slider ? slider.value : 50);

    function pointerToPercent(clientX) {
      const r = faceCompare.getBoundingClientRect();
      const pct = ((clientX - r.left) / r.width) * 100;
      return clamp(pct, 0, 100);
    }

    // Mouse move within circle
    faceCompare.addEventListener("mousemove", (e) => {
      setReveal(pointerToPercent(e.clientX));
    });

    // Touch support
    faceCompare.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        if (!t) return;
        setReveal(pointerToPercent(t.clientX));
      },
      { passive: true }
    );

    // Keyboard / accessibility via range input
    if (slider) {
      slider.addEventListener("input", (e) => {
        setReveal(e.target.value);
      });
      // Provide better keyboard increments with arrow keys by default
      slider.step = "1";
      slider.min = "0";
      slider.max = "100";
    }

    window.addEventListener("resize", () => {
      // Re-apply current value to ensure CSS var remains valid
      if (slider) setReveal(slider.value);
    });
  }
})();
