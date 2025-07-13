// ========================================
// DEVICE DETECTION AND INITIAL SETUP
// ========================================

// Detect if user is on mobile device for performance optimization
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Create the 3D scene - container for all 3D objects
const scene = new THREE.Scene();

// Create camera with perspective projection
// Parameters: field of view (75°), aspect ratio, near clipping plane, far clipping plane
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create WebGL renderer with optimized settings
const renderer = new THREE.WebGLRenderer({ 
    alpha: true,                        // Enable transparency
    antialias: true,                    // Enable smooth edges (crucial for globe quality)
    powerPreference: "high-performance" // Request high-performance GPU
});

// Set pixel ratio for crisp rendering on high-DPI displays (max 2x to avoid performance issues)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Set renderer size to fill the window
renderer.setSize(window.innerWidth, window.innerHeight);

// Add the canvas element to the page
document.body.appendChild(renderer.domElement);

// ========================================
// CAMERA CONTROLS SETUP
// ========================================

// Add orbit controls for mouse/touch interaction with the globe
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;      // Enable smooth camera movement
controls.dampingFactor = 0.1;       // Control smoothness (lower = smoother)
controls.rotateSpeed = 0.6;         // Mouse rotation sensitivity
controls.zoomSpeed = 0.5;           // Mouse wheel zoom sensitivity
controls.enablePan = false;         // Disable panning (only rotation and zoom)

// ========================================
// TEXTURE LOADING AND GLOBE CREATION
// ========================================

// Create texture loader for loading image files
const textureLoader = new THREE.TextureLoader();

// Load Earth textures - use lower resolution on mobile for better performance
const textureSize = isMobile ? '1024' : '2048';
const mapTexture = textureLoader.load(`https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_${textureSize}.jpg`);
const bumpTexture = textureLoader.load(`https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_bump_${textureSize}.jpg`);

// Globe dimensions
const radius = 15;

// Create sphere geometry with adaptive detail level
// Higher segments = smoother sphere but lower performance
// 48 segments on mobile provides good balance between quality and performance
const geometryDetail = isMobile ? 48 : 64;
const geometry = new THREE.SphereGeometry(radius, geometryDetail, geometryDetail);

// Create material with Earth textures and lighting properties
const material = new THREE.MeshPhongMaterial({
    map: mapTexture,           // Color/diffuse texture
    bumpMap: bumpTexture,      // Height map for surface detail
    bumpScale: 0.1,            // Intensity of bump effect
    specular: 0x333333,        // Specular highlight color (dark gray)
    shininess: 10              // Shininess level (lower = more matte)
});

// Create the globe mesh by combining geometry and material
const globe = new THREE.Mesh(geometry, material);

// Add the globe to the scene
scene.add(globe);

// ========================================
// LIGHTING SETUP
// ========================================

// Add ambient light for overall illumination (affects all surfaces equally)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Add directional light to simulate sunlight
const directionalLight = new THREE.DirectionalLight(0x888888, 0.4);
directionalLight.position.set(10, 10, 10);  // Position the light source
scene.add(directionalLight);

// ========================================
// STAR POINTS DATA AND POSITIONING
// ========================================

// Define geographical coordinates for star points
const pointsData = [
    // Major Spanish cities
    { lat: 40.416775, lon: -3.703790 },  // Madrid
    { lat: 41.385064, lon: 2.173404 },   // Barcelona
    
    // Generate 30 random points across Spain
    ...Array(30).fill().map(() => ({
        lat: 36 + Math.random() * 8,      // Latitude range covering Spain
        lon: -9 + Math.random() * 7       // Longitude range covering Spain
    })),
    
    // European cities
    { lat: 52.520008, lon: 13.404954 },  // Berlin
    { lat: 48.137154, lon: 11.576124 },  // Munich
    { lat: 50.110924, lon: 8.682127 },   // Frankfurt
    { lat: 53.551085, lon: 9.993682 },   // Hamburg
    { lat: 50.937531, lon: 6.960279 },   // Cologne
    { lat: 48.856614, lon: 2.352222 },   // Paris
    { lat: 43.296482, lon: 5.369780 },   // Marseille
    { lat: 45.764043, lon: 4.835659 },   // Lyon
    { lat: 43.610769, lon: 1.444209 },   // Toulouse
    { lat: 47.218371, lon: -1.553621 }   // Nantes
];

// ========================================
// COORDINATE CONVERSION FUNCTION
// ========================================

/**
 * Convert latitude/longitude coordinates to 3D Cartesian coordinates
 * @param {number} lat - Latitude in degrees
 * @param {number} lon - Longitude in degrees  
 * @param {number} radius - Sphere radius
 * @returns {THREE.Vector3} 3D position vector
 */
function latLonToVector3(lat, lon, radius) {
    // Convert degrees to radians
    const phi = (90 - lat) * Math.PI / 180;      // Polar angle (from north pole)
    const theta = (lon + 180) * Math.PI / 180;   // Azimuthal angle (from -180° longitude)
    
    // Convert spherical coordinates to Cartesian coordinates
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),  // X coordinate
        radius * Math.cos(phi),                      // Y coordinate (up/down)
        radius * Math.sin(phi) * Math.sin(theta)     // Z coordinate
    );
}

// ========================================
// STAR POINTS CREATION
// ========================================

// Array to store star point elements and their 3D positions
const starPoints = [];

// Create HTML elements for each star point
pointsData.forEach(point => {
    // Calculate 3D position on globe surface (slightly offset outward)
    const position = latLonToVector3(point.lat, point.lon, radius + 0.15);
    
    // Create HTML div element for the star
    const star = document.createElement('div');
    star.className = 'star-point';
    document.body.appendChild(star);
    
    // Store reference to element and its 3D position
    starPoints.push({ element: star, position });
});

// ========================================
// STAR POSITION UPDATE FUNCTION
// ========================================

// Frame counter for performance optimization
let frameCount = 0;

/**
 * Update 2D screen positions of star points based on 3D positions and camera
 * This function projects 3D world coordinates to 2D screen coordinates
 */
function updateStarPositions() {
    starPoints.forEach(star => {
        // Clone the 3D position to avoid modifying original
        const vector = star.position.clone();
        
        // Project 3D coordinates to 2D screen coordinates
        // This converts world space to normalized device coordinates (-1 to 1)
        vector.project(camera);
        
        // Convert normalized coordinates to pixel coordinates
        const x = (vector.x + 1) * window.innerWidth / 2;   // Convert X to pixels
        const y = -(vector.y - 1) * window.innerHeight / 2; // Convert Y to pixels (flip Y axis)
        
        // Update HTML element position (offset by 10px to center the 20px star)
        star.element.style.left = `${x - 10}px`;
        star.element.style.top = `${y - 10}px`;
    });
}

// ========================================
// CAMERA POSITIONING
// ========================================

// Position camera to focus on Spain (Madrid coordinates)
// Place camera 30 units away from globe center in direction of Madrid
const spainPosition = latLonToVector3(40.416775, -3.703790, radius + 30);
camera.position.copy(spainPosition);

// Point camera towards the center of the globe
camera.lookAt(0, 0, 0);

// ========================================
// ANIMATION LOOP
// ========================================

/**
 * Main animation loop - runs every frame
 * Handles rendering, camera updates, and star position updates
 */
function animate() {
    // Request next animation frame (typically 60fps)
    requestAnimationFrame(animate);
    
    // Update camera controls (handles smooth movement)
    controls.update();
    
    // Render the 3D scene
    renderer.render(scene, camera);
    
    // Update star positions every other frame for performance
    // (30fps star updates instead of 60fps)
    if (++frameCount % 2 === 0) {
        updateStarPositions();
    }
}

// Start the animation loop
animate();

// ========================================
// WINDOW RESIZE HANDLER
// ========================================

/**
 * Handle window resize events
 * Updates camera aspect ratio and renderer size
 */
window.addEventListener('resize', () => {
    // Update camera aspect ratio to match new window dimensions
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Resize renderer to match new window size
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update star positions for new screen dimensions
    updateStarPositions();
});

// ========================================
// BACKGROUND STARS CREATION
// ========================================

// Get container element for background stars
const starContainer = document.getElementById("stars");

// Reduce number of background stars on mobile for better performance
const numStars = isMobile ? 100 : 150;

// Generate random twinkling stars in the background
for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.className = "star";
    
    // Random position across the screen
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    
    // Random animation duration for twinkling effect
    star.style.animationDuration = `${2 + Math.random() * 3}s`;
    
    // Random opacity for variety
    star.style.opacity = Math.random() * 0.6 + 0.4;
    
    // Add star to container
    starContainer.appendChild(star);
}