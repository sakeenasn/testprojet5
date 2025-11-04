// === SCÈNE, CAMÉRA, RENDU ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === LUMIÈRE (Soleil) ===
const sunlight = new THREE.PointLight(0xffffff, 2, 0);
scene.add(sunlight);

// === CONTRÔLES ===
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 80, 180);
controls.update();

// === SOLEIL ===
const sunTexture = new THREE.TextureLoader().load('assets/Soleil.jpeg');
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(12, 64, 64),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

// === PLANÈTES ===
const planetData = [
  { name: "Mercure", size: 1, dist: 20, speed: 0.04, texture: 'assets/Mercure.jpeg' },
  { name: "Vénus",   size: 1.8, dist: 30, speed: 0.015, texture: 'assets/Venus.jpeg' },
  { name: "Terre",   size: 2, dist: 40, speed: 0.01, texture: 'assets/Terre.jpeg' },
  { name: "Mars",    size: 1.5, dist: 50, speed: 0.008, texture: 'assets/Mars.jpeg' },
  { name: "Jupiter", size: 6, dist: 70, speed: 0.004, texture: 'assets/Jupiter.jpeg' },
  { name: "Saturne", size: 5, dist: 90, speed: 0.003, texture: 'assets/Saturne.jpeg', ring: 'assets/RingSaturne.png' },
  { name: "Uranus",  size: 4, dist: 110, speed: 0.002, texture: 'assets/Uranus.jpeg' },
  { name: "Neptune", size: 4, dist: 130, speed: 0.001, texture: 'assets/Neptune.jpeg' }
];

const planets = [];

// === CRÉATION DES PLANÈTES ET ORBITES ===
planetData.forEach(data => {
  const texture = new THREE.TextureLoader().load(data.texture);
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 32, 32),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  planet.userData = data;
  scene.add(planet);
  planets.push(planet);

  // --- Anneau pour Saturne ---
  if(data.ring){
    const ringTexture = new THREE.TextureLoader().load(data.ring);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(data.size + 0.5, data.size + 2.5, 64),
      new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide, transparent: true })
    );
    ring.rotation.x = - Math.PI / 2;
    planet.add(ring);
  }

  // --- Orbite
  const curve = new THREE.EllipseCurve(0, 0, data.dist, data.dist);
  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x555555 });
  const orbit = new THREE.LineLoop(geometry, material);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);
});

// === INTERACTION CLIC ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoBox = document.getElementById('infoBox');

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if(intersects.length > 0){
    const planet = intersects[0].object;
    const data = planet.userData;
    infoBox.innerHTML = `<strong>${data.name}</strong><br>
      Distance du Soleil : ${data.dist} unités<br>
      Taille relative : ${data.size}<br>
      Vitesse orbitale : ${data.speed}`;
    infoBox.style.display = 'block';
  } else {
    infoBox.style.display = 'none';
  }
});

// === ANIMATION ===
function animate(){
  requestAnimationFrame(animate);
  sun.rotation.y += 0.001;
  planets.forEach(planet => {
    const data = planet.userData;
    const angle = Date.now() * 0.0005 * data.speed;
    planet.position.x = Math.cos(angle) * data.dist;
    planet.position.z = Math.sin(angle) * data.dist;
    planet.rotation.y += 0.02;
  });
  controls.update();
  renderer.render(scene, camera);
}
animate();

// === ADAPTATION TAILLE ÉCRAN ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
