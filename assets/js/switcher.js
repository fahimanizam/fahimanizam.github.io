// Style switcher: remembers which template the visitor picked.
// index.html (Developer, the default) redirects to hogwarts.html when "hogwarts" was chosen.
(function () {
  const fab = document.querySelector(".mode-fab");
  if (!fab) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Browsers with cross-document view transitions animate the switch in CSS (switcher.css)
  const nativeTransition = "onpagereveal" in window;

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

  fab.addEventListener("click", e => {
    try { localStorage.setItem("template", fab.dataset.template); } catch { }
    if (nativeTransition || reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey) return; // normal navigation

    // Fallback: a quick spin, then go
    e.preventDefault();
    fab.classList.add("launching");
    setTimeout(() => { window.location.href = fab.href; }, 150);
  });

  // Coming back with the browser's back button: reset the spin
  window.addEventListener("pageshow", e => {
    if (e.persisted) fab.classList.remove("launching");
  });
})();
