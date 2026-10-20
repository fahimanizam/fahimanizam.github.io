// Style switcher: remembers which template the visitor picked.
// index.html (Developer, the default) redirects to hogwarts.html when "hogwarts" was chosen.
(function () {
  const fab = document.querySelector(".mode-fab");
  if (!fab) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Download the other style in the background so switching is instant
  window.addEventListener("load", () => {
    const otherCss = fab.dataset.template === "hogwarts" ? "assets/css/style.css" : "assets/css/pro.css";
    [fab.getAttribute("href"), otherCss].forEach(url => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      document.head.appendChild(link);
    });
  });

  // Show the label for a moment on the first page view of the session
  let seen = false;
  try { seen = sessionStorage.getItem("mode-fab-seen") === "1"; } catch { }
  if (!seen) {
    setTimeout(() => fab.classList.add("expanded"), 600);
    setTimeout(() => fab.classList.remove("expanded"), 4600);
    try { sessionStorage.setItem("mode-fab-seen", "1"); } catch { }
  }

  // The new page reveals in a circle growing from the button (switcher.css).
  // These match its length and easing so the sparkles ride along its edge.
  const REVEAL_MS = 1100;
  const revealEase = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const pick = list => list[Math.floor(Math.random() * list.length)];

  function sparkleStyle(hogwarts) {
    return hogwarts
      ? { colors: ["#f5c542", "#d4a017", "#b8860b", "#e8a33d", "#ffd36b"], shapes: ["✦", "✧", "★", "•", "✦"] }
      : { colors: ["#3fb950", "#7ee787", "#a5f3fc", "#ffffff", "#56d364"], shapes: ["✦", "•", "+", "✧", "•"] };
  }

  function sparkleLayer() {
    const layer = document.createElement("div");
    layer.className = "mode-sparkles";
    document.body.appendChild(layer);
    return layer;
  }

  function fabCenter() {
    const box = fab.getBoundingClientRect();
    return { x: box.left + box.height / 2, y: box.top + box.height / 2 };
  }

  // One twinkling sparkle: pops in at (x, y), drifts by (dx, dy) and fades
  function sparkle(layer, look, x, y, dx, dy, delay, duration) {
    const s = document.createElement("span");
    const color = pick(look.colors);
    s.textContent = pick(look.shapes);
    s.style.cssText = `left:${x}px;top:${y}px;color:${color};font-size:${9 + Math.random() * 15}px;text-shadow:0 0 8px ${color},0 0 2px rgba(0,0,0,.35)`;
    layer.appendChild(s);
    const spin = Math.random() * 360 - 180;
    s.animate([
      { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
      { transform: `translate(calc(${dx * 0.4}px - 50%), calc(${dy * 0.4}px - 50%)) scale(1.25) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.3 },
      { transform: `translate(calc(${dx}px - 50%), calc(${dy + 25}px - 50%)) scale(0) rotate(${spin}deg)`, opacity: 0 }
    ], { duration, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" });
  }

  // Clicked: the button charges up and throws a few sparkles before we leave
  function chargeUp() {
    const look = sparkleStyle(fab.classList.contains("mode-fab--hogwarts"));
    const layer = sparkleLayer();
    const { x, y } = fabCenter();
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 40 + Math.random() * 80;
      sparkle(layer, look, x, y, Math.cos(a) * d, Math.sin(a) * d, Math.random() * 120, 450 + Math.random() * 300);
    }
    fab.classList.add("charging");
  }

  // Arrived from the switch button: sparkle dust trails the edge of the reveal.
  // Runs before the first paint, so it plays during the page transition.
  function sprinkleReveal() {
    const look = sparkleStyle(fab.classList.contains("mode-fab--developer"));
    const layer = sparkleLayer();
    const { x: x0, y: y0 } = fabCenter();
    const w = window.innerWidth, h = window.innerHeight;
    const maxR = Math.hypot(w, h) * 1.05;

    // A first puff right out of the button
    for (let i = 0; i < 16; i++) {
      const a = (Math.random() * 110 - 10) * Math.PI / 180;
      const d = 60 + Math.random() * 120;
      sparkle(layer, look, x0, y0, Math.cos(a) * d, -Math.sin(a) * d, Math.random() * 100, 600 + Math.random() * 300);
    }

    // Then dust all along the growing edge
    let made = 0;
    for (let tries = 0; made < 90 && tries < 400; tries++) {
      const p = 0.04 + Math.random() * 0.86;
      const r = revealEase(p) * maxR - 40 + Math.random() * 30;
      const a = Math.random() * Math.PI / 2;
      const x = x0 + Math.cos(a) * r;
      const y = y0 - Math.sin(a) * r;
      if (r < 30 || x > w + 10 || y < -10) continue;
      const drift = 20 + Math.random() * 40;
      sparkle(layer, look, x, y, Math.cos(a) * drift, -Math.sin(a) * drift, p * REVEAL_MS, 650 + Math.random() * 450);
      made++;
    }
    setTimeout(() => layer.remove(), REVEAL_MS + 1300);
  }

  let sprinkle = false;
  try {
    sprinkle = sessionStorage.getItem("mode-sprinkle") === "1";
    sessionStorage.removeItem("mode-sprinkle");
  } catch { }
  if (sprinkle && !reduceMotion) sprinkleReveal();

  fab.addEventListener("click", e => {
    try { localStorage.setItem("template", fab.dataset.template); } catch { }
    if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey) return; // normal navigation

    e.preventDefault();
    try { sessionStorage.setItem("mode-sprinkle", "1"); } catch { }
    chargeUp();
    setTimeout(() => { window.location.href = fab.href; }, 300);
  });

  // Coming back with the browser's back button: reset the button
  window.addEventListener("pageshow", e => {
    if (!e.persisted) return;
    fab.classList.remove("charging");
    document.querySelectorAll(".mode-sparkles").forEach(layer => layer.remove());
  });
})();
