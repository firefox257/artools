import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Light blue sky

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 3;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls (for camera movement)
const controls = new OrbitControls(camera, renderer.domElement);

// Gray Plane
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
scene.add(plane);

// Grid Helper
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Rotating Box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red box
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.y = 0.5; // Position above the plane
scene.add(box);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the box
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    controls.update(); // Update orbit controls
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
});
