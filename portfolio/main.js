import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene, Camera, Renderer, Loader Setup ---------------------------|
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true;

camera.position.setZ(30);

const loader = new GLTFLoader();

// ---------------------------------------------------------|


/**
 * Animation Loop
 * 
 * Applies all constant transformations every tick.
 */
function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

loader.load('/room.glb', function (gltf) {
  scene.add(gltf.scene);

}, undefined, function (error) {
  console.error(error);
});



animate();