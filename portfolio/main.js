import './style.css'
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DirectionalLightHelper, SpotLightHelper } from 'three';
import { CustomEase } from "gsap/CustomEase";
import gsapCore from 'gsap/gsap-core';

gsap.registerPlugin(CustomEase);

const speed = 50;
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

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true;

camera.position.set(-0.30, 1.9, 1.8);
camera.rotation.set(-0.06, 0, 0);
camera.updateProjectionMatrix();

var gltfScene;
var models = {};
const loader = new GLTFLoader();

var initDollyComplete = false;

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.object.position.set(52.39856489618762, 55.69405045162902, 66.79870509161366);
// controls.addEventListener("change", event => {
//   console.log(controls.object.position);
//   console.log(controls.object.rotation);
// });


initScreen();


/**
 * Function used to display loading screen on `console`, while models are being loaded.
 */
async function initScreen() {

  let modelsLoaded = loadModels();
  await printPreamble();
  if (!modelsLoaded) {
    document.querySelector("#screen-console-text").innerHTML += "Error! Failed to load Models";
  }
  await new Promise(r => setTimeout(r, 500));
  document.querySelector("#screen-console").style.display = 'none';
  setupLighting();
  animate();
}

async function printPreamble() {

  var screenConsole = document.querySelector("#screen-console-text");
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
  return new Promise((resolve, reject) => {
    loader.load('/room.glb', function (gltf) {

      gltfScene = gltf.scene;
      scene.add(gltfScene);

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
      resolve(false);
    });

    resolve(true);
  });
}




// Lighting
function setupLighting() {

  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2);
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


/*
58.58021594401725
35.809561983910775
71.11938785360569

-0.5410995928728004
0.698875756431121
0.368910029539352
*/

function initDolly() {

  var tl = gsap.timeline({ onComplete: () => { initDollyComplete = true } });
  tl.to(camera.position, {
    duration: 2.4,
    ease: CustomEase.create("custom", "M0,0,C0.505,0.201,0.424,0.79,0.999,0.999,0.999,0.999,0.999,0.999,1,1"),
    z: 71.11938785360569
  });

  tl.to(camera.position, {
    duration: 2.2,
    ease: CustomEase.create("custom", "M0,0,C0.956,0,0.822,1,1,1"),
    x: 58.58021594401725,
    y: 35.809561983910775
  }, 0.2);

  tl.to(camera.rotation, {
    duration: 2.15,
    ease: CustomEase.create("custom", "M0,0,C0.78,0.016,0.768,0.996,0.998,0.996,0.999,0.998,1,1,1,1"),
    x: -0.5410995928728004,
    y: 0.698875756431121,
    z: 0.368910029539352
  }, 0.2);
}

/**
 * Animation Loop
 * 
 * Applies all constant transformations every tick.
 */
function animate() {
  requestAnimationFrame(animate);

  if (!initDollyComplete) {
    console.log("animating");
    initDolly();
  }

  // controls.update();
  renderer.render(scene, camera);
}


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}