document.documentElement.classList.add("js");

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const navLinks = Array.from(document.querySelectorAll("nav a"));
const toast = document.querySelector(".toast");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let toastTimer;

/* Mobile menu */

const setMenu = (open) => {
  header.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.textContent = open ? "Close" : "Menu";
};

menuButton.addEventListener("click", () =>
  setMenu(!header.classList.contains("open")),
);
navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

/* Highlight the section currently in view */

const sections = navLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

const setCurrent = (id) => {
  navLinks.forEach((link) => {
    if (link.hash === `#${id}`) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
};

const spy = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setCurrent(visible.target.id);
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.1, 0.5] },
);
sections.forEach((section) => spy.observe(section));

/* Reveal on scroll */

const revealables = document.querySelectorAll(".reveal");
if (reduceMotion) {
  revealables.forEach((el) => el.classList.add("in"));
} else {
  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        reveal.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  revealables.forEach((el) => reveal.observe(el));
}

/* Copy swatches */

document.querySelectorAll(".swatch").forEach((swatch) => {
  const hint = swatch.querySelector("small span:last-child");
  const hintText = hint.textContent;
  let resetTimer;

  swatch.addEventListener("click", async () => {
    const value = swatch.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* Clipboard may be unavailable on local files. */
    }
    swatch.classList.add("copied");
    hint.textContent = "Copied ✓";
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      swatch.classList.remove("copied");
      hint.textContent = hintText;
    }, 1600);

    toast.querySelector("span").textContent = value;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
  });
});
