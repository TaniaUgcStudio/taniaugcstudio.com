
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.6;
controls.zoomSpeed = 0.5;
controls.enablePan = false;

const textureLoader = new THREE.TextureLoader();
const mapTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
const bumpTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_bump_2048.jpg');

const radius = 15;
const geometry = new THREE.SphereGeometry(radius, 64, 64);
const material = new THREE.MeshPhongMaterial({
    map: mapTexture,
    bumpMap: bumpTexture,
    bumpScale: 0.1,
    specular: 0x333333,
    shininess: 10
});
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

scene.add(new THREE.AmbientLight(0xffffff));
const directionalLight = new THREE.DirectionalLight(0x888888, 0.3);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const pointsData = [
    { lat: 40.416775, lon: -3.703790 },
    { lat: 41.385064, lon: 2.173404 },
    ...Array(30).fill().map(() => ({
        lat: 36 + Math.random() * 8,
        lon: -9 + Math.random() * 7
    })),
    { lat: 52.520008, lon: 13.404954 },
    { lat: 48.137154, lon: 11.576124 },
    { lat: 50.110924, lon: 8.682127 },
    { lat: 53.551085, lon: 9.993682 },
    { lat: 50.937531, lon: 6.960279 },
    { lat: 48.856614, lon: 2.352222 },
    { lat: 43.296482, lon: 5.369780 },
    { lat: 45.764043, lon: 4.835659 },
    { lat: 43.610769, lon: 1.444209 },
    { lat: 47.218371, lon: -1.553621 }
];

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

const starPoints = [];
pointsData.forEach(point => {
    const position = latLonToVector3(point.lat, point.lon, radius + 0.15);
    const star = document.createElement('div');
    star.className = 'star-point';
    document.body.appendChild(star);
    starPoints.push({ element: star, position });
});

let frameCount = 0;
function updateStarPositions() {
    starPoints.forEach(star => {
        const vector = star.position.clone();
        vector.project(camera);
        const x = (vector.x + 1) * window.innerWidth / 2;
        const y = -(vector.y - 1) * window.innerHeight / 2;
        star.element.style.left = `${x - 10}px`;
        star.element.style.top = `${y - 10}px`;
    });
}

const spainPosition = latLonToVector3(40.416775, -3.703790, radius + 27);
camera.position.copy(spainPosition);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    if (++frameCount % 2 === 0) updateStarPositions();
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateStarPositions();
});

const starContainer = document.getElementById("stars");
const numStars = 150;
for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDuration = `${2 + Math.random() * 3}s`;
    star.style.opacity = Math.random() * 0.6 + 0.4;
    starContainer.appendChild(star);
}
