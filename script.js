const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// Set canvas dimensions to be slightly larger
const width = 880; // Increased width for the game
const height = 700; // Increased height for the game
canvas.width = width;
canvas.height = height;

let lives = 20; // Start with 5 lives
let player_x = width / 2 - 25; // Center the player horizontally
let player_y = height - 100;
let bullets = [];
let enemyBullets = [];
let normalEnemies = [];
let bossBullets = [];
let enemiesPassed = 0;
let bossSpawned = false;
let bossHealth = 200;
let bossX = width / 2 - 75;
const bossSize = 150; // Boss size (3 times bigger than normal enemy)

const playerSpeed = 7;
const bulletSpeed = 10; // Slower bullet speed
let enemySpeed = 2; // Speed of normal enemies
let enemyBulletSpeed = 5;
let bossBulletSpeed = 9;
let normalEnemyHealth = 2;
let bossMaxHealth = 1000;

let stage = 1;
const maxStages = 5;

let stageCleared = false;

const playerImage = new Image();
playerImage.src = 'images/player.png';
const normalEnemyImage = new Image();
normalEnemyImage.src = 'images/enemy.png';
const bulletImage = new Image();
bulletImage.src = 'images/bullet.png';
const enemyBulletImage = new Image();
enemyBulletImage.src = 'images/enemy_bullet.png';
const lifeImage = new Image();
lifeImage.src = 'images/life.png';
const bossImage = new Image();
bossImage.src = 'images/boss.png';


// Modify updateBoss function to handle the explosion
function updateBoss() {
    if (explosionActive) return;  // Skip boss update if explosion is active

    bossX += Math.sin(Date.now() / 500) * 3;  // Boss moves left and right

    // Boss shooting logic (more complex patterns)
    if (Math.random() < 0.05) {
        // Spread of bullets in multiple directions
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / (4 + stage)) {  // More bullets per stage
            bossBullets.push({
                x: bossX + bossSize / 2,
                y: 80,
                vx: Math.cos(angle) * bossBulletSpeed,
                vy: Math.sin(angle) * bossBulletSpeed
            });
        }
    }

    // Update boss bullet positions and check for collision with player
    bossBullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Check if the center of the boss bullet hits the player
        const bulletCenterX = bullet.x; // Center of the bullet
        const bulletCenterY = bullet.y;
        const playerCenterX = player_x + 10; // Center of the player (50x50)
        const playerCenterY = player_y + 10;

        // Remove bullets that move off-screen
        if (bullet.x < 0 || bullet.x > width || bullet.y > height) {
            bossBullets.splice(index, 1);
        } else if (
            Math.abs(bulletCenterX - playerCenterX) < 10 &&  // Check X distance to the center of the player
            Math.abs(bulletCenterY - playerCenterY) < 10     // Check Y distance to the center of the player
        ) {
            lives--;
            bossBullets.splice(index, 1);
        }
    });

    // Check for bullet collision with boss
    bullets.forEach((bullet, index) => {
        if (bullet.x > bossX && bullet.x < bossX + bossSize && bullet.y < 150) {
            bossHealth -= 2;
            bullets.splice(index, 1);
        }
    });

    // Trigger explosion when boss health reaches 0
    if (bossHealth <= 0 && !explosionActive) {
        triggerBossExplosion();
    }
}

// Trigger boss explosion function
function triggerBossExplosion() {
    explosionX = bossX;
    explosionY = 50; // Position of the boss
    explosionFrames = 0;
    explosionActive = true;
}

// Draw explosion animation
function drawExplosion() {
    if (explosionActive) {
        const frameWidth = 128; // Assuming each frame is 128x128 in size
        const frameHeight = 128;

        // Calculate current frame to display
        const frameX = (explosionFrames % 5) * frameWidth;
        const frameY = Math.floor(explosionFrames / 5) * frameHeight;

        // Draw the current explosion frame
        ctx.drawImage(explosionImage, frameX, frameY, frameWidth, frameHeight, explosionX, explosionY, bossSize, bossSize);

        explosionFrames++;
        if (explosionFrames >= maxExplosionFrames) {
            explosionActive = false;
            stageCleared = true; // Proceed to the next stage after the explosion completes
        }
    }
}

// Modify the draw function to include explosion
function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw lives
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(lifeImage, 10 + i * 30, 10, 20, 20);
    }

    // Draw player
    ctx.drawImage(playerImage, player_x, player_y);

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.drawImage(bulletImage, bullet.x, bullet.y);
    });

    // Draw enemy bullets
    enemyBullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 15, 0, Math.PI * 2); // Bullet size of 15px
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    });

    // Draw normal enemies
    normalEnemies.forEach(enemy => {
        ctx.drawImage(normalEnemyImage, enemy.x, enemy.y);
    });

    // Draw boss if spawned
    if (bossSpawned && !explosionActive) {
        ctx.drawImage(bossImage, bossX, 50, bossSize, bossSize);  // Boss 3x larger

        // Draw boss health bar
        const healthBarWidth = 200;
        ctx.fillStyle = 'red';
        ctx.fillRect(bossX + (bossSize - healthBarWidth) / 2, 30, healthBarWidth * (bossHealth / bossMaxHealth), 10);
    }

    // Draw boss bullets
    bossBullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 15, 0, Math.PI * 2); // Bullet size of 15px
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
    });

    // Draw explosion if active
    if (explosionActive) {
        drawExplosion();
    }
}


// Key press management
let keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Add event listener for start button
startButton.addEventListener('click', () => {
    startButton.style.display = 'none'; // Hide the start button
    canvas.style.display = 'block'; // Show the canvas
    gameLoop(); // Start the game
});

// Initialize last bullet time and bullet delay
let lastBulletTime = 0;
const bulletDelay = 100; // Delay between bullets in milliseconds

// Game loop
function gameLoop() {
    update();
    draw();
    if (lives > 0) {
        requestAnimationFrame(gameLoop);
    } else {
        gameOver();
    }
}

// Game update logic
function update() {
    if (stageCleared) {
        if (stage < maxStages) {
            stage++;
            stageCleared = false;
            resetStage();  // Reset game state for the new stage
        } else {
            winGame();  // Player wins after stage 5
            return;
        }
    }

    // Player movement (left-right with Arrow keys and back-forth with up-down keys)
    if (keys['ArrowLeft'] && player_x > 0) player_x -= playerSpeed;
    if (keys['ArrowRight'] && player_x < width - 50) player_x += playerSpeed; // 50 is the player's width
    if (keys['ArrowUp'] && player_y > 0) player_y -= playerSpeed; // Move up
    if (keys['ArrowDown'] && player_y < height - 50) player_y += playerSpeed; // Move down

    // Automatic shooting with bullet space
    if (keys['z'] && Date.now() - lastBulletTime > bulletDelay) {
        bullets.push({ x: player_x + 20, y: player_y }); // Fire bullet from player's position
        lastBulletTime = Date.now(); // Update last bullet time
    }

    // Update bullet positions
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) bullets.splice(index, 1);  // Remove if off-screen
    });

    // Spawn normal enemies
    if (!bossSpawned && enemiesPassed < 20) {
        if (Math.random() < 0.02 + 0.005 * stage) {  // Increase spawn rate by stage
            normalEnemies.push({
                x: Math.random() * (width - 50),
                y: -50,
                health: normalEnemyHealth,
                direction: Math.random() < 0.5 ? -1 : 1 // Randomly choose initial direction
            });
        }
    }

    // Move normal enemies and handle collisions
    normalEnemies.forEach((enemy, enemyIndex) => {
        enemy.y += enemySpeed;  // Move down
        enemy.x += enemy.direction * 1.5; // Move horizontally

        // Change direction at the edges of the screen
        if (enemy.x <= 0 || enemy.x >= width - 30) {
            enemy.direction *= -1;
        }

        // If the enemy goes off the screen, remove it
        if (enemy.y > height) {
            enemiesPassed++;
            normalEnemies.splice(enemyIndex, 1);
            if (enemiesPassed >= 20 && !bossSpawned) {
                bossSpawned = true;
            }
        }

        // Check for bullet collision
        bullets.forEach((bullet, bulletIndex) => {
            if (bullet.y < enemy.y + 30 && bullet.x > enemy.x && bullet.x < enemy.x + 30) {
                enemy.health -= 1;
                bullets.splice(bulletIndex, 1);
                if (enemy.health <= 0) normalEnemies.splice(enemyIndex, 1);
            }
        });

        // Enemy shooting logic
        if (Math.random() < 0.02) {
            enemyBullets.push({ x: enemy.x + 15, y: enemy.y + 30 });
        }
    });

    // Update enemy bullet positions and check for collision with player
    enemyBullets.forEach((bullet, index) => {
        bullet.y += enemyBulletSpeed;

        // Check if the center of the enemy bullet hits the player
        const bulletCenterX = bullet.x + 15; // Center of the 30x30 bullet
        const bulletCenterY = bullet.y + 15;
        const playerCenterX = player_x + 25; // Center of the player (50x50)
        const playerCenterY = player_y + 25;

        if (bullet.y > height) {
            enemyBullets.splice(index, 1);
        } else if (
            Math.abs(bulletCenterX - playerCenterX) < 25 &&  // Check X distance to the center of the player
            Math.abs(bulletCenterY - playerCenterY) < 25     // Check Y distance to the center of the player
        ) {
            lives--;
            enemyBullets.splice(index, 1);
        }
    });

    // Boss logic
    if (bossSpawned && bossHealth > 0) {
        updateBoss();
    }
}

// Boss update logic
function updateBoss() {
    bossX += Math.sin(Date.now() / 500) * 3;  // Boss moves left and right

    // Boss shooting logic (more complex patterns)
    if (Math.random() < 0.05) {
        // Spread of bullets in multiple directions
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / (4 + stage)) {  // More bullets per stage
            bossBullets.push({
                x: bossX + bossSize / 2,
                y: 80,
                vx: Math.cos(angle) * bossBulletSpeed,
                vy: Math.sin(angle) * bossBulletSpeed
            });
        }
    }

    // Update boss bullet positions and check for collision with player
    bossBullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Check if the center of the boss bullet hits the player
        const bulletCenterX = bullet.x; // Center of the bullet
        const bulletCenterY = bullet.y;
        const playerCenterX = player_x + 25; // Center of the player (50x50)
        const playerCenterY = player_y + 25;

        // Remove bullets that move off-screen
        if (bullet.x < 0 || bullet.x > width || bullet.y > height) {
            bossBullets.splice(index, 1);
        } else if (
            Math.abs(bulletCenterX - playerCenterX) < 25 &&  // Check X distance to the center of the player
            Math.abs(bulletCenterY - playerCenterY) < 25     // Check Y distance to the center of the player
        ) {
            lives--;
            bossBullets.splice(index, 1);
        }
    });

    // Check for bullet collision with boss
    bullets.forEach((bullet, index) => {
        if (bullet.x > bossX && bullet.x < bossX + bossSize && bullet.y < 150) {
            bossHealth -= 2;
            bullets.splice(index, 1);
        }
    });

    // Progress to the next stage after defeating the boss
    if (bossHealth <= 0) {
        stageCleared = true;
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw lives
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(lifeImage, 10 + i * 30, 10, 20, 20);
    }

    // Draw player
    ctx.drawImage(playerImage, player_x, player_y);

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.drawImage(bulletImage, bullet.x, bullet.y);
    });

    // Draw enemy bullets (3 times larger size)
    enemyBullets.forEach(bullet => {
        ctx.drawImage(enemyBulletImage, bullet.x, bullet.y, 30, 30); // Size increased to 3 times
    });

    // Draw normal enemies
    normalEnemies.forEach(enemy => {
        ctx.drawImage(normalEnemyImage, enemy.x, enemy.y);
    });

    // Draw boss if spawned
    if (bossSpawned) {
        ctx.drawImage(bossImage, bossX, 50, bossSize, bossSize);  // Boss 3x larger

        // Draw boss health bar
        const healthBarWidth = 200;
        ctx.fillStyle = 'red';
        ctx.fillRect(bossX + (bossSize - healthBarWidth) / 2, 30, healthBarWidth * (bossHealth / bossMaxHealth), 10);
    }

    // Draw boss bullets
    bossBullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 15, 0, Math.PI * 2); // Bullet size of 15px
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
    });
}

// Game over function
function gameOver() {
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.fillText('Game Over!', width / 2 - 120, height / 2);
    ctx.fillText(`You achieved stage ${stage}`, width / 2 - 150, height / 2 + 50);
}

// Win game function
function winGame() {
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.fillText('You Win!', width / 2 - 100, height / 2);
    ctx.fillText(`You achieved stage ${stage}`, width / 2 - 150, height / 2 + 50);
}

// Reset the stage for the next level
function resetStage() {
    enemiesPassed = 0;
    bossSpawned = false;
    bossHealth = bossMaxHealth;
    bullets = [];
    enemyBullets = [];
    normalEnemies = [];
    bossBullets = [];
}

// Load images and start the game when they are ready
function loadImages() {
    return Promise.all([playerImage, normalEnemyImage, bulletImage, enemyBulletImage, lifeImage, bossImage].map(img => {
        return new Promise(resolve => {
            img.onload = resolve;
        });
    }));
}

// Initialize the game
loadImages().then(() => {
    canvas.style.display = 'none'; // Hide the canvas until the game starts
    startButton.style.display = 'block'; // Show the start button
});
