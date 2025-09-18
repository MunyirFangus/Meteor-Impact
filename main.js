// ✅ CDN imports — no bare module specifier errors
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / (window.innerHeight * 0.8),
    0.1,
    1000
);
camera.position.set(0, 50, 100);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
document.getElementById('simulation').appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Light
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(50, 50, 50);
scene.add(light);

// Earth texture
const loader = new THREE.TextureLoader();
const earthTexture = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');

// Earth mesh
const earthGeometry = new THREE.SphereGeometry(20, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Meteor
let meteorSize = 2;    // adjustable
let meteorSpeed = 0.7; // adjustable
const meteorGeometry = new THREE.SphereGeometry(meteorSize, 16, 16);
const meteorMaterial = new THREE.MeshPhongMaterial({ color: 0xff4422 });
const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
meteor.position.set(50, 50, -100);
scene.add(meteor);

// Explosion
const explosionGeometry = new THREE.SphereGeometry(1, 32, 32);
const explosionMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.7
});
const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
explosion.visible = false;
scene.add(explosion);

// Animate loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate Earth
    earth.rotation.y += 0.001;

    // Meteor movement
    if (meteor.position.z < 0) {
        meteor.position.z += meteorSpeed;
        meteor.position.y -= meteorSpeed * 0.07;
    } else {
        // Impact
        explosion.position.copy(meteor.position);
        explosion.visible = true;
        explosion.scale.addScalar(0.5);
        meteor.visible = false;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.8);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
});

// Optional console control
window.setMeteor = (size, speed) => {
    meteor.scale.set(size / meteorSize, size / meteorSize, size / meteorSize);
    meteorSize = size;
    meteorSpeed = speed;
};
