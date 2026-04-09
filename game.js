const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreNode = document.getElementById("score");
const livesNode = document.getElementById("lives");
const levelNode = document.getElementById("level");
const statusChip = document.getElementById("status-chip");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const startButton = document.getElementById("start-button");
const touchLeft = document.querySelector(".touch-left");
const touchRight = document.querySelector(".touch-right");
const touchFire = document.querySelector(".touch-fire");

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
  touch: { left: false, right: false, fire: false },
  player: null,
  bullets: [],
  alienBullets: [],
  aliens: [],
  stars: [],
  barriers: [],
  effects: [],
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
    maxHealth: 100,
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
  state.effects = [];
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
  setStatusChip("playing");
}

function syncHud() {
  scoreNode.textContent = String(state.score);
  livesNode.textContent = String(state.lives);
  levelNode.textContent = String(state.level);
}

function setStatusChip(status) {
  statusChip.className = "chip chip--" + status;
  statusChip.textContent = status === "gameover" ? "GAME OVER" : status === "victory" ? "VICTORY" : status.toUpperCase();
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
    setStatusChip("paused");
  } else {
    hideOverlay();
    state.lastTime = performance.now();
    setStatusChip("playing");
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
  state.effects = [];
  syncHud();
}

function endGame(victory = false) {
  state.running = false;
  if (victory) {
    setStatusChip("victory");
    showOverlay("Sector Cleared", `Final score ${state.score}. Press Enter or Start to play again.`, "Play Again");
  } else {
    setStatusChip("gameover");
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

function handleTouchFire() {
  if (state.touch.fire) return; // prevent rapid-fire on hold
  if (!state.paused) firePlayerBullet();
  state.touch.fire = true;
}

function handleTouchFireEnd() {
  state.touch.fire = false;
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
  if (state.keys.left || state.touch.left) state.player.x -= state.player.speed * dt;
  if (state.keys.right || state.touch.right) state.player.x += state.player.speed * dt;
  state.player.x = Math.max(18, Math.min(WIDTH - state.player.width - 18, state.player.x));
  state.fireCooldown = Math.max(0, state.fireCooldown - dt);
}

function updateEffects(dt) {
  state.effects = state.effects.filter((effect) => {
    effect.life -= dt * 2.5;
    if (effect.type === 'impact') {
      effect.radius += (effect.maxRadius - effect.radius) * dt * 3;
    }
    return effect.life > 0;
  });
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
      const oldHealth = barrier.health;
      barrier.health = Math.max(0, barrier.health - amount);
      
      // Create impact effect at hit point
      const hitX = projectile.x + projectile.width / 2;
      const hitY = projectile.y + projectile.height / 2;
      
      // Determine color based on projectile type
      const isAlienBullet = state.alienBullets.includes(projectile);
      const impactColor = isAlienBullet ? '#ff6b8f' : '#f6f87a';
      
      // Create impact effect
      state.effects.push({
        x: hitX,
        y: hitY,
        radius: 3,
        maxRadius: isAlienBullet ? 18 : 12,
        life: 1.0,
        color: impactColor,
        type: 'impact',
      });
      
      // If barrier health dropped significantly, add debris effect
      if (oldHealth > 0 && barrier.health === 0) {
        // Barrier destroyed - create explosion effect
        for (let i = 0; i < 12; i++) {
          state.effects.push({
            x: hitX + (Math.random() - 0.5) * 20,
            y: hitY + (Math.random() - 0.5) * 10,
            radius: Math.random() * 4 + 1,
            maxRadius: 8,
            life: 0.8 + Math.random() * 0.4,
            color: '#84f6ff',
            type: 'debris',
          });
        }
      }
      
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
    
    const healthRatio = barrier.health / barrier.maxHealth;
    const alpha = 0.5 + healthRatio * 0.5;
    
    // Base barrier body - changes color as health drops
    let baseColor;
    if (healthRatio > 0.7) {
      baseColor = "rgba(122, 245, 157,"; // Healthy - green
    } else if (healthRatio > 0.4) {
      baseColor = "rgba(196, 230, 98,"; // Moderate - yellow-green
    } else if (healthRatio > 0.2) {
      baseColor = "rgba(255, 194, 92,"; // Damaged - orange
    } else {
      baseColor = "rgba(255, 121, 198,"; // Critical - pinkish
    }
    
    ctx.fillStyle = `${baseColor} ${alpha})`;
    ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
    
    // Draw internal structure that degrades with damage
    if (healthRatio > 0.3) {
      ctx.clearRect(barrier.x + 30, barrier.y + 28, 30, 20);
    } else if (healthRatio > 0.1) {
      // More damage = more sections removed
      ctx.clearRect(barrier.x + 15, barrier.y + 20, 20, 15);
      ctx.clearRect(barrier.x + 55, barrier.y + 20, 20, 15);
    } else {
      // Near destruction - only small sections remain
      ctx.clearRect(barrier.x + 10, barrier.y + 15, 15, 10);
      ctx.clearRect(barrier.x + 65, barrier.y + 15, 15, 10);
    }
    
    // Border that becomes more prominent when damaged
    const borderColor = healthRatio > 0.5 
      ? `rgba(255,255,255,${0.2 + healthRatio * 0.3})`
      : `rgba(255,121,198,${0.4 + (1 - healthRatio) * 0.4})`;
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(barrier.x, barrier.y, barrier.width, barrier.height);
    
    // Add damage cracks/marks for low health
    if (healthRatio < 0.6) {
      ctx.strokeStyle = `rgba(0,0,0,${0.2 + (1 - healthRatio) * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Draw some crack lines
      const numCracks = Math.floor((1 - healthRatio) * 6);
      for (let i = 0; i < numCracks; i++) {
        const cx = barrier.x + 15 + Math.random() * (barrier.width - 30);
        const cy = barrier.y + 10 + Math.random() * (barrier.height - 20);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + (Math.random() - 0.5) * 12, cy + (Math.random() - 0.5) * 12);
      }
      ctx.stroke();
    }
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

function drawEffects() {
  for (const effect of state.effects) {
    ctx.save();
    ctx.globalAlpha = effect.life;
    ctx.fillStyle = effect.color;
    
    if (effect.type === 'impact') {
      // Round impact effect
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add a glow ring for stronger visuals
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (effect.type === 'debris') {
      // Debris particles - small squares
      ctx.fillRect(effect.x - effect.radius, effect.y - effect.radius, effect.radius * 2, effect.radius * 2);
    }
    
    ctx.restore();
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
  drawEffects();
  drawBarriers();
  drawAliens();
  drawBullets();
  drawPlayer();
}

function updateFrame(dt) {
  updateStars(dt);

  if (state.running && !state.paused) {
    updatePlayer(dt);
    updateEffects(dt);
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

// Touch/Pointer input handlers
function setupTouchControls() {
  const handleStart = (btn, key) => (e) => {
    e.preventDefault();
    btn.classList.add("active");
    state.touch[key] = true;
    if (key === "fire") handleTouchFire();
  };

  const handleEnd = (btn, key) => (e) => {
    e.preventDefault();
    btn.classList.remove("active");
    state.touch[key] = false;
    if (key === "fire") handleTouchFireEnd();
  };

  [touchLeft, touchRight, touchFire].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("pointerdown", handleStart(btn, btn.classList.contains("touch-left") ? "left" : btn.classList.contains("touch-right") ? "right" : "fire"));
    btn.addEventListener("pointerup", handleEnd(btn, btn.classList.contains("touch-left") ? "left" : btn.classList.contains("touch-right") ? "right" : "fire"));
    btn.addEventListener("pointerleave", handleEnd(btn, btn.classList.contains("touch-left") ? "left" : btn.classList.contains("touch-right") ? "right" : "fire"));
    btn.addEventListener("touchstart", handleStart(btn, btn.classList.contains("touch-left") ? "left" : btn.classList.contains("touch-right") ? "right" : "fire"), { passive: false });
    btn.addEventListener("touchend", handleEnd(btn, btn.classList.contains("touch-left") ? "left" : btn.classList.contains("touch-right") ? "right" : "fire"));
  });
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

  window.__spaceInvadersDebug.spawnTestBullet(120, 560);
  window.__spaceInvadersDebug.step(0.15);
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

  // Victory path: advance to level 4, kill all aliens, verify VICTORY state
  window.__spaceInvadersDebug.winLevel();
  window.__spaceInvadersDebug.winLevel();
  window.__spaceInvadersDebug.winLevel();
  window.__spaceInvadersDebug.killAllAliens();
  window.__spaceInvadersDebug.step(0.016);
  const afterVictory = window.__spaceInvadersDebug.snapshot();

  // Touch control verification: fire on first tap
  window.__spaceInvadersDebug.startGame();
  window.__spaceInvadersDebug.step(0.016);
  window.__spaceInvadersDebug.setTouchFire(true);
  window.__spaceInvadersDebug.step(0.016);
  const afterTouchFire = window.__spaceInvadersDebug.snapshot();
  window.__spaceInvadersDebug.setTouchFire(false);

  const pass = before.running === false
    && before.overlayText.includes("Space")
    && afterStart.running === true
    && afterMove.playerX > startX
    && afterShot.bullets >= 1
    && afterHit.aliveAliens < afterStart.aliveAliens
    && afterHit.score > afterStart.score
    && afterHit.effects >= 1
    && afterHit.barrierHealth < afterStart.barrierHealth
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
    && afterRestart.lives === 3
    && before.statusChipText === "READY"
    && afterStart.statusChipText === "PLAYING"
    && afterPause.statusChipText === "PAUSED"
    && afterResume.statusChipText === "PLAYING"
    && afterGameOver.statusChipText === "GAME OVER"
    && afterRestart.statusChipText === "PLAYING"
    && afterVictory.statusChipText === "VICTORY"
    && afterTouchFire.bullets > afterRestart.bullets;

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
    afterVictory,
    afterTouchFire,
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
showOverlay("Space Invaders", "Clear four waves of invaders, defend the base, and press Space to fire.", "Start Game");
setStatusChip("ready");

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
  forceVictory() {
    endGame(true);
  },
  killAllAliens() {
    state.aliens.forEach((alien) => { alien.alive = false; });
  },
  winLevel,
  spawnTestBullet(x, y) {
    state.bullets.push({ x, y, width: 4, height: 14, speed: 460, spent: false });
  },
  setTouchFire(isPressed) {
    state.touch.fire = isPressed;
    if (isPressed) {
      handleTouchFire();
    } else {
      handleTouchFireEnd();
    }
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
      effects: state.effects.length,
      aliveAliens: state.aliens.filter((alien) => alien.alive).length,
      alienPositions: state.aliens.filter((alien) => alien.alive).map((alien) => ({ x: alien.x, y: alien.y })),
      barrierHealth: state.barriers.map((barrier) => barrier.health),
      overlayText: overlayText.textContent,
      statusChipText: statusChip.textContent,
      touchState: { left: state.touch.left, right: state.touch.right, fire: state.touch.fire },
    };
  },
};

setupTouchControls();

requestAnimationFrame((time) => {
  state.lastTime = time;
  tick(time);
});

if (params.get("smoke") === "1") {
  window.setTimeout(runSmokeTest, 50);
}
