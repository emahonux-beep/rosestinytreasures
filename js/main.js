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

// Shop page: sort/category/price filtering, mirrored between the top filter
// bar and the "All Filters" modal, both driving the same state.
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("shop-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".card--product"));
  const emptyMessage = document.getElementById("filter-empty");
  const modal = document.getElementById("filter-modal");
  const clearButtons = document.querySelectorAll("[data-clear-filters]");
  const openModalButtons = document.querySelectorAll("[data-open-filter-modal]");
  const closeModalButtons = document.querySelectorAll("[data-close-filter-modal]");
  const clearAllLink = document.querySelector(".filter-bar__clear");

  const sortInputs = document.querySelectorAll('[data-filter="sort"]');
  const categoryInputs = document.querySelectorAll('select[data-filter="category"]');
  const categoryChips = document.querySelectorAll(".filter-chip");
  const priceMinInputs = document.querySelectorAll('[data-filter="price-min"]');
  const priceMaxInputs = document.querySelectorAll('[data-filter="price-max"]');

  const state = { sort: "featured", category: "", priceMin: null, priceMax: null };

  function syncControls() {
    sortInputs.forEach((el) => { el.value = state.sort; });
    categoryInputs.forEach((el) => { el.value = state.category; });
    categoryChips.forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.chipValue === state.category);
    });
    priceMinInputs.forEach((el) => { el.value = state.priceMin ?? ""; });
    priceMaxInputs.forEach((el) => { el.value = state.priceMax ?? ""; });

    const isDefault = state.sort === "featured" && !state.category && state.priceMin === null && state.priceMax === null;
    if (clearAllLink) clearAllLink.hidden = isDefault;
  }

  function applyFilters() {
    const matches = cards.filter((card) => {
      const categories = (card.dataset.category || "").split(" ");
      if (state.category && !categories.includes(state.category)) return false;
      const price = parseFloat(card.dataset.price || "0");
      if (state.priceMin !== null && price < state.priceMin) return false;
      if (state.priceMax !== null && price > state.priceMax) return false;
      return true;
    });

    matches.sort((a, b) => {
      if (state.sort === "price-asc") return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
      if (state.sort === "price-desc") return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
      if (state.sort === "name-asc") {
        const nameA = a.querySelector(".card__title").textContent.trim();
        const nameB = b.querySelector(".card__title").textContent.trim();
        return nameA.localeCompare(nameB);
      }
      return cards.indexOf(a) - cards.indexOf(b);
    });

    matches.forEach((card) => grid.appendChild(card));

    cards.forEach((card) => { card.hidden = !matches.includes(card); });

    if (emptyMessage) emptyMessage.hidden = matches.length > 0;
  }

  function handleFilterChange(e) {
    const key = e.target.dataset.filter;
    if (!key) return;
    if (key === "sort") state.sort = e.target.value;
    if (key === "category") state.category = e.target.value;
    if (key === "price-min") state.priceMin = e.target.value === "" ? null : parseFloat(e.target.value);
    if (key === "price-max") state.priceMax = e.target.value === "" ? null : parseFloat(e.target.value);
    syncControls();
    applyFilters();
  }

  [...sortInputs, ...categoryInputs, ...priceMinInputs, ...priceMaxInputs].forEach((el) => {
    el.addEventListener("change", handleFilterChange);
  });

  categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      state.category = chip.dataset.chipValue;
      syncControls();
      applyFilters();
    });
  });

  clearButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.sort = "featured";
      state.category = "";
      state.priceMin = null;
      state.priceMax = null;
      syncControls();
      applyFilters();
    });
  });

  if (clearAllLink) {
    clearAllLink.addEventListener("click", () => {
      state.sort = "featured";
      state.category = "";
      state.priceMin = null;
      state.priceMax = null;
      syncControls();
      applyFilters();
    });
  }

  if (modal) {
    openModalButtons.forEach((btn) => btn.addEventListener("click", () => modal.showModal()));
    closeModalButtons.forEach((btn) => btn.addEventListener("click", () => modal.close()));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.close();
    });
  }

  syncControls();
});
