import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DirectionalLightHelper, SpotLightHelper } from 'three';
import { CustomEase } from "gsap/CustomEase";
import gsapCore from 'gsap/gsap-core';

gsap.registerPlugin(CustomEase);

// Variables Setup ---------------------------|


var scene;
var canvas;

var camera;
var renderer;

var gltfScene;
var models = {};
var loader;

var initDollyComplete = false;

// var controls;

// -------------------------------------------|



export function setupCanvas() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xfbe0a0);

        canvas = document.querySelector('#model-viewer');

        camera = new THREE.PerspectiveCamera(30, 2, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({
                canvas: canvas,
        });

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.physicallyCorrectLights = true;

        camera.position.set(-0.30, 1.9, 1.8);
        camera.rotation.set(-0.06, 0, 0);
        camera.updateProjectionMatrix();

        window.addEventListener('resize', onWindowResize, false);
        setupLighting();

        loader = new GLTFLoader();

        /* Debugging Controls commented out below - remember to uncomment update in animation function */

        // controls = new OrbitControls(camera, renderer.domElement);
        // controls.addEventListener("change", event => {
        //         console.log(controls.object.position);
        //         console.log(controls.object.rotation);
        // });


        return loadModels();
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

/**
 * Initialises lighting in scene
 */
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

/**
 * This function defines the initial camera movement upon leaving the loading screen
 */
function initDolly() {

        var tl = gsap.timeline({ onComplete: () => { initDollyComplete = true } });
        tl.to(camera.position, {
                duration: 2.4,
                ease: CustomEase.create("custom", "M0,0,C0.505,0.201,0.424,0.79,0.999,0.999,0.999,0.999,0.999,0.999,1,1"),
                z: 73
        });

        tl.to(camera.position, {
                duration: 2.2,
                ease: CustomEase.create("custom", "M0,0,C0.956,0,0.822,1,1,1"),
                x: 58.58021594401725,
                y: 37.2
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
export function animate() {
        requestAnimationFrame(animate);

        if (!initDollyComplete) {
                console.log("animating");
                initDolly();
        }

        // controls.update();
        renderer.render(scene, camera);
}

function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
}