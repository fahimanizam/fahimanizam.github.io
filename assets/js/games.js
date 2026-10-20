// ================= RETRO ARCADE =================
// One canvas, one modal, several games. Each game is an object with:
// start(), update(dt), draw(), and optional onKey(code), onPointer(type, x, y)
(function () {
  const W = 480, H = 320;
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const modal = document.getElementById("gameModal");
  const titleEl = document.getElementById("gameTitle");
  const scoreEl = document.getElementById("gameScore");
  const helpEl = document.getElementById("gameHelp");
  const touchControls = document.getElementById("touchControls");

  const keys = {};
  let game = null, rafId = null, lastTime = 0;

  // ---------- helpers ----------
  function setScore(text) { scoreEl.textContent = text; }

  function getBest(id) {
    try { return parseInt(localStorage.getItem("arcade-best-" + id)) || 0; } catch { return 0; }
  }
  function saveBest(id, score, lowerIsBetter) {
    const best = getBest(id);
    const better = lowerIsBetter ? (best === 0 || score < best) : score > best;
    if (better) { try { localStorage.setItem("arcade-best-" + id, score); } catch { } }
    return better ? score : best;
  }

  function overlay(title, subtitle) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 30px Poppins, sans-serif";
    ctx.fillText(title, W / 2, H / 2 - 10);
    ctx.font = "15px Poppins, sans-serif";
    ctx.fillText(subtitle, W / 2, H / 2 + 22);
    ctx.textAlign = "left";
  }

  const isStartKey = code => code === "Space" || code === "Enter";
  const rand = (min, max) => min + Math.random() * (max - min);
  const shuffle = arr => {
    for (let k = arr.length - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [arr[k], arr[r]] = [arr[r], arr[k]];
    }
    return arr;
  };

  // ================= SNAKE =================
  const snake = {
    title: "🐍 Snake",
    help: "Arrow keys / WASD or swipe to turn. Space to start.",
    controls: true,
    size: 20,
    start() {
      this.cols = W / this.size; this.rows = H / this.size;
      this.body = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
      this.dir = { x: 1, y: 0 };
      this.queue = [];
      this.score = 0;
      this.stepTime = 0.12;
      this.timer = 0;
      this.state = "ready";
      this.placeFood();
      setScore(`Score: 0 · Best: ${getBest("snake")}`);
    },
    placeFood() {
      do {
        this.food = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) };
      } while (this.body.some(p => p.x === this.food.x && p.y === this.food.y));
    },
    turn(x, y) {
      const lastDir = this.queue.length ? this.queue[this.queue.length - 1] : this.dir;
      if (lastDir.x === -x && lastDir.y === -y) return; // no reversing into yourself
      if (lastDir.x === x && lastDir.y === y) return;
      if (this.queue.length < 3) this.queue.push({ x, y });
    },
    onKey(code) {
      if (this.state !== "playing") {
        if (isStartKey(code)) { if (this.state === "over") this.start(); this.state = "playing"; }
        return;
      }
      if (code === "ArrowUp" || code === "KeyW") this.turn(0, -1);
      if (code === "ArrowDown" || code === "KeyS") this.turn(0, 1);
      if (code === "ArrowLeft" || code === "KeyA") this.turn(-1, 0);
      if (code === "ArrowRight" || code === "KeyD") this.turn(1, 0);
    },
    onPointer(type, x, y) {
      if (type === "down") {
        this.swipe = { x, y };
        if (this.state !== "playing") this.onKey("Space");
      } else if (type === "up" && this.swipe) {
        const dx = x - this.swipe.x, dy = y - this.swipe.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
          if (Math.abs(dx) > Math.abs(dy)) this.turn(Math.sign(dx), 0);
          else this.turn(0, Math.sign(dy));
        }
        this.swipe = null;
      }
    },
    update(dt) {
      if (this.state !== "playing") return;
      this.timer += dt;
      if (this.timer < this.stepTime) return;
      this.timer = 0;
      if (this.queue.length) this.dir = this.queue.shift();

      const head = { x: this.body[0].x + this.dir.x, y: this.body[0].y + this.dir.y };
      const hitWall = head.x < 0 || head.y < 0 || head.x >= this.cols || head.y >= this.rows;
      const hitSelf = this.body.some(p => p.x === head.x && p.y === head.y);
      if (hitWall || hitSelf) {
        this.state = "over";
        this.best = saveBest("snake", this.score);
        return;
      }
      this.body.unshift(head);
      if (head.x === this.food.x && head.y === this.food.y) {
        this.score++;
        this.stepTime = Math.max(0.05, this.stepTime - 0.003);
        this.placeFood();
        setScore(`Score: ${this.score} · Best: ${getBest("snake")}`);
      } else {
        this.body.pop();
      }
    },
    draw() {
      const s = this.size;
      ctx.fillStyle = "#1d2b1f";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#223525";
      for (let x = 0; x < this.cols; x++)
        for (let y = 0; y < this.rows; y++)
          if ((x + y) % 2) ctx.fillRect(x * s, y * s, s, s);

      ctx.font = `${s - 2}px sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText("🍎", this.food.x * s, this.food.y * s + 1);
      ctx.textBaseline = "alphabetic";

      this.body.forEach((p, idx) => {
        ctx.fillStyle = idx === 0 ? "#9be15d" : "#5fb33a";
        ctx.beginPath();
        ctx.roundRect(p.x * s + 1, p.y * s + 1, s - 2, s - 2, 5);
        ctx.fill();
      });

      if (this.state === "ready") overlay("Snake", "Press Space or tap to start");
      if (this.state === "over") overlay(`Game Over · ${this.score}`, `Best: ${this.best} · Space or tap to retry`);
    }
  };

  // ================= DUCK SHOOTING =================
  const duck = {
    title: "🦆 Duck Shooting",
    help: "Click or tap the ducks. You have 30 seconds!",
    controls: false,
    cursor: "crosshair",
    start() {
      this.ducks = [];
      this.shots = [];
      this.score = 0;
      this.misses = 0;
      this.timeLeft = 30;
      this.spawnTimer = 0;
      this.state = "ready";
      setScore(`Best: ${getBest("duck")}`);
    },
    spawn() {
      const fromLeft = Math.random() < 0.5;
      const speed = rand(90, 150) + (30 - this.timeLeft) * 4; // faster as time runs out
      this.ducks.push({
        x: fromLeft ? -30 : W + 30,
        y: rand(40, 190),
        baseY: 0,
        vx: fromLeft ? speed : -speed,
        phase: rand(0, Math.PI * 2),
        hit: false,
        vy: 0,
        golden: Math.random() < 0.1
      });
      const d = this.ducks[this.ducks.length - 1];
      d.baseY = d.y;
    },
    onKey(code) {
      if (this.state !== "playing" && isStartKey(code)) {
        if (this.state === "over") this.start();
        this.state = "playing";
      }
    },
    onPointer(type, x, y) {
      if (type !== "down") return;
      if (this.state !== "playing") { this.onKey("Space"); return; }
      this.shots.push({ x, y, life: 0.25 });
      // check ducks from front to back
      for (let k = this.ducks.length - 1; k >= 0; k--) {
        const d = this.ducks[k];
        if (!d.hit && Math.abs(x - d.x) < 24 && Math.abs(y - d.y) < 18) {
          d.hit = true;
          d.vy = -60;
          this.score += d.golden ? 5 : 1;
          setScore(`Score: ${this.score} · ${Math.ceil(this.timeLeft)}s`);
          return;
        }
      }
      this.misses++;
    },
    update(dt) {
      this.shots.forEach(s => s.life -= dt);
      this.shots = this.shots.filter(s => s.life > 0);
      if (this.state !== "playing") return;

      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.state = "over";
        this.best = saveBest("duck", this.score);
        return;
      }
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawn();
        this.spawnTimer = rand(0.5, 1.1);
      }
      this.ducks.forEach(d => {
        if (d.hit) {
          d.vy += 600 * dt;
          d.y += d.vy * dt;
        } else {
          d.phase += dt * 4;
          d.x += d.vx * dt;
          d.y = d.baseY + Math.sin(d.phase) * 18;
        }
      });
      this.ducks = this.ducks.filter(d => d.x > -60 && d.x < W + 60 && d.y < H + 40);
      setScore(`Score: ${this.score} · ${Math.ceil(this.timeLeft)}s`);
    },
    drawDuck(d) {
      ctx.save();
      ctx.translate(d.x, d.y);
      if (d.vx < 0) ctx.scale(-1, 1);
      if (d.hit) ctx.rotate(Math.PI);
      const body = d.golden ? "#f5c518" : "#7a5230";
      // body
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // wing (flaps)
      ctx.fillStyle = d.golden ? "#e0a800" : "#5c3b20";
      const flap = d.hit ? 0 : Math.sin(d.phase * 3) * 8;
      ctx.beginPath();
      ctx.ellipse(-3, -4 - flap / 2, 11, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      // head
      ctx.fillStyle = d.golden ? "#f5c518" : "#2e7d32";
      ctx.beginPath();
      ctx.arc(17, -9, 8, 0, Math.PI * 2);
      ctx.fill();
      // beak
      ctx.fillStyle = "#ff9800";
      ctx.beginPath();
      ctx.moveTo(24, -10); ctx.lineTo(32, -7); ctx.lineTo(24, -5);
      ctx.fill();
      // eye
      ctx.fillStyle = "#000";
      ctx.fillRect(18, -12, 3, 3);
      ctx.restore();
    },
    draw() {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#6ec6ff");
      sky.addColorStop(1, "#d6f0ff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      // clouds
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      [[80, 50], [300, 35], [420, 80]].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.arc(cx + 18, cy - 6, 20, 0, Math.PI * 2);
        ctx.arc(cx + 38, cy, 15, 0, Math.PI * 2);
        ctx.fill();
      });

      this.ducks.forEach(d => this.drawDuck(d));

      // grass and bushes in front of falling ducks
      ctx.fillStyle = "#4caf50";
      ctx.fillRect(0, H - 70, W, 70);
      ctx.fillStyle = "#388e3c";
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.arc(x + 20, H - 70, 26, Math.PI, 0);
        ctx.fill();
      }

      this.shots.forEach(s => {
        ctx.strokeStyle = `rgba(255, 80, 0, ${s.life * 4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 14 - s.life * 30, 0, Math.PI * 2);
        ctx.stroke();
      });

      if (this.state === "ready") overlay("Duck Shooting", "Golden ducks are worth 5! Tap to start");
      if (this.state === "over") {
        overlay(`Time's up! Score: ${this.score}`, `Best: ${this.best} · Missed shots: ${this.misses} · Tap to retry`);
      }
    }
  };

  // ================= BUG STOMPER (platformer) =================
  const T = 20; // tile size
  const platformer = {
    title: "🐛 Bug Stomper: Ship It!",
    help: "◀ ▶ / A D to move · ▲ / W / Space to jump · stomp bugs, reach the 💻",
    controls: true,
    buildLevel() {
      const cols = 112, rows = H / T;
      const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
      const gaps = [[18, 20], [40, 42], [63, 66], [85, 87]];
      for (let c = 0; c < cols; c++) {
        if (gaps.some(([a, b]) => c >= a && c <= b)) continue;
        grid[14][c] = grid[15][c] = 1;
      }
      // [col, row, length]
      const platforms = [[8, 10, 4], [14, 8, 3], [24, 10, 5], [30, 7, 4], [36, 10, 3], [46, 9, 6],
      [54, 6, 4], [58, 10, 3], [68, 9, 5], [75, 6, 4], [80, 10, 3], [92, 10, 4], [97, 7, 3]];
      platforms.forEach(([c, r, len]) => { for (let k = 0; k < len; k++) grid[r][c + k] = 2; });
      // staircase before the goal
      for (let k = 0; k < 4; k++) for (let r = 13 - k; r <= 13; r++) grid[r][100 + k] = 1;

      const beans = [];
      platforms.forEach(([c, r, len]) => {
        for (let k = 0; k < len; k += 2) beans.push({ x: (c + k) * T + 10, y: (r - 1) * T + 10, taken: false });
      });
      [5, 11, 27, 33, 50, 71, 90].forEach(c => beans.push({ x: c * T + 10, y: 13 * T + 10, taken: false }));

      // bugs: [col, row they stand on]
      const bugs = [[12, 14], [26, 10], [34, 14], [48, 9], [52, 14], [70, 9], [74, 14], [82, 14], [94, 10], [96, 14]]
        .map(([c, r]) => ({ x: c * T, y: r * T - 14, w: 18, h: 14, vx: -40, alive: true, squash: 0 }));

      return { grid, cols, rows, beans, bugs, goal: { x: 107 * T, y: 12 * T } };
    },
    start() {
      this.lives = 3;
      this.score = 0;
      this.level = this.buildLevel();
      this.state = "ready";
      this.respawn();
    },
    respawn() {
      this.player = { x: 2 * T, y: 11 * T, w: 16, h: 20, vx: 0, vy: 0, onGround: false, facing: 1 };
      this.camX = 0;
      this.updateScore();
    },
    updateScore() {
      const beans = this.level.beans.filter(b => b.taken).length;
      setScore(`☕ ${beans}/${this.level.beans.length} · ❤️ ${this.lives} · Score ${this.score}`);
    },
    solid(c, r) {
      if (c < 0 || c >= this.level.cols) return true; // world edges are walls
      if (r < 0 || r >= this.level.rows) return false;
      return this.level.grid[r][c] !== 0;
    },
    // Move a box along one axis and stop it at solid tiles
    moveAxis(o, dx, dy) {
      o.x += dx; o.y += dy;
      const c0 = Math.floor(o.x / T), c1 = Math.floor((o.x + o.w - 1) / T);
      const r0 = Math.floor(o.y / T), r1 = Math.floor((o.y + o.h - 1) / T);
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (!this.solid(c, r)) continue;
          if (dx > 0) o.x = c * T - o.w;
          if (dx < 0) o.x = (c + 1) * T;
          if (dy > 0) { o.y = r * T - o.h; o.onGround = true; }
          if (dy < 0) o.y = (r + 1) * T;
          if (dy) o.vy = 0;
          return true;
        }
      }
      return false;
    },
    onKey(code) {
      if (this.state === "playing") return;
      if (isStartKey(code) || code === "ArrowUp") {
        if (this.state === "over" || this.state === "won") this.start();
        this.state = "playing";
      }
    },
    onPointer(type) {
      if (type === "down" && this.state !== "playing") this.onKey("Space");
    },
    loseLife() {
      this.lives--;
      if (this.lives <= 0) {
        this.state = "over";
        this.best = saveBest("platformer", this.score);
      } else {
        this.respawn();
      }
      this.updateScore();
    },
    update(dt) {
      if (this.state !== "playing") return;
      dt = Math.min(dt, 1 / 30);
      const p = this.player;
      const left = keys.ArrowLeft || keys.KeyA, right = keys.ArrowRight || keys.KeyD;
      const jump = keys.ArrowUp || keys.KeyW || keys.Space;

      p.vx = (right ? 1 : 0) - (left ? 1 : 0);
      if (p.vx) p.facing = p.vx;
      p.vx *= 190;
      if (jump && p.onGround) p.vy = -560;
      p.vy = Math.min(p.vy + 1500 * dt, 700);

      this.moveAxis(p, p.vx * dt, 0);
      p.onGround = false;
      this.moveAxis(p, 0, p.vy * dt);

      if (p.y > H + 40) { this.loseLife(); return; }

      // bugs patrol and turn around at walls and ledges
      this.level.bugs.forEach(b => {
        if (!b.alive) { b.squash -= dt; return; }
        const nextX = b.x + b.vx * dt;
        const frontC = Math.floor((b.vx > 0 ? nextX + b.w : nextX) / T);
        const footR = Math.floor((b.y + b.h + 1) / T);
        const bodyR = Math.floor((b.y + b.h - 1) / T);
        if (this.solid(frontC, bodyR) || !this.solid(frontC, footR)) b.vx = -b.vx;
        else b.x = nextX;

        const overlap = p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y;
        if (!overlap) return;
        if (p.vy > 0 && p.y + p.h - b.y < 12) {
          b.alive = false;
          b.squash = 0.4;
          p.vy = -380;
          this.score += 100;
          this.updateScore();
        } else {
          this.loseLife();
        }
      });
      if (this.state !== "playing") return;

      this.level.beans.forEach(bean => {
        if (!bean.taken && Math.abs(p.x + p.w / 2 - bean.x) < 14 && Math.abs(p.y + p.h / 2 - bean.y) < 16) {
          bean.taken = true;
          this.score += 10;
          this.updateScore();
        }
      });

      const g = this.level.goal;
      if (p.x + p.w > g.x && p.x < g.x + 2 * T && p.y + p.h > g.y) {
        this.score += this.lives * 500;
        this.state = "won";
        this.best = saveBest("platformer", this.score);
        this.updateScore();
      }

      const worldW = this.level.cols * T;
      this.camX = Math.max(0, Math.min(p.x - W / 3, worldW - W));
    },
    draw() {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#2b1d3a");
      sky.addColorStop(1, "#6b4f8a");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // parallax background "city of servers"
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let k = 0; k < 30; k++) {
        const bx = k * 70 - (this.camX * 0.3) % 70;
        ctx.fillRect(bx, 150 + (k * 37) % 60, 40, 200);
      }

      ctx.save();
      ctx.translate(-Math.round(this.camX), 0);

      const { grid, cols, rows } = this.level;
      const c0 = Math.floor(this.camX / T), c1 = Math.min(cols - 1, c0 + W / T + 1);
      for (let r = 0; r < rows; r++) {
        for (let c = c0; c <= c1; c++) {
          const t = grid[r][c];
          if (!t) continue;
          if (t === 1) {
            ctx.fillStyle = r > 0 && grid[r - 1][c] ? "#5d4037" : "#8bc34a";
            ctx.fillRect(c * T, r * T, T, T);
            if (!(r > 0 && grid[r - 1][c])) { ctx.fillStyle = "#5d4037"; ctx.fillRect(c * T, r * T + 6, T, T - 6); }
          } else {
            ctx.fillStyle = "#c07a3d";
            ctx.fillRect(c * T, r * T, T, T);
            ctx.strokeStyle = "#7b4a1e";
            ctx.strokeRect(c * T + 0.5, r * T + 0.5, T - 1, T - 1);
          }
        }
      }

      // coffee beans
      this.level.beans.forEach(b => {
        if (b.taken) return;
        ctx.fillStyle = "#6f4e37";
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 5, 7, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3e2723";
        ctx.beginPath();
        ctx.moveTo(b.x - 2, b.y - 5); ctx.quadraticCurveTo(b.x + 2, b.y, b.x - 1, b.y + 5);
        ctx.stroke();
      });

      // bugs
      this.level.bugs.forEach(b => {
        if (!b.alive && b.squash <= 0) return;
        ctx.fillStyle = "#e53935";
        if (!b.alive) { ctx.fillRect(b.x, b.y + b.h - 4, b.w, 4); return; }
        ctx.beginPath();
        ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2 + 2, b.w / 2, b.h / 2 - 1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#212121";
        ctx.fillRect(b.x + b.w / 2 - 1, b.y + 3, 2, b.h - 4);
        ctx.fillStyle = "#fff";
        const ex = b.vx > 0 ? b.x + b.w - 5 : b.x + 2;
        ctx.fillRect(ex, b.y + 3, 3, 3);
        ctx.strokeStyle = "#212121";
        ctx.beginPath();
        ctx.moveTo(ex + 1, b.y + 3); ctx.lineTo(ex + (b.vx > 0 ? 5 : -3), b.y - 3);
        ctx.stroke();
      });

      // goal laptop
      const g = this.level.goal;
      ctx.fillStyle = "#cfd8dc";
      ctx.fillRect(g.x, g.y + 2 * T - 6, 2 * T + 8, 6);
      ctx.fillStyle = "#37474f";
      ctx.fillRect(g.x + 4, g.y + 6, 2 * T, 2 * T - 12);
      ctx.fillStyle = "#4fc3f7";
      ctx.fillRect(g.x + 7, g.y + 9, 2 * T - 6, 2 * T - 18);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("DEPLOY", g.x + 8, g.y + 24);

      // player: a little coffee cup
      const p = this.player;
      ctx.fillStyle = "#fafafa";
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + 4, p.w, p.h - 4, [0, 0, 6, 6]);
      ctx.fill();
      ctx.strokeStyle = "#fafafa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      const hx = p.facing > 0 ? p.x - 1 : p.x + p.w + 1;
      ctx.arc(hx, p.y + 11, 4, p.facing > 0 ? Math.PI / 2 : -Math.PI / 2, p.facing > 0 ? Math.PI * 1.5 : Math.PI / 2);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = "#6f4e37";
      ctx.fillRect(p.x, p.y + 4, p.w, 4);
      ctx.fillStyle = "#212121";
      const eyeX = p.x + (p.facing > 0 ? 8 : 3);
      ctx.fillRect(eyeX, p.y + 11, 2, 3);
      ctx.fillRect(eyeX + 4, p.y + 11, 2, 3);

      ctx.restore();

      if (this.state === "ready") overlay("Bug Stomper: Ship It!", "Stomp the bugs and reach the laptop · Space / tap");
      if (this.state === "over") overlay("Out of lives! 🐛", `Score ${this.score} · Best ${this.best} · Space / tap to retry`);
      if (this.state === "won") overlay("🚀 Deployed to production!", `Score ${this.score} · Best ${this.best} · Space / tap to replay`);
    }
  };

  // ================= BRICK BREAKER =================
  const bricks = {
    title: "🧱 Brick Breaker",
    help: "Move with mouse, touch, or ◀ ▶. Space / tap to launch.",
    controls: true,
    start() {
      this.score = 0;
      this.lives = 3;
      this.levelNum = 1;
      this.buildBricks();
      this.state = "ready";
      this.resetBall();
    },
    buildBricks() {
      const colors = ["#ef5350", "#ffa726", "#ffee58", "#66bb6a", "#42a5f5"];
      this.bricks = [];
      const cols = 10, bw = 44, bh = 16, gap = 2;
      for (let r = 0; r < 5; r++)
        for (let c = 0; c < cols; c++)
          this.bricks.push({ x: 7 + c * (bw + gap), y: 40 + r * (bh + gap), w: bw, h: bh, color: colors[r], alive: true });
    },
    resetBall() {
      this.paddle = this.paddle || { w: 80, h: 10, x: W / 2 - 40, y: H - 24 };
      this.ball = { x: W / 2, y: this.paddle.y - 8, r: 6, vx: 0, vy: 0, stuck: true };
      this.updateScore();
    },
    updateScore() { setScore(`Score: ${this.score} · ❤️ ${this.lives} · Level ${this.levelNum}`); },
    launch() {
      const speed = 260 + this.levelNum * 30;
      const angle = rand(-0.6, 0.6);
      this.ball.vx = Math.sin(angle) * speed;
      this.ball.vy = -Math.cos(angle) * speed;
      this.ball.stuck = false;
    },
    onKey(code) {
      if (!isStartKey(code)) return;
      if (this.state === "over") { this.start(); return; }
      this.state = "playing";
      if (this.ball.stuck) this.launch();
    },
    onPointer(type, x) {
      this.paddle.x = Math.max(0, Math.min(W - this.paddle.w, x - this.paddle.w / 2));
      if (type === "down") this.onKey("Space");
    },
    update(dt) {
      const pad = this.paddle, b = this.ball;
      if (keys.ArrowLeft || keys.KeyA) pad.x -= 380 * dt;
      if (keys.ArrowRight || keys.KeyD) pad.x += 380 * dt;
      pad.x = Math.max(0, Math.min(W - pad.w, pad.x));

      if (b.stuck) { b.x = pad.x + pad.w / 2; return; }
      if (this.state !== "playing") return;

      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
      if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy); }

      // paddle: bounce angle depends on where the ball hits
      if (b.vy > 0 && b.y + b.r >= pad.y && b.y - b.r <= pad.y + pad.h && b.x >= pad.x - b.r && b.x <= pad.x + pad.w + b.r) {
        const speed = Math.hypot(b.vx, b.vy);
        const hit = ((b.x - pad.x) / pad.w - 0.5) * 2; // -1 .. 1
        const angle = hit * 1.05;
        b.vx = Math.sin(angle) * speed;
        b.vy = -Math.cos(angle) * speed;
        b.y = pad.y - b.r;
      }

      for (const br of this.bricks) {
        if (!br.alive) continue;
        if (b.x + b.r > br.x && b.x - b.r < br.x + br.w && b.y + b.r > br.y && b.y - b.r < br.y + br.h) {
          br.alive = false;
          this.score += 10;
          const overlapX = Math.min(b.x + b.r - br.x, br.x + br.w - (b.x - b.r));
          const overlapY = Math.min(b.y + b.r - br.y, br.y + br.h - (b.y - b.r));
          if (overlapX < overlapY) b.vx = -b.vx; else b.vy = -b.vy;
          this.updateScore();
          break;
        }
      }

      if (this.bricks.every(br => !br.alive)) {
        this.levelNum++;
        this.buildBricks();
        this.resetBall();
      }

      if (b.y > H + 20) {
        this.lives--;
        if (this.lives <= 0) {
          this.state = "over";
          this.best = saveBest("bricks", this.score);
        } else {
          this.resetBall();
        }
        this.updateScore();
      }
    },
    draw() {
      ctx.fillStyle = "#14141f";
      ctx.fillRect(0, 0, W, H);
      this.bricks.forEach(br => {
        if (!br.alive) return;
        ctx.fillStyle = br.color;
        ctx.beginPath();
        ctx.roundRect(br.x, br.y, br.w, br.h, 3);
        ctx.fill();
      });
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h, 5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
      ctx.fill();

      if (this.state === "ready") overlay("Brick Breaker", "Space or tap to launch");
      if (this.state === "over") overlay(`Game Over · ${this.score}`, `Best: ${this.best} · Space or tap to retry`);
    }
  };

  // ================= MEMORY MATCH =================
  const memory = {
    title: "🃏 Memory Match",
    help: "Click or tap two cards to flip them. Find all the pairs!",
    controls: false,
    start() {
      const icons = ["☕", "📚", "🦉", "💻", "🚀", "🌱", "🎧", "⚡"];
      this.cards = shuffle([...icons, ...icons]).map(icon => ({ icon, open: false, matched: false }));
      this.picked = [];
      this.moves = 0;
      this.lockTimer = 0;
      this.time = 0;
      this.state = "playing";
      setScore(`Moves: 0 · Best: ${getBest("memory") || "-"}`);
    },
    cardRect(idx) {
      const cw = 70, ch = 66, gap = 10;
      const ox = (W - (4 * cw + 3 * gap)) / 2, oy = (H - (4 * ch + 3 * gap)) / 2;
      return { x: ox + (idx % 4) * (cw + gap), y: oy + Math.floor(idx / 4) * (ch + gap), w: cw, h: ch };
    },
    onKey(code) { if (this.state === "won" && isStartKey(code)) this.start(); },
    onPointer(type, x, y) {
      if (type !== "down") return;
      if (this.state === "won") { this.start(); return; }
      if (this.lockTimer > 0) return;
      const idx = this.cards.findIndex((_, k) => {
        const r = this.cardRect(k);
        return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      });
      if (idx < 0) return;
      const card = this.cards[idx];
      if (card.open || card.matched) return;
      card.open = true;
      this.picked.push(card);
      if (this.picked.length === 2) {
        this.moves++;
        const [a, b] = this.picked;
        if (a.icon === b.icon) {
          a.matched = b.matched = true;
          this.picked = [];
          if (this.cards.every(c => c.matched)) {
            this.state = "won";
            this.best = saveBest("memory", this.moves, true);
          }
        } else {
          this.lockTimer = 0.8;
        }
        setScore(`Moves: ${this.moves} · Best: ${getBest("memory") || "-"}`);
      }
    },
    update(dt) {
      if (this.state === "playing") this.time += dt;
      if (this.lockTimer > 0) {
        this.lockTimer -= dt;
        if (this.lockTimer <= 0) {
          this.picked.forEach(c => c.open = false);
          this.picked = [];
        }
      }
    },
    draw() {
      ctx.fillStyle = "#1e2a3a";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      this.cards.forEach((card, idx) => {
        const r = this.cardRect(idx);
        const faceUp = card.open || card.matched;
        ctx.fillStyle = card.matched ? "#c8e6c9" : faceUp ? "#ffffff" : "#5c6bc0";
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 8);
        ctx.fill();
        if (faceUp) {
          ctx.font = "32px sans-serif";
          ctx.fillText(card.icon, r.x + r.w / 2, r.y + r.h / 2 + 2);
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.font = "bold 26px Poppins, sans-serif";
          ctx.fillText("?", r.x + r.w / 2, r.y + r.h / 2);
        }
      });
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      if (this.state === "won") overlay(`🎉 Done in ${this.moves} moves!`, `${Math.round(this.time)}s · Best: ${this.best} moves · Tap to replay`);
    }
  };

  const games = { snake, duck, platformer, bricks, memory };

  // ---------- loop ----------
  function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
    game.update(dt);
    game.draw();
    rafId = requestAnimationFrame(loop);
  }

  window.openGame = function (id) {
    game = games[id];
    titleEl.textContent = game.title;
    helpEl.textContent = game.help;
    canvas.style.cursor = game.cursor || "default";
    touchControls.classList.toggle("show", !!game.controls);
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    game.start();
    lastTime = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  };

  window.closeGame = function () {
    cancelAnimationFrame(rafId);
    rafId = null;
    game = null;
    modal.style.display = "none";
    document.body.style.overflow = "";
    Object.keys(keys).forEach(k => keys[k] = false);
  };

  // ---------- input ----------
  const gameKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];

  document.addEventListener("keydown", e => {
    if (!game) return;
    if (e.code === "Escape") { closeGame(); return; }
    if (gameKeys.includes(e.code)) e.preventDefault(); // stop page scrolling
    if (!keys[e.code] && game.onKey) game.onKey(e.code);
    keys[e.code] = true;
  });
  document.addEventListener("keyup", e => { keys[e.code] = false; });

  function toCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    return [(e.clientX - rect.left) * W / rect.width, (e.clientY - rect.top) * H / rect.height];
  }
  ["down", "move", "up"].forEach(type => {
    canvas.addEventListener("pointer" + type, e => {
      if (!game || !game.onPointer) return;
      if (type === "move" && game !== bricks) return;
      e.preventDefault();
      game.onPointer(type, ...toCanvas(e));
    });
  });

  // on-screen buttons act like held keys
  touchControls.querySelectorAll("button").forEach(btn => {
    const code = btn.dataset.key;
    const press = e => {
      e.preventDefault();
      if (!game) return;
      if (!keys[code] && game.onKey) game.onKey(code);
      keys[code] = true;
    };
    const release = e => { e.preventDefault(); keys[code] = false; };
    btn.addEventListener("pointerdown", press);
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointerleave", release);
    btn.addEventListener("pointercancel", release);
  });

  modal.addEventListener("click", e => { if (e.target === modal) closeGame(); });
})();
