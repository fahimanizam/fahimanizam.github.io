// Logo Animation
    const logo = document.getElementById('logo');

    logo.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    // Typing Effect
    const words = ["Tech Enthusiast", "AI Learner", "Problem Solver"];
    let i = 0, j = 0, isDeleting = false;
    const typingElement = document.querySelector(".typing");
    function type() {
      const currentWord = words[i];
      if (!isDeleting) {
        typingElement.textContent = currentWord.substring(0, j++);
        if (j > currentWord.length) {
          isDeleting = true;
          setTimeout(type, 1000); return;
        }
      } else {
        typingElement.textContent = currentWord.substring(0, j--);
        if (j < 0) {
          isDeleting = false; i = (i + 1) % words.length;
        }
      }
      setTimeout(type, 100);
    }
    type();

    // Experience Duration Calculation
    function formatMonth(date) {
      return date.toLocaleString('default', { month: 'short' });
    }

    function calculateDuration(startDate, endDate = new Date()) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();

      if (months < 0) {
        years--;
        months += 12;
      }

      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }

    document.querySelectorAll('.experience-item').forEach(item => {
      const startAttr = item.getAttribute('data-start');
      const endAttr = item.getAttribute('data-end');

      const startDate = new Date(startAttr);
      const endDate = endAttr ? new Date(endAttr) : new Date();

      const duration = calculateDuration(startDate, endDate);

      const startText = `${formatMonth(startDate)} ${startDate.getFullYear()}`;
      const endText = endAttr
        ? `${formatMonth(endDate)} ${endDate.getFullYear()}`
        : 'Present';

      item.querySelector('.duration').textContent =
        `(${startText} – ${endText} | ${duration})`;
    });

    // Background Music
    document.addEventListener("click", () => {
      const music = document.getElementById("bg-music");
      music.volume = 0.03; music.play().catch(() => { });
    }, { once: true });

    // scroll and social sidebar
    const scrollUp = document.getElementById("scrollUp");
    const scrollDown = document.getElementById("scrollDown");

    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollUp.style.display = "block";
        scrollDown.style.display = "none";
      } else {
        scrollUp.style.display = "none";
        scrollDown.style.display = "block";
      }
    });

    scrollUp.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    scrollDown.addEventListener("click", () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });


    // Age Calculator
    function calculateAge() {
      const birthdate = document.getElementById("birthdate").value;
      const result = document.getElementById("result");
      if (!birthdate) { result.innerHTML = "Please select your birthdate."; return; }
      const birthDateObj = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) age--;
      result.innerHTML = "You are " + age + " years old.";
    }

    // Calculator
    function appendValue(value) { document.getElementById("display").value += value; }
    function clearDisplay() { document.getElementById("display").value = ""; }
    function deleteLast() {
      const display = document.getElementById("display");
      display.value = display.value.slice(0, -1);
    }
    function calculate() {
      const display = document.getElementById("display");
      try { display.value = eval(display.value); } catch { display.value = "Error"; }
    }

    // Password Generator
    function generatePassword() {
      const length = document.getElementById("passLength").value;
      const result = document.getElementById("passwordResult");
      if (!length || length < 4) { result.innerHTML = "Enter length (min 4)"; return; }
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
      let password = "";
      for (let i = 0; i < length; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
      result.innerHTML = password;
    }

    // BMI Calculator
    function calculateBMI() {
      const weight = parseFloat(document.getElementById("weight").value);
      const feet = parseFloat(document.getElementById("heightFeet").value);
      const inch = parseFloat(document.getElementById("heightInch").value);
      const result = document.getElementById("bmiResult");

      if (!weight || isNaN(feet) || isNaN(inch)) {
        result.innerHTML = "Please enter weight and height correctly!";
        return;
      }

      // Convert feet and inches to meters
      const totalInches = (feet * 12) + inch;
      const heightMeters = totalInches * 0.0254;

      const bmi = (weight / (heightMeters ** 2)).toFixed(2);
      result.innerHTML = `Your BMI is ${bmi}`;
    }
    // Number Guessing Game
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    function checkGuess() {
      const guess = document.getElementById("guessInput").value;
      const result = document.getElementById("guessResult");
      if (!guess) { result.innerHTML = "Enter a number!"; return; }
      result.innerHTML = (guess == randomNumber) ? "🎉 Correct!" : "❌ Try Again!";
    }

    // Library Modal
    function openBook(title, imgSrc, review) {
      document.getElementById("bookTitle").textContent = title;
      document.getElementById("bookImg").src = imgSrc;
      document.getElementById("bookReview").textContent = review;
      document.getElementById("bookModal").style.display = "flex";
    }


    // Resume Modal
    const resumeModal = document.getElementById("resumeModal");
    const resumeFrame = document.getElementById("resumeFrame");
    const resumePreviewUrl = "https://drive.google.com/file/d/1f1sk7_fA4Vdjxr1X1xU9TRYpZYT4E-xo/preview";

    document.getElementById("viewResumeBtn").addEventListener("click", (e) => {
      e.preventDefault();
      if (!resumeFrame.src) resumeFrame.src = resumePreviewUrl;
      resumeModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });

    function closeResume() {
      resumeModal.style.display = "none";
      document.body.style.overflow = "";
    }

    resumeModal.addEventListener("click", (e) => {
      if (e.target === resumeModal) closeResume();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && resumeModal.style.display === "flex") closeResume();
    });

    // Medium Blog Fetching (Example with dummy data)
    const rssUrl = 'https://medium.com/feed/@fahimanizamnova96';

    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`)
      .then(response => response.json())
      .then(data => {
        const list = document.getElementById('blog-list');
        data.items.slice(0, 5).forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
          list.appendChild(li);
        });
      })
      .catch(err => console.log(err));

    // blog modal
    const blogCards = document.querySelectorAll(".blog-card");
    const modal = document.getElementById("blogModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDate = document.getElementById("modalDate");
    const modalText = document.getElementById("modalText");
    const modalLink = document.getElementById("modalLink");
    const closeBtn = document.querySelector(".close-btn");

    blogCards.forEach(card => {
      card.addEventListener("click", () => {
        modalTitle.textContent = card.dataset.title;
        modalDate.textContent = card.dataset.date;
        modalText.textContent = card.dataset.content;
        modalLink.href = card.dataset.link;
        modal.style.display = "flex";
      });
    });

    // Closes the book and blog modals (both use the same close button handler)
    function closeBook() {
      document.getElementById("bookModal").style.display = "none";
      document.getElementById("blogModal").style.display = "none";
    }
    window.onclick = function (event) {
      if (event.target.id === "bookModal" || event.target.id === "blogModal") closeBook();
    };

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
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

    // Night mode: "Nox" turns the lights off, "Lumos" turns them back on
    const nightToggle = document.getElementById("nightToggle");
    function renderNightToggle() {
      const isNight = document.documentElement.getAttribute("data-theme") === "dark";
      nightToggle.textContent = isNight ? "✨ Lumos" : "🌙 Nox";
      nightToggle.title = isNight ? "Switch to day mode" : "Switch to night mode";
    }
    nightToggle.addEventListener("click", () => {
      const isNight = document.documentElement.getAttribute("data-theme") === "dark";
      if (isNight) document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", "dark");
      try { localStorage.setItem("theme", isNight ? "light" : "dark"); } catch { }
      renderNightToggle();
    });
    renderNightToggle();
