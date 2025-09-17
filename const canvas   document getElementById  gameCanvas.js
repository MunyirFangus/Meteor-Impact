const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player setup
let player = { x: 180, y: 350, w: 40, h: 40, speed: 5 };

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") player.x -= player.speed;
  if (e.key === "ArrowRight") player.x += player.speed;
});

function drawPlayer() {
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

gameLoop();