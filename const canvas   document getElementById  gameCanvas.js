// game.js - simple asteroid defense game
// Controls: Move mouse to aim. Click or press SPACE to fire rockets.

(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // HUD elements
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const planetHealthEl = document.getElementById('planetHealth');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');

  // Opening/credits UI
  const opening = document.getElementById('opening');
  const credits = document.getElementById('credits');
  document.getElementById('playBtn').addEventListener('click', startFromMenu);
  document.getElementById('creditsBtn').addEventListener('click', showCredits);
  document.getElementById('backBtn').addEventListener('click', backToMenu);

  function showCredits(){ opening.style.display='none'; credits.style.display='flex'; }
  function backToMenu(){ credits.style.display='none'; opening.style.display='flex'; }
  function startFromMenu(){ opening.style.display='none'; startGame(); }

  // Canvas resizing
  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Game state
  let running = false;
  let lastTime = 0;
  let asteroids = [];
  let rockets = [];
  let particles = [];
  let mouse = {x: 0, y: 0};
  let score = 0;
  let lives = 3;
  let planetHealth = 100;
  let spawnTimer = 0;
  let spawnInterval = 1400; // spawn every N ms
  let difficultyTimer = 0;

  // Player turret: placed above planet center
  const turret = {
    x: 0,
    y: 0,
    angle: 0,
    cooldown: 0
  };

  // helpers
  function rand(min, max){ return Math.random()*(max-min)+min; }
  function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

  // create asteroid
  function spawnAsteroid(){
    // spawn at a random edge above or side
    const edge = Math.random();
    let x, y, vx, vy;
    const size = Math.floor(rand(10, 60)); // px -> visual size
    if(edge < 0.6){
      // top spawn
      x = rand(0, canvas.width);
      y = -50;
    } else if(edge < 0.8){
      x = -50; y = rand(0, canvas.height/1.4);
    } else {
      x = canvas.width+50; y = rand(0, canvas.height/1.4);
    }
    // velocity towards planet center + some randomness
    const target = {x: canvas.width/2, y: canvas.height * 0.78};
    const angleToCenter = Math.atan2(target.y - y, target.x - x);
    const speed = rand(0.6, 2.4) + Math.min(3.5, score/50); // get harder
    vx = Math.cos(angleToCenter) * speed;
    vy = Math.sin(angleToCenter) * speed;
    const hp = Math.max(1, Math.round(size/12));
    asteroids.push({x,y,vx,vy,size,hp,maxHp:hp});
  }

  // rocket
  function fireRocket(){
    if(turret.cooldown > 0) return;
    turret.cooldown = 12; // frames
    const speed = 8;
    const angle = turret.angle;
    const x = turret.x + Math.cos(angle) * 24;
    const y = turret.y + Math.sin(angle) * 24;
    rockets.push({x,y,vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed, r:4});
  }

  // particle explosion
  function createParticles(x,y,color,amount=12){
    for(let i=0;i<amount;i++){
      const ang = Math.random()*Math.PI*2;
      const sp = rand(1,5);
      particles.push({x,y,vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp, life:60, color});
    }
  }

  // collisions
  function updateCollisions(){
    // rockets vs asteroids
    for(let i=asteroids.length-1;i>=0;i--){
      for(let j=rockets.length-1;j>=0;j--){
        const a = asteroids[i], r = rockets[j];
        const dx = a.x - r.x, dy = a.y - r.y;
        if(dx*dx+dy*dy < (a.size/2 + r.r)*(a.size/2 + r.r)){
          // hit
          a.hp -= 1;
          rockets.splice(j,1);
          createParticles(r.x, r.y, '#ffcb6b', 8);
          if(a.hp <= 0){
            score += Math.round(a.size);
            createParticles(a.x, a.y, '#ff6b6b', 24);
            asteroids.splice(i,1);
          }
          break;
        }
      }
    }

    // asteroids reaching planet
    const planetY = canvas.height * 0.78;
    const planetX = canvas.width/2;
    const planetR = Math.min(canvas.width, canvas.height) * 0.18;
    for(let i=asteroids.length-1;i>=0;i--){
      const a = asteroids[i];
      const dx = a.x - planetX, dy = a.y - planetY;
      if(dx*dx+dy*dy < (planetR - 6 + a.size/2)*(planetR - 6 + a.size/2)){
        // impact
        createParticles(a.x, a.y, '#ff4f4f', 30);
        planetHealth -= Math.max(4, Math.round(a.size/8));
        if(planetHealth < 0) planetHealth = 0;
        asteroids.splice(i,1);
      }
    }
  }

  // update loop
  function update(dt){
    if(!running) return;
    // spawn logic
    spawnTimer += dt;
    difficultyTimer += dt;
    if(spawnTimer > spawnInterval){
      spawnTimer = 0;
      spawnAsteroid();
      // gradually reduce interval to increase difficulty
      spawnInterval = Math.max(450, spawnInterval - 12);
    }
    // turret cooldown
    if(turret.cooldown > 0) turret.cooldown--;

    // update turret pos/angle
    turret.x = canvas.width/2;
    turret.y = canvas.height * 0.72;
    turret.angle = Math.atan2(mouse.y - turret.y, mouse.x - turret.x);

    // rockets
    for(let i=rockets.length-1;i>=0;i--){
      rockets[i].x += rockets[i].vx;
      rockets[i].y += rockets[i].vy;
      // out of bounds
      if(rockets[i].x < -20 || rockets[i].x > canvas.width+20 || rockets[i].y < -20 || rockets[i].y > canvas.height+20){
        rockets.splice(i,1);
      }
    }

    // asteroids
    for(let a of asteroids){
      a.x += a.vx;
      a.y += a.vy;
      // rotate slightly (visual) - not required
    }

    // particles
    for(let i=particles.length-1;i>=0;i--){
      particles[i].x += particles[i].vx;
      particles[i].y += particles[i].vy;
      particles[i].life--;
      if(particles[i].life <= 0) particles.splice(i,1);
    }

    // collisions and planet health
    updateCollisions();

    // game over?
    if(planetHealth <= 0){
      running = false;
      showGameOver();
    }

    // update HUD
    scoreEl.textContent = score;
    planetHealthEl.textContent = Math.max(0, Math.round(planetHealth));
  }

  // draw
  function draw(){
    // clear
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // starfield background (simple)
    drawStarfield();

    // draw planet (bottom center)
    const planetX = canvas.width/2;
    const planetY = canvas.height * 0.78;
    const planetR = Math.min(canvas.width, canvas.height) * 0.18;

    // planet glow
    const grad = ctx.createRadialGradient(planetX, planetY, planetR*0.2, planetX, planetY, planetR*1.8);
    grad.addColorStop(0, 'rgba(30,160,250,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(planetX, planetY, planetR*1.8, 0, Math.PI*2); ctx.fill();

    // planet body
    ctx.fillStyle = '#0b7dd0';
    ctx.beginPath(); ctx.arc(planetX, planetY, planetR, 0, Math.PI*2); ctx.fill();

    // planet shine
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.arc(planetX - planetR*0.4, planetY - planetR*0.4, planetR*0.5, 0, Math.PI*2); ctx.fill();

    // turret
    drawTurret(turret.x, turret.y, turret.angle);

    // rockets
    for(let r of rockets){
      ctx.fillStyle = '#ffd58b';
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI*2); ctx.fill();
      // rocket trail
      ctx.fillStyle = 'rgba(255,180,80,0.3)';
      ctx.beginPath(); ctx.ellipse(r.x - r.vx*2, r.y - r.vy*2, r.r*2.3, r.r, 0, 0, Math.PI*2); ctx.fill();
    }

    // asteroids
    for(let a of asteroids){
      // body
      const healthRatio = a.hp / a.maxHp;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate((Date.now()/1000) * (0.2 + (a.size%7)*0.02));
      // rock shape
      ctx.fillStyle = `rgba(${200},${150},${120},1)`;
      ctx.beginPath();
      ctx.ellipse(0,0,a.size*0.6,a.size*0.45,0,0,Math.PI*2);
      ctx.fill();
      // damage overlay
      if(healthRatio < 1){
        ctx.fillStyle = `rgba(255, ${120}, 120, ${1-healthRatio})`;
        ctx.beginPath(); ctx.arc(-a.size*0.15, -a.size*0.05, a.size*0.22, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }

    // particles
    for(let p of particles){
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life/60);
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // HUD aiming line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.setLineDash([4,6]);
    ctx.beginPath();
    ctx.moveTo(turret.x, turret.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // draw turret (a small cannon)
  function drawTurret(x,y,angle){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    // barrel
    ctx.fillStyle = '#111';
    ctx.fillRect(0, -8, 40, 16);
    ctx.fillStyle = '#2aa9ff';
    ctx.fillRect(-6, -12, 12, 8);
    // base
    ctx.beginPath();
    ctx.fillStyle = '#1c2733';
    ctx.arc(0,0,20,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // simple starfield
  const stars = [];
  for(let i=0;i<120;i++){
    stars.push({x:Math.random(), y:Math.random(), s:Math.random()*1.6});
  }
  function drawStarfield(){
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let s of stars){
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${0.6*s.s})`;
      ctx.arc(s.x*canvas.width, s.y*canvas.height, s.s, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // game loop
  function loop(ts){
    if(!lastTime) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // input
  canvas.addEventListener('mousemove', e=>{
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mousedown', e=>{
    fireRocket();
  });
  window.addEventListener('keydown', e=>{
    if(e.code === 'Space'){ e.preventDefault(); fireRocket(); }
    if(e.code === 'KeyP'){ togglePause(); }
  });

  // pause / restart
  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', resetGame);
  function togglePause(){ running = !running; pauseBtn.textContent = running ? 'Pause' : 'Resume'; }
  function resetGame(){ initGame(); }

  // game over
  function showGameOver(){
    setTimeout(()=> {
      alert('Game Over! Score: ' + score);
      initGame();
      opening.style.display = 'flex';
    }, 150);
  }

  // initialize / start
  function initGame(){
    asteroids = []; rockets = []; particles = [];
    score = 0; planetHealth = 100; spawnInterval = 1400; spawnTimer = 0;
    running = false;
    scoreEl.textContent = 0;
    planetHealthEl.textContent = 100;
    pauseBtn.textContent = 'Pause';
  }

  function startGame(){
    initGame();
    running = true;
    lastTime = 0;
  }

  // start loop immediately but do not run until startGame called
  requestAnimationFrame(loop);

  // expose startGame for menu
  window.startGame = startGame;

  // auto start if menu not used
  // startGame();
})();