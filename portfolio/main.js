import './style.css'
import * as THREE from 'three';
import { TorusGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


// Scene, Camera, Renderer Setup ---------------------------|
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.setZ(30);

// ---------------------------------------------------------|


/**
 * Animation Loop
 * 
 * Applies all constant transformations every tick.
 */
function animate() {
  requestAnimationFrame(animate);

  // controls.update();

  renderer.render(scene, camera);
}

const pLight = new THREE.PointLight(0xFFFFFF);
pLight.position.set(20, 20, 20);

const aLight = new THREE.AmbientLight(0xFFFFFF);

scene.add(pLight, aLight);

const gridHelper = new THREE.GridHelper();
// const controls = new OrbitControls(camera, renderer.domElement);

scene.add(gridHelper);

animate();