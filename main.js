// ✅ ES Module imports from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import * as dat from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';

// === Scene setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Lighting ===
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 10, 10);
scene.add(dirLight);
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// === Earth ===
const earthGeo = new THREE.SphereGeometry(5, 128, 128);
const earthMat = new THREE.MeshPhongMaterial({ color: 0x2266cc });
const earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

// === Continents overlay ===
const landGeo = new THREE.SphereGeometry(5.01, 128, 128);
const landMat = new THREE.MeshPhongMaterial({ color: 0x228833, transparent: true, opacity: 0.3 });
const land = new THREE.Mesh(landGeo, landMat);
scene.add(land);

// === Impacts array ===
const impacts = [];

// === Drop asteroid function ===
function dropAsteroid(lat, lon, size) {
    const asteroidGeo = new THREE.SphereGeometry(size, 32, 32);
    const asteroidMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const radius = 5 + size;

    asteroid.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
    scene.add(asteroid);

    let t = 0;
    const animateDrop = () => {
        if (t < 1) {
            asteroid.position.multiplyScalar(0.95);
            t += 0.01;
            requestAnimationFrame(animateDrop);
        } else {
            asteroidImpact(lat, lon, size);
            scene.remove(asteroid);
        }
    };
    animateDrop();
}

// === Asteroid impact ===
function asteroidImpact(lat, lon, size) {
    createCrater(lat, lon, size);
    createShockwave(lat, lon, size);
    createTsunami(lat, lon, size);
    impacts.push({ lat, lon, size });
    updateStats(lat, lon, size);
}

// === Crater ===
function createCrater(lat, lon, size) {
    const geo = new THREE.RingGeometry(size, size * 1.5, 32);
    const mat = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const crater = new THREE.Mesh(geo, mat);

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const radius = 5 + 0.01;

    crater.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
    crater.lookAt(earth.position);
    scene.add(crater);
}

// === Shockwave ===
function createShockwave(lat, lon, size) {
    const geo = new THREE.RingGeometry(size * 0.5, size * 0.55, 64);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const shock = new THREE.Mesh(geo, mat);

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const radius = 5 + 0.02;

    shock.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
    shock.lookAt(earth.position);
    scene.add(shock);

    let scale = 1;
    function animateShock() {
        if (scale < 10) {
            scale += 0.1;
            shock.scale.set(scale, scale, scale);
            shock.material.opacity *= 0.97;
            requestAnimationFrame(animateShock);
        } else scene.remove(shock);
    }
    animateShock();
}

// === Tsunami ===
function createTsunami(lat, lon, size) {
    if (lat < 60 && lat > -60) {
        const geo = new THREE.RingGeometry(size * 1.5, size * 1.6, 64);
        const mat = new THREE.MeshBasicMaterial({ color: 0x3399ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const wave = new THREE.Mesh(geo, mat);

        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const radius = 5 + 0.01;

        wave.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
        wave.lookAt(earth.position);
        scene.add(wave);

        let scale = 1;
        function animateWave() {
            if (scale < 10) {
                scale += 0.1;
                wave.scale.set(scale, scale, scale);
                wave.material.opacity *= 0.97;
                requestAnimationFrame(animateWave);
            } else scene.remove(wave);
        }
        animateWave();
    }
}

// === Stats overlay ===
const statsDiv = document.getElementById('stats-container');
function updateStats(lat, lon, size) {
    const energy = Math.round(size * 1000);
    statsDiv.innerHTML = `Impact #${impacts.length}<br>Lat: ${lat}° Lon: ${lon}°<br>Asteroid Size: ${size} km<br>Energy: ${energy} Mt TNT`;
}

// === GUI ===
const gui = new dat.GUI({ autoPlace: false });
document.getElementById('gui-container').appendChild(gui.domElement);
const params = { lat: 0, lon: 0, size: 0.5, drop: () => dropAsteroid(params.lat, params.lon, params.size) };
gui.add(params, 'lat', -90, 90).name('Latitude');
gui.add(params, 'lon', -180, 180).name('Longitude');
gui.add(params, 'size', 0.1, 1).name('Asteroid Size');
gui.add(params, 'drop').name('Drop Asteroid');

// === Render loop ===
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// === Resize handling ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
