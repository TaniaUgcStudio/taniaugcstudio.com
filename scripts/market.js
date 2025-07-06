// Three.js Globe Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('globe-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.SphereGeometry(5, 64, 64);
const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const material = new THREE.MeshBasicMaterial({ map: texture });
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

// Debris Animation
const debrisCount = 50;
const debrisArray = [];
for (let i = 0; i < debrisCount; i++) {
    const size = Math.random() * 3 + 1;
    const debris = document.createElement('div');
    debris.className = 'debris';
    debris.style.width = `${size}px`;
    debris.style.height = `${size}px`;
    debris.style.left = `${Math.random() * window.innerWidth}px`;
    debris.style.top = `${Math.random() * window.innerHeight}px`;
    document.body.appendChild(debris);
    debrisArray.push({
        element: debris,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
    });
}

function animateDebris() {
    debrisArray.forEach(debris => {
        let x = parseFloat(debris.element.style.left);
        let y = parseFloat(debris.element.style.top);
        x += debris.vx;
        y += debris.vy;
        if (x < 0 || x > window.innerWidth) debris.vx *= -1;
        if (y < 0 || y > window.innerHeight) debris.vy *= -1;
        debris.element.style.left = `${x}px`;
        debris.element.style.top = `${y}px`;
    });
}

// Camera position helper
function latLonToCameraPosition(lat, lon, radius, distance = 10) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    const x = distance * Math.sin(phi) * Math.cos(theta);
    const y = distance * Math.cos(phi);
    const z = distance * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
}

// Globe Animation
let time = 0;
const zoomDuration = 5;
const initialPosition = latLonToCameraPosition(40.7128, -74.0060, 5, 15); // New York
const targetPosition = latLonToCameraPosition(40.4168, -3.7038, 5, 8); // Madrid
const targetLookAt = new THREE.Vector3(
    5 * Math.sin((90 - 40.4168) * Math.PI / 180) * Math.cos((-3.7038 + 180) * Math.PI / 180),
    5 * Math.cos((90 - 40.4168) * Math.PI / 180),
    5 * Math.sin((90 - 40.4168) * Math.PI / 180) * Math.sin((-3.7038 + 180) * Math.PI / 180)
);

function animateGlobe() {
    time += 0.016;
    if (time <= zoomDuration) {
        if (time < zoomDuration / 2) {
            earth.rotation.y += 0.01;
        } else {
            earth.rotation.y += 0.01 * (1 - (time - zoomDuration / 2) / (zoomDuration / 2));
        }
        
        const t = time / zoomDuration;
        const ease = 1 - Math.pow(1 - t, 3);
        camera.position.lerpVectors(initialPosition, targetPosition, ease);
        camera.fov = 75 - (75 - 30) * ease;
        camera.updateProjectionMatrix();
        camera.lookAt(targetLookAt);
        renderer.render(scene, camera);
        animateDebris();
        requestAnimationFrame(animateGlobe);
    } else {
        document.getElementById('globe-canvas').style.display = 'none';
        document.getElementById('map').style.display = 'block';
        document.querySelector('.text-overlay').classList.add('hidden');
        initMapbox();
    }
}
animateGlobe();

// Mapbox Setup
function initMapbox() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2FkZXFhbCIsImEiOiJjbDA0ZHBpZDgwYjl5M2Rud2wweDVhaWVtIn0.PSwxdzBQL8ZCh0kYT4UA9g';
    
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/sadeqal/cl04dpzyq000v15o3nlcnpn9d',
        center: [-3.7038, 40.4168],
        zoom: 12,
        pitch: 80,
        bearing: 0
    });
    
    map.on('load', () => {
        // Generate markers within Madrid bounding box
        for (let i = 0; i < 50; i++) {
            const lng = -3.75 + Math.random() * 0.1;
            const lat = 40.38 + Math.random() * 0.1;
            
            new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(map);
        }
        
        map.triggerRepaint(); // Ensure all renders properly
    });
    
    // Continue debris animation
    function continueAnimation() {
        animateDebris();
        requestAnimationFrame(continueAnimation);
    }
    continueAnimation();
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});