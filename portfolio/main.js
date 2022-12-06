import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DirectionalLightHelper, SpotLightHelper } from 'three';


const speed = 75;
const console_text = ["> git clone https://github.com/SamBehm/personal-portfolio.git",
  "Cloning into 'personal-portfolio'...",
  "remote: Enumerating objects: 306, done.",
  "remote: Counting objects: 100% (306/306), done.",
  "remote: Compressing objects: 100% (184/184), done.",
  "remote: Total 306 (delta 143), reused 280 (delta 117), pack-reused 0;",
  "Receiving objects: 100% (306/306), 2.38 MiB | 3.06 MiB/s, done.",
  "Resolving deltas: 100% (143/143), done.",
  "Welcome!"];

// Scene, Camera, Renderer Setup ---------------------------|
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x303030);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true;

camera.position.set(-0.30, 1.9, 1.8);
camera.rotation.set(-0.06, 0, 0);
camera.updateProjectionMatrix();

var models = {};
const loader = new GLTFLoader();

initScreen();


/**
 * Function used to display loading screen on `console`, while models are being loaded.
 */
async function initScreen() {
  await printPreamble();
  loadModels();
  await new Promise(r => setTimeout(r, 1000));
  document.querySelector("#screen-console").style.display = 'none';
  setupLighting();
  animate();
}

async function printPreamble() {

  var screenConsole = document.querySelector("#screen-console");
  screenConsole.innerHTML = ">" + '<span id="blinker">\u25ae</span>';

  for (let pos = 1; pos < console_text[0].length; pos++) {
    screenConsole.innerHTML = console_text[0].substring(0, pos) + '<span id="blinker">\u25ae</span>';
    await new Promise(r => setTimeout(r, speed));
  }

  screenConsole.innerHTML = console_text[0] + '<br/>';

  for (let lineNum = 1; lineNum < console_text.length; lineNum++) {
    screenConsole.innerHTML += console_text[lineNum] + '<br/>';
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 501)));
  }
}


function loadModels() {
  loader.load('/room.glb', function (gltf) {

    scene.add(gltf.scene);

    // Code Below is for possible splitting of models to allow for
    // seperate animations and such.

    /*gltf.scene.traverse(function (object) {
      if (object.name) {
        models[object.name] = object;
        console.log(object.name);
        scene.add(object);
      }
    });*/

  }, undefined, function (error) {
    console.error(error);
  });
}


// Lighting
function setupLighting() {

  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xFF9C36, 7, 40, Math.PI / 2, 1, 0.1);

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

  let pointLight = new THREE.PointLight(0xFF9C36, 4, 40, 0.05);
  let pointLightShelf = pointLight;
  pointLight.position.set(15, 15, 30);
  pointLightShelf.position.set(-14, 10, 14);

  scene.add(pointLight);
}


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