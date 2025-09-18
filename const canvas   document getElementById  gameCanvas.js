let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let spaceship = { x: 400, y: 550, width: 40, height: 20, speed: 5 };
let bullets = [];
let asteroids = [];
let gameRunning = false;

function startGame() {
  console.log("Play button works!");
  alert("Game is starting!");

  document.querySelector(".menu").style.display = "none";
  document.getElementById("credits").style.display = "none";
  canvas.style.display = "block";
  gameRunning = true;
  spawnAsteroids();
  gameLoop();
}

function spawnAsteroids() {
  setInterval(() => {
    if (gameRunning) {
      let x = Math.random() * (canvas.width - 30);
      asteroids.push({ x: x, y: 0, size: 30 });
    }
  }, 1500);
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw spaceship
  ctx.fillStyle = "cyan";
  ctx.fillRect(spaceship.x, spaceship.y, spaceship.width, spaceship.height);

  // Draw bullets
  ctx.fillStyle = "yellow";
  bullets.forEach((b, i) => {
    b.y -= 7;
    ctx.fillRect(b.x, b.y, 5, 10);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Draw asteroids
  ctx.fillStyle = "red";
  asteroids.forEach((a, ai) => {
    a.y += 2;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Collision with spaceship
    if (
      a.y + a.size > spaceship.y &&
      a.x > spaceship.x &&
      a.x < spaceship.x + spaceship.width
    ) {
      gameOver();
    }

    // Bullet hits asteroid
    bullets.forEach((b, bi) => {
      if (
        b.x > a.x - a.size/2 &&
        b.x < a.x + a.size/2 &&
        b.y < a.y + a.size/2
      ) {
        asteroids.splice(ai, 1);
        bullets.splice(bi, 1);
      }
    });
  });

  requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft" && spaceship.x > 0) spaceship.x -= spaceship.speed;
  if (e.key === "ArrowRight" && spaceship.x < canvas.width - spaceship.width) spaceship.x += spaceship.speed;
  if (e.key === " ") bullets.push({ x: spaceship.x + spaceship.width / 2, y: spaceship.y });
});

function gameOver() {
  gameRunning = false;
  alert("Game Over! Earth was hit by Impactor-2025.");
  window.location.reload();
}

// Credits handling
function showCredits() {
  document.querySelector(".menu").style.display = "none";
  document.getElementById("credits").style.display = "block";
}

function hideCredits() {
  document.getElementById("credits").style.display = "none";
  document.querySelector(".menu").style.display = "block";
}