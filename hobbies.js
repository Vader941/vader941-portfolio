// hobbies.js — carousel + lightbox for hobbies
(function () {
  const track = document.querySelector(".carousel-track");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".carousel-slide"));
  const prevBtn = document.querySelector(".carousel-control--prev");
  const nextBtn = document.querySelector(".carousel-control--next");
  const slideCount = slides.length;

  let currentIndex = 0;

  function updateSlides() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    slides.forEach((slide, idx) => {
      slide.classList.toggle("is-active", idx === currentIndex);
    });
  }

  function goToNext() {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlides();
  }

  function goToPrev() {
    currentIndex = (currentIndex - 1 + slideCount) % slideCount;
    updateSlides();
  }

  if (nextBtn) nextBtn.addEventListener("click", goToNext);
  if (prevBtn) prevBtn.addEventListener("click", goToPrev);

  // Keyboard support for arrows when buttons focused
  [prevBtn, nextBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
    });
  });

  // Initialize
  updateSlides();

  // ===== Lightbox =====
  const lightbox = document.getElementById("hobby-lightbox");
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector(".hobby-lightbox-image");

  function openLightbox(src, alt) {
    if (!lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.removeAttribute("hidden");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    if (!lightboxImg) return;
    lightbox.setAttribute("hidden", "");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    lightboxImg.src = "";
    lightboxImg.alt = "";
  }

  // Click any slide → open big version
  slides.forEach((slide) => {
    const btn = slide.querySelector(".carousel-slide-button");
    const img = slide.querySelector("img");
    if (!btn || !img) return;

    btn.addEventListener("click", () => {
      openLightbox(img.src, img.alt);
    });
  });

  // Close on backdrop or close button click
  lightbox.addEventListener("click", (e) => {
    const target = e.target;
    if (
      target instanceof Element &&
      (target.hasAttribute("data-lightbox-close") ||
        !target.closest(".hobby-lightbox-inner"))
    ) {
      closeLightbox();
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
    }
  });
})();
