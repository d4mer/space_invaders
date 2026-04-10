const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreNode = document.getElementById("score");
const livesNode = document.getElementById("lives");
const levelNode = document.getElementById("level");
const statusChip = document.getElementById("status-chip");
const effectRack = document.getElementById("effect-rack");
const soundToggle = document.getElementById("sound-toggle");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const startButton = document.getElementById("start-button");
const touchLeft = document.querySelector(".touch-left");
const touchRight = document.querySelector(".touch-right");
const touchFire = document.querySelector(".touch-fire");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const DEFAULT_FIRE_COOLDOWN = 0.28;
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
  powerups: [],
  direction: 1,
  formationSpeed: 38,
  dropDistance: 18,
  fireCooldown: 0,
  alienFireTimer: 0,
  lastTime: 0,
  powerupEffects: {
    rapidFire: { active: false, duration: 0, cooldownMod: 0.1 },
    spreadShot: { active: false, duration: 0 },
  },
  audio: {
    enabled: !params.has("smoke"),
    context: null,
    masterGain: null,
    unlocked: false,
  },
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
  state.powerups = [];
  state.fireCooldown = 0;
  state.powerupEffects.rapidFire.active = false;
  state.powerupEffects.rapidFire.duration = 0;
  state.powerupEffects.spreadShot.active = false;
  state.powerupEffects.spreadShot.duration = 0;
  syncHud();
  syncPowerupHud();
}

function startGame() {
  unlockAudio();
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

function syncPowerupHud() {
  const activeEffects = [];

  if (state.powerupEffects.rapidFire.active) {
    activeEffects.push({ className: "effect-pill effect-pill--rapid-fire", label: "Rapid Fire" });
  }

  if (state.powerupEffects.spreadShot.active) {
    activeEffects.push({ className: "effect-pill effect-pill--spread-shot", label: "Spread Shot" });
  }

  effectRack.innerHTML = activeEffects
    .map((effect) => `<span class="${effect.className}">${effect.label}</span>`)
    .join("");
}

function syncSoundToggle() {
  soundToggle.setAttribute("aria-pressed", state.audio.enabled ? "true" : "false");
  soundToggle.textContent = state.audio.enabled ? "SOUND ON" : "SOUND OFF";
}

function ensureAudio() {
  if (!state.audio.enabled) return null;
  if (state.audio.context) return state.audio.context;

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    state.audio.enabled = false;
    syncSoundToggle();
    return null;
  }

  const context = new AudioContextCtor();
  const masterGain = context.createGain();
  masterGain.gain.value = 0.07;
  masterGain.connect(context.destination);

  state.audio.context = context;
  state.audio.masterGain = masterGain;
  return context;
}

function unlockAudio() {
  if (!state.audio.enabled) return;
  const context = ensureAudio();
  if (!context) return;
  if (context.state === "suspended") context.resume();
  state.audio.unlocked = true;
}

function playSound(config) {
  if (!state.audio.enabled) return;
  const context = ensureAudio();
  if (!context || !state.audio.masterGain) return;
  if (context.state === "suspended") return;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const filter = context.createBiquadFilter();
  const duration = config.duration || 0.12;

  oscillator.type = config.type || "triangle";
  oscillator.frequency.setValueAtTime(config.from, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, config.to || config.from), now + duration);

  filter.type = config.filterType || "lowpass";
  filter.frequency.setValueAtTime(config.filter || 1800, now);
  filter.Q.value = config.q || 0.8;

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(config.volume || 0.16, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(state.audio.masterGain);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function playPlayerFireSound() {
  playSound({ type: "square", from: 720, to: 260, duration: 0.08, volume: 0.12, filter: 2400 });
}

function playAlienFireSound() {
  playSound({ type: "sawtooth", from: 240, to: 110, duration: 0.12, volume: 0.07, filter: 900 });
}

function playAlienHitSound() {
  playSound({ type: "triangle", from: 520, to: 160, duration: 0.14, volume: 0.15, filter: 1800 });
}

function playBarrierHitSound() {
  playSound({ type: "square", from: 180, to: 80, duration: 0.06, volume: 0.06, filter: 700 });
}

function playPowerupSound() {
  playSound({ type: "triangle", from: 360, to: 880, duration: 0.18, volume: 0.14, filter: 2600 });
}

function playLoseLifeSound() {
  playSound({ type: "sawtooth", from: 240, to: 70, duration: 0.22, volume: 0.11, filter: 900 });
}

function playVictorySound() {
  playSound({ type: "triangle", from: 440, to: 980, duration: 0.26, volume: 0.14, filter: 2400 });
}

function playGameOverSound() {
  playSound({ type: "sawtooth", from: 180, to: 50, duration: 0.3, volume: 0.12, filter: 700 });
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
  unlockAudio();
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
  playPowerupSound();
  state.level += 1;
  createAliens(state.level);
  createBarriers();
  state.bullets = [];
  state.alienBullets = [];
  state.effects = [];
  state.powerups = [];
  state.powerupEffects.rapidFire.active = false;
  state.powerupEffects.rapidFire.duration = 0;
  state.powerupEffects.spreadShot.active = false;
  state.powerupEffects.spreadShot.duration = 0;
  syncHud();
  syncPowerupHud();
}

function endGame(victory = false) {
  state.running = false;
  if (victory) playVictorySound();
  else playGameOverSound();
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
  unlockAudio();
  
  // Apply rapid fire powerup (reduces cooldown)
  const cooldown = state.powerupEffects.rapidFire.active
    ? state.powerupEffects.rapidFire.cooldownMod
    : DEFAULT_FIRE_COOLDOWN;
  
  // Create main bullet
  state.bullets.push({
    x: state.player.x + state.player.width / 2 - 2,
    y: state.player.y - 14,
    width: 4,
    height: 14,
    speed: 460,
  });
  
  // Apply spread shot powerup (fire additional angled bullets)
  if (state.powerupEffects.spreadShot.active) {
    // Left angled bullet
    state.bullets.push({
      x: state.player.x + state.player.width / 2 - 2,
      y: state.player.y - 14,
      width: 4,
      height: 14,
      speed: 460,
      vx: -40, // slight left angle
    });
    // Right angled bullet
    state.bullets.push({
      x: state.player.x + state.player.width / 2 - 2,
      y: state.player.y - 14,
      width: 4,
      height: 14,
      speed: 460,
      vx: 40, // slight right angle
    });
  }
  
  state.fireCooldown = cooldown;
  playPlayerFireSound();
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
  playAlienFireSound();
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

function spawnPowerup(x, y) {
  // Two powerup types: rapid fire and spread shot
  const type = Math.random() < 0.5 ? 'rapidFire' : 'spreadShot';
  
  state.powerups.push({
    x: x - 12,
    y: y,
    width: 24,
    height: 24,
    speed: 120,
    type: type,
    collected: false,
    life: 8.0, // 8 seconds before powerup expires
    bounceOffset: 0,
  });
}

function collectPowerup(powerup) {
  powerup.collected = true;

  if (powerup.type === 'rapidFire') {
    state.powerupEffects.rapidFire.active = true;
    state.powerupEffects.rapidFire.duration = 6.0; // 6 seconds duration
  } else if (powerup.type === 'spreadShot') {
    state.powerupEffects.spreadShot.active = true;
    state.powerupEffects.spreadShot.duration = 6.0; // 6 seconds duration
  }

  syncPowerupHud();
  playPowerupSound();
}

function updatePowerups(dt) {
  // Update powerup positions
  state.powerups = state.powerups.filter((powerup) => {
    if (powerup.collected) return false;
    
    // Move powerup down
    powerup.y += powerup.speed * dt;
    
    // Add bounce animation effect
    powerup.bounceOffset += dt * 8;
    powerup.x += Math.sin(powerup.bounceOffset) * 2;
    
    // Check if powerup expired
    powerup.life -= dt;
    if (powerup.life <= 0) {
      // Powerup expired - create visual feedback effect
      state.effects.push({
        x: powerup.x + powerup.width / 2,
        y: powerup.y + powerup.height / 2,
        radius: 10,
        maxRadius: 20,
        life: 1.0,
        color: powerup.type === 'rapidFire' ? '#ffb86c' : '#b794ff',
        type: 'debris',
      });
      return false;
    }
    
    return powerup.y < HEIGHT + 40;
  });
}

function updatePowerupEffects(dt) {
  let changed = false;

  if (state.powerupEffects.rapidFire.active) {
    state.powerupEffects.rapidFire.duration -= dt;
    if (state.powerupEffects.rapidFire.duration <= 0) {
      state.powerupEffects.rapidFire.active = false;
      state.powerupEffects.rapidFire.duration = 0;
      changed = true;
    }
  }

  if (state.powerupEffects.spreadShot.active) {
    state.powerupEffects.spreadShot.duration -= dt;
    if (state.powerupEffects.spreadShot.duration <= 0) {
      state.powerupEffects.spreadShot.active = false;
      state.powerupEffects.spreadShot.duration = 0;
      changed = true;
    }
  }

  if (changed) syncPowerupHud();
}

function updateBullets(dt) {
  for (const bullet of state.bullets) {
    bullet.y -= bullet.speed * dt;
    if (bullet.vx) bullet.x += bullet.vx * dt;
  }
  for (const bullet of state.alienBullets) bullet.y += bullet.speed * dt;
  state.bullets = state.bullets.filter((bullet) => bullet.y + bullet.height > 0 && bullet.x > -20 && bullet.x < WIDTH + 20);
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
    }
  }

  // End the game just before aliens visibly overrun the live barricades.
  const liveBarriers = state.barriers.filter((barrier) => barrier.health > 0);
  const defenseLineY = liveBarriers.length
    ? Math.min(...liveBarriers.map((barrier) => barrier.y)) - 6
    : state.player.y - 12;

  for (const alien of state.aliens) {
    if (!alien.alive) continue;
    if (alien.y + alien.height >= defenseLineY) {
      endGame(false);
      return;
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

      playBarrierHitSound();
      
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
        playAlienHitSound();
        
        // 15% chance to drop a powerup
        if (Math.random() < 0.15) {
          spawnPowerup(alien.x + alien.width / 2, alien.y + alien.height / 2);
        }
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
        playLoseLifeSound();
        state.player.x = WIDTH / 2 - state.player.width / 2;
      }
    }
  }

  // Check powerup collisions with player
  for (const powerup of state.powerups) {
    if (powerup.collected) continue;
    if (rectsIntersect(state.player, powerup)) {
      collectPowerup(powerup);
    }
  }

  state.powerups = state.powerups.filter((powerup) => !powerup.collected);

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
  
  // Ship body glow/trail effect for modern look
  const trailGlow = "rgba(132, 246, 255, 0.2)";
  
  // Engine exhaust glow at bottom (dynamic based on movement)
  const isMoving = state.keys.left || state.keys.right || 
                   state.touch.left || state.touch.right;
  const flicker = isMoving ? Math.random() * 4 : 0;
  
  // Exhaust flame base color with gradient effect
  ctx.fillStyle = "rgba(255, 180, 100, 0.7)";
  ctx.beginPath();
  const flameY = p.height + flicker;
  for (let i = 0; i < 5; i++) {
    const flameX = p.width / 2 - 8 + i * 4;
    ctx.arc(flameX, flameY, 3 + Math.random() * 2, 0, Math.PI * 2);
  }
  ctx.fill();
  
  // Inner bright exhaust core
  ctx.fillStyle = "rgba(255, 230, 140, 0.9)";
  ctx.beginPath();
  for (let i = 1; i < 3; i++) {
    const flameX = p.width / 2 - 4 + i * 4;
    ctx.arc(flameX, flameY - 2, 2 + Math.random(), 0, Math.PI * 2);
  }
  ctx.fill();
  
  // Main ship body with gradient layering effect
  const mainColor = "#84f6ff";
  ctx.fillStyle = mainColor;
  
  // Base/platform with shadow effect for depth
  const baseShadowY = p.height - 4;
  ctx.fillStyle = "rgba(60, 180, 220, 0.4)";
  ctx.fillRect(-6, baseShadowY + flicker * 0.5, p.width + 12, 6);
  
  // Restore main color for ship body
  ctx.fillStyle = mainColor;
  ctx.fillRect(0, 12, p.width, 10); // Base platform
  
  // Angular ship body with modern sleek design
  ctx.beginPath();
  ctx.moveTo(10, 12); // Start from left side of cockpit area
  ctx.lineTo(p.width / 2 - 3, 0); // Left wing tip of cockpit
  ctx.lineTo(p.width / 2 + 3, 0); // Right wing tip of cockpit  
  ctx.lineTo(p.width - 10, 12); // End at right side
  ctx.closePath();
  ctx.fill();
  
  // Cockpit highlight for depth (gradient effect)
  const cockpitGradient = "#d9ffff";
  ctx.fillStyle = cockpitGradient;
  
  // Main vertical highlight strip (simulates metallic sheen)
  ctx.fillRect(p.width / 2 - 5, 4, 10, 18);
  
  // Center bright accent for cockpit window effect
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(p.width / 2 - 3, 6, 6, 10);
  
  // Add subtle wing/engine details on sides for modern look
  ctx.fillStyle = "rgba(132, 246, 255, 0.7)";
  ctx.fillRect(-3, p.height - 6, 4, 8); // Left wing detail
  ctx.fillRect(p.width - 1, p.height - 6, 4, 8); // Right wing detail
  
  ctx.restore();
}

function drawAliens() {
  for (const alien of state.aliens) {
    if (!alien.alive) continue;
    
    const palette = ["#ff79c6", "#ffb86c", "#84f6ff", "#7af59d", "#b794ff"];
    const glowPalette = ["#ffaaee", "#ffd588", "#aaffff", "#bbeecc", "#ddbbff"];
    
    ctx.save();
    ctx.translate(alien.x, alien.y);
    
    const color = palette[alien.row % palette.length];
    const glowColor = glowPalette[alien.row % glowPalette.length];
    
    // Add subtle pulsing glow effect based on alien row and time
    const pulseIntensity = 0.3 + Math.sin(Date.now() / (80 + alien.row * 20)) * 0.15;
    
    // Glow halo around each alien (more prominent for top rows)
    ctx.fillStyle = `rgba(${hexToRgba(glowColor)}, ${pulseIntensity * 0.4})`;
    ctx.beginPath();
    ctx.arc(alien.width / 2, alien.height / 2, 
            Math.max(alien.width, alien.height) * 0.75, 0, Math.PI * 2);
    ctx.fill();
    
    // Main body with gradient-like layering
    ctx.fillStyle = color;
    
    // Central core - brighter center effect  
    const centerX = alien.width / 2;
    ctx.fillRect(4, 6, alien.width - 8, alien.height - 8);
    
    // Inner highlight for depth (simulates gradient)
    ctx.fillStyle = `rgba(${hexToRgba(color)}, 0.5)`;
    const highlightY = alien.height * 0.3;
    ctx.fillRect(8, 12 + highlightY - alien.height * 0.3, 
                 alien.width - 16, alien.height * 0.5);
    
    // Wing/body sections with modern angular design
    ctx.fillStyle = color;
    ctx.fillRect(0, 10, alien.width, 12); // Main body extension
    ctx.fillRect(6, 0, 8, 14); // Left upper protrusion
    ctx.fillRect(alien.width - 14, 0, 8, 14); // Right upper protrusion
    
    // Eye/visor windows with glowing effect
    ctx.fillStyle = `rgba(${hexToRgba(glowColor)}, 0.7)`;
    ctx.fillRect(11, 14, 6, 5); // Left eye area
    ctx.fillRect(alien.width - 17, 14, 6, 5); // Right eye area
    
    // Eye glow centers
    ctx.fillStyle = `rgba(${hexToRgba(glowColor)}, 1)`;
    const eyePulse = Math.sin(Date.now() / (60 + alien.row * 15)) > -0.3;
    if (eyePulse) {
      ctx.fillRect(12, 15, 4, 3); // Left eye glow
      ctx.fillRect(alien.width - 16, 15, 4, 3); // Right eye glow
    }
    
    // Leg/feet details with modern styling  
    ctx.fillStyle = color;
    ctx.fillRect(8, alien.height - 4, 6, 10); // Left foot
    ctx.fillRect(alien.width - 14, alien.height - 4, 6, 10); // Right foot
    
    // Foot tip accents
    ctx.fillStyle = `rgba(${hexToRgba(glowColor)}, 0.6)`;
    ctx.fillRect(9, alien.height + 4, 4, 2); // Left tip
    ctx.fillRect(alien.width - 13, alien.height + 4, 4, 2); // Right tip
    
    ctx.restore();
  }
}

// Helper function to convert hex colors to rgba values for dynamic glow effects
function hexToRgba(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// Cache the helper on window for debugging if needed
window.__hexToRgba = hexToRgba;

function drawBarriers() {
  for (const barrier of state.barriers) {
    if (barrier.health <= 0) continue;
    
    const healthRatio = barrier.health / barrier.maxHealth;
    
    // Multi-stage visual degradation based on health ratio
    if (healthRatio > 0.75) {
      // Healthy state - clean, bright green-blue with glow
      const baseColor = "rgba(100, 255, 220";
      ctx.fillStyle = `${baseColor}, 1)`;
      
      // Main body with rounded appearance using gradient-like effect
      const gradWidth = barrier.width;
      ctx.fillRect(barrier.x, barrier.y + 4, gradWidth, barrier.height - 8);
      
      // Inner glow highlight for healthy state
      ctx.fillStyle = "rgba(150, 255, 240, 0.3)";
      ctx.fillRect(barrier.x + 8, barrier.y + 12, gradWidth - 16, 8);
      
      // Clean border with cyan glow
      ctx.strokeStyle = "rgba(100, 255, 220, 0.7)";
      ctx.lineWidth = 3;
      ctx.strokeRect(barrier.x, barrier.y + 2, gradWidth, barrier.height - 4);
      
      // Structural details visible when healthy
      ctx.fillStyle = "rgba(0, 45, 38, 0.6)";
      ctx.fillRect(barrier.x + 22, barrier.y + 30, 18, 14);
      ctx.fillRect(barrier.x + 50, barrier.y + 30, 18, 14);
      
    } else if (healthRatio > 0.5) {
      // Moderately damaged - yellow-green with visible wear
      const baseColor = "rgba(200, 245, 110";
      ctx.fillStyle = `${baseColor}, 0.9)`;
      
      // Slightly smaller body showing erosion
      const erosion = (1 - healthRatio) * 8;
      ctx.fillRect(barrier.x + erosion, barrier.y + 6 + erosion, 
                   barrier.width - erosion * 2, barrier.height - 10);
      
      // Warning highlight stripe
      ctx.fillStyle = "rgba(255, 200, 80, 0.4)";
      ctx.fillRect(barrier.x + erosion + 12, barrier.y + 14 + erosion, 
                   barrier.width - erosion * 2 - 24, 6);
      
      // Border showing stress
      ctx.strokeStyle = "rgba(200, 180, 60, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(barrier.x + erosion, barrier.y + 4 + erosion, 
                     barrier.width - erosion * 2, barrier.height - 6);
      
      // One structural element removed
      ctx.fillStyle = "rgba(0, 35, 28, 0.7)";
      ctx.fillRect(barrier.x + erosion + 55, barrier.y + 32 + erosion, 16, 12);
      
      // Small crack marks appear
      ctx.fillStyle = "rgba(80, 60, 20, 0.5)";
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const crackX = barrier.x + 25 + i * 18;
        ctx.fillRect(crackX, barrier.y + 36 - (i * 2), 8, 2);
      }
      
    } else if (healthRatio > 0.3) {
      // Heavily damaged - orange with significant damage
      const baseColor = "rgba(255, 180, 70";
      ctx.fillStyle = `${baseColor}, 0.8)`;
      
      // More erosion visible
      const heavyErosion = (1 - healthRatio) * 14;
      ctx.fillRect(barrier.x + heavyErosion, barrier.y + 8 + heavyErosion * 1.5, 
                   barrier.width - heavyErosion * 2, barrier.height - 16);
      
      // Critical warning flash effect (subtle pulsing)
      const pulse = Math.sin(Date.now() / 100) * 3;
      ctx.fillStyle = `rgba(255, ${140 + pulse * 3}, 80, 0.3)`;
      ctx.fillRect(barrier.x + heavyErosion + 8, barrier.y + 16 + heavyErosion * 1.5, 
                   barrier.width - heavyErosion * 2 - 16, 8);
      
      // Fractured border
      ctx.strokeStyle = "rgba(255, 100, 40, 0.6)";
      ctx.lineWidth = 2;
      
      // Draw fractured border (skip gaps for crack effect)
      const segmentLen = 12;
      const perimeterX = barrier.width - heavyErosion * 2;
      const perimeterY = barrier.height - 6 - heavyErosion * 1.5;
      for (let i = 0; i < perimeterX / segmentLen; i++) {
        if (i % 2 === 0) ctx.strokeRect(barrier.x + heavyErosion + i * segmentLen, barrier.y + 4 + heavyErosion * 1.5, segmentLen - 2, perimeterY);
      }
      
    } else if (healthRatio > 0.15) {
      // Critical state - red/orange, barely holding together
      ctx.fillStyle = "rgba(255, 90, 80, 0.7)";
      
      // Minimal remaining structure
      const criticalErosion = (1 - healthRatio) * 20;
      ctx.fillRect(barrier.x + criticalErosion, barrier.y + 12 + criticalErosion * 2, 
                   Math.max(20, barrier.width - criticalErosion * 3), barrier.height - 24);
      
      // Intense warning glow with pulsing
      const intensePulse = 0.5 + Math.sin(Date.now() / 60) * 0.3;
      ctx.fillStyle = `rgba(255, 60, 40, ${intensePulse})`;
      ctx.fillRect(barrier.x + criticalErosion + 6, barrier.y + 20 + criticalErosion * 2, 
                   Math.max(8, barrier.width - criticalErosion * 3 - 12), 6);
      
      // Heavy crack network
      ctx.strokeStyle = "rgba(40, 20, 10, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const cx = barrier.x + criticalErosion + Math.random() * (barrier.width - criticalErosion * 2);
        const cy = barrier.y + Math.random() * (barrier.height - 10);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + (Math.random() - 0.5) * 24, cy + Math.random() * 16);
      }
      ctx.stroke();
      
    } else {
      // Near destruction - flickering, barely visible remnants
      ctx.fillStyle = "rgba(255, 100, 50, 0.4)";
      const finalErosion = 24 + Math.random() * 8;
      
      // Fading remnants with flicker effect
      const flicker = Math.abs(Math.sin(Date.now() / 30)) > 0.2;
      if (flicker) {
        ctx.fillRect(barrier.x + finalErosion, barrier.y + 16 + finalErosion * 2.5, 
                     Math.max(8, barrier.width - finalErosion * 3), 12);
      }
      
      // Final warning - intense flashing
      const finalFlash = Math.abs(Math.sin(Date.now() / 20)) > 0.5;
      if (finalFlash) {
        ctx.fillStyle = "rgba(255, 180, 60, 0.9)";
        ctx.fillRect(barrier.x + finalErosion - 2, barrier.y + 14 + finalErosion * 2.5, 
                     Math.max(16, barrier.width - finalErosion * 3 + 4), 8);
      }
    }
    
    // Health bar overlay for critical barriers (visible at <40% health)
    if (healthRatio <= 0.4 && !state.paused) {
      const barWidth = barrier.width * healthRatio;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(barrier.x, barrier.y - 8, barrier.width, 4);
      ctx.fillStyle = healthRatio > 0.25 ? "#ff8866" : "#ff4433";
      ctx.fillRect(barrier.x, barrier.y - 8, barWidth, 4);
    }
  }
}

function drawBullets() {
  // Player bullets - modern glowing trail effect
  for (const bullet of state.bullets) {
    // Trail glow gradient behind the bullet
    const trailGradient = ctx;
    ctx.fillStyle = "rgba(240, 255, 180, 0.3)";
    ctx.fillRect(bullet.x - 2, bullet.y + bullet.height * 0.3, 
                 bullet.width + 4, bullet.height * 0.7);
    
    // Core bullet with glow halo
    ctx.fillStyle = "#f8ff66";
    ctx.fillRect(bullet.x, bullet.y + 2, bullet.width, bullet.height - 4);
    
    // Bright center highlight
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bullet.x + 1, bullet.y + 4, bullet.width - 2, bullet.height / 3);
    
    // Outer glow halo effect
    ctx.fillStyle = "rgba(240, 255, 180, 0.6)";
    ctx.beginPath();
    ctx.arc(bullet.x + bullet.width/2, bullet.y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Bottom sparkle for propulsion effect
    ctx.fillStyle = "rgba(255, 200, 100, 0.7)";
    ctx.beginPath();
    const sparkleY = bullet.y + bullet.height - 2;
    for (let i = 0; i < 3; i++) {
      ctx.arc(bullet.x + bullet.width/2 - 4 + i*4, sparkleY + Math.random()*3, 
              1.5 + Math.random(), 0, Math.PI * 2);
    }
    ctx.fill();
  }
  
  // Alien bullets - menacing red with spiral/spike effect
  for (const bullet of state.alienBullets) {
    // Outer darkness trail
    ctx.fillStyle = "rgba(180, 40, 60, 0.25)";
    ctx.fillRect(bullet.x - 1, bullet.y + bullet.height * 0.2, 
                 bullet.width + 2, bullet.height * 0.8);
    
    // Main body with gradient effect simulation
    ctx.fillStyle = "#ff5577";
    ctx.fillRect(bullet.x, bullet.y + 2, bullet.width, bullet.height - 4);
    
    // Inner dark core for menacing look
    ctx.fillStyle = "#aa2233";
    ctx.fillRect(bullet.x + 1, bullet.y + 4, bullet.width - 2, bullet.height / 3);
    
    // Spiky edges effect using small triangles at corners
    ctx.fillStyle = "#ff3355";
    const spikeLen = 4;
    // Top spikes
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x - spikeLen/2, bullet.y - spikeLen);
    ctx.lineTo(bullet.x + bullet.width + spikeLen/2, bullet.y - spikeLen);
    ctx.lineTo(bullet.x + bullet.width, bullet.y);
    ctx.fill();
    
    // Bottom glow/sparks for alien energy effect  
    ctx.fillStyle = "rgba(255, 100, 130, 0.6)";
    ctx.beginPath();
    const alienSparkY = bullet.y + bullet.height;
    for (let i = 0; i < 4; i++) {
      ctx.arc(bullet.x + bullet.width/2 - 5 + i*3, alienSparkY + Math.random()*4, 
              1.2 + Math.random() * 0.8, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // Pulsing glow effect around alien bullet  
    const pulse = 0.3 + Math.sin(Date.now() / 50) * 0.1;
    ctx.fillStyle = `rgba(220, 60, 95, ${pulse})`;
    ctx.beginPath();
    ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, 
            10, 0, Math.PI * 2);
    ctx.fill();
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

function drawPowerups() {
  for (const powerup of state.powerups) {
    if (powerup.collected) continue;
    
    ctx.save();
    ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
    
    // Pulsing animation for collectible powerups
    const pulse = Math.sin(powerup.bounceOffset) * 2;
    const scale = 1 + pulse / 24;
    ctx.scale(scale, scale);
    
    // Draw powerup based on type
    if (powerup.type === 'rapidFire') {
      // Rapid fire: orange rounded rectangle with lightning bolt
      // Use cross-browser-safe approach - manually draw rounded rect
      ctx.fillStyle = '#ffb86c';
      ctx.beginPath();
      const rx = -10, ry = -10, rw = 20, rh = 20, r = 6;
      ctx.moveTo(rx + r, ry);
      ctx.lineTo(rx + rw - r, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
      ctx.lineTo(rx + rw, ry + rh - r);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
      ctx.lineTo(rx + r, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
      ctx.lineTo(rx, ry + r);
      ctx.quadraticCurveTo(rx, ry, rx + r, ry);
      ctx.closePath();
      ctx.fill();
      
      // Lightning bolt symbol
      ctx.fillStyle = '#091127';
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.lineTo(4, -6);
      ctx.lineTo(-2, 2);
      ctx.lineTo(2, 2);
      ctx.lineTo(-4, 8);
      ctx.lineTo(-4, -6);
      ctx.fill();
    } else if (powerup.type === 'spreadShot') {
      // Spread shot: purple rounded rectangle with three bullets
      // Use cross-browser-safe approach - manually draw rounded rect
      ctx.fillStyle = '#b794ff';
      ctx.beginPath();
      const rx = -10, ry = -10, rw = 20, rh = 20, r = 6;
      ctx.moveTo(rx + r, ry);
      ctx.lineTo(rx + rw - r, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
      ctx.lineTo(rx + rw, ry + rh - r);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
      ctx.lineTo(rx + r, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
      ctx.lineTo(rx, ry + r);
      ctx.quadraticCurveTo(rx, ry, rx + r, ry);
      ctx.closePath();
      ctx.fill();
      
      // Three bullet symbols
      ctx.fillStyle = '#091127';
      // Center bullet
      ctx.fillRect(-3, -6, 6, 12);
      // Left bullet
      ctx.fillRect(-9, -3, 4, 6);
      // Right bullet
      ctx.fillRect(5, -3, 4, 6);
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
  drawPowerups();
  drawPlayer();
}

function updateFrame(dt) {
  updateStars(dt);

  if (state.running && !state.paused) {
    updatePlayer(dt);
    updateEffects(dt);
    updateBullets(dt);
    updateAliens(dt);
    updatePowerups(dt);
    handleCollisions();
  }
  
  // Update powerup effects expiration
  updatePowerupEffects(dt);
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

  const targetAlien = afterShot.alienPositions[0];
  window.__spaceInvadersDebug.spawnTestBullet(targetAlien.x + 17, targetAlien.y + 34);
  window.__spaceInvadersDebug.step(0.08);
  const afterAlienHit = window.__spaceInvadersDebug.snapshot();

  window.__spaceInvadersDebug.spawnTestBullet(120, 560);
  window.__spaceInvadersDebug.step(0.15);
  const afterBarrierHit = window.__spaceInvadersDebug.snapshot();

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

  // Alien overrun test: move aliens down to barricade line and verify GAME OVER
  window.__spaceInvadersDebug.startGame();
  window.__spaceInvadersDebug.step(0.016);
  // Move aliens down to the barricade line (HEIGHT - 150)
  // Aliens start at y=90 with height=26, so we need to move them down enough
  // The barricade is at HEIGHT - 150 = 650 - 150 = 500 (for 684 height)
  // Let's move them to y = 474 ( HEIGHT - 150 - alien height)
  window.__spaceInvadersDebug.moveAliensDown(400);
  window.__spaceInvadersDebug.step(0.016);
  const afterAlienOverrun = window.__spaceInvadersDebug.snapshot();

  // Victory path: advance to level 4, kill all aliens, verify VICTORY state
  window.__spaceInvadersDebug.startGame();
  window.__spaceInvadersDebug.step(0.016);
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

  // Powerup collection and expiry verification using real collision handling.
  window.__spaceInvadersDebug.startGame();
  window.__spaceInvadersDebug.step(0.016);
  const powerupPlayer = window.__spaceInvadersDebug.snapshot();

  window.__spaceInvadersDebug.spawnTestPowerup(powerupPlayer.playerX + 27, powerupPlayer.playerY, 'rapidFire');
  window.__spaceInvadersDebug.step(0.016);
  const afterRapidFireCollection = window.__spaceInvadersDebug.snapshot();
  window.__spaceInvadersDebug.firePlayerBullet();
  window.__spaceInvadersDebug.step(0.11);
  window.__spaceInvadersDebug.firePlayerBullet();
  const afterRapidFireBurst = window.__spaceInvadersDebug.snapshot();
  window.__spaceInvadersDebug.forceGameOver();
  window.__spaceInvadersDebug.step(6.1);
  const afterRapidFireExpiration = window.__spaceInvadersDebug.snapshot();

  window.__spaceInvadersDebug.startGame();
  window.__spaceInvadersDebug.step(0.016);
  const spreadShotPlayer = window.__spaceInvadersDebug.snapshot();
  window.__spaceInvadersDebug.spawnTestPowerup(spreadShotPlayer.playerX + 27, spreadShotPlayer.playerY, 'spreadShot');
  window.__spaceInvadersDebug.step(0.016);
  const afterSpreadShotCollection = window.__spaceInvadersDebug.snapshot();
  window.__spaceInvadersDebug.firePlayerBullet();
  const afterSpreadShotVolley = window.__spaceInvadersDebug.snapshot();
  window.__spaceInvadersDebug.forceGameOver();
  window.__spaceInvadersDebug.step(6.1);
  const afterSpreadShotExpiration = window.__spaceInvadersDebug.snapshot();

  const pass = before.running === false
    && before.overlayText.includes("Space")
    && afterStart.running === true
    && afterMove.playerX > startX
    && afterShot.bullets >= 1
    && afterAlienHit.aliveAliens < afterShot.aliveAliens
    && afterAlienHit.score > afterShot.score
    && afterBarrierHit.effects >= afterAlienHit.effects + 1
    && afterBarrierHit.barrierHealthTotal < afterAlienHit.barrierHealthTotal
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
    && afterTouchFire.bullets > afterRestart.bullets
    && afterRapidFireCollection.powerups === 0
    && afterRapidFireCollection.powerupEffects.rapidFire === true
    && afterRapidFireCollection.effectRackText.includes("Rapid Fire")
    && afterRapidFireBurst.bullets >= afterRapidFireCollection.bullets + 2
    && afterRapidFireExpiration.powerupEffects.rapidFire === false
    && !afterRapidFireExpiration.effectRackText.includes("Rapid Fire")
    && afterRapidFireExpiration.powerups === 0
    && afterSpreadShotCollection.powerups === 0
    && afterSpreadShotCollection.powerupEffects.spreadShot === true
    && afterSpreadShotCollection.effectRackText.includes("Spread Shot")
    && afterSpreadShotVolley.bullets >= afterSpreadShotCollection.bullets + 3
    && afterSpreadShotExpiration.powerupEffects.spreadShot === false
    && !afterSpreadShotExpiration.effectRackText.includes("Spread Shot")
    && afterSpreadShotExpiration.powerups === 0
    && afterAlienOverrun.running === false
    && afterAlienOverrun.statusChipText === "GAME OVER";

  const report = {
    pass,
    before,
    afterStart,
    afterMove,
    afterShot,
    afterAlienHit,
    afterBarrierHit,
    afterPause,
    afterPauseStep,
    afterResume,
    afterResumeStep,
    afterGameOver,
    afterRestart,
    afterVictory,
    afterTouchFire,
    afterAlienOverrun,
    afterRapidFireCollection,
    afterRapidFireBurst,
    afterRapidFireExpiration,
    afterSpreadShotCollection,
    afterSpreadShotVolley,
    afterSpreadShotExpiration,
  };

  document.body.dataset.smoke = pass ? "pass" : "fail";
  reportNode.textContent = JSON.stringify(report);
}

window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("pointerdown", unlockAudio, { passive: true });
window.addEventListener("touchstart", unlockAudio, { passive: true });
window.addEventListener("keyup", (event) => handleKey(event, false));
soundToggle.addEventListener("click", () => {
  state.audio.enabled = !state.audio.enabled;
  syncSoundToggle();
  if (state.audio.enabled) unlockAudio();
});
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
syncSoundToggle();

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
  moveAliensDown(distance) {
    for (const alien of state.aliens) {
      if (!alien.alive) continue;
      alien.y += distance;
    }
  },
  killAllAliens() {
    state.aliens.forEach((alien) => { alien.alive = false; });
  },
  winLevel,
  spawnTestBullet(x, y) {
    state.bullets.push({ x, y, width: 4, height: 14, speed: 460, spent: false });
  },
  spawnTestPowerup(x, y, type) {
    // type: 'rapidFire' or 'spreadShot'
    state.powerups.push({
      x: x - 12,
      y: y,
      width: 24,
      height: 24,
      speed: 120,
      type: type || 'rapidFire',
      collected: false,
      life: 8.0,
      bounceOffset: 0,
    });
  },
  activatePowerup(type) {
    // type: 'rapidFire' or 'spreadShot'
    if (type === 'rapidFire') {
      state.powerupEffects.rapidFire.active = true;
      state.powerupEffects.rapidFire.duration = 6.0;
    } else if (type === 'spreadShot') {
      state.powerupEffects.spreadShot.active = true;
      state.powerupEffects.spreadShot.duration = 6.0;
    }
  },
  setTouchFire(isPressed) {
    if (isPressed) {
      handleTouchFire();
    } else {
      handleTouchFireEnd();
    }
  },
  forceCollectTestPowerup(x, y, type) {
    // Spawn powerup at player position and immediately collect it
    const typeStr = type || 'rapidFire';
    const powerup = {
      x: x - 12,
      y: y,
      width: 24,
      height: 24,
      speed: 120,
      type: typeStr,
      collected: false,
      life: 8.0,
      bounceOffset: 0,
    };
    state.powerups.push(powerup);
    // Mark as collected so it doesn't fall away
    powerup.collected = true;
    // Directly activate the effect
    if (typeStr === 'rapidFire') {
      state.powerupEffects.rapidFire.active = true;
      state.powerupEffects.rapidFire.duration = 6.0;
    } else if (typeStr === 'spreadShot') {
      state.powerupEffects.spreadShot.active = true;
      state.powerupEffects.spreadShot.duration = 6.0;
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
      playerY: state.player.y,
      bullets: state.bullets.length,
      alienBullets: state.alienBullets.length,
      effects: state.effects.length,
      powerups: state.powerups.length,
      powerupEffects: {
        rapidFire: state.powerupEffects.rapidFire.active,
        spreadShot: state.powerupEffects.spreadShot.active,
      },
      aliveAliens: state.aliens.filter((alien) => alien.alive).length,
      alienPositions: state.aliens.filter((alien) => alien.alive).map((alien) => ({ x: alien.x, y: alien.y })),
      barrierHealth: state.barriers.map((barrier) => barrier.health),
      barrierHealthTotal: state.barriers.reduce((total, barrier) => total + barrier.health, 0),
      overlayText: overlayText.textContent,
      statusChipText: statusChip.textContent,
      effectRackText: effectRack.textContent,
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
