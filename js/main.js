/* DARCNIA landing — interacciones.
   CONFIG: completar cuando existan los links reales. */
// Una landing siempre abre en el tope: sin esto, la restauración de scroll de
// Chrome deja al visitante a mitad de página y rompe las animaciones de entrada.
history.scrollRestoration = "manual";

const CONFIG = {
  steamUrl: "https://store.steampowered.com/app/5004590/Darcnia_Monster/",
  youtubeId: null,          // ej: "dQw4w9WgXcQ" — id del tráiler en YouTube (prioridad sobre localVideo)
  localVideo: "assets/video/trailer.mp4",
  patreonUrl: "https://www.patreon.com/darcniamonster",
  sfx: true                 // sonidos sutiles de UI si existen los archivos
};

/* ---------------- i18n ---------------- */
const LANGS = ["en", "es"];
let lang = localStorage.getItem("darcnia_lang");
if (!LANGS.includes(lang)) {
  lang = (navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en";
}

function applyLang(l) {
  lang = l;
  localStorage.setItem("darcnia_lang", l);
  document.documentElement.lang = l;
  const dict = window.I18N[l];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (dict[k]) el.textContent = dict[k];
  });
  document.getElementById("langEn").classList.toggle("active", l === "en");
  document.getElementById("langEs").classList.toggle("active", l === "es");
  document.getElementById("langEn").setAttribute("aria-pressed", l === "en");
  document.getElementById("langEs").setAttribute("aria-pressed", l === "es");
  document.title = "Darcnia Monster";
}
document.getElementById("langEn").addEventListener("click", () => applyLang("en"));
document.getElementById("langEs").addEventListener("click", () => applyLang("es"));
applyLang(lang);

/* ---------------- Steam / video según CONFIG ---------------- */
const steamBtns = [document.getElementById("heroSteam"), document.getElementById("supportSteam"), document.getElementById("navSteam")];
if (CONFIG.steamUrl) {
  steamBtns.forEach(b => { if (b) { b.href = CONFIG.steamUrl; b.target = "_blank"; } });
  document.querySelectorAll(".soon-chip").forEach(c => c.remove());
} else {
  [document.getElementById("heroSteam"), document.getElementById("supportSteam")].forEach(b => {
    if (b) b.addEventListener("click", e => e.preventDefault());
  });
}

const videoShell = document.getElementById("videoShell");
if (CONFIG.youtubeId) {
  videoShell.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${CONFIG.youtubeId}?rel=0" title="DARCNIA trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
} else if (CONFIG.localVideo) {
  videoShell.classList.add("playable");
  document.getElementById("videoLabel").setAttribute("data-i18n", "hero.trailer_play");
  applyLang(lang); // refresca el texto del overlay con la clave nueva
  videoShell.addEventListener("click", () => {
    videoShell.innerHTML = `<video src="${CONFIG.localVideo}" controls autoplay playsinline poster="assets/video/poster.webp"></video>`;
  }, { once: true });
}

/* En táctil no hay cursor: la pista de la galería cambia a "tocá una carta". */
if (matchMedia("(hover: none)").matches) {
  const hint = document.querySelector(".cards-hint");
  if (hint) { hint.setAttribute("data-i18n", "cards.hint_touch"); applyLang(lang); }
}

/* ---------------- nav ---------------- */
const nav = document.getElementById("nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 40), { passive: true });

const burger = document.getElementById("navBurger");
const links = document.getElementById("navLinks");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  links.classList.toggle("open");
});
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  burger.classList.remove("open");
  links.classList.remove("open");
}));

/* ---------------- reveals con cascada ---------------- */
/* Los hijos de cada grilla entran ESCALONADOS (70ms entre sí) — la diferencia
   entre "aparece todo" y coreografía. El delay se limpia al terminar para no
   retrasar los hovers. */
document.querySelectorAll(".card-grid, .sigil-row, .media-grid, .pillars, .support-grid").forEach(grid => {
  Array.from(grid.children).forEach((el, i) => {
    if (el.classList.contains("reveal")) el.style.transitionDelay = (i * 70) + "ms";
  });
});
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("on");
    io.unobserve(e.target);
    if (e.target.style.transitionDelay) {
      setTimeout(() => { e.target.style.transitionDelay = ""; }, 1400);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ---------------- CTA fija en móvil ---------------- */
const mobileCta = document.getElementById("mobileCta");
if (CONFIG.steamUrl) {
  const ms = document.getElementById("mobileSteam");
  if (ms) { ms.href = CONFIG.steamUrl; ms.target = "_blank"; }
}
const toTop = document.getElementById("toTop");
addEventListener("scroll", () => {
  mobileCta.classList.toggle("show", scrollY > innerHeight * 0.9);
  toTop.classList.toggle("show", scrollY > innerHeight * 1.5);
}, { passive: true });
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* ---------------- scroll-spy: enciende el link de la sección visible ---------------- */
const spyLinks = new Map();
document.querySelectorAll(".nav-links a[href^='#']").forEach(a => {
  const sec = document.getElementById(a.getAttribute("href").slice(1));
  if (sec) spyLinks.set(sec, a);
});
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    spyLinks.forEach(a => a.classList.remove("active"));
    const link = spyLinks.get(e.target);
    if (link) link.classList.add("active");
  });
}, { rootMargin: "-35% 0px -55% 0px" });
spyLinks.forEach((a, sec) => spy.observe(sec));

/* ---------------- starfield con parallax ---------------- */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [], mx = 0, my = 0;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

function initStars() {
  const r = canvas.parentElement.getBoundingClientRect();
  canvas.width = r.width * devicePixelRatio;
  canvas.height = r.height * devicePixelRatio;
  stars = Array.from({ length: 230 }, () => ({
    x: Math.random(), y: Math.random(),
    z: Math.random() * 0.8 + 0.2,             // profundidad → parallax y tamaño
    tw: Math.random() * Math.PI * 2,
    sp: 0.4 + Math.random() * 1.2
  }));
}
function drawStars(t) {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  for (const s of stars) {
    const par = s.z * 18 * devicePixelRatio;
    const x = s.x * w + mx * par, y = s.y * h + my * par;
    const a = REDUCED ? 0.7 : 0.35 + 0.65 * Math.abs(Math.sin(s.tw + t * 0.001 * s.sp));
    const rad = s.z * 1.6 * devicePixelRatio;
    ctx.globalAlpha = a * 0.9;
    ctx.fillStyle = s.z > 0.75 ? "#fff7e0" : "#cfd8ff";
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (!REDUCED) requestAnimationFrame(drawStars);
}
initStars();
addEventListener("resize", initStars);
addEventListener("pointermove", e => {
  mx = (e.clientX / innerWidth - 0.5) * -1;
  my = (e.clientY / innerHeight - 0.5) * -1;
}, { passive: true });
requestAnimationFrame(drawStars);

/* ---------------- tilt holográfico de cartas ---------------- */
document.querySelectorAll(".card3d").forEach(card => {
  const inner = card.querySelector(".card3d-inner");
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const px = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    const py = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
    inner.style.setProperty("--ry", ((px - 0.5) * 26).toFixed(2) + "deg");
    inner.style.setProperty("--rx", ((0.5 - py) * 22).toFixed(2) + "deg");
    inner.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    inner.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    // la sombra huye del cursor: vende la profundidad del tilt
    inner.style.setProperty("--sx", ((0.5 - px) * 26).toFixed(1) + "px");
    inner.style.setProperty("--sy", ((0.5 - py) * 26 + 14).toFixed(1) + "px");
  });
  card.addEventListener("pointerleave", () => {
    inner.style.setProperty("--rx", "0deg");
    inner.style.setProperty("--ry", "0deg");
    inner.style.setProperty("--sx", "0px");
    inner.style.setProperty("--sy", "0px");
  });
});

/* ---------------- lightbox ---------------- */
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lightboxImg");
document.querySelectorAll(".media-item").forEach(m => m.addEventListener("click", () => {
  lbImg.src = m.dataset.full;
  lbImg.alt = m.querySelector("img").alt;
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}));
function closeLb() { lb.hidden = true; lbImg.src = ""; document.body.style.overflow = ""; }
document.getElementById("lightboxClose").addEventListener("click", closeLb);
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });

/* ---------------- detalle de carta (CardDetail del juego) ----------------
   Misma coreografía que card_detail.gd: dim 0.14s + la carta crece 0.86→1
   con rebote; el panel de info sube desde abajo como el modal de la gema. */
const RANGOS = ["F", "F+", "E", "D", "C", "B", "A", "S", "S+", "SS", "SS+", "SSS"];
const detail = document.getElementById("cardDetail");
const detailImg = document.getElementById("detailImg");
const detailMeta = document.getElementById("detailMeta");
const detailText = document.getElementById("detailText");
const detailFlavor = document.getElementById("detailFlavor");

function openDetail(card) {
  const id = card.dataset.card;
  const d = window.CARDS_DATA && window.CARDS_DATA[id];
  const img = card.querySelector("img");
  detailImg.src = img.src;
  detailImg.alt = img.alt;
  if (d) {
    const loc = d[lang] || d.en;
    const rango = RANGOS[Math.min(Math.max(d.level - 1, 0), RANGOS.length - 1)];
    detailMeta.innerHTML = d.monster
      ? `<strong>${loc.name}</strong> · ${lang === "es" ? "Rango" : "Rank"} ${rango} · ATK ${d.atk} / DEF ${d.def}`
      : `<strong>${loc.name}</strong>`;
    detailText.textContent = loc.text || "";
    detailText.hidden = !loc.text;
    detailFlavor.textContent = loc.flavor || "";
    detailFlavor.hidden = !loc.flavor;
  } else {
    detailMeta.textContent = img.alt;
    detailText.textContent = "";
    detailFlavor.hidden = true;
  }
  detail.hidden = false;
  document.body.style.overflow = "hidden";
  void detail.offsetWidth; // reflow: garantiza que la transición corra (rAF no dispara en tabs de fondo)
  detail.classList.add("in");
  if (window._detailSfx) { window._detailSfx.currentTime = 0; window._detailSfx.play().catch(() => {}); }
}

function closeDetail() {
  detail.classList.remove("in");
  setTimeout(() => { detail.hidden = true; detailImg.src = ""; document.body.style.overflow = ""; }, 180);
}

document.querySelectorAll(".card3d[data-card]").forEach(card => {
  card.addEventListener("click", () => openDetail(card));
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetail(card); }
  });
});
document.getElementById("detailClose").addEventListener("click", closeDetail);
detail.addEventListener("click", e => { if (e.target === detail) closeDetail(); });

/* ESC en cascada: cierra lo más específico que esté abierto. */
addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!detail.hidden) closeDetail();
  else if (!lb.hidden) closeLb();
});

/* ---------------- música del templo ----------------
   La del menú del juego. Los navegadores bloquean autoplay con sonido:
   arranca (con fade) en el primer gesto del usuario, salvo que la haya
   silenciado antes (localStorage). */
const music = new Audio("assets/audio/menu.mp3");
music.loop = true;
music.volume = 0;
const MUSIC_VOL = 0.16;
let musicMuted = localStorage.getItem("darcnia_music") === "off";
const musicBtn = document.getElementById("musicBtn");

function musicUi() {
  musicBtn.classList.toggle("muted", musicMuted);
  musicBtn.setAttribute("aria-pressed", String(!musicMuted));
}
let _fadeTimer = null;
function musicFade(to, ms) {
  clearInterval(_fadeTimer);
  const from = music.volume, t0 = performance.now();
  _fadeTimer = setInterval(() => {
    const k = Math.min((performance.now() - t0) / ms, 1);
    music.volume = from + (to - from) * k;
    if (k >= 1) {
      clearInterval(_fadeTimer);
      if (to === 0) music.pause();
    }
  }, 50);
}
/* Arranque: reintenta en cada gesto hasta que el navegador lo permita. */
const GESTOS = ["pointerdown", "keydown", "touchstart"];
function _musicTry() {
  if (musicMuted) { _musicDisarm(); return; }
  music.play().then(() => { musicFade(MUSIC_VOL, 1800); _musicDisarm(); }).catch(() => {});
}
function _musicDisarm() {
  GESTOS.forEach(ev => removeEventListener(ev, _musicTry, true));
}
GESTOS.forEach(ev => addEventListener(ev, _musicTry, true));
musicBtn.addEventListener("click", e => {
  e.stopPropagation();
  musicMuted = !musicMuted;
  localStorage.setItem("darcnia_music", musicMuted ? "off" : "on");
  if (musicMuted) musicFade(0, 500);
  else { music.play().then(() => musicFade(MUSIC_VOL, 900)).catch(() => {}); }
  musicUi();
});
musicUi();

/* ---------------- SFX sutiles (opcionales) ---------------- */
if (CONFIG.sfx) {
  const mk = src => { const a = new Audio(src); a.volume = 0.09; a.preload = "auto"; return a; };
  const hoverS = mk("assets/sfx/hover.mp3");
  const clickS = mk("assets/sfx/click.mp3");
  window._detailSfx = mk("assets/sfx/detail.mp3");
  window._detailSfx.volume = 0.11;
  let armed = false;
  addEventListener("pointerdown", () => { armed = true; }, { once: true, capture: true });
  document.querySelectorAll(".btn").forEach(b => {
    b.addEventListener("pointerenter", () => { if (armed) { hoverS.currentTime = 0; hoverS.play().catch(() => {}); } });
    b.addEventListener("click", () => { if (armed) { clickS.currentTime = 0; clickS.play().catch(() => {}); } });
  });
}
