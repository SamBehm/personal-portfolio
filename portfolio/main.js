import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DirectionalLightHelper, SpotLightHelper } from 'three';

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
  var material = gltf.material;
  material.metalness = 0;
  material.roughness = 1;
  scene.add(gltf.scene);

}, undefined, function (error) {
  console.error(error);
});


const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xFF9C36, 20, 40, 1, 0.6, 0.2);

spotLight.castShadow = true;

spotLight.position.set(-16, 4, 3);
spotLight.target.position.set(0, 0, 10);
spotLight.target.updateMatrixWorld();

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.Height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);

const slHelper = new THREE.SpotLightHelper(spotLight);
scene.add(slHelper);

// const pointLight = new THREE.PointLight(0xFF9CD6, 100, 40, 2);

// pointLight.position.set(-16, 3.6, 3);
// scene.add(pointLight);

// const plHelper = new THREE.PointLightHelper(pointLight);
// scene.add(plHelper);


animate();