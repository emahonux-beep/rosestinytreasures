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

// The work gallery scrolls itself continuously (pure CSS animation); this just
// pauses that animation while a visitor is touching it on mobile (desktop uses
// a plain :hover rule in CSS since it doesn't need JS).
document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  let resumeTimer = null;
  gallery.addEventListener("touchstart", () => {
    clearTimeout(resumeTimer);
    gallery.classList.add("is-paused");
  }, { passive: true });
  gallery.addEventListener("touchend", () => {
    resumeTimer = setTimeout(() => gallery.classList.remove("is-paused"), 1500);
  }, { passive: true });
});
