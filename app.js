const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on base canvas
const scoreEl = document.getElementById('score-val');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');

// --- 1. Entity Definitions ---

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.speed = 1000; // Hyper-fast laser bullets
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
        this.radius = 3;
        this.color = '#00ffcc';
        this.history = []; // Preallocate history for laser trail
    }

    update(dt) {
        this.history.push({x: this.x, y: this.y});
        if (this.history.length > 6) this.history.shift();

        this.x += this.dx * this.speed * dt;
        this.y += this.dy * this.speed * dt;
    }

    draw(ctx) {
        // Draw the neon laser trail
        if (this.history.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for(let i=1; i<this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.stroke();
            ctx.shadowBlur = 0; // reset
        }

        // Plasma core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class EnemyBullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.speed = 400; // Enemy bullets are slower than player shots
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
        this.radius = 2;
        this.color = '#ff3366';
    }

    update(dt) {
        this.x += this.dx * this.speed * dt;
        this.y += this.dy * this.speed * dt;
    }

    draw(ctx) {
        // Draw enemy projectile with red/pink glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 120 + Math.random() * 80; 
        this.radius = 18; // Slightly larger for better visual hitboxes
        this.color = '#ff3366';
        
        // Visual flair parameters
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 4;
        this.sides = Math.floor(Math.random() * 3) + 3; // 3 to 5 sides (triangles, squares, pentagons)
        this.spawnProgress = 0; // For warp-in animation
        
        // Firing parameters
        this.fireTimer = Math.random() * 2; // Random delay before first shot
        this.fireInterval = 1.5 + Math.random() * 0.5; // Fire every 1.5-2 seconds
    }

    update(dt, px, py) {
        if (this.spawnProgress < 1) {
            this.spawnProgress = Math.min(1, this.spawnProgress + dt * 3);
        }

        // Homing behavior
        const angle = Math.atan2(py - this.y, px - this.x);
        
        this.rotation += this.rotSpeed * dt;
        this.x += Math.cos(angle) * this.speed * dt;
        this.y += Math.sin(angle) * this.speed * dt;
        
        // Update firing logic
        this.fireTimer += dt;
        if (this.fireTimer >= this.fireInterval) {
            this.fireTimer = 0;
            return { shouldFire: true, angle: angle };
        }
        
        return { shouldFire: false, angle: angle };
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Spawn warp-in scale effect
        ctx.scale(this.spawnProgress, this.spawnProgress);

        // Draw geometric outer shell
        ctx.beginPath();
        for (let i = 0; i < this.sides; i++) {
            const a = (Math.PI * 2 / this.sides) * i;
            ctx.lineTo(Math.cos(a) * this.radius, Math.sin(a) * this.radius);
        }
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(255, 51, 102, 0.15)'; // Dim fill
        ctx.fill();
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.stroke();
        
        // Draw intense glowing inner core
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        const speed = Math.random() * 400 + 100; // Explosive fast burst
        const angle = Math.random() * Math.PI * 2;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.size = Math.random() * 5 + 2;
        this.life = 1.0; 
        this.decay = Math.random() * 1.5 + 0.5; // Random fade out speed
        this.color = color;
        
        // Tumbling effect
        this.rotation = Math.random() * Math.PI;
        this.rotSpeed = (Math.random() - 0.5) * 15;
    }

    update(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        // Friction reduces purely ballistic movement into a floating dispersion
        this.dx *= 0.92;
        this.dy *= 0.92;
        
        this.rotation += this.rotSpeed * dt;
        this.life -= this.decay * dt;
    }

    draw(ctx) {
        let alpha = Math.max(0, this.life);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Draw small squared sparks
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// --- 2. The Game State ---

const player = { 
    x: canvas.width / 2, 
    y: canvas.height / 2, 
    speed: 350, 
    radius: 16,
    color: '#00ffcc'
};

let bullets = [];
let enemyBullets = [];
let enemies = [];
let particles = [];
const keys = {};

// Screen shake logic
let shakeTime = 0;
let shakeMagnitude = 0;

let score = 0;
let lastEnemySpawnTime = 0;
let enemySpawnInterval = 1000;
const baseEnemySpawnInterval = 1000;

// Track mouse position mapped to canvas coordinates
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2 - 100;

let isGameOver = false;

// Global timer for animating background grid and pulsing effects
let timeElapsed = 0;

// --- 3. Input Tracking ---

window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

window.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
};

// Hook up the HTML restart button overlay
gameOverEl.addEventListener('click', () => {
    if (isGameOver) {
        restartGame();
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (isGameOver) return;
    
    // Shoot continuously on click (or just once)
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    
    shoot(mx, my);
});

function shoot(targetX, targetY) {
    const angle = Math.atan2(targetY - player.y, targetX - player.x);
    // Apply slight spread/recoil inaccuracy
    const spread = (Math.random() - 0.5) * 0.08;
    bullets.push(new Bullet(player.x, player.y, angle + spread));
    
    // Kickback juice!
    shakeScreen(40, 3);
}

function shakeScreen(durationMs, magnitude) {
    shakeTime = durationMs;
    shakeMagnitude = magnitude;
}

function spawnEnemy() {
    let x, y;
    // Spawn purely off-screen so they fly in seamlessly
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -100 : canvas.width + 100;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -100 : canvas.height + 100;
    }
    enemies.push(new Enemy(x, y));
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function restartGame() {
    isGameOver = false;
    gameOverEl.classList.remove('active');
    score = 0;
    scoreEl.innerText = score;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    particles = [];
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    enemySpawnInterval = baseEnemySpawnInterval;
    lastTime = performance.now();
    
    // Nuke tracked keys to prevent runaway on respawn
    for (let key in keys) keys[key] = false;
}

async function setGameOver() {
    isGameOver = true;
    finalScoreEl.innerText = score;
    gameOverEl.classList.add('active'); // Fade in HTML overlay

    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '<li>LOADING DATA...</li>';

    try {
        if (score > 0) {
            let name = prompt("NEW HIGH SCORE! Enter initials:", "AAA");
            if (!name) name = "NON";
            name = name.substring(0, 3).toUpperCase();
            
            const res = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, score: score })
            });
            const data = await res.json();
            renderLeaderboard(data, leaderboardList);
        } else {
            const res = await fetch('/api/scores');
            const data = await res.json();
            renderLeaderboard(data, leaderboardList);
        }
    } catch (e) {
        leaderboardList.innerHTML = '<li>OFFLINE MODE - NO.NET SERVER FOUND</li>';
        console.error('Leaderboard fetch failed:', e);
    }
}

function renderLeaderboard(data, container) {
    if (!data || data.length === 0) {
        container.innerHTML = '<li>NO RECORDS FOUND</li>';
        return;
    }
    container.innerHTML = data.map((entry, i) => 
        `<li><span>${i+1}. ${entry.name || '???'}</span><span>${entry.score}</span></li>`
    ).join('');
}

// --- 4. The Main Loop ---

let lastTime = performance.now();

function gameLoop(currentTime) {
    let dt = (currentTime - lastTime) / 1000;
    // Cap gigantic physics leaps after un-tabbing
    if (dt > 0.1) dt = 0.1; 
    lastTime = currentTime;

    timeElapsed += dt;

    if (!isGameOver) {
        update(dt, currentTime);
    }
    
    render(); 
    requestAnimationFrame(gameLoop);
}

function update(dt, currentTime) {
    // A. Movement Logic
    let moveDX = 0;
    let moveDY = 0;

    if (keys['w']) moveDY -= 1;
    if (keys['s']) moveDY += 1;
    if (keys['a']) moveDX -= 1;
    if (keys['d']) moveDX += 1;

    // Normalize diagonal movement speed
    if (moveDX !== 0 || moveDY !== 0) {
        const length = Math.sqrt(moveDX * moveDX + moveDY * moveDY);
        moveDX /= length;
        moveDY /= length;
    }

    player.x += moveDX * player.speed * dt;
    player.y += moveDY * player.speed * dt;

    // Keep player fully contained in the arena
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // B. Director / Spawner Logic (Difficulty Curve)
    if (currentTime - lastEnemySpawnTime > enemySpawnInterval) {
        spawnEnemy();
        // Occasionally spawn doubling hordes at high tiers
        if (Math.random() < 0.25) spawnEnemy();
        
        lastEnemySpawnTime = currentTime;
        enemySpawnInterval = Math.max(250, enemySpawnInterval - 10);
    }

    // C. Entity Physics & Collision Checks

    // Handle Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.update(dt);
        
        // GC off-screen bullets
        if (b.x < -100 || b.x > canvas.width + 100 || b.y < -100 || b.y > canvas.height + 100) {
            bullets.splice(i, 1);
            continue;
        }

        // Collision sweep (Enemies vs Bullets)
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];
            const dist = Math.hypot(b.x - e.x, b.y - e.y);
            if (dist < b.radius + e.radius) {
                // Glorious explosion juice
                createParticles(e.x, e.y, e.color, 20); // colored shrapnel
                createParticles(e.x, e.y, '#ffffff', 8); // hot white core
                
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                
                score += 10;
                // Directly bump DOM for score (faster than redrawing text every frame)
                scoreEl.innerText = score;
                
                // Screen punch
                shakeScreen(150, 6);
                break; // bullet spent
            }
        }
    }

    // Handle Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        const fireData = e.update(dt, player.x, player.y);

        // Enemy fires at player
        if (fireData.shouldFire) {
            enemyBullets.push(new EnemyBullet(e.x, e.y, fireData.angle));
        }

        // Enemy vs Player collision
        const dist = Math.hypot(player.x - e.x, player.y - e.y);
        // Slightly forgiving hitbox (0.8 scale)
        if (dist < player.radius * 0.8 + e.radius * 0.8) {
            shakeScreen(400, 25);
            createParticles(player.x, player.y, player.color, 60);
            createParticles(player.x, player.y, '#ffffff', 30);
            setGameOver();
            break;
        }
    }

    // Handle Enemy Bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let eb = enemyBullets[i];
        eb.update(dt);
        
        // GC off-screen enemy bullets
        if (eb.x < -100 || eb.x > canvas.width + 100 || eb.y < -100 || eb.y > canvas.height + 100) {
            enemyBullets.splice(i, 1);
            continue;
        }

        // Collision with player
        const dist = Math.hypot(player.x - eb.x, player.y - eb.y);
        if (dist < player.radius + eb.radius) {
            // Hit! Game over
            shakeScreen(400, 25);
            createParticles(player.x, player.y, player.color, 60);
            createParticles(player.x, player.y, '#ffffff', 30);
            enemyBullets.splice(i, 1);
            setGameOver();
            break;
        }
    }

    // Handle Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update(dt);
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Decay the screen shake
    if (shakeTime > 0) {
        shakeTime -= dt * 1000;
        if (shakeTime < 0) shakeTime = 0;
    }
}

function render() {
    // Deep neon backdrop
    ctx.fillStyle = '#0a0a12';
    // Use fillRect to clear, slightly faster + blocks transparent bleed
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // 1. Setup Camera Shake Map
    if (shakeTime > 0) {
        const dx = (Math.random() - 0.5) * 2 * shakeMagnitude;
        const dy = (Math.random() - 0.5) * 2 * shakeMagnitude;
        ctx.translate(dx, dy);
    }

    // 2. Draw animated grid floor
    drawGrid();

    // 3. Enable additive blending to stack glows up natively
    ctx.globalCompositeOperation = 'lighter';

    // 4. Draw Particles & Plasma Projectiles underneath the main geo
    particles.forEach(p => p.draw(ctx));
    bullets.forEach(b => b.draw(ctx));
    enemyBullets.forEach(eb => eb.draw(ctx));

    // Reset blending back to normal draw layers
    ctx.globalCompositeOperation = 'source-over';
    
    // 5. Draw Hostiles
    enemies.forEach(e => e.draw(ctx));

    // 6. Draw the Player's Ship + crosshairs
    if (!isGameOver) {
        drawPlayer();
        drawAim();
    }

    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.05)';
    ctx.lineWidth = 1;
    const size = 60;
    // Panning offset to create movement depth
    const offset = (timeElapsed * 25) % size;

    ctx.beginPath();
    // Verticals stay put
    for(let x = 0; x <= canvas.width; x += size) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    // Horizontals slide down smoothly
    for(let y = 0; y <= canvas.height + size; y += size) {
        ctx.moveTo(0, y - offset);
        ctx.lineTo(canvas.width, y - offset);
    }
    ctx.stroke();
}

function drawPlayer() {
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(angle);

    // Render thruster flame if propelling
    const isMoving = keys['w'] || keys['a'] || keys['s'] || keys['d'];
    if (isMoving) {
        ctx.beginPath();
        ctx.moveTo(-10, 0); // Tail
        const flameLength = -25 - Math.random() * 15; // Jitter flame length
        ctx.lineTo(flameLength, 0);
        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 5;
        // Make fire blend nicely
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff9900';
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineCap = 'butt';
    }

    // Strike Fighter Geometry Canvas
    ctx.beginPath();
    ctx.moveTo(18, 0); // Front nose cone
    ctx.lineTo(-12, 12); // Right wing tip
    ctx.lineTo(-6, 0); // Rear indentation gap
    ctx.lineTo(-12, -12); // Left wing tip
    ctx.closePath();

    ctx.fillStyle = '#0a0a12'; // Hollow center matching BG
    ctx.fill();

    // Vibrant glowing hull frame
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = player.color;
    ctx.stroke();

    // Bright energy pilot pit
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.fill();

    ctx.restore();
}

function drawAim() {
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    
    // Draw the faint targeting laser scanning downrange
    ctx.beginPath();
    ctx.moveTo(player.x + Math.cos(angle) * 30, player.y + Math.sin(angle) * 30);
    ctx.lineTo(player.x + Math.cos(angle) * 2000, player.y + Math.sin(angle) * 2000);
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Dynamic Reticle at mouse position
    ctx.beginPath();
    // Make reticle pulse slightly
    const pulse = 8 + Math.sin(timeElapsed * 10) * 1.5;
    ctx.arc(mouseX, mouseY, pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner dot
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
}

// Start the sequence
requestAnimationFrame(gameLoop);
