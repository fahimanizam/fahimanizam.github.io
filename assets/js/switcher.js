// Template switcher: remembers which template the visitor picked.
// index.html (Developer, the default) redirects to hogwarts.html when "hogwarts" was chosen.
document.querySelectorAll(".template-switch a").forEach(link => {
  link.addEventListener("click", () => {
    try { localStorage.setItem("template", link.dataset.template); } catch { }
  });
});
