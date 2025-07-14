// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting with Earth-appropriate tones
scene.add(new THREE.AmbientLight(0xffffff));
const directionalLight = new THREE.DirectionalLight(0x888888, 0.3);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Add OrbitControls with increased zoom range
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.enableZoom = true;
controls.enablePan = false;
controls.minDistance = 0.25;
controls.maxDistance = 3;

// Create star texture with 4-point star
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Draw sharper 4-point star
    ctx.beginPath();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 20; // Outer tip radius
    const innerRadius = 5;  // Smaller inner radius for thinner tips
    const points = 4;
    for (let i = 0; i < points * 2; i++) {
        const radius = (i % 2 === 0) ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points;
        ctx.lineTo(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        );
    }
    ctx.closePath();
    
    // Apply brighter radial gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius * 1.5);
    gradient.addColorStop(0, 'rgba(255, 247, 178, 1)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.shadowColor = '#f7f2e1';
    ctx.shadowBlur = 10;
    
    return new THREE.CanvasTexture(canvas);
}

// Corrected city locations
const cities = [
    // Spain: Major city centers
    { lat: 40.416775, lon: 90 + -3.703790 },  // Madrid
    { lat: 41.387916, lon: 90 + 2.169916 },   // Barcelona
    { lat: 39.469907, lon: 90 + -0.376288 },  // Valencia
    { lat: 37.389092, lon: 90 + -5.984459 },  // Sevilla
    { lat: 41.656063, lon: 90 + -0.877339 },  // Zaragoza
    { lat: 36.721273, lon: 90 + -4.421398 },  // Málaga
    { lat: 37.987000, lon: 90 + -1.130654 },  // Murcia
    { lat: 39.569600, lon: 90 + 2.650160 },   // Palma de Mallorca
    { lat: 28.123547, lon: 90 + -15.436257 }, // Las Palmas de Gran Canaria
    { lat: 43.263013, lon: 90 + -2.934985 },  // Bilbao
    
    // European capitals (excluding Russia)
    { lat: 41.902783, lon: 90 + 12.496366 }, // Italy: Rome
    { lat: 48.856614, lon: 90 + 2.352222 },  // France: Paris
    { lat: 52.520008, lon: 90 + 13.404954 }, // Germany: Berlin
    { lat: 51.507351, lon: 90 + -0.127758 }, // United Kingdom: London
    { lat: 52.370216, lon: 90 + 4.895168 },  // Netherlands: Amsterdam
    { lat: 50.850346, lon: 90 + 4.351721 },  // Belgium: Brussels
    { lat: 48.208174, lon: 90 + 16.373819 }, // Austria: Vienna
    { lat: 59.329323, lon: 90 + 18.068581 }, // Sweden: Stockholm
    { lat: 60.169856, lon: 90 + 24.938379 }, // Finland: Helsinki
    { lat: 59.913869, lon: 90 + 10.752245 }, // Norway: Oslo
    { lat: 55.676097, lon: 90 + 12.568337 }, // Denmark: Copenhagen
    { lat: 38.722252, lon: 90 + -9.139337 },  // Portugal: Lisbon
    { lat: 53.349805, lon: 90 + -6.260310 }, // Ireland: Dublin
    { lat: 50.075538, lon: 90 + 14.437800 }, // Czech Republic: Prague
    { lat: 47.497912, lon: 90 + 19.040235 }, // Hungary: Budapest
    { lat: 52.229676, lon: 90 + 21.012229 }, // Poland: Warsaw
    { lat: 46.056947, lon: 90 + 14.505751 }, // Slovenia: Ljubljana
    { lat: 48.148596, lon: 90 + 17.107748 }, // Slovakia: Bratislava
    { lat: 38.736946, lon: 90 + 35.496891 }, // Türkiye: Ankara
    { lat: 37.983810, lon: 90 + 23.727539 }, // Greece: Athens
    { lat: 47.376887, lon: 90 + 8.541694 },  // Switzerland: Zurich
    { lat: 44.426767, lon: 90 + 26.102538 }, // Romania: Bucharest
    { lat: 44.786568, lon: 90 + 20.448922 }, // Serbia: Belgrade
    { lat: 42.697708, lon: 90 + 23.321868 }, // Bulgaria: Sofia
    { lat: 45.815011, lon: 90 + 15.981919 }, // Croatia: Zagreb
    { lat: 43.85625,  lon:18.413076 }, // Bosnia and Herzegovina: Sarajevo
    { lat: 42.141037, lon: 90 + 19.086165 }, // Montenegro: Podgorica
    { lat: 41.996460, lon: 90 + 21.431410 }, // North Macedonia: Skopje
    { lat: 41.327546, lon: 90 + 19.818698 }, // Albania: Tirana
    { lat: 56.949649, lon: 90 + 24.105186 }, // Latvia: Riga
    { lat: 59.436961, lon: 90 + 24.753575 }, // Estonia: Tallinn
    { lat: 54.687156, lon: 90 + 25.279651 }, // Lithuania: Vilnius
    { lat: 64.146582, lon: 90 + -21.942635 }, // Iceland: Reykjavik
    { lat: 35.898909, lon: 90 + 14.514552 }, // Malta: Valletta
    { lat: 47.070714, lon: 90 + 15.439504 }, // Austria: Graz (additional major city)
    { lat: 49.195060, lon: 90 + 16.606837 }, // Czech Republic: Brno (additional major city)
    { lat: 45.501689, lon: 90 + -73.567256 }, // Canada: Montreal (additional major city)
    { lat: 43.653226, lon: 90 + -79.383184 }, // Canada: Toronto (additional major city)
    { lat: 39.904200, lon: 90 + 116.407396 }, // China: Beijing
    { lat: 31.230390, lon: 90 + 121.473702 }, // China: Shanghai
    { lat: 23.129110, lon: 90 + 113.264385 }, // China: Guangzhou
    { lat: 30.274089, lon: 90 + 120.155070 }, // China: Hangzhou
    { lat: 22.543096, lon: 90 + 114.057865 }, // China: Shenzhen
    { lat: 15.498289, lon: 90 + -88.030418 }, // Honduras: San Pedro Sula (example non-European city, adjust as needed)
    { lat: 39.739236, lon: 90 + -104.990251 }, // USA: Denver
    { lat: 40.712776, lon: 90 + -74.005974 }, // USA: New York City
    { lat: 34.052235, lon: 90 + -118.243683 }, // USA: Los Angeles
    { lat: 41.878114, lon: 90 + -87.629798 }, // USA: Chicago
    { lat: 29.760427, lon: 90 + -95.369803 }, // USA: Houston
    { lat: 33.448377, lon: 90 + -112.074037 }, // USA: Phoenix
    { lat: 39.952584, lon: 90 + -75.165222 }, // USA: Philadelphia
    { lat: 29.424122, lon: 90 + -98.493628 }, // USA: San Antonio\
    
    // Non-European countries
    { lat: -15.794229, lon: 90 + -47.882166 }, // Brazil: Brasília (capital)
    { lat: 45.421530, lon: 90 + -75.697193 }, // Canada: Ottawa (capital)
    { lat: 19.432608, lon: 90 + -99.133208 }, // Mexico: Mexico City (capital)
    { lat: 20.673791, lon: 90 + -103.343803 }, // Mexico: Guadalajara
    { lat: 25.686614, lon: 90 + -100.316113 }, // Mexico: Monterrey
    { lat: 19.040297, lon: 90 + -98.206200 }, // Mexico: Puebla
    { lat: 21.161908, lon: 90 + -86.851528 }, // Mexico: Cancún
    { lat: -34.603684, lon: 90 + -58.381559 }, // Argentina: Buenos Aires (capital)
    { lat: -31.420083, lon: 90 + -64.188776 }, // Argentina: Córdoba
    { lat: -32.889458, lon: 90 + -68.845839 }, // Argentina: Mendoza
    { lat: -33.448890, lon: 90 + -70.669265 }, // Chile: Santiago (capital)
    { lat: -33.024057, lon: 90 + -71.551828 }, // Chile: Valparaíso
];

// Load Earth GLTF model
const loader = new THREE.GLTFLoader();
let earthModel;
loader.load(
    '3dmodels/earth/scene.gltf',
    (gltf) => {
        earthModel = gltf.scene;
        earthModel.scale.set(1, 1, 1);
        earthModel.position.set(0, 0, 0);
        scene.add(earthModel);
        
        const box = new THREE.Box3().setFromObject(earthModel);
        const estimatedRadius = (box.max.x - box.min.x) / 2;
        
        // Apply fallback material
        earthModel.traverse((child) => {
            if (child.isMesh && (!child.material.map || child.material.map.image.currentSrc === '')) {
                child.material = new THREE.MeshStandardMaterial({ color: 0x87cefa, metalness: 0.7, roughness: 0.3 });
            }
        });
        
        // Add stars at city locations
        const starTexture = createStarTexture();
        const starMaterial = new THREE.SpriteMaterial({
            map: starTexture,
            transparent: true,
            depthTest: false
        });
        
        const earthRadius = estimatedRadius || 1;
        cities.forEach(city => {
            const position = latLonToVector3(city.lat, city.lon, earthRadius * 1.01);
            const star = new THREE.Sprite(starMaterial);
            star.position.copy(position);
            star.scale.set(0.1, 0.1, 0.1);
            star.userData = { name: city.name };
            earthModel.add(star);
        });
        
        function animateStars() {
            const time = Date.now() * 0.001;
            earthModel.traverse((child) => {
                if (child.isSprite) {
                    const scale = 0.1 + 0.05 * Math.sin(time * 1.5);
                    child.scale.set(scale, scale, scale);
                    child.material.opacity = 0.7 + 0.3 * Math.sin(time * 1.5);
                }
            });
        }
        
        function animate() {
            requestAnimationFrame(animate);
            animateStars();
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    },
    (xhr) => {
        console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
    },
    (error) => {
        console.error('Failed to load Earth GLTF model:', error);
        alert('Error loading Earth model. Ensure 3dmodels/earth/scene.gltf is correct.');
    }
);

// Set initial camera position to focus on Spain (Madrid coordinates)
const spainPosition = latLonToVector3(40.416775, -3.703790 + 90, 5); // Using radius 5 for initial view
camera.position.copy(spainPosition);
camera.lookAt(0, 0, 0);

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// Add background stars
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

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});