import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.156.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.156.0/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10,10,10);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0x404040,0.5));

// Earth
const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({color:0x2233ff});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Meteor
let meteor = null;
let meteorVelocity = 0;

// UI
const sizeSlider = document.getElementById('size');
const speedSlider = document.getElementById('speed');

document.addEventListener('click', (event)=>{
  if(meteor) scene.remove(meteor);

  const size = parseFloat(sizeSlider.value);
  meteorVelocity = parseFloat(speedSlider.value);

  const meteorGeometry = new THREE.SphereGeometry(size,16,16);
  const meteorMaterial = new THREE.MeshBasicMaterial({color:0xff5500});
  meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);

  // Map click to 3D space roughly
  meteor.position.set((Math.random()-0.5)*10, 15, (Math.random()-0.5)*10);
  scene.add(meteor);
});

// Explosion
function createExplosion(position, radius){
  const geometry = new THREE.SphereGeometry(radius,32,32);
  const material = new THREE.MeshBasicMaterial({color:0xffaa00, transparent:true, opacity:0.6});
  const explosion = new THREE.Mesh(geometry, material);
  explosion.position.copy(position);
  scene.add(explosion);
  setTimeout(()=>scene.remove(explosion),500);
}

// Animate
function animate(){
  requestAnimationFrame(animate);

  earth.rotation.y += 0.001;

  if(meteor){
    meteor.position.y -= meteorVelocity * 0.1;
    if(meteor.position.distanceTo(earth.position)<5){
      createExplosion(meteor.position, meteor.scale.x*3);
      scene.remove(meteor);
      meteor = null;
    }
  }

  controls.update();
  renderer.render(scene,camera);
}

animate();

// Resize
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
