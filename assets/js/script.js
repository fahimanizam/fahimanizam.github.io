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

    // --- GitHub dynamic tooltip ---
    async function fetchGitHubProfile() {
      const username = "yourusername"; // change this
      const res = await fetch(`https://api.github.com/users/${username}`);
      const data = await res.json();
      const tooltip = document.getElementById("githubTooltip");
      tooltip.innerHTML = `
    <strong>${data.name || username}</strong><br>
    ${data.bio || ''}<br>
    Repos: ${data.public_repos}<br>
    Followers: ${data.followers}<br>
    <a href="${data.html_url}" target="_blank">View Profile</a>
  `;
    }
    fetchGitHubProfile();

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

    function closeBook() { document.getElementById("bookModal").style.display = "none"; }
    window.onclick = function (event) {
      const modal = document.getElementById("bookModal");
      if (event.target === modal) modal.style.display = "none";
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

    function closeBook() { document.getElementById("blogModal").style.display = "none"; }
    window.onclick = function (event) {
      const modal = document.getElementById("blogModal");
      if (event.target === modal) modal.style.display = "none";
    };

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });