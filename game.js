const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreNode = document.getElementById("score");
const livesNode = document.getElementById("lives");
const levelNode = document.getElementById("level");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const startButton = document.getElementById("start-button");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const params = new URLSearchParams(window.location.search);

const state = {
  running: false,
  paused: false,
  score: 0,
  lives: 3,
  level: 1,
  keys: { left: false, right: false },
  player: null,
  bullets: [],
  alienBullets: [],
  aliens: [],
  stars: [],
  barriers: [],
  direction: 1,
  formationSpeed: 38,
  dropDistance: 18,
  fireCooldown: 0,
  alienFireTimer: 0,
  lastTime: 0,
};

function resetStars() {
  state.stars = Array.from({ length: 90 }, () => ({
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    r: Math.random() * 1.8 + 0.2,
    speed: Math.random() * 12 + 8,
  }));
}

function createPlayer() {
  state.player = {
    width: 54,
    height: 22,
    x: WIDTH / 2 - 27,
    y: HEIGHT - 68,
    speed: 310,
  };
}

function createAliens(level) {
  const rows = 5;
  const cols = 10;
  const aliens = [];
  const spacingX = 70;
  const spacingY = 52;
  const startX = 110;
  const startY = 90;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      aliens.push({
        row,
        x: startX + col * spacingX,
        y: startY + row * spacingY,
        width: 38,
        height: 26,
        alive: true,
        points: (rows - row) * 10,
      });
    }
  }

  state.aliens = aliens;
  state.direction = 1;
  state.formationSpeed = 34 + level * 9;
  state.dropDistance = 18;
  state.alienFireTimer = 0.7;
}

function createBarriers() {
  state.barriers = [0, 1, 2, 3].map((index) => ({
    x: 110 + index * 185,
    y: HEIGHT - 150,
    width: 90,
    height: 48,
    health: 100,
  }));
}

function resetLevel(resetScore = true) {
  if (resetScore) {
    state.score = 0;
    state.lives = 3;
    state.level = 1;
  }

  createPlayer();
  createAliens(state.level);
  createBarriers();
  state.bullets = [];
  state.alienBullets = [];
  state.fireCooldown = 0;
  syncHud();
}

function startGame() {
  resetStars();
  resetLevel(true);
  hideOverlay();
  state.running = true;
  state.paused = false;
  state.lastTime = performance.now();
}

function syncHud() {
  scoreNode.textContent = String(state.score);
  livesNode.textContent = String(state.lives);
  levelNode.textContent = String(state.level);
}

function showOverlay(title, text, buttonText) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  startButton.textContent = buttonText;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  if (state.paused) {
    showOverlay("Paused", "Press P or Enter to resume.", "Resume");
  } else {
    hideOverlay();
    state.lastTime = performance.now();
  }
}

function resumeGame() {
  if (!state.paused) return;
  togglePause();
}

function winLevel() {
  state.level += 1;
  createAliens(state.level);
  createBarriers();
  state.bullets = [];
  state.alienBullets = [];
  syncHud();
}

function endGame(victory = false) {
  state.running = false;
  if (victory) {
    showOverlay("Sector Cleared", `Final score ${state.score}. Press Enter or Start to play again.`, "Play Again");
  } else {
    showOverlay("Base Lost", `Final score ${state.score}. Press Enter or Start to try again.`, "Restart");
  }
}

function firePlayerBullet() {
  if (state.fireCooldown > 0 || !state.running || state.paused) return;
  state.bullets.push({
    x: state.player.x + state.player.width / 2 - 2,
    y: state.player.y - 14,
    width: 4,
    height: 14,
    speed: 460,
  });
  state.fireCooldown = 0.28;
}

function pickAlienShooter() {
  const living = state.aliens.filter((alien) => alien.alive);
  if (!living.length) return null;

  const columns = new Map();
  for (const alien of living) {
    const key = Math.round(alien.x);
    const current = columns.get(key);
    if (!current || alien.y > current.y) columns.set(key, alien);
  }

  const shooters = Array.from(columns.values());
  return shooters[Math.floor(Math.random() * shooters.length)] || null;
}

function fireAlienBullet() {
  const shooter = pickAlienShooter();
  if (!shooter) return;
  state.alienBullets.push({
    x: shooter.x + shooter.width / 2 - 3,
    y: shooter.y + shooter.height,
    width: 6,
    height: 16,
    speed: 220 + state.level * 18,
  });
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function updateStars(dt) {
  for (const star of state.stars) {
    star.y += star.speed * dt;
    if (star.y > HEIGHT) {
      star.y = -2;
      star.x = Math.random() * WIDTH;
    }
  }
}

function updatePlayer(dt) {
  if (state.keys.left) state.player.x -= state.player.speed * dt;
  if (state.keys.right) state.player.x += state.player.speed * dt;
  state.player.x = Math.max(18, Math.min(WIDTH - state.player.width - 18, state.player.x));
  state.fireCooldown = Math.max(0, state.fireCooldown - dt);
}

function updateBullets(dt) {
  for (const bullet of state.bullets) bullet.y -= bullet.speed * dt;
  for (const bullet of state.alienBullets) bullet.y += bullet.speed * dt;
  state.bullets = state.bullets.filter((bullet) => bullet.y + bullet.height > 0);
  state.alienBullets = state.alienBullets.filter((bullet) => bullet.y < HEIGHT + bullet.height);
}

function updateAliens(dt) {
  let leftMost = Infinity;
  let rightMost = -Infinity;
  let shouldDrop = false;

  for (const alien of state.aliens) {
    if (!alien.alive) continue;
    alien.x += state.direction * state.formationSpeed * dt;
    leftMost = Math.min(leftMost, alien.x);
    rightMost = Math.max(rightMost, alien.x + alien.width);
  }

  if (leftMost < 26 || rightMost > WIDTH - 26) shouldDrop = true;

  if (shouldDrop) {
    state.direction *= -1;
    for (const alien of state.aliens) {
      if (!alien.alive) continue;
      alien.y += state.dropDistance;
      if (alien.y + alien.height >= state.player.y) {
        endGame(false);
      }
    }
  }

  state.alienFireTimer -= dt;
  if (state.alienFireTimer <= 0) {
    fireAlienBullet();
    state.alienFireTimer = Math.max(0.25, 1.05 - state.level * 0.08);
  }
}

function applyBarrierDamage(projectile, amount) {
  for (const barrier of state.barriers) {
    if (barrier.health <= 0) continue;
    if (rectsIntersect(projectile, barrier)) {
      barrier.health = Math.max(0, barrier.health - amount);
      return true;
    }
  }
  return false;
}

function handleCollisions() {
  for (const bullet of state.bullets) {
    if (applyBarrierDamage(bullet, 18)) {
      bullet.spent = true;
      continue;
    }

    for (const alien of state.aliens) {
      if (!alien.alive || bullet.spent) continue;
      if (rectsIntersect(bullet, alien)) {
        alien.alive = false;
        bullet.spent = true;
        state.score += alien.points;
        syncHud();
      }
    }
  }

  for (const bullet of state.alienBullets) {
    if (applyBarrierDamage(bullet, 14)) {
      bullet.spent = true;
      continue;
    }

    if (rectsIntersect(bullet, state.player)) {
      bullet.spent = true;
      state.lives -= 1;
      syncHud();
      if (state.lives <= 0) {
        endGame(false);
      } else {
        state.player.x = WIDTH / 2 - state.player.width / 2;
      }
    }
  }

  state.bullets = state.bullets.filter((bullet) => !bullet.spent);
  state.alienBullets = state.alienBullets.filter((bullet) => !bullet.spent);

  if (state.aliens.every((alien) => !alien.alive)) {
    if (state.level >= 4) {
      endGame(true);
    } else {
      winLevel();
    }
  }
}

function drawStars() {
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (const star of state.stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  const p = state.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = "#84f6ff";
  ctx.fillRect(0, 10, p.width, 12);
  ctx.beginPath();
  ctx.moveTo(8, 10);
  ctx.lineTo(p.width / 2, 0);
  ctx.lineTo(p.width - 8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d9ffff";
  ctx.fillRect(p.width / 2 - 4, 3, 8, 18);
  ctx.restore();
}

function drawAliens() {
  for (const alien of state.aliens) {
    if (!alien.alive) continue;
    const palette = ["#ff79c6", "#ffb86c", "#84f6ff", "#7af59d", "#b794ff"];
    ctx.save();
    ctx.translate(alien.x, alien.y);
    ctx.fillStyle = palette[alien.row % palette.length];
    ctx.fillRect(4, 6, alien.width - 8, alien.height - 8);
    ctx.fillRect(0, 10, alien.width, 10);
    ctx.fillRect(6, 0, 8, 10);
    ctx.fillRect(alien.width - 14, 0, 8, 10);
    ctx.clearRect(10, 12, 5, 5);
    ctx.clearRect(alien.width - 15, 12, 5, 5);
    ctx.fillRect(8, alien.height - 2, 6, 8);
    ctx.fillRect(alien.width - 14, alien.height - 2, 6, 8);
    ctx.restore();
  }
}

function drawBarriers() {
  for (const barrier of state.barriers) {
    if (barrier.health <= 0) continue;
    const alpha = barrier.health / 100;
    ctx.fillStyle = `rgba(122, 245, 157, ${0.28 + alpha * 0.5})`;
    ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
    ctx.clearRect(barrier.x + 30, barrier.y + 28, 30, 20);
    ctx.strokeStyle = `rgba(255,255,255,${0.15 + alpha * 0.35})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(barrier.x, barrier.y, barrier.width, barrier.height);
  }
}

function drawBullets() {
  ctx.fillStyle = "#f6f87a";
  for (const bullet of state.bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
  ctx.fillStyle = "#ff6b8f";
  for (const bullet of state.alienBullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function drawGround() {
  ctx.strokeStyle = "rgba(132, 246, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT - 34);
  ctx.lineTo(WIDTH, HEIGHT - 34);
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawStars();
  drawGround();
  drawBarriers();
  drawAliens();
  drawBullets();
  drawPlayer();
}

function updateFrame(dt) {
  updateStars(dt);

  if (state.running && !state.paused) {
    updatePlayer(dt);
    updateBullets(dt);
    updateAliens(dt);
    handleCollisions();
  }
}

function tick(time) {
  const dt = Math.min(0.033, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;
  updateFrame(dt);
  draw();
  requestAnimationFrame(tick);
}

function handleKey(event, pressed) {
  if (event.code === "ArrowLeft" || event.code === "KeyA") state.keys.left = pressed;
  if (event.code === "ArrowRight" || event.code === "KeyD") state.keys.right = pressed;
  if (pressed && event.code === "Space") {
    event.preventDefault();
    if (!state.paused) firePlayerBullet();
  }
  if (pressed && event.code === "KeyP") {
    togglePause();
  }
  if (pressed && event.code === "Enter") {
    if (state.paused) {
      resumeGame();
    } else if (!state.running) {
      startGame();
    }
  }
}

function ensureSmokeReportNode() {
  let node = document.getElementById("smoke-report");
  if (!node) {
    node = document.createElement("pre");
    node.id = "smoke-report";
    node.hidden = true;
    document.body.appendChild(node);
  }
  return node;
}

function runSmokeTest() {
  const reportNode = ensureSmokeReportNode();
  const before = window.__spaceInvadersDebug.snapshot();
  window.__spaceInvadersDebug.startGame();
  const afterStart = window.__spaceInvadersDebug.snapshot();

  const startX = afterStart.playerX;
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }));
  window.__spaceInvadersDebug.step(0.2);
  window.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowRight" }));
  const afterMove = window.__spaceInvadersDebug.snapshot();

  window.__spaceInvadersDebug.firePlayerBullet();
  window.__spaceInvadersDebug.step(0.016);
  const afterShot = window.__spaceInvadersDebug.snapshot();

  window.__spaceInvadersDebug.spawnTestBullet(120, 108);
  window.__spaceInvadersDebug.step(0.016);
  const afterHit = window.__spaceInvadersDebug.snapshot();

  window.__spaceInvadersDebug.togglePause();
  const afterPause = window.__spaceInvadersDebug.snapshot();

  // Capture paused-state values before stepping while paused
  const pausedPlayerX = afterPause.playerX;
  const pausedAlienBullets = afterPause.alienBullets;
  const pausedAliveAliens = afterPause.aliveAliens;
  const pausedAlienPositions = afterPause.alienPositions;

  window.__spaceInvadersDebug.step(0.1);
  const afterPauseStep = window.__spaceInvadersDebug.snapshot();

  window.__spaceInvadersDebug.resumeGame();
  const afterResume = window.__spaceInvadersDebug.snapshot();

  window.__spaceInvadersDebug.step(0.1);
  const afterResumeStep = window.__spaceInvadersDebug.snapshot();

  window.__spaceInvadersDebug.forceGameOver();
  const afterGameOver = window.__spaceInvadersDebug.snapshot();
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter" }));
  window.dispatchEvent(new KeyboardEvent("keyup", { code: "Enter" }));
  window.__spaceInvadersDebug.step(0.016);
  const afterRestart = window.__spaceInvadersDebug.snapshot();

  const pass = before.running === false
    && afterStart.running === true
    && afterMove.playerX > startX
    && afterShot.bullets >= 1
    && afterHit.aliveAliens < afterStart.aliveAliens
    && afterHit.score > afterStart.score
    && afterPause.paused === true
    && afterPause.running === true
    && afterPauseStep.paused === true
    && afterPauseStep.score === afterPause.score
    && afterPauseStep.bullets === afterPause.bullets
    && afterPauseStep.playerX === pausedPlayerX
    && afterPauseStep.aliveAliens === pausedAliveAliens
    && afterPauseStep.alienBullets === pausedAlienBullets
    && JSON.stringify(afterPauseStep.alienPositions) === JSON.stringify(pausedAlienPositions)
    && afterResume.paused === false
    && afterResume.running === true
    && afterResume.score === afterPause.score
    && afterResume.lives === afterPause.lives
    && afterResume.level === afterPause.level
    && afterGameOver.running === false
    && afterRestart.running === true
    && afterRestart.paused === false
    && afterRestart.lives === 3;

  const report = {
    pass,
    before,
    afterStart,
    afterMove,
    afterShot,
    afterHit,
    afterPause,
    afterPauseStep,
    afterResume,
    afterResumeStep,
    afterGameOver,
    afterRestart,
  };

  document.body.dataset.smoke = pass ? "pass" : "fail";
  reportNode.textContent = JSON.stringify(report);
}

window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));
startButton.addEventListener("click", () => {
  if (state.paused) {
    resumeGame();
  } else {
    startGame();
  }
});

resetStars();
resetLevel(true);
showOverlay("Space Invaders", "Clear four waves of invaders and defend the base.", "Start Game");

// Expose a minimal debug surface so browser-based smoke checks can verify core gameplay state.
window.__spaceInvadersDebug = {
  startGame,
  firePlayerBullet,
  togglePause,
  resumeGame,
  step(seconds = 1 / 60) {
    updateFrame(seconds);
    draw();
  },
  setPlayerX(x) {
    state.player.x = x;
  },
  forceGameOver() {
    endGame(false);
  },
  spawnTestBullet(x, y) {
    state.bullets.push({ x, y, width: 4, height: 14, speed: 460, spent: false });
  },
  snapshot() {
    return {
      running: state.running,
      paused: state.paused,
      score: state.score,
      lives: state.lives,
      level: state.level,
      playerX: state.player.x,
      bullets: state.bullets.length,
      alienBullets: state.alienBullets.length,
      aliveAliens: state.aliens.filter((alien) => alien.alive).length,
      alienPositions: state.aliens.filter((alien) => alien.alive).map((alien) => ({ x: alien.x, y: alien.y })),
      barrierHealth: state.barriers.map((barrier) => barrier.health),
    };
  },
};

requestAnimationFrame((time) => {
  state.lastTime = time;
  tick(time);
});

if (params.get("smoke") === "1") {
  window.setTimeout(runSmokeTest, 50);
}
