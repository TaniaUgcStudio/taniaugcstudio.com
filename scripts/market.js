
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
const geometry = new THREE.SphereGeometry(radius, isMobile ? 48 : 64, isMobile ? 48 : 64);
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
    // Spain: Major city centers
    { lat: 40.416775, lon: -3.703790 }, // Madrid
    { lat: 41.385064, lon: 2.173404 },  // Barcelona
    { lat: 39.469907, lon: -0.376288 }, // Valencia
    { lat: 37.389092, lon: -5.984459 }, // Seville
    { lat: 43.263013, lon: -2.934985 }, // Bilbao

    // European capitals (excluding Russia)
    { lat: 41.902783, lon: 12.496366 }, // Italy: Rome
    { lat: 48.856614, lon: 2.352222 },  // France: Paris
    { lat: 52.520008, lon: 13.404954 }, // Germany: Berlin
    { lat: 51.507351, lon: -0.127758 }, // United Kingdom: London
    { lat: 52.370216, lon: 4.895168 },  // Netherlands: Amsterdam
    { lat: 50.850346, lon: 4.351721 },  // Belgium: Brussels
    { lat: 48.208174, lon: 16.373819 }, // Austria: Vienna
    { lat: 59.329323, lon: 18.068581 }, // Sweden: Stockholm
    { lat: 60.169856, lon: 24.938379 }, // Finland: Helsinki
    { lat: 59.913869, lon: 10.752245 }, // Norway: Oslo
    { lat: 55.676097, lon: 12.568337 }, // Denmark: Copenhagen
    { lat: 38.722252, lon: -9.139337 },  // Portugal: Lisbon
    { lat: 53.349805, lon: -6.260310 }, // Ireland: Dublin
    { lat: 50.075538, lon: 14.437800 }, // Czech Republic: Prague
    { lat: 47.497912, lon: 19.040235 }, // Hungary: Budapest
    { lat: 52.229676, lon: 21.012229 }, // Poland: Warsaw
    { lat: 46.056947, lon: 14.505751 }, // Slovenia: Ljubljana
    { lat: 48.148596, lon: 17.107748 }, // Slovakia: Bratislava
    { lat: 38.736946, lon: 35.496891 }, // Türkiye: Ankara
    { lat: 37.983810, lon: 23.727539 }, // Greece: Athens
    { lat: 47.376887, lon: 8.541694 },  // Switzerland: Zurich
    { lat: 44.426767, lon: 26.102538 }, // Romania: Bucharest
    { lat: 44.786568, lon: 20.448922 }, // Serbia: Belgrade
    { lat: 42.697708, lon: 23.321868 }, // Bulgaria: Sofia
    { lat: 45.815011, lon: 15.981919 }, // Croatia: Zagreb
    { lat: 43.85625,  lon:18.413076 }, // Bosnia and Herzegovina: Sarajevo
    { lat: 42.141037, lon: 19.086165 }, // Montenegro: Podgorica
    { lat: 41.996460, lon: 21.431410 }, // North Macedonia: Skopje
    { lat: 41.327546, lon: 19.818698 }, // Albania: Tirana
    { lat: 56.949649, lon: 24.105186 }, // Latvia: Riga
    { lat: 59.436961, lon: 24.753575 }, // Estonia: Tallinn
    { lat: 54.687156, lon: 25.279651 }, // Lithuania: Vilnius
    { lat: 64.146582, lon: -21.942635 }, // Iceland: Reykjavik
    { lat: 35.898909, lon: 14.514552 }, // Malta: Valletta
    { lat: 47.070714, lon: 15.439504 }, // Austria: Graz (additional major city)
    { lat: 49.195060, lon: 16.606837 }, // Czech Republic: Brno (additional major city)
    { lat: 45.501689, lon: -73.567256 }, // Canada: Montreal (additional major city)
    { lat: 43.653226, lon: -79.383184 }, // Canada: Toronto (additional major city)
    { lat: 39.904200, lon: 116.407396 }, // China: Beijing
    { lat: 31.230390, lon: 121.473702 }, // China: Shanghai
    { lat: 23.129110, lon: 113.264385 }, // China: Guangzhou
    { lat: 30.274089, lon: 120.155070 }, // China: Hangzhou
    { lat: 22.543096, lon: 114.057865 }, // China: Shenzhen
    { lat: 15.498289, lon: -88.030418 }, // Honduras: San Pedro Sula (example non-European city, adjust as needed)
    { lat: 39.739236, lon: -104.990251 }, // USA: Denver
    { lat: 40.712776, lon: -74.005974 }, // USA: New York City
    { lat: 34.052235, lon: -118.243683 }, // USA: Los Angeles
    { lat: 41.878114, lon: -87.629798 }, // USA: Chicago
    { lat: 29.760427, lon: -95.369803 }, // USA: Houston
    { lat: 33.448377, lon: -112.074037 }, // USA: Phoenix
    { lat: 39.952584, lon: -75.165222 }, // USA: Philadelphia
    { lat: 29.424122, lon: -98.493628 }, // USA: San Antonio
    // Non-European countries
    { lat: -15.794229, lon: -47.882166 }, // Brazil: Brasília (capital)
    { lat: 45.421530, lon: -75.697193 }, // Canada: Ottawa (capital)
    { lat: 19.432608, lon: -99.133208 }, // Mexico: Mexico City (capital)
    { lat: 20.673791, lon: -103.343803 }, // Mexico: Guadalajara
    { lat: 25.686614, lon: -100.316113 }, // Mexico: Monterrey
    { lat: 19.040297, lon: -98.206200 }, // Mexico: Puebla
    { lat: 21.161908, lon: -86.851528 }, // Mexico: Cancún
    { lat: -34.603684, lon: -58.381559 }, // Argentina: Buenos Aires (capital)
    { lat: -31.420083, lon: -64.188776 }, // Argentina: Córdoba
    { lat: -32.889458, lon: -68.845839 }, // Argentina: Mendoza
    { lat: -33.448890, lon: -70.669265 }, // Chile: Santiago (capital)
    { lat: -33.024057, lon: -71.551828 }, // Chile: Valparaíso
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
