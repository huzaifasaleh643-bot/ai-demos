// Pixora — interactions (captured behaviour patterns: countdown, carousels, chips, tabs)

/* ---------- promo countdown (counts down to 6d 16h 50m from load) ---------- */
(() => {
  const end = Date.now() + ((6 * 24 + 16) * 60 + 50) * 60 * 1000;
  const d = document.getElementById("cd-d");
  const h = document.getElementById("cd-h");
  const m = document.getElementById("cd-m");
  if (!d) return;
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    let ms = Math.max(0, end - Date.now());
    const mins = Math.floor(ms / 60000);
    d.textContent = pad(Math.floor(mins / 1440));
    h.textContent = pad(Math.floor((mins % 1440) / 60));
    m.textContent = pad(mins % 60);
  };
  tick();
  setInterval(tick, 15000);
})();

/* ---------- nav: border on scroll + mobile menu ---------- */
(() => {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  toggle?.addEventListener("click", () => nav.classList.toggle("open"));
  document.querySelectorAll("#navLinks a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
})();

/* ---------- carousels: arrow buttons scroll the rail ---------- */
document.querySelectorAll("[data-carousel]").forEach((car) => {
  const rail = car.querySelector("[data-rail]");
  car.querySelectorAll(".nav-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = Number(btn.dataset.dir);
      const step = Math.max(240, rail.clientWidth * 0.7);
      rail.scrollBy({ left: dir * step, behavior: "smooth" });
    });
  });
});

/* ---------- chips: single active per row ---------- */
document.querySelectorAll(".chips").forEach((row) => {
  row.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip || !row.contains(chip)) return;
    row.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
  });
});

/* ---------- segmented tabs swap the showcase copy ---------- */
(() => {
  const tabs = document.getElementById("showcaseTabs");
  const copy = document.getElementById("showcaseCopy");
  if (!tabs || !copy) return;
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    tabs.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    copy.style.opacity = "0";
    setTimeout(() => {
      copy.textContent = btn.dataset.copy;
      copy.style.opacity = "1";
    }, 140);
  });
  copy.style.transition = "opacity .18s ease";
})();

/* ---------- prompt bar: mode tabs + "inspire me" ---------- */
(() => {
  document.querySelectorAll(".prompt-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".prompt-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  const ideas = [
    "A neon-lit street market at night, slow dolly shot",
    "Product shot of a glass bottle on wet stone, cinematic",
    "Flat-lay poster for a summer sale, bold type",
    "A paper-cutout city that folds itself together",
    "Portrait with floating glass shapes, studio light",
  ];
  const input = document.getElementById("promptInput");
  document.getElementById("inspireBtn")?.addEventListener("click", () => {
    input.value = ideas[Math.floor(Math.random() * ideas.length)];
    input.focus();
  });
})();
