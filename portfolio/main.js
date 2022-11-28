import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DirectionalLightHelper, SpotLightHelper } from 'three';

// Scene, Camera, Renderer, Loader Setup ---------------------------|
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x594F3B);

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

// const axesHelper = new THREE.AxesHelper(20);
// scene.add(axesHelper);

loader.load('/room.glb', function (gltf) {
  scene.add(gltf.scene);

}, undefined, function (error) {
  console.error(error);
});


const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xFF9C36, 4, 40, Math.PI / 2, 1, 0.1);

spotLight.castShadow = true;

spotLight.position.set(-16, 4, 3);
spotLight.target.position.set(0, 0, 15);
spotLight.target.updateMatrixWorld();

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.Height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);

// const slHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(slHelper);

let pointLight = new THREE.PointLight(0xFF9C36, 2, 40, 0.01);
pointLight.position.set(15, 15, 30);

scene.add(pointLight);

// let plHelper = new THREE.PointLightHelper(pointLight);
// scene.add(plHelper);

animate();