document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── Hero: show the construction grid briefly, then reveal the mark ──
const logo = document.querySelector(".logo");

if (!reducedMotion) {
  logo.classList.add("is-loading", "is-intro");
  requestAnimationFrame(() => {
    setTimeout(() => logo.classList.remove("is-loading"), 250);
    setTimeout(() => logo.classList.remove("is-intro"), 1600);
  });
}

// Click pins the grid open; hover/focus previews it (CSS)
logo.addEventListener("click", () => {
  const pinned = logo.getAttribute("aria-pressed") === "true";
  logo.setAttribute("aria-pressed", String(!pinned));
});

// ── Palette: click a swatch to copy its HEX ──
const toast = document.querySelector(".toast");
let toastTimer;

function showToast(hex) {
  toast.innerHTML = "";
  const chip = document.createElement("span");
  chip.className = "toast__chip";
  chip.style.background = `#${hex}`;
  toast.append(chip, `#${hex} 복사됨`);
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // file:// and older browsers: fall back to a hidden textarea
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

document.querySelectorAll(".swatch").forEach((swatch) => {
  const hex = swatch.dataset.hex;
  const hint = swatch.querySelector(".swatch__hint");
  const state = swatch.querySelector(".swatch__state")?.textContent;
  const name = swatch.querySelector(".swatch__name")?.textContent;

  hint.textContent = `#${hex} · 복사`;
  swatch.setAttribute("aria-label", `${name ?? state} #${hex} 복사`);

  swatch.addEventListener("click", async () => {
    await copyText(`#${hex}`);
    showToast(hex);
    hint.textContent = "복사됨 ✓";
    swatch.classList.add("is-copied");
    clearTimeout(swatch.copyTimer);
    swatch.copyTimer = setTimeout(() => {
      swatch.classList.remove("is-copied");
      hint.textContent = `#${hex} · 복사`;
    }, 1400);
  });
});

// ── Scroll reveal, staggered within each column ──
document.querySelectorAll(".palette__col").forEach((col) => {
  col.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--i", i));
});

if (reducedMotion || !("IntersectionObserver" in window)) {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}
