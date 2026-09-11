// Toggles the mobile navigation menu open/closed.
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-nav");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
});

// Slowly auto-scrolls the work gallery, pausing while a visitor is interacting with it.
document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  let isPaused = false;
  let resumeTimer = null;

  const pause = () => { isPaused = true; };
  const resumeSoon = () => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { isPaused = false; }, 2500);
  };

  gallery.addEventListener("mouseenter", pause);
  gallery.addEventListener("mouseleave", resumeSoon);
  gallery.addEventListener("touchstart", pause, { passive: true });
  gallery.addEventListener("touchend", resumeSoon, { passive: true });
  gallery.addEventListener("wheel", () => { pause(); resumeSoon(); }, { passive: true });

  setInterval(() => {
    if (isPaused) return;
    const atEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 1;
    if (atEnd) {
      gallery.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      gallery.scrollBy({ left: 1, behavior: "auto" });
    }
  }, 30);
});
