import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js'; // Water effect
import { Sky } from 'three/addons/objects/Sky.js'; // Alternative dynamic sky (optional)

let scene, camera, renderer;
let controls, water, cube, sun, sky; // Keep track of sky if using Sky object

init();
animate();

function init() {
    // --- Basic Scene Setup ---
    scene = new THREE.Scene();

    // --- Camera ---
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(30, 30, 100); // Start position
    camera.lookAt(0, 0, 0); // Look at the center

    // --- Renderer ---
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better color/lighting
    renderer.toneMappingExposure = 0.6;
    // --- Enable Shadows ---
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

    document.body.appendChild(renderer.domElement);

    // --- Controls ---
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smoother movement
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.495; // Prevent looking straight down/up too far
    controls.minDistance = 20;
    controls.maxDistance = 500;
    controls.target.set(0, 10, 0); // Adjust target slightly above water
    controls.update();

    // --- Lighting ---
    sun = new THREE.DirectionalLight(0xffffff, 2.5); // Bright white light
    sun.position.set(100, 150, 100); // Position the light source
    sun.target.position.set(0, 0, 0); // Point the light at the center
    // --- Enable Shadows for the Light ---
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;  // Higher resolution shadow map
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 50;
    sun.shadow.camera.far = 500;
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    // sun.shadow.bias = -0.001; // Adjust if shadow artifacts appear

    scene.add(sun);
    scene.add(sun.target);

    // --- Optional: Helper for directional light shadow camera ---
    // const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
    // scene.add( shadowHelper );

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4); // Soft ambient light
    scene.add(ambientLight);


    // --- Skybox ---
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    // !!! IMPORTANT: Replace these paths with your actual skybox images !!!
    // You can find free skybox textures online (e.g., Poly Haven, Kenney Assets)
    // Order: +X (Right), -X (Left), +Y (Top), -Y (Bottom), +Z (Front), -Z (Back)
    const skyboxTexture = cubeTextureLoader.load([
        'path/to/your/skybox/px.jpg', // Right
        'path/to/your/skybox/nx.jpg', // Left
        'path/to/your/skybox/py.jpg', // Top
        'path/to/your/skybox/ny.jpg', // Bottom
        'path/to/your/skybox/pz.jpg', // Front
        'path/to/your/skybox/nz.jpg'  // Back
    ]);
    scene.background = skyboxTexture;
    scene.environment = skyboxTexture; // Use skybox for reflections/environment lighting


    // --- Alternative: Dynamic Sky (using Sky object) ---
    /*
    sky = new Sky();
    sky.scale.setScalar( 10000 );
    scene.add( sky );

    const skyUniforms = sky.material.uniforms;
    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;

    const parameters = {
        elevation: 3, // Angle above horizon
        azimuth: 180  // Rotation around Y axis
    };

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    let renderTarget;

    function updateSun() {
        const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
        const theta = THREE.MathUtils.degToRad( parameters.azimuth );

        sun.position.setFromSphericalCoords( 1, phi, theta ); // Set light position based on sky params
        sky.material.uniforms[ 'sunPosition' ].value.copy( sun.position );

        if ( renderTarget !== undefined ) renderTarget.dispose();
        renderTarget = pmremGenerator.fromScene( sky ); // Generate environment map from sky
        scene.environment = renderTarget.texture;
        scene.background = renderTarget.texture; // Set background too
    }
    updateSun(); // Initial setup
    // If using dynamic sky, you might want to updateSun() periodically or based on controls
    */


    // --- Water ---
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000); // Large plane
    water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('https://unpkg.com/three@0.163.0/examples/textures/waternormals.jpg', function (texture) {
            // Ensure normals texture repeats
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: sun.position.clone().normalize(), // Use the light's direction
        sunColor: 0xffffff,
        waterColor: 0x001e0f, // Dark greenish-blue water
        distortionScale: 3.7,
        fog: scene.fog !== undefined // Use scene fog if available
    });
    water.rotation.x = -Math.PI / 2; // Rotate plane to be horizontal
    water.position.y = -1; // Position water slightly below origin
    // --- Enable Shadows on Water ---
    water.receiveShadow = true;
    scene.add(water);


    // --- Metallic Cube ---
    const cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,    // Base color (greyish)
        metalness: 1.0,     // Fully metallic
        roughness: 0.1,     // Quite smooth/reflective
        envMap: scene.environment, // Use skybox/environment for reflections
        envMapIntensity: 1.0
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = 15; // Position cube above the water
    // --- Enable Shadows for Cube ---
    cube.castShadow = true;
    cube.receiveShadow = false; // Cube doesn't need to receive shadows in this setup
    scene.add(cube);

    // --- Handle Window Resize ---
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Animate water
    if (water) {
        water.material.uniforms['time'].value += 1.0 / 60.0; // Update water time uniform for animation
    }

    // Optional: Animate cube
    // cube.rotation.x += 0.005;
    // cube.rotation.y += 0.005;

    // Render the scene
    renderer.render(scene, camera);
}

