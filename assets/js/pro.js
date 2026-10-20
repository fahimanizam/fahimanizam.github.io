// ================= SITE =================

// Theme toggle (light / dark), remembers the choice
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

function currentTheme() {
  const saved = root.getAttribute("data-theme");
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function renderThemeIcon() {
  themeToggle.innerHTML = currentTheme() === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
themeToggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch { }
  renderThemeIcon();
});
renderThemeIcon();

// Mobile navigation
const navbar = document.getElementById("navbar");
const navMenu = document.getElementById("navMenu");
const navToggle = document.getElementById("navToggle");

function setNav(open) {
  navMenu.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", open);
  navToggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
}
navToggle.addEventListener("click", () => setNav(!navMenu.classList.contains("open")));
navMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setNav(false)));

// Navbar shadow + back to top button
const backToTop = document.getElementById("backToTop");
function onScroll() {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
  backToTop.classList.toggle("show", window.scrollY > 600);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Highlight the nav link of the section in view
const navLinks = [...navMenu.querySelectorAll("a")];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
navLinks.forEach(a => {
  const section = document.querySelector(a.getAttribute("href"));
  if (section) sectionObserver.observe(section);
});

// Reveal-on-scroll animations
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Experience durations
function formatMonth(date) {
  return date.toLocaleString("en-US", { month: "short" });
}

function calculateDuration(startDate, endDate = new Date()) {
  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth() + 1; // count the starting month
  if (months < 0) { years--; months += 12; }
  if (months >= 12) { years++; months -= 12; }
  const parts = [];
  if (years) parts.push(`${years} yr${years !== 1 ? "s" : ""}`);
  if (months) parts.push(`${months} mo${months !== 1 ? "s" : ""}`);
  return parts.join(" ");
}

document.querySelectorAll(".experience-item").forEach(item => {
  const startDate = new Date(item.dataset.start);
  const endDate = item.dataset.end ? new Date(item.dataset.end) : new Date();
  const startText = `${formatMonth(startDate)} ${startDate.getFullYear()}`;
  const endText = item.dataset.end ? `${formatMonth(endDate)} ${endDate.getFullYear()}` : "Present";
  item.querySelector(".duration").innerHTML =
    `${startText} – ${endText}<small>${calculateDuration(startDate, endDate)}</small>`;
  if (!item.dataset.end) item.classList.add("current");
});

// Years of experience since the first job
const firstJob = new Date("2020-11-01");
document.getElementById("yearsExp").textContent =
  Math.floor((Date.now() - firstJob) / (365.25 * 24 * 3600 * 1000));

document.getElementById("year").textContent = new Date().getFullYear();

// Modals
function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.style.overflow = "";
}
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(modal.id); });
});
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  document.querySelectorAll(".modal.open").forEach(m => closeModal(m.id));
});

// Resume modal (falls back to the normal link on small screens)
const resumeFrame = document.getElementById("resumeFrame");
const resumePreviewUrl = "https://drive.google.com/file/d/1f1sk7_fA4Vdjxr1X1xU9TRYpZYT4E-xo/preview";
document.querySelectorAll("[data-resume]").forEach(link => {
  link.addEventListener("click", e => {
    if (window.innerWidth < 640) return;
    e.preventDefault();
    if (!resumeFrame.src) resumeFrame.src = resumePreviewUrl;
    openModal("resumeModal");
  });
});

// Bookshelf
function openBook(title, imgSrc, review) {
  document.getElementById("bookTitle").textContent = title;
  document.getElementById("bookImg").src = imgSrc;
  document.getElementById("bookImg").alt = title + " cover";
  document.getElementById("bookReview").textContent = review;
  openModal("bookModal");
}

// Blog posts
document.querySelectorAll(".blog-card").forEach(card => {
  card.addEventListener("click", () => {
    document.getElementById("modalTitle").textContent = card.dataset.title;
    document.getElementById("modalDate").textContent = card.dataset.date;
    document.getElementById("modalText").textContent = card.dataset.content;
    document.getElementById("modalLink").href = card.dataset.link;
    openModal("blogModal");
  });
});

// Playground tabs
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => {
      t.classList.toggle("active", t === tab);
      t.setAttribute("aria-selected", t === tab);
    });
    document.querySelectorAll(".tab-panel").forEach(p =>
      p.classList.toggle("active", p.id === "tab-" + tab.dataset.tab));
  });
});

// Copy email
const copyEmail = document.getElementById("copyEmail");
copyEmail.addEventListener("click", () => {
  navigator.clipboard.writeText(copyEmail.dataset.email).then(() => {
    copyEmail.querySelector("span").textContent = "Copied!";
    setTimeout(() => copyEmail.querySelector("span").textContent = "Copy email", 2000);
  }).catch(() => { window.location.href = "mailto:" + copyEmail.dataset.email; });
});

// Theme music (opt-in)
const music = document.getElementById("bg-music");
const musicToggle = document.getElementById("musicToggle");
musicToggle.addEventListener("click", () => {
  if (music.paused) {
    music.volume = 0.15;
    music.play().catch(() => { });
    musicToggle.setAttribute("aria-pressed", "true");
    musicToggle.querySelector("span").textContent = "Pause theme";
  } else {
    music.pause();
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.querySelector("span").textContent = "Play theme";
  }
});

// ================= PLAYGROUND TOOLS =================

// Age Calculator
function calculateAge() {
  const birthdate = document.getElementById("birthdate").value;
  const result = document.getElementById("result");
  if (!birthdate) { result.textContent = "Please select your birthdate."; return; }
  const birthDateObj = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) age--;
  result.textContent = "You are " + age + " years old.";
}

// Password Generator
function generatePassword() {
  const length = parseInt(document.getElementById("passLength").value);
  const result = document.getElementById("passwordResult");
  if (!length || length < 4) { result.textContent = "Enter a length of at least 4."; return; }
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  const values = crypto.getRandomValues(new Uint32Array(Math.min(length, 128)));
  result.textContent = Array.from(values, v => chars[v % chars.length]).join("");
}

// BMI Calculator
function calculateBMI() {
  const weight = parseFloat(document.getElementById("weight").value);
  const feet = parseFloat(document.getElementById("heightFeet").value);
  const inch = parseFloat(document.getElementById("heightInch").value) || 0;
  const result = document.getElementById("bmiResult");

  if (!weight || isNaN(feet)) {
    result.textContent = "Please enter your weight and height.";
    return;
  }

  // Convert feet and inches to meters
  const heightMeters = ((feet * 12) + inch) * 0.0254;
  const bmi = weight / (heightMeters ** 2);
  const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  result.textContent = `Your BMI is ${bmi.toFixed(1)} (${category})`;
}

// Number Guessing Game
let secretNumber = Math.floor(Math.random() * 10) + 1;
let guessCount = 0;
function checkGuess() {
  const guess = parseInt(document.getElementById("guessInput").value);
  const result = document.getElementById("guessResult");
  if (!guess) { result.textContent = "Enter a number!"; return; }
  guessCount++;
  if (guess === secretNumber) {
    result.textContent = `🎉 Correct in ${guessCount} ${guessCount === 1 ? "try" : "tries"}! New number picked.`;
    secretNumber = Math.floor(Math.random() * 10) + 1;
    guessCount = 0;
  } else {
    result.textContent = guess < secretNumber ? "Too low, try again ⬆️" : "Too high, try again ⬇️";
  }
}

// Sorting Hat
function sortingHat() {
  const name = document.getElementById("hatName").value.trim();
  const result = document.getElementById("hatResult");
  if (!name) { result.innerHTML = "The hat needs a name to think about..."; return; }
  const houses = [
    { name: "Gryffindor 🦁", trait: "brave and daring" },
    { name: "Hufflepuff 🦡", trait: "loyal and kind" },
    { name: "Ravenclaw 🦅", trait: "wise and curious" },
    { name: "Slytherin 🐍", trait: "ambitious and clever" }
  ];
  // Same name always gets the same house
  let hash = 0;
  for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const house = houses[hash % houses.length];
  result.innerHTML = "Hmm, difficult... very difficult...";
  setTimeout(() => {
    result.textContent = `${name}, you are ${house.trait}. Better be... ${house.name}!`;
  }, 1200);
}

// Typing Speed Test
const typingSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Coffee first, then code, then more coffee.",
  "It does not do to dwell on dreams and forget to live.",
  "Small daily improvements lead to stunning results.",
  "Debugging is twice as hard as writing the code in the first place."
];
let typingSentence = "";
let typingStart = null;

function resetTyping() {
  typingSentence = typingSentences[Math.floor(Math.random() * typingSentences.length)];
  typingStart = null;
  document.getElementById("typingTarget").textContent = typingSentence;
  const input = document.getElementById("typingInput");
  input.value = "";
  input.disabled = false;
  document.getElementById("typingResult").innerHTML = "";
}

function checkTyping() {
  const input = document.getElementById("typingInput");
  const result = document.getElementById("typingResult");
  if (!typingStart) typingStart = Date.now();
  const typed = input.value;
  if (!typingSentence.startsWith(typed)) {
    result.innerHTML = "❌ Typo! Fix it to continue.";
    return;
  }
  result.innerHTML = "";
  if (typed === typingSentence) {
    const minutes = (Date.now() - typingStart) / 60000;
    const wpm = Math.round((typingSentence.length / 5) / minutes);
    result.innerHTML = `🎉 ${wpm} WPM in ${(minutes * 60).toFixed(1)}s`;
    input.disabled = true;
  }
}
resetTyping();

// Pomodoro Timer
let pomoSeconds = 25 * 60;
let pomoInterval = null;
let pomoOnBreak = false;

function renderPomodoro() {
  const m = String(Math.floor(pomoSeconds / 60)).padStart(2, "0");
  const s = String(pomoSeconds % 60).padStart(2, "0");
  document.getElementById("pomoDisplay").textContent = `${m}:${s}`;
}

function togglePomodoro() {
  const btn = document.getElementById("pomoStartBtn");
  if (pomoInterval) {
    clearInterval(pomoInterval);
    pomoInterval = null;
    btn.textContent = "Start";
    return;
  }
  btn.textContent = "Pause";
  pomoInterval = setInterval(() => {
    pomoSeconds--;
    if (pomoSeconds < 0) {
      pomoOnBreak = !pomoOnBreak;
      pomoSeconds = (pomoOnBreak ? 5 : 25) * 60;
      document.getElementById("pomoResult").textContent = pomoOnBreak ? "☕ Coffee break!" : "Focus session";
    }
    renderPomodoro();
  }, 1000);
}

function resetPomodoro() {
  clearInterval(pomoInterval);
  pomoInterval = null;
  pomoOnBreak = false;
  pomoSeconds = 25 * 60;
  document.getElementById("pomoStartBtn").textContent = "Start";
  document.getElementById("pomoResult").textContent = "Focus session";
  renderPomodoro();
}

// Reaction Time Test
let reactionState = "idle"; // idle | waiting | ready
let reactionTimeout = null;
let reactionStart = 0;
let reactionBest = null;

function reactionClick() {
  const box = document.getElementById("reactionBox");
  const result = document.getElementById("reactionResult");
  if (reactionState === "idle") {
    reactionState = "waiting";
    box.className = "reaction-box waiting";
    box.textContent = "Wait for green...";
    result.innerHTML = "";
    reactionTimeout = setTimeout(() => {
      reactionState = "ready";
      box.className = "reaction-box ready";
      box.textContent = "CLICK!";
      reactionStart = performance.now();
    }, 1500 + Math.random() * 2500);
  } else if (reactionState === "waiting") {
    clearTimeout(reactionTimeout);
    reactionState = "idle";
    box.className = "reaction-box";
    box.textContent = "Too soon! Click to retry";
  } else {
    const ms = Math.round(performance.now() - reactionStart);
    reactionBest = reactionBest === null ? ms : Math.min(reactionBest, ms);
    reactionState = "idle";
    box.className = "reaction-box";
    box.textContent = "Click to try again";
    result.innerHTML = `⚡ ${ms} ms (best: ${reactionBest} ms)`;
  }
}

// Color Palette Generator
function generatePalette() {
  const palette = document.getElementById("palette");
  const baseHue = Math.floor(Math.random() * 360);
  palette.innerHTML = "";
  document.getElementById("paletteResult").innerHTML = "";
  for (let k = 0; k < 5; k++) {
    const hex = hslToHex((baseHue + k * 30) % 360, 65, 40 + k * 8);
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.background = hex;
    swatch.title = hex;
    swatch.addEventListener("click", () => {
      navigator.clipboard.writeText(hex)
        .then(() => document.getElementById("paletteResult").innerHTML = `Copied ${hex} 📋`)
        .catch(() => document.getElementById("paletteResult").innerHTML = hex);
    });
    palette.appendChild(swatch);
  }
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
generatePalette();

// Word Counter
function countWords() {
  const text = document.getElementById("wordInput").value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.ceil(words / 200);
  document.getElementById("wordResult").innerHTML =
    `${words} words · ${text.length} characters · ${minutes} min read`;
}

document.getElementById("reactionBox").addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reactionClick(); }
});
