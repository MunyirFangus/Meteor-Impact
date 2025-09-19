const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Earth map
const earth = {
  x: canvas.width/2,
  y: canvas.height/2,
  radius: 200,
  damageMap: [] // store damage impacts
};

// Meteor variables
let meteors = [];
const meteorTypeSelect = document.getElementById('meteorType');
let meteorSpeed = document.getElementById('speed').value;

// Update speed slider
document.getElementById('speed').addEventListener('input', e => meteorSpeed = e.target.value);

// Determine meteor size by type
function getMeteorSize(type){
  switch(type){
    case 'small': return 15;
    case 'medium': return 30;
    case 'large': return 50;
    default: return 30;
  }
}

// Click to launch meteor
canvas.addEventListener('click', e => {
  const size = getMeteorSize(meteorTypeSelect.value);
  meteors.push({
    x: e.clientX,
    y: 0,
    size,
    speed: meteorSpeed
  });
});

// Draw Earth
function drawEarth(){
  ctx.fillStyle = '#2233ff';
  ctx.beginPath();
  ctx.arc(earth.x, earth.y, earth.radius, 0, Math.PI*2);
  ctx.fill();

  // Draw damage impacts
  earth.damageMap.forEach(d=>{
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size,0,Math.PI*2);
    ctx.fill();
  });
}

// Draw meteors
function drawMeteors(){
  meteors.forEach(m => {
    ctx.fillStyle = '#ff5500';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size,0,Math.PI*2);
    ctx.fill();

    m.y += Number(m.speed);

    // Check collision with Earth
    const dx = m.x - earth.x;
    const dy = m.y - earth.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    if(distance < earth.radius){
      createExplosion(m.x, m.y, m.size*2);
      meteors.splice(meteors.indexOf(m),1);
    }
  });
}

// Explosion
let explosions = [];
function createExplosion(x,y,radius){
  // Add to visual damage map
  earth.damageMap.push({x,y,size:radius/2, color:'rgba(255,170,0,0.6)'});

  // Add animation
  explosions.push({x,y,radius,alpha:1});
}

// Draw explosions
function drawExplosions(){
  explosions.forEach(ex=>{
    ctx.fillStyle = `rgba(255,170,0,${ex.alpha})`;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.radius,0,Math.PI*2);
    ctx.fill();
    ex.alpha -= 0.05;
  });
  explosions = explosions.filter(ex=>ex.alpha>0);
}

// Animation
function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawEarth();
  drawMeteors();
  drawExplosions();
  requestAnimationFrame(animate);
}

animate();

// Handle resize
window.addEventListener('resize', ()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
