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

// Shop page: sort/category/price filtering. The top bar uses pill buttons
// that open small dropdown popovers; the "All Filters" modal offers the same
// controls (select + chips) in one place. Both drive one shared state.
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

  // Bar popovers (pill buttons + dropdown panels)
  const popoverToggles = document.querySelectorAll("[data-toggle-popover]");
  const popovers = document.querySelectorAll(".filter-popover");
  const sortOptionButtons = document.querySelectorAll('#popover-sort [data-option-value]');
  const categoryOptionButtons = document.querySelectorAll('#popover-category [data-option-value]');
  const closePopoverButtons = document.querySelectorAll("[data-close-popover]");

  // Modal controls
  const sortSelects = document.querySelectorAll('select[data-filter="sort"]');
  const categoryChips = document.querySelectorAll(".filter-chip");

  // Price inputs live in both the bar popover and the modal, sharing data-filter attrs.
  const priceMinInputs = document.querySelectorAll('[data-filter="price-min"]');
  const priceMaxInputs = document.querySelectorAll('[data-filter="price-max"]');

  const state = { sort: "featured", category: "", priceMin: null, priceMax: null };

  function closeAllPopovers() {
    popovers.forEach((p) => { p.hidden = true; });
    popoverToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  }

  function syncControls() {
    sortSelects.forEach((el) => { el.value = state.sort; });
    categoryChips.forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.chipValue === state.category);
    });
    sortOptionButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.optionValue === state.sort);
    });
    categoryOptionButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.optionValue === state.category);
    });
    priceMinInputs.forEach((el) => { el.value = state.priceMin ?? ""; });
    priceMaxInputs.forEach((el) => { el.value = state.priceMax ?? ""; });

    const isDefault = state.sort === "featured" && !state.category && state.priceMin === null && state.priceMax === null;
    if (clearAllLink) clearAllLink.hidden = isDefault;

    const sortBtnLabel = document.querySelector('[data-btn-label="sort"]')?.closest(".filter-btn");
    if (sortBtnLabel) sortBtnLabel.classList.toggle("has-active", state.sort !== "featured");
    const categoryBtnLabel = document.querySelector('[data-btn-label="category"]')?.closest(".filter-btn");
    if (categoryBtnLabel) categoryBtnLabel.classList.toggle("has-active", !!state.category);
    const priceBtnLabel = document.querySelector('[data-btn-label="price"]')?.closest(".filter-btn");
    if (priceBtnLabel) priceBtnLabel.classList.toggle("has-active", state.priceMin !== null || state.priceMax !== null);
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

  function resetFilters() {
    state.sort = "featured";
    state.category = "";
    state.priceMin = null;
    state.priceMax = null;
    syncControls();
    applyFilters();
  }

  function handlePriceInputChange(e) {
    const key = e.target.dataset.filter;
    if (key === "price-min") state.priceMin = e.target.value === "" ? null : parseFloat(e.target.value);
    if (key === "price-max") state.priceMax = e.target.value === "" ? null : parseFloat(e.target.value);
    syncControls();
    applyFilters();
  }
  [...priceMinInputs, ...priceMaxInputs].forEach((el) => el.addEventListener("change", handlePriceInputChange));

  sortSelects.forEach((el) => {
    el.addEventListener("change", () => {
      state.sort = el.value;
      syncControls();
      applyFilters();
    });
  });

  categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      state.category = chip.dataset.chipValue;
      syncControls();
      applyFilters();
    });
  });

  sortOptionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.sort = btn.dataset.optionValue;
      syncControls();
      applyFilters();
      closeAllPopovers();
    });
  });

  categoryOptionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.optionValue;
      syncControls();
      applyFilters();
      closeAllPopovers();
    });
  });

  // Popover open/close: one open at a time, closes on outside click, Escape, or Apply.
  popoverToggles.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const popover = document.getElementById(btn.getAttribute("aria-controls"));
      const willOpen = popover.hidden;
      closeAllPopovers();
      if (willOpen) {
        popover.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
  closePopoverButtons.forEach((btn) => btn.addEventListener("click", closeAllPopovers));
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-dropdown")) closeAllPopovers();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllPopovers();
  });

  clearButtons.forEach((btn) => btn.addEventListener("click", resetFilters));
  if (clearAllLink) clearAllLink.addEventListener("click", resetFilters);

  if (modal) {
    openModalButtons.forEach((btn) => btn.addEventListener("click", () => { closeAllPopovers(); modal.showModal(); }));
    closeModalButtons.forEach((btn) => btn.addEventListener("click", () => modal.close()));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.close();
    });
  }

  syncControls();
});
